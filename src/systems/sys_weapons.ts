import {instantiate} from "../../lib/game.js";
import {Vec2} from "../../lib/math.js";
import {float} from "../../lib/random.js";
import {vec2_length, vec2_normalize, vec2_subtract} from "../../lib/vec2.js";
import {AIState} from "../components/com_ai_fighter.js";
import {query_down} from "../components/com_children.js";
import {EmitParticles} from "../components/com_emit_particles.js";
import {shake} from "../components/com_shake.js";
import {Weapon, WeaponKind, WeaponMelee, WeaponRanged} from "../components/com_weapon.js";
import {Game} from "../game.js";
import {blueprint_boomerang_projectile} from "../scenes/blu_boomerang.js";
import {blueprint_flame_particle} from "../scenes/blu_flame_particle.js";
import {blueprint_grenade} from "../scenes/blu_grenade.js";
import {blueprint_piercing_projectile} from "../scenes/blu_piercing_projectile.js";
import {blueprint_projectile} from "../scenes/blu_projectile.js";
import {getAIStateName} from "../ui/ai_state.js";
import {Has} from "../world.js";

const QUERY = Has.Children; // Entities that might have weapon children

export function sys_weapons(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            // Look for weapon children
            for (let weapon_entity of query_down(game.World, entity, Has.Weapon)) {
                if (weapon_entity === entity) continue; // Skip the parent itself

                let weapon = game.World.Weapon[weapon_entity];
                if (!weapon) continue;

                // Update cooldowns
                if (weapon.LastAttackTime > 0) {
                    weapon.LastAttackTime = Math.max(0, weapon.LastAttackTime - delta);
                }

                // Check if weapon should activate based on AI state and weapon type
                if (should_activate_weapon(game, entity, weapon)) {
                    activate_weapon(game, entity, weapon_entity, weapon);
                }
            }
        }
    }
}

function should_activate_weapon(game: Game, parent_entity: number, weapon: Weapon): boolean {
    // Check if parent has AI fighter component
    if (!(game.World.Signature[parent_entity] & Has.AIFighter)) {
        return false;
    }

    let ai = game.World.AIFighter[parent_entity];
    if (!ai) return false;

    let should_activate = false;

    // Ranged weapons can activate in Circling, Pursuing, and Dashing states
    if (weapon.Kind === WeaponKind.Ranged) {
        should_activate =
            (ai.State === AIState.Circling ||
                ai.State === AIState.Pursuing ||
                ai.State === AIState.Dashing) &&
            weapon.LastAttackTime <= 0;
    }
    // Melee weapons still only activate in Dashing state
    else if (weapon.Kind === WeaponKind.Melee) {
        should_activate = ai.State === AIState.Dashing && weapon.LastAttackTime <= 0;
    }

    if (should_activate) {
        console.log(
            `[WEAPON] Entity ${parent_entity} activating ${weapon.Kind === WeaponKind.Ranged ? "ranged" : "melee"} weapon (AI State: ${getAIStateName(ai.State)}, Cooldown: ${weapon.LastAttackTime.toFixed(2)})`,
        );
    }

    return should_activate;
}

function get_weapon_name(game: Game, weapon_entity: number): string | null {
    // Check if weapon has a Name component
    if (!(game.World.Signature[weapon_entity] & Has.Named)) return null;

    let named_component = game.World.Named[weapon_entity];
    return named_component ? named_component.Name : null;
}

function activate_weapon(
    game: Game,
    wielder_entity: number,
    weapon_entity: number,
    weapon: Weapon,
) {
    // Set weapon on cooldown
    weapon.LastAttackTime = weapon.Cooldown;

    // Get wielder's position and target
    let wielder_transform = game.World.LocalTransform2D[wielder_entity];
    if (!wielder_transform) return;

    // Find target (opponent)
    let target_entity = find_weapon_target(game, wielder_entity, weapon);
    if (target_entity === -1) {
        console.log(`[WEAPON] Entity ${wielder_entity} failed to find target`);
        return;
    }

    let target_transform = game.World.LocalTransform2D[target_entity];
    if (!target_transform) return;

    // Calculate distance to target
    let to_target: Vec2 = [0, 0];
    vec2_subtract(to_target, target_transform.Translation, wielder_transform.Translation);
    let distance = vec2_length(to_target);

    // Check if target is in range
    if (distance > weapon.Range) {
        console.log(
            `[WEAPON] Entity ${wielder_entity} target ${target_entity} out of range (${distance.toFixed(2)} > ${weapon.Range})`,
        );
        return;
    }

    console.log(
        `[WEAPON] Entity ${wielder_entity} attacking target ${target_entity} at range ${distance.toFixed(2)}`,
    );

    // Apply weapon-specific effects
    switch (weapon.Kind) {
        case WeaponKind.Melee:
            let melee_weapon_name = get_weapon_name(game, weapon_entity);
            switch (melee_weapon_name) {
                case "chainsaw":
                    execute_chainsaw_attack(game, wielder_entity, target_entity, weapon, distance);
                    break;
                default:
                    execute_melee_attack(game, wielder_entity, target_entity, weapon, distance);
                    break;
            }
            break;
        case WeaponKind.Ranged:
            let weapon_name = get_weapon_name(game, weapon_entity);
            switch (weapon_name) {
                case "flamethrower":
                    execute_flamethrower_attack(
                        game,
                        wielder_entity,
                        target_entity,
                        weapon,
                        weapon_entity,
                    );
                    break;
                case "grenade_launcher":
                    execute_grenade_launcher_attack(game, wielder_entity, target_entity, weapon);
                    break;
                case "crossbow":
                    execute_crossbow_attack(game, wielder_entity, target_entity, weapon);
                    break;
                case "boomerang":
                    execute_boomerang_attack(game, wielder_entity, target_entity, weapon);
                    break;
                default:
                    execute_ranged_attack(game, wielder_entity, target_entity, weapon);
                    break;
            }
            break;
    }
}

function find_weapon_target(game: Game, wielder_entity: number, weapon: Weapon): number {
    // For now, find the nearest enemy with health
    let wielder_transform = game.World.LocalTransform2D[wielder_entity];
    if (!wielder_transform) return -1;

    let nearest_entity = -1;
    let nearest_distance = weapon.Range + 1; // Start beyond weapon range
    let candidates = 0;

    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if (entity === wielder_entity) continue;
        if (!(game.World.Signature[entity] & Has.Health)) continue;
        if (!(game.World.Signature[entity] & Has.LocalTransform2D)) continue;

        let health = game.World.Health[entity];
        if (!health.IsAlive) continue;

        candidates++;

        let transform = game.World.LocalTransform2D[entity];
        let distance_vec: Vec2 = [0, 0];
        vec2_subtract(distance_vec, transform.Translation, wielder_transform.Translation);
        let distance = vec2_length(distance_vec);

        if (distance < nearest_distance) {
            nearest_distance = distance;
            nearest_entity = entity;
        }
    }

    console.log(
        `[TARGET] Entity ${wielder_entity} found ${candidates} potential targets, selected: ${nearest_entity} (distance: ${nearest_distance.toFixed(2)})`,
    );

    return nearest_entity;
}

function execute_melee_attack(
    game: Game,
    wielder_entity: number,
    target_entity: number,
    weapon: WeaponMelee,
    _distance: number,
) {
    // Add damage to pending queue instead of applying directly
    let target_health = game.World.Health[target_entity];
    target_health.PendingDamage.push({
        Amount: weapon.Damage,
        Source: wielder_entity,
        Type: "melee",
    });

    console.log(
        `[MELEE] Entity ${wielder_entity} -> ${target_entity}: adding ${weapon.Damage} melee damage to pending queue`,
    );

    if (weapon.Knockback > 0) {
        apply_knockback(game, wielder_entity, target_entity, weapon.Knockback);
    }

    // Add screen shake for impact
    if (game.Camera !== undefined) {
        let shake_radius = 0.5; // Fixed radius for all shakes
        let shake_duration = 0.2; // 200ms shake
        shake(shake_radius, shake_duration)(game, game.Camera);
    }
}

function execute_chainsaw_attack(
    game: Game,
    wielder_entity: number,
    target_entity: number,
    weapon: WeaponMelee,
    _distance: number,
) {
    // Chainsaw works like regular melee but with continuous damage feel
    let target_health = game.World.Health[target_entity];
    target_health.PendingDamage.push({
        Amount: weapon.Damage,
        Source: wielder_entity,
        Type: "chainsaw",
    });

    console.log(
        `[CHAINSAW] Entity ${wielder_entity} -> ${target_entity}: adding ${weapon.Damage} chainsaw damage to pending queue`,
    );

    if (weapon.Knockback > 0) {
        apply_knockback(game, wielder_entity, target_entity, weapon.Knockback);
    }

    // Add stronger screen shake for chainsaw impact
    if (game.Camera !== undefined) {
        let shake_radius = 0.6; // Slightly stronger shake
        let shake_duration = 0.25; // Longer shake for chainsaw
        shake(shake_radius, shake_duration)(game, game.Camera);
    }
}

function execute_ranged_attack(
    game: Game,
    wielder_entity: number,
    target_entity: number,
    weapon: WeaponRanged,
) {
    let wielder_transform = game.World.LocalTransform2D[wielder_entity];
    let target_transform = game.World.LocalTransform2D[target_entity];
    if (!wielder_transform || !target_transform) return;

    // Calculate direction to target
    let to_target: Vec2 = [0, 0];
    vec2_subtract(to_target, target_transform.Translation, wielder_transform.Translation);
    vec2_normalize(to_target, to_target);

    // Apply scatter (aiming inaccuracy) - random angle deviation
    let scatter_angle = float(-1, 1) * weapon.Scatter;
    let cos_scatter = Math.cos(scatter_angle);
    let sin_scatter = Math.sin(scatter_angle);
    let scattered_x = to_target[0] * cos_scatter - to_target[1] * sin_scatter;
    let scattered_y = to_target[0] * sin_scatter + to_target[1] * cos_scatter;
    to_target[0] = scattered_x;
    to_target[1] = scattered_y;

    // Spawn projectiles based on weapon stats
    for (let i = 0; i < weapon.ProjectileCount; i++) {
        // Calculate spread for multiple projectiles
        let spread_angle = 0;
        if (weapon.ProjectileCount > 1) {
            let total_spread = weapon.Spread * (weapon.ProjectileCount - 1);
            spread_angle = -total_spread / 2 + weapon.Spread * i;
        }

        // Apply spread to direction
        let projectile_direction: Vec2 = [to_target[0], to_target[1]];
        if (spread_angle !== 0) {
            let cos_angle = Math.cos(spread_angle);
            let sin_angle = Math.sin(spread_angle);
            let x = projectile_direction[0] * cos_angle - projectile_direction[1] * sin_angle;
            let y = projectile_direction[0] * sin_angle + projectile_direction[1] * cos_angle;
            projectile_direction[0] = x;
            projectile_direction[1] = y;
        }

        // Create projectile entity
        let projectile_entity = instantiate(
            game,
            blueprint_projectile(
                game,
                weapon.Damage,
                wielder_entity,
                weapon.Range,
                weapon.ProjectileSpeed,
            ),
        );

        // Set projectile position (slightly offset from wielder)
        let projectile_transform = game.World.LocalTransform2D[projectile_entity];
        if (projectile_transform) {
            projectile_transform.Translation[0] =
                wielder_transform.Translation[0] + to_target[0] * 0.5;
            projectile_transform.Translation[1] =
                wielder_transform.Translation[1] + to_target[1] * 0.5;
        }

        // Set projectile movement direction using control_always2d
        let control = game.World.ControlAlways2D[projectile_entity];
        if (control) {
            control.Direction = [projectile_direction[0], projectile_direction[1]];
        }
    }

    console.log(
        `[RANGED] Entity ${wielder_entity} fired ${weapon.ProjectileCount} projectile(s) toward target ${target_entity} with scatter ${scatter_angle.toFixed(3)}`,
    );
}

function execute_flamethrower_attack(
    game: Game,
    wielder_entity: number,
    target_entity: number,
    weapon: WeaponRanged,
    weapon_entity: number,
) {
    let wielder_transform = game.World.LocalTransform2D[wielder_entity];
    let target_transform = game.World.LocalTransform2D[target_entity];
    if (!wielder_transform || !target_transform) return;

    // Calculate direction to target
    let to_target: Vec2 = [0, 0];
    vec2_subtract(to_target, target_transform.Translation, wielder_transform.Translation);
    vec2_normalize(to_target, to_target);

    // Find and activate the particle emitter on the weapon
    let emitter = game.World.EmitParticles[weapon_entity];
    if (emitter) {
        // Set emission direction toward target
        emitter.Direction[0] = to_target[0];
        emitter.Direction[1] = to_target[1];

        // Update particle creator to use correct damage and source
        emitter.Creator = (_game: Game, direction: Vec2, speed: number) =>
            blueprint_flame_particle(
                weapon.Damage, // Use weapon damage
                wielder_entity, // Source entity
                direction,
                speed,
                0.8, // particle lifetime
            );

        // Activate the emitter
        emitter.Active = true;
        emitter.Age = 0; // Reset age for new burst

        console.log(
            `[FLAMETHROWER] Entity ${wielder_entity} activated particle emitter toward target ${target_entity}`,
        );
    } else {
        console.warn(`[FLAMETHROWER] Entity ${weapon_entity} missing EmitParticles component`);
    }
}

function execute_crossbow_attack(
    game: Game,
    wielder_entity: number,
    target_entity: number,
    weapon: WeaponRanged,
) {
    let wielder_transform = game.World.LocalTransform2D[wielder_entity];
    let target_transform = game.World.LocalTransform2D[target_entity];
    if (!wielder_transform || !target_transform) return;

    // Calculate direction to target
    let to_target: Vec2 = [0, 0];
    vec2_subtract(to_target, target_transform.Translation, wielder_transform.Translation);
    vec2_normalize(to_target, to_target);

    // Apply scatter (crossbow is very accurate, minimal scatter)
    let scatter_angle = float(-1, 1) * weapon.Scatter;
    let cos_scatter = Math.cos(scatter_angle);
    let sin_scatter = Math.sin(scatter_angle);
    let scattered_x = to_target[0] * cos_scatter - to_target[1] * sin_scatter;
    let scattered_y = to_target[0] * sin_scatter + to_target[1] * cos_scatter;
    to_target[0] = scattered_x;
    to_target[1] = scattered_y;

    // Create piercing projectile entity
    let projectile_entity = instantiate(
        game,
        blueprint_piercing_projectile(
            game,
            weapon.Damage,
            wielder_entity,
            weapon.Range,
            weapon.ProjectileSpeed,
        ),
    );

    // Set projectile position (slightly offset from wielder)
    let projectile_transform = game.World.LocalTransform2D[projectile_entity];
    if (projectile_transform) {
        projectile_transform.Translation[0] = wielder_transform.Translation[0] + to_target[0] * 0.5;
        projectile_transform.Translation[1] = wielder_transform.Translation[1] + to_target[1] * 0.5;
    }

    // Set projectile movement direction using control_always2d
    let control = game.World.ControlAlways2D[projectile_entity];
    if (control) {
        control.Direction = [to_target[0], to_target[1]];
    }

    console.log(
        `[CROSSBOW] Entity ${wielder_entity} fired piercing bolt ${projectile_entity} toward target ${target_entity}`,
    );
}

function execute_grenade_launcher_attack(
    game: Game,
    wielder_entity: number,
    target_entity: number,
    weapon: WeaponRanged,
) {
    let wielder_transform = game.World.LocalTransform2D[wielder_entity];
    let target_transform = game.World.LocalTransform2D[target_entity];
    if (!wielder_transform || !target_transform) return;

    // Calculate relative target position
    let target_position: Vec2 = [
        target_transform.Translation[0] - wielder_transform.Translation[0],
        target_transform.Translation[1] - wielder_transform.Translation[1],
    ];

    // Create grenade projectile entity
    let grenade_entity = instantiate(
        game,
        blueprint_grenade(
            game,
            weapon.Damage,
            wielder_entity,
            weapon.Range,
            weapon.ProjectileSpeed,
            target_position,
        ),
    );

    // Set grenade starting position (slightly offset from wielder)
    let grenade_transform = game.World.LocalTransform2D[grenade_entity];
    if (grenade_transform) {
        let to_target: Vec2 = [0, 0];
        vec2_subtract(to_target, target_transform.Translation, wielder_transform.Translation);
        vec2_normalize(to_target, to_target);

        grenade_transform.Translation[0] = wielder_transform.Translation[0] + to_target[0] * 0.5;
        grenade_transform.Translation[1] = wielder_transform.Translation[1] + to_target[1] * 0.5;
    }

    console.log(
        `[GRENADE_LAUNCHER] Entity ${wielder_entity} fired grenade ${grenade_entity} toward target ${target_entity}`,
    );
}

function execute_boomerang_attack(
    game: Game,
    wielder_entity: number,
    target_entity: number,
    weapon: WeaponRanged,
) {
    let wielder_transform = game.World.LocalTransform2D[wielder_entity];
    let target_transform = game.World.LocalTransform2D[target_entity];
    if (!wielder_transform || !target_transform) return;

    // Create boomerang projectile entity
    let boomerang_entity = instantiate(
        game,
        blueprint_boomerang_projectile(
            game,
            wielder_entity, // thrower
            [target_transform.Translation[0], target_transform.Translation[1]], // target position
            weapon.Range, // max range
            weapon.ProjectileSpeed, // speed
        ),
    );

    // Set boomerang starting position (slightly offset from wielder)
    let boomerang_transform = game.World.LocalTransform2D[boomerang_entity];
    if (boomerang_transform) {
        // Calculate direction to target for offset
        let to_target: Vec2 = [0, 0];
        vec2_subtract(to_target, target_transform.Translation, wielder_transform.Translation);
        vec2_normalize(to_target, to_target);

        boomerang_transform.Translation[0] = wielder_transform.Translation[0] + to_target[0] * 0.3;
        boomerang_transform.Translation[1] = wielder_transform.Translation[1] + to_target[1] * 0.3;
    }

    console.log(
        `[BOOMERANG] Entity ${wielder_entity} threw boomerang ${boomerang_entity} toward target ${target_entity}`,
    );
}

function apply_knockback(
    game: Game,
    _source_entity: number,
    _target_entity: number,
    _knockback_force: number,
) {
    // TODO: Implement proper knockback physics
    // For now, just add extra screen shake
    if (game.Camera !== undefined) {
        let shake_radius = 0.5; // Fixed radius for all shakes
        let shake_duration = 0.3; // 300ms shake for knockback
        shake(shake_radius, shake_duration)(game, game.Camera);
    }
}

import {Vec2} from "../../lib/math.js";
import {float} from "../../lib/random.js";
import {vec2_length, vec2_normalize, vec2_subtract} from "../../lib/vec2.js";
import {blueprint_flame_particle} from "../blueprints/particles/blu_flame_particle.js";
import {blueprint_boomerang_projectile} from "../blueprints/projectiles/blu_boomerang.js";
import {blueprint_grenade} from "../blueprints/projectiles/blu_grenade.js";
import {blueprint_projectile} from "../blueprints/projectiles/blu_projectile.js";
import {AIState} from "../components/com_ai_fighter.js";
import {SpawnMode} from "../components/com_spawn.js";
import {Weapon} from "../components/com_weapon.js";
import {Game} from "../game.js";
import {getAIStateName} from "../ui/ai_state.js";
import {Has} from "../world.js";

const QUERY = Has.Weapon; // Entities that are weapons

export function sys_weapons(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let weapon = game.World.Weapon[entity];
            DEBUG: if (!weapon) throw new Error("missing component");

            // Update cooldowns
            if (weapon.LastAttackTime > 0) {
                weapon.LastAttackTime = Math.max(0, weapon.LastAttackTime - delta);
            }

            // Find the wielder (parent entity)
            let wielder_entity = -1;
            if (game.World.Signature[entity] & Has.SpatialNode2D) {
                let spatial_node = game.World.SpatialNode2D[entity];
                wielder_entity = spatial_node?.Parent ?? -1;
            }
            DEBUG: if (wielder_entity === -1) throw new Error("weapon missing parent");

            // Check if weapon should activate based on AI state and weapon type
            if (should_activate_weapon(game, wielder_entity, weapon)) {
                activate_weapon(game, wielder_entity, entity, weapon);
            }
        }
    }
}

function should_activate_weapon(game: Game, parent_entity: number, weapon: Weapon): boolean {
    let ai = game.World.AIFighter[parent_entity];
    DEBUG: if (!ai) throw new Error("missing component");

    // All weapons are ranged - can activate in Circling, Pursuing, and Dashing states
    let should_activate =
        (ai.State === AIState.Circling ||
            ai.State === AIState.Pursuing ||
            ai.State === AIState.Dashing) &&
        weapon.LastAttackTime <= 0;

    if (should_activate) {
        console.log(
            `[${Date.now()}] [WEAPON] Entity ${parent_entity} activating ranged weapon (AI State: ${getAIStateName(ai.State)}, Cooldown: ${weapon.LastAttackTime.toFixed(2)})`,
        );
    }

    return should_activate;
}

function get_weapon_name(game: Game, weapon_entity: number): string | null {
    // Check if weapon has a Label component
    if (!(game.World.Signature[weapon_entity] & Has.Label)) return null;

    let label_component = game.World.Label[weapon_entity];
    return label_component ? label_component.Name || null : null;
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
    DEBUG: if (!wielder_transform) throw new Error("missing component");

    // Find target (opponent)
    let target_entity = find_weapon_target(game, wielder_entity, weapon);
    if (target_entity === -1) {
        console.log(`[WEAPON] Entity ${wielder_entity} failed to find target`);
        return;
    }

    let target_transform = game.World.LocalTransform2D[target_entity];
    DEBUG: if (!target_transform) throw new Error("missing component");

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

    // Apply weapon-specific effects based on weapon name
    let weapon_name = get_weapon_name(game, weapon_entity);
    switch (weapon_name) {
        case "flamethrower":
            execute_flamethrower_attack(game, wielder_entity, target_entity, weapon, weapon_entity);
            break;
        case "grenade_launcher":
            execute_grenade_launcher_attack(
                game,
                wielder_entity,
                target_entity,
                weapon,
                weapon_entity,
            );
            break;
        case "boomerang":
            execute_boomerang_attack(game, wielder_entity, target_entity, weapon, weapon_entity);
            break;
        default:
            execute_ranged_attack(game, wielder_entity, target_entity, weapon, weapon_entity);
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

function execute_ranged_attack(
    game: Game,
    wielder_entity: number,
    target_entity: number,
    weapon: Weapon,
    weapon_entity: number,
) {
    let wielder_transform = game.World.LocalTransform2D[wielder_entity];
    let target_transform = game.World.LocalTransform2D[target_entity];
    DEBUG: if (!wielder_transform || !target_transform) throw new Error("missing component");

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

    // Find and activate the spawner on the weapon
    let spawner = game.World.Spawn[weapon_entity];
    DEBUG: if (!spawner) {
        throw new Error(`[RANGED] Weapon ${weapon_entity} missing spawn component`);
    }

    // Set spawn direction toward target (with scatter applied)
    spawner.Direction[0] = to_target[0];
    spawner.Direction[1] = to_target[1];

    // Update blueprint to use correct damage parameters
    spawner.Blueprint = blueprint_projectile(
        game,
        weapon.Damage,
        weapon.Range,
        weapon.ProjectileSpeed,
    );

    // Activate the spawner based on its mode
    if (spawner.Mode === SpawnMode.Count) {
        spawner.RemainingCount = spawner.TotalCount;
    } else {
        spawner.Duration = spawner.ConfiguredDuration;
    }

    console.log(
        `[RANGED] Entity ${wielder_entity} activated spawner toward target ${target_entity} with scatter ${scatter_angle.toFixed(3)}`,
    );
}

function execute_flamethrower_attack(
    game: Game,
    wielder_entity: number,
    target_entity: number,
    weapon: Weapon,
    weapon_entity: number,
) {
    let wielder_transform = game.World.LocalTransform2D[wielder_entity];
    let target_transform = game.World.LocalTransform2D[target_entity];
    DEBUG: if (!wielder_transform || !target_transform) throw new Error("missing component");

    // Calculate direction to target
    let to_target: Vec2 = [0, 0];
    vec2_subtract(to_target, target_transform.Translation, wielder_transform.Translation);
    vec2_normalize(to_target, to_target);

    // Find and activate the spawner on the weapon
    let spawner = game.World.Spawn[weapon_entity];
    DEBUG: if (!spawner) throw new Error("missing component");

    // Set spawn direction toward target
    spawner.Direction[0] = to_target[0];
    spawner.Direction[1] = to_target[1];

    // Update blueprint to use correct damage and source
    spawner.Blueprint = blueprint_flame_particle(weapon.Damage);

    // Activate the timed spawner
    if (spawner.Mode === SpawnMode.Timed) {
        spawner.Duration = spawner.ConfiguredDuration;
    }

    console.log(
        `[${Date.now()}] [FLAMETHROWER] Entity ${wielder_entity} activated spawner toward target ${target_entity}`,
    );
}

function execute_grenade_launcher_attack(
    game: Game,
    wielder_entity: number,
    target_entity: number,
    weapon: Weapon,
    weapon_entity: number,
) {
    let wielder_transform = game.World.LocalTransform2D[wielder_entity];
    let target_transform = game.World.LocalTransform2D[target_entity];
    DEBUG: if (!wielder_transform || !target_transform) throw new Error("missing component");

    // Calculate direction to target
    let to_target: Vec2 = [0, 0];
    vec2_subtract(to_target, target_transform.Translation, wielder_transform.Translation);
    vec2_normalize(to_target, to_target);

    // Calculate relative target position for grenade blueprint
    let target_position: Vec2 = [
        target_transform.Translation[0] - wielder_transform.Translation[0],
        target_transform.Translation[1] - wielder_transform.Translation[1],
    ];

    // Find and activate the spawner on the weapon
    let spawner = game.World.Spawn[weapon_entity];
    DEBUG: if (!spawner) {
        throw new Error(`[GRENADE_LAUNCHER] Weapon ${weapon_entity} missing spawn component`);
    }

    // Set spawn direction toward target
    spawner.Direction[0] = to_target[0];
    spawner.Direction[1] = to_target[1];

    // Update blueprint to use correct parameters for this specific shot
    spawner.Blueprint = blueprint_grenade(
        game,
        weapon.Damage,
        wielder_entity,
        weapon.Range,
        weapon.ProjectileSpeed,
        target_position,
    );

    // Activate the count-based spawner
    if (spawner.Mode === SpawnMode.Count) {
        spawner.RemainingCount = spawner.TotalCount;
    }

    console.log(
        `[GRENADE_LAUNCHER] Entity ${wielder_entity} activated grenade spawner toward target ${target_entity}`,
    );
}

function execute_boomerang_attack(
    game: Game,
    wielder_entity: number,
    target_entity: number,
    weapon: Weapon,
    weapon_entity: number,
) {
    let wielder_transform = game.World.LocalTransform2D[wielder_entity];
    let target_transform = game.World.LocalTransform2D[target_entity];
    DEBUG: if (!wielder_transform || !target_transform) throw new Error("missing component");

    // Calculate direction to target
    let to_target: Vec2 = [0, 0];
    vec2_subtract(to_target, target_transform.Translation, wielder_transform.Translation);
    vec2_normalize(to_target, to_target);

    // Find and activate the spawner on the weapon
    let spawner = game.World.Spawn[weapon_entity];
    DEBUG: if (!spawner) {
        throw new Error(`[BOOMERANG] Weapon ${weapon_entity} missing spawn component`);
    }

    // Set spawn direction toward target
    spawner.Direction[0] = to_target[0];
    spawner.Direction[1] = to_target[1];

    // Update blueprint to use correct parameters for this specific shot
    spawner.Blueprint = blueprint_boomerang_projectile(
        game,
        wielder_entity, // thrower
        [target_transform.Translation[0], target_transform.Translation[1]], // target position
        weapon.Range, // max range
        weapon.ProjectileSpeed, // speed
    );

    // Activate the count-based spawner
    if (spawner.Mode === SpawnMode.Count) {
        spawner.RemainingCount = spawner.TotalCount;
    }

    console.log(
        `[BOOMERANG] Entity ${wielder_entity} activated boomerang spawner toward target ${target_entity}`,
    );
}

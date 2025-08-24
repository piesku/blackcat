import {Vec2} from "../../lib/math.js";
import {blueprint_flame_particle} from "../blueprints/particles/blu_flame_particle.js";
import {blueprint_boomerang_projectile} from "../blueprints/projectiles/blu_boomerang.js";
import {blueprint_grenade} from "../blueprints/projectiles/blu_grenade.js";
import {blueprint_projectile} from "../blueprints/projectiles/blu_projectile.js";
import {query_down} from "../components/com_children.js";
import {AiState} from "../components/com_control_ai.js";
import {SpawnMode} from "../components/com_spawn.js";
import {Weapon} from "../components/com_weapon.js";
import {Game} from "../game.js";
import {getAIStateName} from "../ui/ai_state.js";
import {Has} from "../world.js";

const QUERY = Has.Weapon | Has.SpatialNode2D;

export function sys_control_weapon(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let weapon = game.World.Weapon[entity];
            DEBUG: if (!weapon) throw new Error("missing component");

            // Update cooldowns
            if (weapon.LastAttackTime > 0) {
                weapon.LastAttackTime = Math.max(0, weapon.LastAttackTime - delta);
            }

            // Find the wielder (parent entity)
            let spatial_node = game.World.SpatialNode2D[entity];
            let wielder_entity = spatial_node.Parent ?? -1;
            DEBUG: if (wielder_entity === -1) throw new Error("weapon missing parent");

            // Check if weapon should activate based on AI state and weapon type
            if (should_activate_weapon(game, wielder_entity, weapon)) {
                activate_weapon(game, wielder_entity, entity);
            }
        }
    }
}

function should_activate_weapon(game: Game, parent_entity: number, weapon: Weapon): boolean {
    let ai = game.World.ControlAi[parent_entity];
    let aim = game.World.Aim[parent_entity];
    DEBUG: if (!ai || !aim) throw new Error("missing component");

    // All weapons are ranged - can activate in Circling, Pursuing, and Dashing states
    // AND must have a valid target from the Aim component within range
    let should_activate =
        (ai.State === AiState.Circling ||
            ai.State === AiState.Pursuing ||
            ai.State === AiState.Dashing) &&
        weapon.LastAttackTime <= 0 &&
        aim.TargetEntity !== -1 &&
        aim.DistanceToTarget <= weapon.Range;

    if (should_activate) {
        console.log(
            `[${Date.now()}] [WEAPON] Entity ${parent_entity} activating weapon (AI State: ${getAIStateName(ai.State)}, Target: ${aim.TargetEntity}, Distance: ${aim.DistanceToTarget.toFixed(2)})`,
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

function activate_weapon(game: Game, wielder_entity: number, weapon_entity: number) {
    let weapon = game.World.Weapon[weapon_entity];

    // Set weapon on cooldown
    weapon.LastAttackTime = weapon.Cooldown;

    // Apply weapon-specific effects based on weapon name
    let weapon_name = get_weapon_name(game, weapon_entity);
    switch (weapon_name) {
        case "flamethrower":
            execute_flamethrower_attack(game, wielder_entity, weapon, weapon_entity);
            break;
        case "grenade_launcher":
            execute_grenade_launcher_attack(game, wielder_entity, weapon, weapon_entity);
            break;
        case "boomerang":
            execute_boomerang_attack(game, wielder_entity, weapon, weapon_entity);
            break;
        default:
            execute_ranged_attack(game, wielder_entity, weapon, weapon_entity);
            break;
    }
}

function execute_ranged_attack(
    game: Game,
    wielder_entity: number,
    weapon: Weapon,
    weapon_entity: number,
) {
    // Get direction from Aim component
    let aim = game.World.Aim[wielder_entity];
    DEBUG: if (!aim) throw new Error("missing component");
    let to_target: Vec2 = [aim.DirectionToTarget[0], aim.DirectionToTarget[1]];

    // Find and activate all spawners on the weapon and its children
    let spawners_activated = 0;

    // First, handle the main spawner on the weapon entity itself
    if (game.World.Spawn[weapon_entity]) {
        let spawner = game.World.Spawn[weapon_entity];

        // Set spawn direction toward target
        spawner.Direction[0] = to_target[0];
        spawner.Direction[1] = to_target[1];

        // Update blueprint to use correct damage parameters (only for projectile spawners)
        spawner.Blueprint = blueprint_projectile(
            game,
            weapon.Damage,
            weapon.Range,
            spawner.SpeedMin, // Use spawn component's speed
        );

        // Activate the spawner based on its mode using weapon's TotalAmount
        if (spawner.Mode === SpawnMode.Count) {
            spawner.RemainingCount = weapon.TotalAmount;
        } else {
            spawner.Duration = weapon.TotalAmount;
        }

        spawners_activated++;
    }

    // Then, handle any spawners on child entities (e.g., shell casings)
    for (let child_entity of query_down(game.World, weapon_entity, Has.Spawn)) {
        if (child_entity === weapon_entity) continue; // Skip the main weapon, already handled

        let child_spawner = game.World.Spawn[child_entity];
        if (child_spawner) {
            // For child spawners (like shell casings), don't override their blueprint
            // but do activate them with timing synchronized to the main weapon

            // Activate the child spawner using weapon's TotalAmount
            if (child_spawner.Mode === SpawnMode.Count) {
                child_spawner.RemainingCount = weapon.TotalAmount;
            } else {
                child_spawner.Duration = weapon.TotalAmount;
            }

            spawners_activated++;
        }
    }

    console.log(
        `[RANGED] Entity ${wielder_entity} activated ${spawners_activated} spawner(s) toward target ${aim.TargetEntity}`,
    );
}

function execute_flamethrower_attack(
    game: Game,
    wielder_entity: number,
    weapon: Weapon,
    weapon_entity: number,
) {
    // Get direction from Aim component
    let aim = game.World.Aim[wielder_entity];
    DEBUG: if (!aim) throw new Error("wielder missing aim component");
    let to_target: Vec2 = [aim.DirectionToTarget[0], aim.DirectionToTarget[1]];

    // Find and activate the spawner on the weapon
    let spawner = game.World.Spawn[weapon_entity];
    DEBUG: if (!spawner) throw new Error("missing component");

    // Set spawn direction toward target
    spawner.Direction[0] = to_target[0];
    spawner.Direction[1] = to_target[1];

    // Update blueprint to use correct damage and source
    spawner.Blueprint = blueprint_flame_particle(weapon.Damage);

    // Activate the timed spawner using weapon's TotalAmount
    if (spawner.Mode === SpawnMode.Timed) {
        spawner.Duration = weapon.TotalAmount;
    }

    console.log(
        `[${Date.now()}] [FLAMETHROWER] Entity ${wielder_entity} activated spawner toward target ${aim.TargetEntity}`,
    );
}

function execute_grenade_launcher_attack(
    game: Game,
    wielder_entity: number,
    weapon: Weapon,
    weapon_entity: number,
) {
    let aim = game.World.Aim[wielder_entity];
    DEBUG: if (!aim) throw new Error("wielder missing aim component");
    let to_target: Vec2 = [aim.DirectionToTarget[0], aim.DirectionToTarget[1]];

    let wielder_transform = game.World.LocalTransform2D[wielder_entity];
    let target_transform = game.World.LocalTransform2D[aim.TargetEntity];
    DEBUG: if (!wielder_transform || !target_transform) throw new Error("missing component");

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
        spawner.SpeedMin, // Use spawn component's speed
        target_position,
    );

    // Activate the count-based spawner using weapon's TotalAmount
    if (spawner.Mode === SpawnMode.Count) {
        spawner.RemainingCount = weapon.TotalAmount;
    }

    console.log(
        `[GRENADE_LAUNCHER] Entity ${wielder_entity} activated grenade spawner toward target ${aim.TargetEntity}`,
    );
}

function execute_boomerang_attack(
    game: Game,
    wielder_entity: number,
    weapon: Weapon,
    weapon_entity: number,
) {
    let aim = game.World.Aim[wielder_entity];
    DEBUG: if (!aim) throw new Error("wielder missing aim component");
    let to_target: Vec2 = [aim.DirectionToTarget[0], aim.DirectionToTarget[1]];

    let wielder_transform = game.World.LocalTransform2D[wielder_entity];
    let target_transform = game.World.LocalTransform2D[aim.TargetEntity];
    DEBUG: if (!wielder_transform || !target_transform) throw new Error("missing component");

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
        spawner.SpeedMin, // Use spawn component's speed
    );

    // Activate the count-based spawner using weapon's TotalAmount
    if (spawner.Mode === SpawnMode.Count) {
        spawner.RemainingCount = weapon.TotalAmount;
    }

    console.log(
        `[BOOMERANG] Entity ${wielder_entity} activated boomerang spawner toward target ${aim.TargetEntity}`,
    );
}

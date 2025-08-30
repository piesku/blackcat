import {instantiate} from "../../lib/game.js";
import {mat2d_get_translation} from "../../lib/mat2d.js";
import {Vec2} from "../../lib/math.js";
import {clamp} from "../../lib/number.js";
import {vec2_copy, vec2_rotate} from "../../lib/vec2.js";
import {blueprint_boomerang_outward} from "../blueprints/projectiles/blu_boomerang.js";
import {blueprint_mortar_shell} from "../blueprints/projectiles/blu_mortar_shell.js";
import {query_down} from "../components/com_children.js";
import {AiState} from "../components/com_control_ai.js";
import {label, get_root_spawner} from "../components/com_label.js";
import {spawned_by} from "../components/com_spawned_by.js";
import {copy_position} from "../components/com_local_transform2d.js";
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

    // Player weapons fire when marked by sys_control_player
    if (ai.IsPlayer) {
        if (weapon.PlayerWantsToFire) {
            console.log(
                `[PLAYER_WEAPON] Activating marked player weapon for entity ${parent_entity}`,
            );
            // Reset the flag so it doesn't fire again next frame
            weapon.PlayerWantsToFire = false;
            return true;
        }
        return false;
    }

    // AI weapons activate in Circling, Pursuing, and Dashing states
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
            `[AI_WEAPON] Entity ${parent_entity} activating weapon (AI State: ${getAIStateName(ai.State)}, Target: ${aim.TargetEntity}, Distance: ${aim.DistanceToTarget.toFixed(2)})`,
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
        case "mortar":
            execute_mortar_attack(game, wielder_entity, weapon, weapon_entity);
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

    // Find and activate all spawners on the weapon and its children
    let spawners_activated = 0;

    // Handle all spawners on weapon entity and its children
    for (let spawn_entity of query_down(game.World, weapon_entity, Has.Spawn)) {
        let spawner = game.World.Spawn[spawn_entity];
        if (spawner) {
            // Only override direction if spawner wants weapon system to set it
            if (spawner.Direction === null) {
                spawner.Direction = [aim.DirectionToTarget[0], aim.DirectionToTarget[1]];
            }

            // Activate the spawner based on its mode using weapon's TotalAmount
            if (spawner.Mode === SpawnMode.Count) {
                spawner.RemainingCount = weapon.TotalAmount;
            } else {
                spawner.Duration = weapon.TotalAmount;
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

    // Find and activate the spawner on the weapon
    let spawner = game.World.Spawn[weapon_entity];
    DEBUG: if (!spawner) throw new Error("missing component");

    // Set spawn direction toward target
    if (spawner.Direction === null) {
        spawner.Direction = [aim.DirectionToTarget[0], aim.DirectionToTarget[1]];
    }

    // Activate the timed spawner using weapon's TotalAmount
    if (spawner.Mode === SpawnMode.Timed) {
        spawner.Duration = weapon.TotalAmount;
    }

    console.log(
        `[${Date.now()}] [FLAMETHROWER] Entity ${wielder_entity} activated spawner toward target ${aim.TargetEntity}`,
    );
}

let angled_direction: Vec2 = [0, 0];

function execute_mortar_attack(
    game: Game,
    wielder_entity: number,
    weapon: Weapon,
    weapon_entity: number,
) {
    let aim = game.World.Aim[wielder_entity];
    DEBUG: if (!aim) throw new Error("wielder missing aim component");

    // Find and activate the spawner on the weapon
    let spawner = game.World.Spawn[weapon_entity];
    DEBUG: if (!spawner) {
        throw new Error(`[MORTAR] Weapon ${weapon_entity} missing spawn component`);
    }

    // Calculate firing angle for mortar (45 degrees up from horizontal direction to target)
    let base_speed = (spawner.SpeedMin + spawner.SpeedMax) * 0.5;
    let firing_angle = Math.PI * 0.25; // 45 degrees for high arc

    // Calculate initial velocity components for mortar trajectory
    let horizontal_speed = base_speed * Math.cos(firing_angle);

    // Set spawn direction as angled upward toward target
    if (spawner.Direction === null) {
        // Rotate the already-normalized direction by the firing angle (45 degrees upward)
        vec2_rotate(angled_direction, aim.DirectionToTarget, firing_angle);
        spawner.Direction = [angled_direction[0], angled_direction[1]];
    }

    // Approximate flight time based on distance and trajectory
    // Using physics approximation: time = distance / horizontal_speed + extra for arc
    let approx_lifetime = clamp(0.8, 4.0, (aim.DistanceToTarget / horizontal_speed) * 1.2); // 20% extra for arc

    // Update blueprint to use calculated lifetime
    spawner.BlueprintCreator = () => blueprint_mortar_shell(approx_lifetime);

    // Activate the count-based spawner using weapon's TotalAmount
    if (spawner.Mode === SpawnMode.Count) {
        spawner.RemainingCount = weapon.TotalAmount;
    }

    console.log(
        `[MORTAR] Entity ${wielder_entity} firing mortar with ${approx_lifetime.toFixed(2)}s lifetime toward target ${aim.TargetEntity}`,
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

    let target_direction: Vec2 = [0, 0];
    vec2_copy(target_direction, aim.DirectionToTarget);

    let weapon_spatial = game.World.SpatialNode2D[weapon_entity];
    DEBUG: if (!weapon_spatial) throw new Error("weapon missing spatial node");

    // Get world position from spatial node
    let weapon_world_position: Vec2 = [0, 0];
    mat2d_get_translation(weapon_world_position, weapon_spatial.World);

    // Create and launch the boomerang directly at weapon location
    // Get the fighter entity for damage attribution
    let fighter_entity = get_root_spawner(game.World, weapon_entity);

    instantiate(game, [
        ...blueprint_boomerang_outward(
            target_direction, // direction to target
            aim.DistanceToTarget,
        ),
        copy_position(weapon_world_position), // Spawn at weapon's world position
        label("boomerang outward"),
        spawned_by(fighter_entity),
    ]);

    console.log(
        `[BOOMERANG] Entity ${wielder_entity} threw boomerang toward target ${aim.TargetEntity}`,
    );
}

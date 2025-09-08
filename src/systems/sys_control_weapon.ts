import {instantiate} from "../../lib/game.js";
import {mat2d_get_translation} from "../../lib/mat2d.js";
import {Vec2} from "../../lib/math.js";
import {clamp} from "../../lib/number.js";
import {vec2_copy} from "../../lib/vec2.js";
import {blueprint_boomerang_outward} from "../blueprints/projectiles/blu_boomerang.js";
import {blueprint_mortar_shell} from "../blueprints/projectiles/blu_mortar_shell.js";
import {query_down} from "../components/com_children.js";
import {AiState} from "../components/com_control_ai.js";
import {get_root_spawner, label} from "../components/com_label.js";
import {copy_position} from "../components/com_local_transform2d.js";
import {SpawnMode} from "../components/com_spawn.js";
import {spawned_by} from "../components/com_spawned_by.js";
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

            // Update cooldowns (can go negative for energy scaling)
            weapon.TimeToNext -= delta;

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

    // Check basic firing conditions
    // Scale cooldown comparison based on energy for all entities
    let cooldown_threshold = weapon.Cooldown - weapon.Cooldown / ai.Energy;

    let should_activate =
        (ai.State === AiState.Circling ||
            ai.State === AiState.Pursuing ||
            ai.State === AiState.Dashing) &&
        weapon.TimeToNext <= cooldown_threshold &&
        aim.TargetEntity !== -1 &&
        aim.DistanceToTarget <= weapon.Range;

    if (should_activate) {
        let entityType = ai.IsPlayer ? "PLAYER" : "AI";
        let energyInfo = ai.IsPlayer ? `, Energy: ${ai.Energy.toFixed(2)}` : "";
        console.log(
            `[${entityType}_WEAPON] Entity ${parent_entity} activating weapon (AI State: ${getAIStateName(ai.State)}, Target: ${aim.TargetEntity}, Distance: ${aim.DistanceToTarget.toFixed(2)}${energyInfo})`,
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
    let ai = game.World.ControlAi[wielder_entity];
    let health = game.World.Health[wielder_entity];
    DEBUG: if (!weapon || !ai || !health) throw new Error("missing component");

    // Calculate effective cooldown with trait bonuses
    let effective_cooldown = weapon.Cooldown;

    // Apply attack speed multiplier from traits (Quick Draw, Berserker)
    if (ai.AttackSpeedMultiplier) {
        effective_cooldown /= ai.AttackSpeedMultiplier;
    }

    // Apply berserker mode attack bonus when at low health
    if (ai.BerserkerMode) {
        if (health.Current / health.Max <= ai.BerserkerMode.LowHealthThreshold) {
            effective_cooldown /= ai.BerserkerMode.AttackBonus;
        }
    }

    // Set weapon on cooldown
    weapon.TimeToNext = effective_cooldown;

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
    for (let spawn_entity of query_down(
        game.World,
        weapon_entity,
        Has.Spawn | Has.LocalTransform2D,
    )) {
        let local_transform = game.World.LocalTransform2D[spawn_entity];
        let spawner = game.World.Spawn[spawn_entity];

        // Set spawner rotation to aim direction
        local_transform.Rotation = aim.RotationToTarget;

        // Mark entity as dirty so transform system updates it
        game.World.Signature[spawn_entity] |= Has.Dirty;

        // Activate the spawner based on its mode using weapon's TotalAmount
        if (spawner.Mode === SpawnMode.Count) {
            spawner.RemainingCount = weapon.TotalAmount;
        } else {
            spawner.Duration = weapon.TotalAmount;
        }

        spawners_activated++;
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

    // Set spawner rotation to aim direction
    let local_transform = game.World.LocalTransform2D[weapon_entity];
    DEBUG: if (!local_transform) throw new Error("missing component");

    local_transform.Rotation = aim.RotationToTarget;

    // Mark entity as dirty so transform system updates it
    game.World.Signature[weapon_entity] |= Has.Dirty;

    // Activate the timed spawner using weapon's TotalAmount
    if (spawner.Mode === SpawnMode.Timed) {
        spawner.Duration = weapon.TotalAmount;
    }

    console.log(
        `[${Date.now()}] [FLAMETHROWER] Entity ${wielder_entity} activated spawner toward target ${aim.TargetEntity}`,
    );
}

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
    DEBUG: if (!spawner) throw new Error("missing component");

    // Set spawn direction as angled upward toward target
    let local_transform = game.World.LocalTransform2D[weapon_entity];
    DEBUG: if (!local_transform) throw new Error("missing component");

    // Set mortar angle as 45 degrees upward, but facing left or right toward target
    let target_is_left = aim.DirectionToTarget[0] < 0;
    local_transform.Rotation = target_is_left ? 135 : 45; // 135° for left, 45° for right

    // Mark entity as dirty so transform system updates it
    game.World.Signature[weapon_entity] |= Has.Dirty;

    // Use shorter flight time for mortar shells (area effect weapon)
    let approx_lifetime = clamp(0.8, 1.8, 1.0 + aim.DistanceToTarget / 15.0); // Shorter duration

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

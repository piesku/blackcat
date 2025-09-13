import {query_down} from "../components/com_children.js";
import {AiState} from "../components/com_control_ai.js";
import {SpawnMode} from "../components/com_spawn.js";
import {Weapon} from "../components/com_weapon.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Weapon | Has.SpatialNode2D;

const ENERGY_COOLDOWN_SCALE = 0.5; // Cooldown is reduced by up to 50% at max energy

export function sys_control_weapon(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let weapon = game.World.Weapon[entity];
            DEBUG: if (!weapon) throw new Error("missing component");

            // Update cooldowns
            weapon.SinceLast += delta;

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
    let health = game.World.Health[parent_entity];
    DEBUG: if (!ai || !aim || !health) throw new Error("missing component");

    // Check basic firing conditions
    // Scale cooldown comparison based on energy for all entities
    // When energy is 0, use full cooldown; as energy increases, reduce cooldown
    let effective_cooldown = weapon.Cooldown / (1 + ai.Energy * ENERGY_COOLDOWN_SCALE);

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

    let should_activate =
        (ai.State === AiState.Circling || ai.State === AiState.Dashing) &&
        weapon.SinceLast >= effective_cooldown &&
        aim.TargetEntity !== -1 &&
        aim.DistanceToTarget <= weapon.Range;

    if (should_activate) {
        let entityType = ai.IsPlayer ? "PLAYER" : "AI";
        let energyInfo = ai.IsPlayer ? `, Energy: ${ai.Energy.toFixed(2)}` : "";
        console.log(
            `[${entityType}_WEAPON] Entity ${parent_entity} activating weapon (Target: ${aim.TargetEntity}, Distance: ${aim.DistanceToTarget.toFixed(2)}${energyInfo})`,
        );
    }

    return should_activate;
}

function activate_weapon(game: Game, wielder_entity: number, weapon_entity: number) {
    let weapon = game.World.Weapon[weapon_entity];
    DEBUG: if (!weapon) throw new Error("missing component");

    // Set weapon on cooldown
    weapon.SinceLast = 0;

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
            spawner.Count = weapon.TotalAmount;
        } else {
            spawner.Duration = weapon.TotalAmount;
        }

        spawners_activated++;
    }

    console.log(
        `[RANGED] Entity ${wielder_entity} activated ${spawners_activated} spawner(s) toward target ${aim.TargetEntity}`,
    );
}

import {query_down} from "../components/com_children.js";
import {SpawnMode} from "../components/com_spawn.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.ControlAi | Has.Aim;

export function sys_control_player(game: Game, delta: number) {
    // Check for mouse click or touch input
    let should_shoot = game.InputDelta.Mouse0 === 1 || game.InputDelta.Touch0 === 1;

    if (!should_shoot) {
        return;
    }

    // Find the player entity
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let ai = game.World.ControlAi[entity];
            let aim = game.World.Aim[entity];
            DEBUG: if (!ai || !aim) throw new Error("missing component");

            // Only process player entities
            if (!ai.IsPlayer) {
                continue;
            }

            // Must have a valid target to shoot at
            if (aim.TargetEntity === -1) {
                console.log(`[PLAYER_SHOOT] No target for player entity ${entity}`);
                continue;
            }

            // Find all weapons attached to this player and try to fire the first ready one
            let weapon_fired = false;
            for (let weapon_entity of query_down(game.World, entity, Has.Weapon)) {
                let weapon = game.World.Weapon[weapon_entity];
                DEBUG: if (!weapon) throw new Error("missing weapon component");

                // Check if weapon is ready (off cooldown) and in range
                if (weapon.LastAttackTime <= 0 && aim.DistanceToTarget <= weapon.Range) {
                    // Fire this weapon using the existing weapon activation system
                    activate_player_weapon(game, entity, weapon_entity);
                    weapon_fired = true;
                    console.log(`[PLAYER_SHOOT] Player fired weapon at entity ${weapon_entity}`);
                    break; // Only fire one weapon per click
                }
            }

            if (!weapon_fired) {
                console.log(`[PLAYER_SHOOT] No ready weapons for player entity ${entity}`);
            }
        }
    }
}

// Reuse the weapon activation logic from sys_control_weapon
function activate_player_weapon(game: Game, wielder_entity: number, weapon_entity: number) {
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

// Copy necessary helper functions from sys_control_weapon.ts
function get_weapon_name(game: Game, weapon_entity: number): string | null {
    if (!(game.World.Signature[weapon_entity] & Has.Label)) return null;
    let label_component = game.World.Label[weapon_entity];
    return label_component ? label_component.Name || null : null;
}

function execute_ranged_attack(
    game: Game,
    wielder_entity: number,
    weapon: any,
    weapon_entity: number,
) {
    let aim = game.World.Aim[wielder_entity];
    DEBUG: if (!aim) throw new Error("missing component");

    let spawners_activated = 0;

    for (let spawn_entity of query_down(game.World, weapon_entity, Has.Spawn)) {
        let spawner = game.World.Spawn[spawn_entity];
        if (spawner) {
            if (spawner.Direction === null) {
                spawner.Direction = [aim.DirectionToTarget[0], aim.DirectionToTarget[1]];
            }

            if (spawner.Mode === SpawnMode.Count) {
                spawner.RemainingCount = weapon.TotalAmount;
            } else {
                spawner.Duration = weapon.TotalAmount;
            }

            spawners_activated++;
        }
    }

    console.log(
        `[PLAYER_RANGED] Entity ${wielder_entity} activated ${spawners_activated} spawner(s) toward target ${aim.TargetEntity}`,
    );
}

function execute_flamethrower_attack(
    game: Game,
    wielder_entity: number,
    weapon: any,
    weapon_entity: number,
) {
    let aim = game.World.Aim[wielder_entity];
    DEBUG: if (!aim) throw new Error("wielder missing aim component");

    let spawner = game.World.Spawn[weapon_entity];
    DEBUG: if (!spawner) throw new Error("missing component");

    if (spawner.Direction === null) {
        spawner.Direction = [aim.DirectionToTarget[0], aim.DirectionToTarget[1]];
    }

    if (spawner.Mode === SpawnMode.Timed) {
        spawner.Duration = weapon.TotalAmount;
    }

    console.log(
        `[PLAYER_FLAMETHROWER] Entity ${wielder_entity} activated spawner toward target ${aim.TargetEntity}`,
    );
}

function execute_mortar_attack(
    game: Game,
    wielder_entity: number,
    weapon: any,
    weapon_entity: number,
) {
    // Import necessary functions - for now, simplified version
    let aim = game.World.Aim[wielder_entity];
    DEBUG: if (!aim) throw new Error("wielder missing aim component");

    let spawner = game.World.Spawn[weapon_entity];
    DEBUG: if (!spawner) throw new Error("missing component");

    // Simplified mortar logic
    if (spawner.Direction === null) {
        spawner.Direction = [aim.DirectionToTarget[0], aim.DirectionToTarget[1]];
    }

    if (spawner.Mode === SpawnMode.Count) {
        spawner.RemainingCount = weapon.TotalAmount;
    }

    console.log(
        `[PLAYER_MORTAR] Entity ${wielder_entity} firing mortar toward target ${aim.TargetEntity}`,
    );
}

function execute_boomerang_attack(
    game: Game,
    wielder_entity: number,
    weapon: any,
    weapon_entity: number,
) {
    // Simplified boomerang logic for now
    let aim = game.World.Aim[wielder_entity];
    DEBUG: if (!aim) throw new Error("wielder missing aim component");

    console.log(
        `[PLAYER_BOOMERANG] Entity ${wielder_entity} threw boomerang toward target ${aim.TargetEntity}`,
    );
}

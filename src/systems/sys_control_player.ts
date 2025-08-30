import {query_down} from "../components/com_children.js";
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
                console.log(`[PLAYER_INPUT] No target for player entity ${entity}`);
                continue;
            }

            // Find all weapons attached to this player and mark the first ready one for firing
            let weapon_marked = false;
            for (let weapon_entity of query_down(game.World, entity, Has.Weapon)) {
                let weapon = game.World.Weapon[weapon_entity];
                DEBUG: if (!weapon) throw new Error("missing weapon component");

                // Check if weapon is ready (off cooldown) and in range
                if (weapon.LastAttackTime <= 0 && aim.DistanceToTarget <= weapon.Range) {
                    // Mark this weapon for firing - sys_control_weapon will handle the actual firing
                    weapon.PlayerWantsToFire = true;
                    weapon_marked = true;
                    console.log(`[PLAYER_INPUT] Marked weapon ${weapon_entity} for firing`);
                    break; // Only mark one weapon per click
                }
            }

            if (!weapon_marked) {
                console.log(`[PLAYER_INPUT] No ready weapons for player entity ${entity}`);
            }
        }
    }
}

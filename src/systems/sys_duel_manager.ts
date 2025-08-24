import {Action, dispatch} from "../actions.js";
import {Game, GameView} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Health | Has.ControlAi;

// TODO Consider checking for victory conditions in action handlers.
export function sys_duel_manager(game: Game, delta: number) {
    // Only run in arena view
    if (game.CurrentView !== GameView.Arena) {
        return;
    }

    let players: number[] = [];
    let opponents: number[] = [];
    let alivePlayers = 0;
    let aliveOpponents = 0;

    // Find all fighters and categorize them
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let health = game.World.Health[entity];
            let ai = game.World.ControlAi[entity];

            if (ai.IsPlayer) {
                players.push(entity);
                if (health.IsAlive) {
                    alivePlayers++;
                }
            } else {
                opponents.push(entity);
                if (health.IsAlive) {
                    aliveOpponents++;
                }
            }
        }
    }

    // Check for duel resolution
    if (alivePlayers === 0 && aliveOpponents > 0) {
        // Player(s) died - defeat
        console.log("[DUEL] Player defeated!");
        dispatch(game, Action.DuelDefeat);
    } else if (aliveOpponents === 0 && alivePlayers > 0) {
        // Opponent(s) died - victory
        console.log("[DUEL] Player victorious!");
        dispatch(game, Action.DuelVictory);
    } else if (alivePlayers === 0 && aliveOpponents === 0) {
        // Mutual destruction - count as defeat
        console.log("[DUEL] Mutual destruction - defeat!");
        dispatch(game, Action.DuelDefeat);
    }
    // If both sides have alive entities, continue the duel
}

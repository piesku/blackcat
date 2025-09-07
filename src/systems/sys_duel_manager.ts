import {Action, dispatch} from "../actions.js";
import {Game, GameView} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Health | Has.ControlAi | Has.Label;

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

    // Find all main fighters (only entities with "Player" or "Opponent" labels)
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let health = game.World.Health[entity];
            let ai = game.World.ControlAi[entity];
            let label = game.World.Label[entity];

            // Only count main fighters, not companion cats
            if (label && (label.Name === "Player" || label.Name === "Opponent")) {
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
    }

    // Handle delayed duel resolution
    if (game.DuelEndData) {
        // We're in the delay period, count down
        game.DuelEndData.DelayRemaining -= delta;

        if (game.DuelEndData.DelayRemaining <= 0) {
            // Delay finished, trigger the actual victory/defeat
            if (game.DuelEndData.Type === "victory") {
                console.log("[DUEL] Victory delay finished - showing victory screen");
                dispatch(game, Action.DuelVictory);
            } else {
                console.log("[DUEL] Defeat delay finished - showing defeat screen");
                dispatch(game, Action.DuelDefeat);
            }
            // Clear the delay data
            game.DuelEndData = undefined;
        }
        return; // Don't check for new resolution while delay is active
    }

    // Check for duel resolution
    if (alivePlayers === 0 && aliveOpponents > 0) {
        // Player(s) died - start defeat delay
        console.log("[DUEL] Player defeated! Starting delay...");
        game.DuelEndData = {
            Type: "defeat",
            DelayRemaining: 3.0, // 3 second delay
        };
    } else if (aliveOpponents === 0 && alivePlayers > 0) {
        // Opponent(s) died - start victory delay
        console.log("[DUEL] Player victorious! Starting delay...");
        game.DuelEndData = {
            Type: "victory",
            DelayRemaining: 3.0, // 3 second delay
        };
    } else if (alivePlayers === 0 && aliveOpponents === 0) {
        // Mutual destruction - start defeat delay
        console.log("[DUEL] Mutual destruction! Starting delay...");
        game.DuelEndData = {
            Type: "defeat",
            DelayRemaining: 3.0, // 3 second delay
        };
    }
    // If both sides have alive entities, continue the duel
}

import {Game} from "../game.js";
import {Has} from "../world.js";
import {getAIStateName} from "./ai_state.js";

export interface FighterStats {
    playerHP: string;
    opponentHP: string;
    playerAIState: string;
    opponentAIState: string;
}

export function getFighterStats(game: Game): FighterStats {
    let playerHP = "?";
    let opponentHP = "?";
    let playerAIState = "Unknown";
    let opponentAIState = "Unknown";

    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if (game.World.Signature[entity] & Has.ControlAi) {
            let ai = game.World.ControlAi[entity];
            if (!ai) continue;

            // Get health info
            let healthInfo = "?/?";
            if (game.World.Signature[entity] & Has.Health) {
                let health = game.World.Health[entity];
                if (health) {
                    healthInfo = `${Math.ceil(health.Current)}/${health.Max}`;
                }
            }

            // Get AI state info
            let aiStateInfo = getAIStateName(ai.State);

            // Use IsPlayer property to distinguish
            if (ai.IsPlayer) {
                playerHP = healthInfo;
                playerAIState = aiStateInfo;
            } else {
                opponentHP = healthInfo;
                opponentAIState = aiStateInfo;
            }
        }
    }

    return {
        playerHP,
        opponentHP,
        playerAIState,
        opponentAIState,
    };
}

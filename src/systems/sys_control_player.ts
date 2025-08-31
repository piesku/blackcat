import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.ControlPlayer | Has.ControlAi | Has.LocalTransform2D | Has.Move2D;

const ENERGY_PER_TAP = 0.3; // Seconds of movement per tap
const MAX_ENERGY = 1.0; // Maximum stored energy

export function sys_control_player(game: Game, delta: number) {
    // Check for tap/click (transition from up to down)
    let just_tapped = game.InputDelta.Mouse0 === 1 || game.InputDelta.Touch0 === 1;

    // Find the player entity and manage movement energy
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let ai = game.World.ControlAi[entity];
            let move = game.World.Move2D[entity];
            DEBUG: if (!ai || !move) throw new Error("missing component");

            // Add energy on tap/click
            if (just_tapped) {
                ai.MovementEnergy += ENERGY_PER_TAP;
                if (ai.MovementEnergy > MAX_ENERGY) {
                    ai.MovementEnergy = MAX_ENERGY;
                }

                console.log(`[PLAYER_INPUT] Tap! Energy: ${ai.MovementEnergy.toFixed(1)}s`);
            }

            // Decay energy over time
            ai.MovementEnergy -= delta;
            if (ai.MovementEnergy < 0) {
                ai.MovementEnergy = 0;
            }

            // Energy multiplier is now applied in sys_control_ai to the movement direction
            if (ai.MovementEnergy === 0) {
                console.log(`[PLAYER_ENERGY] No energy - fighter stopped`);
            } else if (ai.MovementEnergy < 0.5) {
                console.log(
                    `[PLAYER_ENERGY] Low energy - fighter slowing (${ai.MovementEnergy.toFixed(2)}x speed)`,
                );
            }
        }
    }
}

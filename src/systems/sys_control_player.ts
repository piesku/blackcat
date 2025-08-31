import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.ControlPlayer | Has.ControlAi | Has.LocalTransform2D | Has.Move2D;

const BASE_ENERGY_PER_TAP = 0.3; // Base energy gain per tap
const DIMINISH_FACTOR = 0.5; // How much energy reduces tap effectiveness
const ENERGY_DECAY_RATE = 1.0; // Constant energy decay per second

export function sys_control_player(game: Game, delta: number) {
    // Check for tap/click (transition from up to down)
    let just_tapped = game.InputDelta.Mouse0 === 1 || game.InputDelta.Touch0 === 1;

    // Find the player entity and manage unified energy
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let ai = game.World.ControlAi[entity];
            let move = game.World.Move2D[entity];
            DEBUG: if (!ai || !move) throw new Error("missing component");

            // Add energy on tap/click with diminishing returns
            if (just_tapped) {
                // Less energy per tap when you already have more energy
                let energy_multiplier = 1.0 / (1.0 + ai.Energy * DIMINISH_FACTOR);
                let energy_gain = BASE_ENERGY_PER_TAP * energy_multiplier;
                ai.Energy += energy_gain;
                console.log(
                    `[PLAYER_INPUT] Tap! +${energy_gain.toFixed(2)} energy (${energy_multiplier.toFixed(2)}x multiplier). Total: ${ai.Energy.toFixed(1)}s`,
                );
            }

            // Constant decay over time
            ai.Energy -= ENERGY_DECAY_RATE * delta;
            if (ai.Energy < 0) {
                ai.Energy = 0;
            }

            // Energy multiplier is now applied in sys_control_ai for movement and sys_control_weapon for shooting
            if (ai.Energy === 0) {
                console.log(`[PLAYER_ENERGY] No energy - fighter stopped and can't shoot`);
            } else if (ai.Energy < 0.5) {
                console.log(
                    `[PLAYER_ENERGY] Low energy - fighter slowing and shooting slower (${ai.Energy.toFixed(2)}x speed)`,
                );
            }
        }
    }
}

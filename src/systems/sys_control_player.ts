import {query_down} from "../components/com_children.js";
import {SpawnMode} from "../components/com_spawn.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.ControlPlayer | Has.ControlAi | Has.LocalTransform2D | Has.Move2D | Has.Health;

const BASE_ENERGY_PER_TAP = 0.3; // Base energy gain per tap
const DIMINISH_FACTOR = 0.2; // How much energy reduces tap effectiveness
const ENERGY_DECAY_RATE = 1.0; // Constant energy decay per second
const BASE_ENERGY = 1.0; // Minimum energy when idle (not 0)
const HEALING_RATE = 1; // HP per second when holding (constant)
const MIN_HEALING_ENERGY = 0.0; // Asymptotic minimum energy (never actually reached)
const HEALING_DRAIN_STRENGTH = 1.0; // How aggressively energy drains (higher = faster initial drain)
const HOLD_THRESHOLD = 0.2; // Seconds before hold is considered intentional healing
const POWER_DECAY_RATE = 16.0; // How fast power scale decays back to 1.0 per second

// Module-level hold timer
let hold_timer = 0;

export function sys_control_player(game: Game, delta: number) {
    // Check if holding mouse/touch (currently pressed)
    let is_holding = game.InputState.Mouse0 === 1 || game.InputState.Touch0 === 1;

    // Update module-level hold timer (once per frame, outside entity loop)
    let was_quick_tap = false;

    if (is_holding) {
        hold_timer += delta;
    } else {
        // Handle tap if just released and was below hold threshold
        if (game.InputDelta.Mouse0 === -1 || game.InputDelta.Touch0 === -1) {
            if (hold_timer > 0 && hold_timer < HOLD_THRESHOLD) {
                was_quick_tap = true;
            }
        }
        hold_timer = 0;
    }

    // Find the player entity and manage unified energy
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let ai = game.World.ControlAi[entity];
            let move = game.World.Move2D[entity];
            let health = game.World.Health[entity];
            let control = game.World.ControlPlayer[entity];
            DEBUG: if (!ai || !move || !health || !control) throw new Error("missing component");

            // Handle tap energy gain (only for player entities)
            if (was_quick_tap && ai.IsPlayer) {
                // This was a quick tap/click - add energy with diminishing returns
                let energy_multiplier = 1.0 / (1.0 + ai.Energy * DIMINISH_FACTOR);
                let energy_gain = BASE_ENERGY_PER_TAP * energy_multiplier;
                ai.Energy += energy_gain;
                console.log(
                    `[PLAYER_INPUT] Click/Tap! +${energy_gain.toFixed(2)} energy (${energy_multiplier.toFixed(2)}x multiplier). Total: ${ai.Energy.toFixed(1)}s`,
                );
            }

            // Handle energy and healing based on hold state
            let is_intentional_hold = is_holding && hold_timer >= HOLD_THRESHOLD;

            if (is_intentional_hold && health.IsAlive) {
                // POWER MODE: Intentional holding drains energy for both healing and power scaling

                // Calculate energy drain rate using exponential decay formula
                // Formula: drain_rate = strength * (current_energy - min_energy)
                // This creates fast initial drain that slows down as energy approaches minimum
                let energy_above_minimum = ai.Energy - MIN_HEALING_ENERGY;
                let drain_rate = HEALING_DRAIN_STRENGTH * energy_above_minimum;

                // Apply the calculated drain rate
                ai.Energy -= drain_rate * delta;

                // Ensure we never go below the minimum (mathematical safety net)
                if (ai.Energy < MIN_HEALING_ENERGY) {
                    ai.Energy = MIN_HEALING_ENERGY;
                }

                // Only heal if below max health
                if (health.Current < health.Max) {
                    // Heal based on healing rate scaled by current energy
                    let heal_amount = HEALING_RATE * ai.Energy * delta;
                    let health_before = health.Current;

                    health.Current += heal_amount;
                    if (health.Current > health.Max) {
                        health.Current = health.Max;
                    }

                    if (health.Current > health_before) {
                        let current_drain_rate =
                            HEALING_DRAIN_STRENGTH * (ai.Energy - MIN_HEALING_ENERGY);
                        console.log(
                            `[PLAYER_HEAL] Holding (${hold_timer.toFixed(1)}s) - healing ${(health.Current - health_before).toFixed(2)} HP (${health_before.toFixed(1)} -> ${health.Current.toFixed(1)}), energy: ${ai.Energy.toFixed(2)} (${ai.Energy.toFixed(2)}x heal rate, drain: ${current_drain_rate.toFixed(2)}/s)`,
                        );

                        // Activate healing particle effects on heal spawner child entity
                        for (let child_entity of query_down(
                            game.World,
                            entity,
                            Has.Spawn | Has.Label,
                        )) {
                            let label = game.World.Label[child_entity];
                            if (label && label.Name === "heal_spawner") {
                                let spawn = game.World.Spawn[child_entity];
                                if (spawn.Mode === SpawnMode.Count) {
                                    // Add particles for healing effect
                                    spawn.RemainingCount ||= 1;
                                }
                                break; // Found the heal spawner, no need to continue
                            }
                        }
                    }
                }
            } else if (!is_holding) {
                // NORMAL MODE: Not holding - energy restores/decays toward BASE_ENERGY (1.0)

                if (ai.Energy > BASE_ENERGY) {
                    // Decay high energy back to baseline
                    ai.Energy -= ENERGY_DECAY_RATE * delta;
                    if (ai.Energy < BASE_ENERGY) {
                        ai.Energy = BASE_ENERGY;
                    }
                } else if (ai.Energy < BASE_ENERGY) {
                    // Restore low energy (from healing) back to baseline
                    ai.Energy += ENERGY_DECAY_RATE * delta;
                    if (ai.Energy > BASE_ENERGY) {
                        ai.Energy = BASE_ENERGY;
                    }
                }
            }

            // Calculate power scaling based on energy consumed during hold (only for player entities)
            if (ai.IsPlayer) {
                if (is_intentional_hold && health.IsAlive) {
                    // Record initial energy when hold starts
                    if (hold_timer <= HOLD_THRESHOLD + delta) {
                        // Just started holding - record the initial energy level
                        control.HoldStartEnergy = ai.Energy;
                    }

                    // Power scaling = energy consumed during this hold session
                    // If started with 4 energy and now have 2 energy, scale = 4 - 2 = 2x
                    let energy_consumed = control.HoldStartEnergy - ai.Energy;
                    control.PowerScale = 1.0 + Math.max(0, energy_consumed);
                } else {
                    // Not holding - decay power scale back to 1.0 over a few frames
                    if (control.PowerScale > 1.0) {
                        control.PowerScale -= POWER_DECAY_RATE * delta;
                        if (control.PowerScale < 1.0) {
                            control.PowerScale = 1.0;
                        }
                    }
                    // Reset hold start energy for next session
                    control.HoldStartEnergy = ai.Energy;
                }

                console.log(
                    `[PLAYER_POWER] Energy: ${ai.Energy.toFixed(2)}, Hold: ${hold_timer.toFixed(2)}s, HoldStart: ${control.HoldStartEnergy.toFixed(2)}, Scale: ${control.PowerScale.toFixed(2)}x`,
                );

                // Apply power scaling to visual scale directly
                let transform = game.World.LocalTransform2D[entity];
                if (transform) {
                    transform.Scale[0] = control.PowerScale;
                    transform.Scale[1] = control.PowerScale;
                    // Mark entity as dirty so transform system updates it
                    game.World.Signature[entity] |= Has.Dirty;
                }
            }

            // Energy multiplier is now applied in sys_control_ai for movement and sys_control_weapon for shooting
            if (is_holding && health.Current < health.Max) {
                console.log(
                    `[PLAYER_ENERGY] Healing mode - fighter slowing due to healing (${ai.Energy.toFixed(2)}x speed)`,
                );
            } else if (ai.Energy < BASE_ENERGY + 0.5) {
                console.log(
                    `[PLAYER_ENERGY] Normal energy - fighter at base speed (${ai.Energy.toFixed(2)}x speed)`,
                );
            } else {
                console.log(
                    `[PLAYER_ENERGY] High energy - fighter moving faster (${ai.Energy.toFixed(2)}x speed)`,
                );
            }
        }
    }
}

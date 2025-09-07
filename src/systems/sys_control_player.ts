import {instantiate} from "../../lib/game.js";
import {mat2d_get_translation} from "../../lib/mat2d.js";
import {blueprint_shockwave_burst} from "../blueprints/particles/blu_shockwave_burst.js";
import {copy_position} from "../components/com_local_transform2d.js";
import {spawned_by} from "../components/com_spawned_by.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.ControlPlayer | Has.ControlAi | Has.LocalTransform2D | Has.Move2D | Has.Health;

const DIMINISH_FACTOR = 0.2; // How much energy reduces tap effectiveness
const BASE_ENERGY = 1.0; // Baseline energy when idle
const MIN_HEALING_ENERGY = 0.0; // Asymptotic minimum energy (never actually reached)
const HOLD_THRESHOLD = 0.2; // Seconds before hold is considered intentional healing

// Module-level hold timer
let hold_timer = 0;

export function sys_control_player(game: Game, delta: number) {
    // Check if holding pointer (currently pressed)
    let is_holding = game.PointerState === 1;

    // Calculate transition states (once per frame, outside entity loop)
    let just_stopped_holding = game.PointerDelta === -1;
    let was_quick_tap = false;

    if (is_holding) {
        hold_timer += delta;
    } else {
        // Handle tap if just released and was below hold threshold
        if (game.PointerDelta === -1) {
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
                // Apply tapping with diminishing returns (math naturally handles EnergyPerTap = 0)
                let energy_multiplier = 1.0 / (1.0 + ai.Energy * DIMINISH_FACTOR);
                let energy_gain = ai.EnergyPerTap * energy_multiplier;
                ai.Energy += energy_gain;

                // Log only when energy is actually gained
                if (ai.EnergyPerTap > 0) {
                    console.log(
                        `[PLAYER_INPUT] Click/Tap! +${energy_gain.toFixed(2)} energy (${energy_multiplier.toFixed(2)}x multiplier). Total: ${ai.Energy.toFixed(1)}s`,
                    );
                } else {
                    console.log(`[PLAYER_INPUT] Tapping disabled - no energy upgrade equipped`);
                }
            }

            // Handle energy and healing based on hold state
            let is_intentional_hold = is_holding && hold_timer >= HOLD_THRESHOLD;

            if (is_intentional_hold && health.IsAlive) {
                // POWER MODE: Intentional holding drains energy for both healing and power scaling

                // Calculate energy drain rate using exponential decay formula
                // Formula: drain_rate = strength * (current_energy - min_energy)
                // This creates fast initial drain that slows down as energy approaches minimum
                let energy_above_minimum = ai.Energy - MIN_HEALING_ENERGY;
                let drain_rate = ai.HealingDrainStrength * energy_above_minimum;

                // Apply the calculated drain rate
                ai.Energy -= drain_rate * delta;

                // Ensure we never go below the minimum (mathematical safety net)
                if (ai.Energy < MIN_HEALING_ENERGY) {
                    ai.Energy = MIN_HEALING_ENERGY;
                }

                // Only heal if below max health and healing is enabled
                if (health.Current < health.Max && ai.HealingRate > 0) {
                    // Calculate heal amount based on healing rate scaled by current energy
                    let heal_amount = ai.HealingRate * ai.Energy * delta;

                    // Add to pending healing for sys_health to process
                    health.PendingHealing.push({
                        Amount: heal_amount,
                        Source: entity,
                        Type: "player_healing",
                    });

                    let current_drain_rate =
                        ai.HealingDrainStrength * (ai.Energy - MIN_HEALING_ENERGY);
                    console.log(
                        `[PLAYER_HEAL] Holding (${hold_timer.toFixed(1)}s) - requesting ${heal_amount.toFixed(2)} HP healing, energy: ${ai.Energy.toFixed(2)} (${ai.Energy.toFixed(2)}x heal rate, drain: ${current_drain_rate.toFixed(2)}/s)`,
                    );
                } else if (health.Current < health.Max && ai.HealingRate === 0) {
                    console.log(
                        `[PLAYER_HEAL] Holding (${hold_timer.toFixed(1)}s) - healing disabled, no healing upgrade equipped`,
                    );
                }
            } else if (!is_holding) {
                // NORMAL MODE: Not holding - energy restores/decays toward BASE_ENERGY (1.0)

                if (ai.Energy > BASE_ENERGY) {
                    // Decay high energy back to baseline
                    ai.Energy -= ai.EnergyDecayRate * delta;
                    if (ai.Energy < BASE_ENERGY) {
                        ai.Energy = BASE_ENERGY;
                    }
                } else if (ai.Energy < BASE_ENERGY) {
                    // Restore low energy (from healing) back to baseline
                    ai.Energy += ai.EnergyDecayRate * delta;
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

                    // Shockwave Burst: Trigger when power release begins (just stopped holding with accumulated power)
                    if (
                        ai.ShockwaveBurstEnabled &&
                        control.PowerScale > 1.0 &&
                        just_stopped_holding
                    ) {
                        // Calculate particle count based on accumulated power scale
                        let particle_count = Math.floor(control.PowerScale * 4); // Base formula: 1x = 4 particles, 2x = 8 particles, etc.

                        // Create a shockwave burst entity that handles particle spawning
                        let spatial_node = game.World.SpatialNode2D[entity];
                        if (spatial_node) {
                            let position: [number, number] = [0, 0];
                            mat2d_get_translation(position, spatial_node.World);

                            instantiate(game, [
                                ...blueprint_shockwave_burst(particle_count),
                                copy_position(position),
                                spawned_by(entity),
                            ]);
                        }

                        console.log(
                            `[SHOCKWAVE_BURST] Power release - spawning ${particle_count} shockwave particles! (PowerScale: ${control.PowerScale.toFixed(2)}x)`,
                        );
                    }

                    if (control.PowerScale > 1.0) {
                        control.PowerScale -= ai.PowerDecayRate * delta;
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

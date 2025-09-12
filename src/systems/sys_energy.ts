/**
 * # sys_energy
 *
 * Combat-driven energy system that generates power from dealing and taking damage.
 * Handles energy decay, threshold-based healing, visual size scaling, and damage output scaling.
 *
 * Key Features:
 * - Energy generated from damage dealt/taken (set in sys_deal_damage and sys_health)
 * - Visual size scaling based on energy level (1.0x → 5.0x)
 * - Damage output scaling (1.0x → 2.5x via square root)
 * - Threshold-based auto-healing when energy is high
 * - Energy decay over time toward baseline
 * - Risk/reward: higher energy = larger hitbox + more damage
 */

import {instantiate} from "../../lib/game.js";
import {map_range} from "../../lib/number.js";
import {blueprint_shockwave_burst} from "../blueprints/particles/blu_shockwave_burst.js";
import {ControlAi} from "../components/com_control_ai.js";
import {Health} from "../components/com_health.js";
import {copy_position, LocalTransform2D} from "../components/com_local_transform2d.js";
import {spawned_by} from "../components/com_spawned_by.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.ControlAi | Has.LocalTransform2D | Has.Health;

// Energy system constants
const BASE_ENERGY = 1.0; // Baseline energy when idle (also minimum)
const MAX_ENERGY = 5.0; // Maximum energy level for scaling
const SIZE_SCALE_RANGE = 4.0; // How much size can scale (1.0x → 5.0x)

// Healing constants
const ENERGY_HEALING_THRESHOLD = 0.5; // Percentage of max energy needed for healing

export function sys_energy(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let ai = game.World.ControlAi[entity];
            let transform = game.World.LocalTransform2D[entity];
            let health = game.World.Health[entity];

            DEBUG: if (!ai || !transform || !health) throw new Error("missing component");

            // Entity has Health component, so it's alive - process energy

            // 1. Handle energy decay toward baseline
            handle_energy_decay(ai, delta);

            // 2. Handle threshold-based auto-healing
            handle_auto_healing(entity, ai, health, delta);

            // 3. Handle visual size scaling based on energy
            handle_size_scaling(ai, transform);

            // 4. Handle shockwave burst at max energy
            handle_shockwave_burst(game, entity, ai);

            // 5. Update movement speed based on energy
            update_movement_speed(game, entity, ai);

            // Visual scaling requires transform update
            game.World.Signature[entity] |= Has.Dirty;
        }
    }
}

/**
 * Handle energy decay toward baseline over time
 */
function handle_energy_decay(ai: ControlAi, delta: number) {
    if (ai.Energy > BASE_ENERGY) {
        // Decay toward baseline using exponential approach
        let decay_amount = (ai.Energy - BASE_ENERGY) * ai.EnergyDecayRate * delta;
        ai.Energy = Math.max(BASE_ENERGY, ai.Energy - decay_amount);
    } else if (ai.Energy < BASE_ENERGY) {
        // Recover toward baseline (slower than decay)
        let recovery_amount = (BASE_ENERGY - ai.Energy) * (ai.EnergyDecayRate * 0.5) * delta;
        ai.Energy = Math.min(BASE_ENERGY, ai.Energy + recovery_amount);
    }

    // Ensure energy stays within bounds (never below baseline)
    ai.Energy = Math.max(BASE_ENERGY, Math.min(MAX_ENERGY, ai.Energy));
}

/**
 * Handle threshold-based auto-healing when energy is high enough
 */
function handle_auto_healing(entity: number, ai: ControlAi, health: Health, delta: number): number {
    let healing_applied = 0;

    // Check if we have healing capability and sufficient energy
    if (ai.HealingRate > 0 && health.Current < health.Max) {
        let energy_threshold = MAX_ENERGY * ENERGY_HEALING_THRESHOLD;

        if (ai.Energy >= energy_threshold) {
            // Add healing to pending queue (will be processed by sys_health)
            let healing_rate = ai.HealingRate;
            healing_applied = healing_rate * delta;

            health.PendingHealing.push({
                Amount: healing_applied,
                Source: entity,
                Type: "energy_healing",
            });
        }
    }

    return healing_applied;
}

/**
 * Handle visual size scaling based on energy level
 */
function handle_size_scaling(ai: ControlAi, transform: LocalTransform2D) {
    let size_multiplier = map_range(
        ai.Energy,
        BASE_ENERGY,
        MAX_ENERGY,
        1.0,
        1.0 + SIZE_SCALE_RANGE,
    );

    // Store base scale if not already stored
    if (!ai.BaseScale) {
        ai.BaseScale = transform.Scale[0]; // Assume uniform scaling
    }

    // Apply size scaling
    let new_scale = ai.BaseScale * size_multiplier;
    transform.Scale[0] = new_scale;
    transform.Scale[1] = new_scale;
}

/**
 * Handle shockwave burst when energy reaches maximum
 */
function handle_shockwave_burst(game: Game, entity: number, ai: ControlAi) {
    if (ai.ShockwaveBurstEnabled && ai.Energy >= MAX_ENERGY && !ai.ShockwaveBurstTriggered) {
        // Get entity position for shockwave burst
        let transform = game.World.LocalTransform2D[entity];
        let position: [number, number] = [transform.Translation[0], transform.Translation[1]];

        // Trigger shockwave burst with proper positioning
        instantiate(game, [
            ...blueprint_shockwave_burst(8),
            copy_position(position),
            spawned_by(entity),
        ]);

        // Mark as triggered to prevent spam
        ai.ShockwaveBurstTriggered = true;

        // Reset energy after burst
        ai.Energy = BASE_ENERGY;

        if (ai.IsPlayer) {
            console.log(`[SHOCKWAVE_BURST] Player triggered shockwave burst at max energy!`);
        }
    } else if (ai.Energy < MAX_ENERGY * 0.8) {
        // Reset trigger when energy drops sufficiently
        ai.ShockwaveBurstTriggered = false;
    }
}

/**
 * Update movement speed based on energy level (existing mechanic)
 */
function update_movement_speed(game: Game, entity: number, ai: ControlAi) {
    if (game.World.Signature[entity] & Has.Move2D) {
        let move = game.World.Move2D[entity];
        DEBUG: if (!move) throw new Error("missing move component");

        // Scale movement speed by square root of energy for balanced scaling
        move.MoveSpeed = ai.BaseMoveSpeed * Math.sqrt(ai.Energy / BASE_ENERGY);
    }
}

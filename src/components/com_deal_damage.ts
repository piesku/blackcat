import {Game} from "../game.js";
import {Has} from "../world.js";

/**
 * Component for entities that can deal damage on collision or proximity.
 * Unifies projectile, combat, and area damage functionality.
 * Screen shake is computed dynamically based on damage amount.
 *
 * Cooldown determines behavior:
 * - cooldown = 0: destroy on hit (projectiles, instant effects)
 * - cooldown > 0: persistent damage with cooldown (fighters, continuous effects)
 */
export interface DealDamage {
    /** Damage amount per hit */
    Damage: number;

    /** Cooldown between damage instances (seconds). If 0, destroys on hit. */
    Cooldown: number;

    /** Time remaining until next damage can be dealt */
    LastDamageTime: number;
}

// All damage detection now uses the collision system
// Area effects just use collision detection with large radius

/**
 * Create a damage dealer that responds to collision detection.
 * Works for both point collision (small radius) and area effects (large radius).
 * Screen shake intensity is computed dynamically based on damage amount.
 *
 * @param damage Damage amount per hit
 * @param cooldown Cooldown between damage instances. If 0 (default), destroys on hit.
 */
export function deal_damage(damage: number, cooldown: number = 0) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.DealDamage;
        game.World.DealDamage[entity] = {
            Damage: damage,
            Cooldown: cooldown,
            LastDamageTime: 0,
        };
    };
}

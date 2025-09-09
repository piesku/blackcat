import {Game} from "../game.js";
import {Has} from "../world.js";

/**
 * Component for entities that can deal damage on collision or proximity.
 * Unifies projectile, combat, and area damage functionality.
 */
export interface DealDamage {
    /** Damage amount per hit */
    Damage: number;

    /** Cooldown between damage instances (seconds) */
    Cooldown: number;

    /** Time remaining until next damage can be dealt */
    LastDamageTime: number;

    /** Screen shake properties for damage impact */
    ShakeRadius?: number;
    ShakeDuration?: number;

    /** Whether this damage dealer destroys itself after hitting */
    DestroyOnHit?: boolean;
}

// All damage detection now uses the collision system
// Area effects just use collision detection with large radius

/**
 * Create a damage dealer that responds to collision detection.
 * Works for both point collision (small radius) and area effects (large radius).
 */
export function deal_damage(
    damage: number,
    options: {
        cooldown?: number;
        shake_radius?: number;
        shake_duration?: number;
        destroy_on_hit?: boolean;
    } = {},
) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.DealDamage;
        game.World.DealDamage[entity] = {
            Damage: damage,
            Cooldown: options.cooldown || 0,
            LastDamageTime: 0,
            ShakeRadius: options.shake_radius || 0.5,
            ShakeDuration: options.shake_duration || 0.2,
            DestroyOnHit: options.destroy_on_hit !== false, // Default true
        };
    };
}

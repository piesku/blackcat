/**
 * # Spawn
 *
 * The `Spawn` component allows the entity to spawn other entities with control
 * over direction, spread, speed, duration, and burst patterns.
 */

import {Blueprint} from "../../lib/game.js";
import {Vec2} from "../../lib/math.js";
import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export interface Spawn {
    Blueprint: Blueprint<Game>;
    Interval: number;
    SinceLast: number;
    Direction: Vec2; // Base emission direction (in parent's space)
    Spread: number; // Cone angle in radians (0 = straight line, π = full circle)
    SpeedMin: number; // Minimum spawn speed
    SpeedMax: number; // Maximum spawn speed
    Duration: number; // Time remaining (counts down to 0, Infinity = infinite)
    BurstCount: number; // How many entities to spawn at once (1 = single)
}

/**
 * Spawn blueprints with directional and speed control.
 *
 * @param blueprint The blueprint to spawn.
 * @param frequency Spawns per second.
 * @param options Spawning options.
 */
export function spawn(
    blueprint: Blueprint<Game>,
    frequency: number,
    options: Partial<{
        direction: Vec2;
        spread: number;
        speedMin: number;
        speedMax: number;
        duration: number;
        burstCount: number;
    }> = {},
) {
    return (game: Game, entity: Entity) => {
        const spawner: Spawn = {
            Blueprint: blueprint,
            Interval: 1.0 / frequency,
            SinceLast: 0,
            Direction: options.direction || [0, 1], // Default: upward
            Spread: options.spread || 0, // Default: no spread
            SpeedMin: options.speedMin || 3.0,
            SpeedMax: options.speedMax || 3.0,
            Duration: options.duration ?? Infinity, // Default: infinite
            BurstCount: options.burstCount || 1,
        };

        game.World.Spawn[entity] = spawner;
        game.World.Signature[entity] |= Has.Spawn;
    };
}

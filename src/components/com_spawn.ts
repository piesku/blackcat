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

export const enum SpawnMode {
    Count,
    Timed,
}

export interface SpawnBase {
    Blueprint: Blueprint<Game>;
    Direction: Vec2; // Base emission direction (in parent's space)
    Spread: number; // Cone angle in radians (0 = straight line, π = full circle)
    SpeedMin: number; // Minimum spawn speed
    SpeedMax: number; // Maximum spawn speed
}

export interface SpawnCount extends SpawnBase {
    Mode: SpawnMode.Count;
    TotalCount: number; // Total entities to spawn
    RemainingCount: number; // Entities left to spawn
    Interval: number; // Time between spawns (0 = all at once)
    SinceLast: number; // Time since last spawn
}

export interface SpawnTimed extends SpawnBase {
    Mode: SpawnMode.Timed;
    Duration: number; // Time remaining (counts down to 0)
    ConfiguredDuration: number; // Original duration for reactivation
    Interval: number; // Time between spawns
    SinceLast: number; // Time since last spawn
    BurstCount: number; // How many entities to spawn at once (1 = single)
}

export type Spawn = SpawnCount | SpawnTimed;

/**
 * Spawn a specific count of entities with optional delay between spawns.
 *
 * @param blueprint The blueprint to spawn.
 * @param count Total entities to spawn.
 * @param interval Time between spawns (0 = all at once).
 * @param direction Base emission direction.
 * @param spread Cone angle in radians.
 * @param speedMin Minimum spawn speed.
 * @param speedMax Maximum spawn speed.
 */
export function spawn_count(
    blueprint: Blueprint<Game>,
    count: number,
    interval: number,
    direction: Vec2,
    spread: number,
    speedMin: number,
    speedMax: number,
) {
    return (game: Game, entity: Entity) => {
        const spawner: SpawnCount = {
            Mode: SpawnMode.Count,
            Blueprint: blueprint,
            TotalCount: count,
            RemainingCount: 0, // Start inactive
            Interval: interval,
            SinceLast: 0,
            Direction: direction,
            Spread: spread,
            SpeedMin: speedMin,
            SpeedMax: speedMax,
        };

        game.World.Spawn[entity] = spawner;
        game.World.Signature[entity] |= Has.Spawn;
    };
}

/**
 * Spawn entities continuously over a time duration.
 *
 * @param blueprint The blueprint to spawn.
 * @param duration Total time duration.
 * @param interval Time between spawns.
 * @param direction Base emission direction.
 * @param spread Cone angle in radians.
 * @param speedMin Minimum spawn speed.
 * @param speedMax Maximum spawn speed.
 * @param burstCount How many entities to spawn at once.
 */
export function spawn_timed(
    blueprint: Blueprint<Game>,
    duration: number,
    interval: number,
    direction: Vec2,
    spread: number,
    speedMin: number,
    speedMax: number,
    burstCount: number = 1,
) {
    return (game: Game, entity: Entity) => {
        const spawner: SpawnTimed = {
            Mode: SpawnMode.Timed,
            Blueprint: blueprint,
            Duration: 0, // Start inactive
            ConfiguredDuration: duration, // Store original duration for reactivation
            Interval: interval,
            SinceLast: 0,
            Direction: direction,
            Spread: spread,
            SpeedMin: speedMin,
            SpeedMax: speedMax,
            BurstCount: burstCount,
        };

        game.World.Spawn[entity] = spawner;
        game.World.Signature[entity] |= Has.Spawn;
    };
}

/**
 * Legacy spawn function for backward compatibility.
 * @deprecated Use spawn_count or spawn_timed instead.
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
    // Convert to new timed spawner format
    return spawn_timed(
        blueprint,
        options.duration ?? Infinity,
        1.0 / frequency,
        options.direction || [0, 1],
        options.spread || 0,
        options.speedMin || 3.0,
        options.speedMax || 3.0,
        options.burstCount || 1,
    );
}

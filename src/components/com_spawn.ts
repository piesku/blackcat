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
    BlueprintCreator: () => Blueprint<Game>; // Function that creates fresh blueprint each time
    Direction: Vec2; // Base emission direction (in parent's space)
    Spread: number; // Cone angle in radians (0 = straight line, π = full circle)
    SpeedMin: number; // Minimum spawn speed
    SpeedMax: number; // Maximum spawn speed
}

export interface SpawnCount extends SpawnBase {
    Mode: SpawnMode.Count;
    RemainingCount: number; // Entities left to spawn
    Interval: number; // Time between spawns (0 = all at once)
    SinceLast: number; // Time since last spawn
}

export interface SpawnTimed extends SpawnBase {
    Mode: SpawnMode.Timed;
    Duration: number; // Time remaining (counts down to 0)
    Interval: number; // Time between spawns
    SinceLast: number; // Time since last spawn
    BurstCount: number; // How many entities to spawn at once (1 = single)
}

export type Spawn = SpawnCount | SpawnTimed;

/**
 * Spawn a count of entities with optional delay between spawns.
 * The count is set by the control system that activates this spawner.
 *
 * @param creator The blueprint creator.
 * @param interval Time between spawns (0 = all at once).
 * @param direction Base emission direction.
 * @param spread Cone angle in radians.
 * @param speedMin Minimum spawn speed.
 * @param speedMax Maximum spawn speed.
 * @param initialCount Initial count to spawn (0 = inactive, >0 = immediately active).
 */
export function spawn_count(
    creator: () => Blueprint<Game>,
    interval: number,
    direction: Vec2,
    spread: number,
    speedMin: number,
    speedMax: number,
    initialCount: number = 0,
) {
    return (game: Game, entity: Entity) => {
        const spawner: SpawnCount = {
            Mode: SpawnMode.Count,
            BlueprintCreator: creator,
            RemainingCount: initialCount, // 0 = inactive, >0 = active
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
 * The duration is set by the control system that activates this spawner.
 *
 * @param creator The blueprint creator.
 * @param interval Time between spawns.
 * @param direction Base emission direction.
 * @param spread Cone angle in radians.
 * @param speedMin Minimum spawn speed.
 * @param speedMax Maximum spawn speed.
 * @param burstCount How many entities to spawn at once.
 * @param initialDuration Initial duration to spawn (0 = inactive, >0 = immediately active).
 */
export function spawn_timed(
    creator: () => Blueprint<Game>,
    interval: number,
    direction: Vec2,
    spread: number,
    speedMin: number,
    speedMax: number,
    burstCount: number = 1,
    initialDuration: number = 0,
) {
    return (game: Game, entity: Entity) => {
        const spawner: SpawnTimed = {
            Mode: SpawnMode.Timed,
            BlueprintCreator: creator,
            Duration: initialDuration, // 0 = inactive, >0 = active
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

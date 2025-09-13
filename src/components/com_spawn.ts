/**
 * # Spawn
 *
 * The `Spawn` component allows the entity to spawn other entities with control
 * over direction, spread, speed, duration, and burst patterns.
 */

import {Blueprint} from "../../lib/game.js";
import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export const enum SpawnMode {
    Count,
    Timed,
}

export interface SpawnBase {
    BlueprintCreator: (game: Game, spawner_entity: Entity) => Blueprint<Game>; // Function that creates fresh blueprint each time
    Spread: number; // Cone angle in radians (0 = straight line, π = full circle)
    SpeedMin: number; // Minimum spawn speed
    SpeedMax: number; // Maximum spawn speed
    AlwaysUp: boolean; // If true, spawned entities always face up (world space)
}

export interface SpawnCount extends SpawnBase {
    Mode: SpawnMode.Count;
    Interval: number; // Time between spawns (0 = all at once)
    SinceLast: number; // Time since last spawn
    Count: number; // Entities left to spawn
}

export interface SpawnTimed extends SpawnBase {
    Mode: SpawnMode.Timed;
    Interval: number; // Time between spawns
    SinceLast: number; // Time since last spawn
    Duration: number; // Time remaining (counts down to 0)
}

export type Spawn = SpawnCount | SpawnTimed;

/**
 * Spawn a count of entities with optional delay between spawns.
 * The count is set by the control system that activates this spawner.
 *
 * @param creator The blueprint creator.
 * @param interval Time between spawns (0 = all at once).
 * @param spread Cone angle in radians.
 * @param speedMin Minimum spawn speed.
 * @param speedMax Maximum spawn speed.
 * @param initialCount Initial count to spawn (0 = inactive, >0 = immediately active).
 */
export function spawn_count(
    creator: (game: Game, spawner_entity: Entity) => Blueprint<Game>,
    interval: number,
    spread: number,
    speedMin: number,
    speedMax: number,
    initialCount: number = 0,
) {
    return (game: Game, entity: Entity) => {
        const spawner: SpawnCount = {
            Mode: SpawnMode.Count,
            BlueprintCreator: creator,
            Count: initialCount, // 0 = inactive, >0 = active
            Interval: interval,
            SinceLast: 0,
            Spread: spread,
            SpeedMin: speedMin,
            SpeedMax: speedMax,
            AlwaysUp: false,
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
 * @param spread Cone angle in radians.
 * @param speedMin Minimum spawn speed.
 * @param speedMax Maximum spawn speed.
 * @param initialDuration Initial duration to spawn (0 = inactive, >0 = immediately active).
 */
export function spawn_timed(
    creator: (game: Game, spawner_entity: Entity) => Blueprint<Game>,
    interval: number,
    spread: number,
    speedMin: number,
    speedMax: number,
    initialDuration: number = 0,
    alwaysUp: boolean = false,
) {
    return (game: Game, entity: Entity) => {
        const spawner: SpawnTimed = {
            Mode: SpawnMode.Timed,
            BlueprintCreator: creator,
            Duration: initialDuration, // 0 = inactive, >0 = active
            Interval: interval,
            SinceLast: 0,
            Spread: spread,
            SpeedMin: speedMin,
            SpeedMax: speedMax,
            AlwaysUp: alwaysUp,
        };

        game.World.Spawn[entity] = spawner;
        game.World.Signature[entity] |= Has.Spawn;
    };
}

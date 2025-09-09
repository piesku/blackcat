/**
 * # sys_spawn2d
 *
 * Instantiate blueprints into the world periodically. Supports both simple
 * interval-based spawning and advanced directional/particle-like spawning.
 * Spawned entities inherit the spawner's position and rotation.
 */

import {instantiate} from "../../lib/game.js";
import {mat2d_get_translation} from "../../lib/mat2d.js";
import {DEG_TO_RAD, Vec2} from "../../lib/math.js";
import {float} from "../../lib/random.js";
import {vec2_normalize, vec2_rotate} from "../../lib/vec2.js";
import {Entity} from "../../lib/world.js";
import {get_root_spawner} from "../components/com_label.js";
import {copy_position} from "../components/com_local_transform2d.js";
import {Spawn, SpawnCount, SpawnMode, SpawnTimed} from "../components/com_spawn.js";
import {spawned_by} from "../components/com_spawned_by.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.SpatialNode2D | Has.Spawn;

export function sys_spawn2d(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) == QUERY) {
            update(game, i, delta);
        }
    }
}

const world_position: Vec2 = [0, 0];
const spawn_direction: Vec2 = [0, 0];

function update(game: Game, entity: Entity, delta: number) {
    let spawn = game.World.Spawn[entity];

    switch (spawn.Mode) {
        case SpawnMode.Count:
            update_count_spawner(game, entity, spawn, delta);
            break;
        case SpawnMode.Timed:
            update_timed_spawner(game, entity, spawn, delta);
            break;
    }
}

function update_count_spawner(game: Game, entity: Entity, spawn: SpawnCount, delta: number) {
    if (spawn.Count <= 0) {
        return;
    }

    spawn.SinceLast += delta;
    while (spawn.SinceLast >= spawn.Interval && spawn.Count > 0) {
        spawn.SinceLast -= spawn.Interval;
        spawn.Count--;

        let spatial_node = game.World.SpatialNode2D[entity];
        mat2d_get_translation(world_position, spatial_node.World);
        spawn_single_entity(game, entity, spawn, world_position);
    }
}

function update_timed_spawner(game: Game, entity: Entity, spawn: SpawnTimed, delta: number) {
    // Handle duration countdown
    if (spawn.Duration <= 0) {
        return;
    }

    spawn.SinceLast += delta;

    while (spawn.SinceLast >= spawn.Interval && spawn.Duration > 0) {
        spawn.SinceLast -= spawn.Interval;
        spawn.Duration -= delta;

        let spatial_node = game.World.SpatialNode2D[entity];
        mat2d_get_translation(world_position, spatial_node.World);

        spawn_single_entity(game, entity, spawn, world_position);
    }
}

function spawn_single_entity(
    game: Game,
    spawner_entity: Entity,
    spawn: Spawn,
    position: Readonly<Vec2>,
) {
    // Get spawn direction from spawner entity's rotation (0 degrees = spawn to the right)
    let local_transform = game.World.LocalTransform2D[spawner_entity];
    spawn_direction[0] = Math.cos(local_transform.Rotation * DEG_TO_RAD);
    spawn_direction[1] = Math.sin(local_transform.Rotation * DEG_TO_RAD);

    // Apply random spread
    if (spawn.Spread > 0) {
        let spread_angle = float(-spawn.Spread / 2, spawn.Spread / 2);
        vec2_rotate(spawn_direction, spawn_direction, spread_angle);
    }

    // Normalize direction (should already be normalized but just in case)
    vec2_normalize(spawn_direction, spawn_direction);

    // Random speed within range
    let speed = float(spawn.SpeedMin, spawn.SpeedMax);

    // Resolve fighter entity for damage attribution
    let fighter_entity = get_root_spawner(game.World, spawner_entity);

    // Get blueprint by calling creator with game and spawner context
    let blueprint = spawn.BlueprintCreator(game, spawner_entity);

    // Create entity with spawner attribution
    let spawned_entity = instantiate(game, [
        ...blueprint,
        copy_position(position),
        spawned_by(fighter_entity),
    ]);

    // Set initial velocity after all components are set up
    let rigid_body = game.World.RigidBody2D[spawned_entity];
    if (rigid_body) {
        rigid_body.VelocityLinear[0] = spawn_direction[0] * speed;
        rigid_body.VelocityLinear[1] = spawn_direction[1] * speed;
    }
}

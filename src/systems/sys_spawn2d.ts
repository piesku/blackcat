/**
 * # sys_spawn2d
 *
 * Instantiate blueprints into the world periodically. Supports both simple
 * interval-based spawning and advanced directional/particle-like spawning.
 * Spawned entities inherit the spawner's position and rotation.
 */

import {instantiate} from "../../lib/game.js";
import {mat2d_get_translation} from "../../lib/mat2d.js";
import {Vec2} from "../../lib/math.js";
import {float} from "../../lib/random.js";
import {vec2_normalize, vec2_rotate} from "../../lib/vec2.js";
import {Entity} from "../../lib/world.js";
import {copy_position} from "../components/com_local_transform2d.js";
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

    // Handle duration countdown
    if (spawn.Duration <= 0) {
        return;
    }

    spawn.Duration -= delta;
    spawn.SinceLast += delta;

    if (spawn.SinceLast >= spawn.Interval) {
        spawn.SinceLast = 0;

        let spatial_node = game.World.SpatialNode2D[entity];
        mat2d_get_translation(world_position, spatial_node.World);

        console.log(
            `[${Date.now()}] [SPAWNER] Entity ${entity} spawning ${spawn.BurstCount} entities (duration: ${spawn.Duration.toFixed(2)}s remaining)`,
        );

        // Spawn burst of entities
        for (let i = 0; i < spawn.BurstCount; i++) {
            spawn_single_entity(game, spawn, world_position);
        }
    }
}

function spawn_single_entity(game: Game, spawn: any, position: Vec2) {
    // Check if we can create more entities
    if (game.World.Signature.length - game.World.Graveyard.length >= game.World.Capacity) {
        console.warn("Cannot spawn entity: world at maximum capacity");
        return;
    }

    // Set spawn direction
    spawn_direction[0] = spawn.Direction[0];
    spawn_direction[1] = spawn.Direction[1];

    // Apply random spread
    if (spawn.Spread > 0) {
        let spread_angle = float(-spawn.Spread / 2, spawn.Spread / 2);
        vec2_rotate(spawn_direction, spawn_direction, spread_angle);
    }

    // Normalize direction
    vec2_normalize(spawn_direction, spawn_direction);

    // Random speed within range
    let speed = float(spawn.SpeedMin, spawn.SpeedMax);

    // Create entity using blueprint
    let spawned_entity = instantiate(game, [...spawn.Blueprint, copy_position(position)]);

    // Set initial velocity after all components are set up
    let rigid_body = game.World.RigidBody2D[spawned_entity];
    if (rigid_body) {
        rigid_body.VelocityLinear[0] = spawn_direction[0] * speed;
        rigid_body.VelocityLinear[1] = spawn_direction[1] * speed;
    }
}

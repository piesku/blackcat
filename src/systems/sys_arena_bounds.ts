/**
 * # sys_arena_bounds
 *
 * Keep fighters within the circular arena bounds. This system runs after movement
 * but before transform commits to ensure fighters can't escape the arena.
 */

import {Vec2} from "../../lib/math.js";
import {vec2_distance, vec2_normalize, vec2_scale} from "../../lib/vec2.js";
import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {ARENA_CENTER_X, ARENA_CENTER_Y, ARENA_MAX_FIGHTER_DISTANCE} from "../scenes/sce_arena.js";
import {Has} from "../world.js";

const QUERY = Has.LocalTransform2D | Has.Move2D | Has.Health;

export function sys_arena_bounds(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            update(game, entity);
        }
    }
}

function update(game: Game, entity: Entity) {
    let transform = game.World.LocalTransform2D[entity];
    let health = game.World.Health[entity];

    // Only apply bounds to living entities
    if (!health.IsAlive) {
        return;
    }

    let position = transform.Translation;
    let arena_center: Vec2 = [ARENA_CENTER_X, ARENA_CENTER_Y];

    // Calculate distance from arena center
    let distance_to_center = vec2_distance(position, arena_center);

    // If fighter is outside the allowed area, push them back
    if (distance_to_center > ARENA_MAX_FIGHTER_DISTANCE) {
        // Calculate direction from center to fighter
        let direction: Vec2 = [position[0] - arena_center[0], position[1] - arena_center[1]];

        // Normalize and scale to max allowed distance
        vec2_normalize(direction, direction);
        vec2_scale(direction, direction, ARENA_MAX_FIGHTER_DISTANCE);

        // Set new position
        position[0] = arena_center[0] + direction[0];
        position[1] = arena_center[1] + direction[1];

        // Mark as dirty so transform system updates the world matrix
        game.World.Signature[entity] |= Has.Dirty;
    }
}

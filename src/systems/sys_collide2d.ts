/**
 * # sys_collide2d
 *
 * Detect collisions between static and dynamic [colliders](com_collide2d.html).
 *
 * Collision detection is done using circles for simplified 2D collision detection.
 * Supports entities with both SpatialNode2D (world matrix) and LocalTransform2D
 * (fast path) components for optimal performance.
 *
 * Static vs. dynamic collision detection is O(n*m). All dynamic colliders are
 * checked against all static colliders. This works great for a small number of
 * dynamic colliders and a large number of static colliders.
 *
 * Dynamic vs. dynamic collision detection is O(n^2). All dynamic colliders are
 * checked against all other dynamic colliders. This can become very expensive
 * if there are many dynamic colliders. In general, fewer than 100 dynamic
 * colliders is recommended.
 *
 * Static vs. static collisions are not checked at all.
 */

import {compute_circle_position, intersect_circle, penetrate_circle} from "../../lib/circle2d.js";
import {Collide2D} from "../components/com_collide2d.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.LocalTransform2D | Has.Collide2D;

export function sys_collide2d(game: Game, _delta: number) {
    // Collect all colliders.
    let static_colliders: Array<Collide2D> = [];
    let dynamic_colliders: Array<Collide2D> = [];

    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            let collider = game.World.Collide2D[i];

            // Prepare the collider for this tick's detection.
            collider.Collisions = [];
            if (collider.New) {
                collider.New = false;
                update_circle_position(game, i, collider);
            } else if (collider.Dynamic) {
                update_circle_position(game, i, collider);
                dynamic_colliders.push(collider);
            } else {
                static_colliders.push(collider);
            }
        }
    }

    for (let i = 0; i < dynamic_colliders.length; i++) {
        check_collisions(dynamic_colliders[i], static_colliders, static_colliders.length);
        check_collisions(dynamic_colliders[i], dynamic_colliders, i);
    }
}

/**
 * Update circle position based on available transform components.
 * Supports both SpatialNode2D (world matrix) and LocalTransform2D (fast path).
 */
function update_circle_position(game: Game, entity: number, collider: Collide2D) {
    if (game.World.Signature[entity] & Has.SpatialNode2D) {
        // Entity has SpatialNode2D - use world matrix
        let node = game.World.SpatialNode2D[entity];
        compute_circle_position(node.World, collider);
    } else {
        // Fast path - entity only has LocalTransform2D, use translation directly
        let transform = game.World.LocalTransform2D[entity];
        collider.Center[0] = transform.Translation[0];
        collider.Center[1] = transform.Translation[1];
    }
}

/**
 * Check for collisions between a dynamic collider and other colliders.
 *
 * Length is used to control how many colliders to check against. For collisions
 * with static colliders, length should be equal to colliders.length, since we
 * want to consider all static colliders in the scene. For collisions with other
 * dynamic colliders, we only need to check a pair of colliders once.  Varying
 * length allows to skip half of the NxN checks matrix.
 *
 * @param game The game instance.
 * @param collider The current collider.
 * @param colliders Other colliders to test against.
 * @param length How many colliders to check.
 */
function check_collisions(collider: Collide2D, colliders: Array<Collide2D>, length: number) {
    for (let i = 0; i < length; i++) {
        let other = colliders[i];
        let collider_can_intersect = collider.Mask & other.Layers;
        let other_can_intersect = other.Mask & collider.Layers;
        if (collider_can_intersect || other_can_intersect) {
            if (intersect_circle(collider, other)) {
                let hit = penetrate_circle(collider, other);
                if (collider_can_intersect) {
                    collider.Collisions.push({
                        Other: other.EntityId,
                        Hit: hit,
                    });
                }
                if (other_can_intersect) {
                    other.Collisions.push({
                        Other: collider.EntityId,
                        Hit: [-hit[0], -hit[1]],
                    });
                }
            }
        }
    }
}

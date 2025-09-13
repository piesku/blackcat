/**
 * # sys_collide2d
 *
 * Detect collisions between dynamic [colliders](com_collide2d.html).
 *
 * Collision detection is done using circles for simplified 2D collision detection.
 * Supports entities with both SpatialNode2D (world matrix) and LocalTransform2D
 * (fast path) components for optimal performance.
 *
 * All dynamic colliders are checked against all other dynamic colliders in O(n^2).
 * This works well for arena-based combat with a small number of fighters.
 * Static colliders have been removed since there are only a few arena boundaries.
 */

import {intersect_circle} from "../../lib/circle2d.js";
import {Collide2D} from "../components/com_collide2d.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.LocalTransform2D | Has.Collide2D;

export function sys_collide2d(game: Game, _delta: number) {
    // Collect all colliders.
    let colliders: Array<Collide2D> = [];

    for (let ent = 0; ent < game.World.Signature.length; ent++) {
        if ((game.World.Signature[ent] & QUERY) === QUERY) {
            let collider = game.World.Collide2D[ent];

            // Prepare the collider for this tick's detection.
            collider.Collisions = [];

            // Only top-level entities have colliders.
            let transform = game.World.LocalTransform2D[ent];
            collider.Center[0] = transform.Translation[0];
            collider.Center[1] = transform.Translation[1];

            colliders.push(collider);
        }
    }

    // Check collisions between all colliders.
    for (let i = 0; i < colliders.length; i++) {
        check_collisions(colliders[i], colliders, i);
    }
}

/**
 * Check for collisions between a collider and other colliders.
 *
 * Length is used to control how many colliders to check against. We only need
 * to check a pair of colliders once, so length allows us to skip half of the
 * NxN checks matrix.
 *
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
                if (collider_can_intersect) {
                    collider.Collisions.push(other.EntityId);
                }
                if (other_can_intersect) {
                    other.Collisions.push(collider.EntityId);
                }
            }
        }
    }
}

/**
 * # sys_physics_resolve
 *
 * The second step of the physics simulation: resolve the collisions between
 * [rigid bodies](com_rigid_body2d.html).
 *
 * The positions of colliding rigid bodies are updated to account for the
 * collision response, i.e. the bodies are moved apart. Their velocities are
 * sawpped, too.
 */

import {Vec2} from "../../lib/math.js";
import {
    vec2_add,
    vec2_copy,
    vec2_distance,
    vec2_normalize,
    vec2_scale,
    vec2_set,
    vec2_subtract,
} from "../../lib/vec2.js";
import {Entity} from "../../lib/world.js";
import {RigidKind} from "../components/com_rigid_body2d.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.LocalTransform2D | Has.Collide2D | Has.RigidBody2D;

export function sys_physics2d_resolve(game: Game, delta: number) {
    for (let ent = 0; ent < game.World.Signature.length; ent++) {
        if ((game.World.Signature[ent] & QUERY) === QUERY) {
            update(game, ent);
        }
    }

    // When all collisions are resolved, copy resolved velocities to
    // VelocityLinear, for other systems to use.
    for (let ent = 0; ent < game.World.Signature.length; ent++) {
        if ((game.World.Signature[ent] & QUERY) === QUERY) {
            let rigid_body = game.World.RigidBody2D[ent];
            if (rigid_body.Kind === RigidKind.Dynamic) {
                vec2_copy(rigid_body.VelocityLinear, rigid_body.VelocityResolved);
            }
        }
    }
}

// The combined response translation for all collisions.
let response: Vec2 = [0, 0];
// Temp vector for direction calculations.
let direction: Vec2 = [0, 0];
// Temp vector for velocity calculations.
let velocity_reflection: Vec2 = [0, 0];

function update(game: Game, entity: Entity) {
    let local = game.World.LocalTransform2D[entity];
    let rigid_body = game.World.RigidBody2D[entity];
    let collide = game.World.Collide2D[entity];

    if (rigid_body.Kind === RigidKind.Dynamic) {
        vec2_set(response, 0, 0);
        vec2_copy(rigid_body.VelocityResolved, rigid_body.VelocityLinear);

        for (let i = 0; i < collide.Collisions.length; i++) {
            let other_entity = collide.Collisions[i];
            if (game.World.Signature[other_entity] & Has.RigidBody2D) {
                let other_body = game.World.RigidBody2D[other_entity];
                if (other_body.Kind === RigidKind.Static) {
                    // Simple separation: push dynamic collider away from static collider
                    let other_collider = game.World.Collide2D[other_entity];

                    // Calculate direction from other center to this center
                    vec2_subtract(direction, collide.Center, other_collider.Center);
                    let distance = vec2_distance(collide.Center, other_collider.Center);

                    // Handle case where centers are at same position
                    if (distance === 0) {
                        vec2_set(direction, 1, 0); // Push horizontally
                        distance = 1;
                    }

                    // Calculate required separation distance
                    let required_distance = collide.Radius + other_collider.Radius;

                    // Only separate if currently overlapping
                    if (distance < required_distance) {
                        // Normalize direction to get collision normal
                        vec2_normalize(direction, direction);

                        // Calculate and apply position separation
                        let separation_needed = required_distance - distance;
                        vec2_scale(velocity_reflection, direction, separation_needed); // Reuse temp vector for separation
                        vec2_add(response, response, velocity_reflection);

                        // Simple approach: set velocity to move away from collision
                        // Use penetration distance as velocity magnitude (more penetration = faster bounce)
                        vec2_scale(rigid_body.VelocityResolved, direction, separation_needed);
                    }
                }
                // Note: Dynamic-to-dynamic collisions are handled by damage systems,
                // not physics resolution
            }
        }

        if (response[0] || response[1]) {
            // Apply collision response position correction
            vec2_add(local.Translation, local.Translation, response);
            game.World.Signature[entity] |= Has.Dirty;

            // Apply bounciness to the already-reflected velocity
            vec2_scale(
                rigid_body.VelocityResolved,
                rigid_body.VelocityResolved,
                rigid_body.Bounciness,
            );
        }
    }
}

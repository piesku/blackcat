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

import {penetrate_circle} from "../../lib/circle2d.js";
import {Vec2} from "../../lib/math.js";
import {
    vec2_add,
    vec2_copy,
    vec2_dot,
    vec2_normalize,
    vec2_scale,
    vec2_set,
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

// Temp vector used to compute the reflection off of a static body.
let a: Vec2 = [0, 0];
// The combined response translation for all collisions.
let response: Vec2 = [0, 0];

function update(game: Game, entity: Entity) {
    let local = game.World.LocalTransform2D[entity];
    let rigid_body = game.World.RigidBody2D[entity];
    let collide = game.World.Collide2D[entity];

    if (rigid_body.Kind === RigidKind.Dynamic) {
        rigid_body.IsGrounded = false;
        vec2_set(response, 0, 0);

        for (let i = 0; i < collide.Collisions.length; i++) {
            let other_entity = collide.Collisions[i];
            if (game.World.Signature[other_entity] & Has.RigidBody2D) {
                let other_body = game.World.RigidBody2D[other_entity];
                if (other_body.Kind === RigidKind.Static) {
                    // Only calculate penetration for static collisions that need physics resolution
                    let other_collider = game.World.Collide2D[other_entity];
                    let hit = penetrate_circle(collide, other_collider);

                    // Use the hit vector for position correction and velocity reflection
                    vec2_add(response, response, hit);

                    // Compute the reflection vector as r = v - 2 * (v·n) * n
                    // where v is the incident velocity and n is the collision normal
                    vec2_normalize(a, hit);
                    vec2_scale(a, a, -2 * vec2_dot(rigid_body.VelocityLinear, a));
                    vec2_add(rigid_body.VelocityResolved, rigid_body.VelocityLinear, a);

                    // When Bounciness = 1, collisions are 100% elastic.
                    vec2_scale(
                        rigid_body.VelocityResolved,
                        rigid_body.VelocityResolved,
                        rigid_body.Bounciness,
                    );

                    if (hit[1] > 0) {
                        // Collision from the bottom means the body is grounded.
                        rigid_body.IsGrounded = true;
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
        } else {
            // No collision; the entity's resolved velocity is its linear velocity.
            vec2_copy(rigid_body.VelocityResolved, rigid_body.VelocityLinear);
        }
    }
}

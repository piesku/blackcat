/**
 * # sys_draw2d_debug
 *
 * Debug drawing system for visualizing colliders and aim vectors in real-time.
 * Draws on top of the 2D scene using the Context2D API.
 */

import {Game} from "../game.js";
import {Has} from "../world.js";

const COLLIDER_QUERY = Has.Collide2D;
const AIM_QUERY = Has.Aim;

export function sys_draw2d_debug(game: Game) {
    if (game.Camera === undefined) {
        return;
    }

    let camera = game.World.Camera2D[game.Camera];
    let ctx = game.ForegroundContext;

    // Clear the foreground canvas
    ctx.resetTransform();
    ctx.clearRect(0, 0, game.ViewportWidth, game.ViewportHeight);

    // Apply camera transform
    ctx.transform(
        (camera.Pv[0] * game.ViewportWidth) / 2,
        (-camera.Pv[1] * game.ViewportHeight) / 2,
        (-camera.Pv[2] * game.ViewportWidth) / 2,
        (camera.Pv[3] * game.ViewportHeight) / 2,
        ((1 + camera.Pv[4]) * game.ViewportWidth) / 2,
        ((1 - camera.Pv[5]) * game.ViewportHeight) / 2,
    );

    // Draw colliders
    for (let ent = 0; ent < game.World.Signature.length; ent++) {
        if ((game.World.Signature[ent] & COLLIDER_QUERY) === COLLIDER_QUERY) {
            let collide = game.World.Collide2D[ent];
            let node = game.World.SpatialNode2D[ent];
            let transform = game.World.LocalTransform2D[ent];

            ctx.save();

            if (game.World.Signature[ent] & Has.SpatialNode2D) {
                // Entity has SpatialNode2D - use world matrix
                ctx.transform(
                    node.World[0],
                    -node.World[1],
                    -node.World[2],
                    node.World[3],
                    node.World[4],
                    -node.World[5],
                );
            } else if (game.World.Signature[ent] & Has.LocalTransform2D) {
                // Top-level entity with only LocalTransform2D
                ctx.translate(transform.Translation[0], -transform.Translation[1]);
                ctx.rotate(-transform.Rotation);
                ctx.scale(transform.Scale[0], transform.Scale[1]);
            } else {
                // No transform data available
                ctx.restore();
                continue;
            }

            // Draw collider circle - green when idle, magenta when colliding
            ctx.strokeStyle = collide.Collisions.length > 0 ? "#ff00ff88" : "#00ff0088";
            ctx.lineWidth = 0.05;
            ctx.beginPath();
            ctx.arc(0, 0, collide.Radius, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.restore();
        }
    }

    // Draw aim vectors
    for (let ent = 0; ent < game.World.Signature.length; ent++) {
        if ((game.World.Signature[ent] & AIM_QUERY) === AIM_QUERY) {
            let aim = game.World.Aim[ent];
            let node = game.World.SpatialNode2D[ent];
            let transform = game.World.LocalTransform2D[ent];

            // Skip if no valid target
            if (aim.TargetEntity === -1 || aim.DistanceToTarget === Infinity) {
                continue;
            }

            ctx.save();

            if (game.World.Signature[ent] & Has.SpatialNode2D) {
                // Entity has SpatialNode2D - use world matrix
                ctx.transform(
                    node.World[0],
                    -node.World[1],
                    -node.World[2],
                    node.World[3],
                    node.World[4],
                    -node.World[5],
                );
            } else if (game.World.Signature[ent] & Has.LocalTransform2D) {
                // Top-level entity with only LocalTransform2D
                ctx.translate(transform.Translation[0], -transform.Translation[1]);
                ctx.rotate(-transform.Rotation);
                ctx.scale(transform.Scale[0], transform.Scale[1]);
            } else {
                // No transform data available
                ctx.restore();
                continue;
            }

            // Draw aim vector - cyan line from entity to target
            let vectorX = aim.DirectionToTarget[0] * aim.DistanceToTarget;
            let vectorY = aim.DirectionToTarget[1] * aim.DistanceToTarget;

            ctx.strokeStyle = "#00ffff88";
            ctx.lineWidth = 0.05;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(vectorX, -vectorY); // Flip Y for canvas coordinate system
            ctx.stroke();

            ctx.restore();
        }
    }
}

/**
 * # sys_draw2d_debug
 *
 * Debug drawing system for visualizing colliders and aim vectors in real-time.
 * Draws on top of the 2D scene using the Context2D API.
 */

import {Game} from "../game.js";
import {Has} from "../world.js";

const COLLIDER_QUERY = Has.SpatialNode2D | Has.Collide2D;
const AIM_QUERY = Has.SpatialNode2D | Has.Aim;

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
            let node = game.World.SpatialNode2D[ent];
            let collide = game.World.Collide2D[ent];

            ctx.save();
            ctx.transform(
                node.World[0],
                -node.World[1],
                -node.World[2],
                node.World[3],
                node.World[4],
                -node.World[5],
            );

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
            let node = game.World.SpatialNode2D[ent];
            let aim = game.World.Aim[ent];

            // Skip if no valid target
            if (aim.TargetEntity === -1 || aim.DistanceToTarget === Infinity) {
                continue;
            }

            ctx.save();
            ctx.transform(
                node.World[0],
                -node.World[1],
                -node.World[2],
                node.World[3],
                node.World[4],
                -node.World[5],
            );

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

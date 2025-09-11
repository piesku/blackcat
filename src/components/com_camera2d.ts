/**
 * # Camera2D
 *
 * The `Camera2D` component makes the rendering system render the scene from the
 * vantage point of the entity.
 */

import {mat2d_create} from "../../lib/mat2d.js";
import {Mat2D} from "../../lib/math.js";
import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export interface Camera2D {
    Projection: Mat2D;
    Pv: Mat2D;
}

/**
 * Add Camera2D to an entity.
 *
 * Camera2D always uses an orthographic projection. The projection is set up
 * with z-order +1 as the near plane and -1 as the far plane. Use render2d's
 * order() mixin to change the z-order.
 *
 * The projection dynamically resizes to keep the unit size in pixels constant.
 */
export function camera2d() {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.Camera2D;
        game.World.Camera2D[entity] = {
            Projection: mat2d_create(),
            Pv: mat2d_create(),
        };
    };
}

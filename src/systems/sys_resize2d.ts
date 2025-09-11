/**
 * # sys_resize2d
 *
 * Resize the inner resolution of canvases when the browser's window is resized,
 * and update the projection matrices of cameras in the scene.
 */

import {mat2d_from_ortho} from "../../lib/mat2d.js";
import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Camera2D;

export function sys_resize2d(game: Game, delta: number) {
    if (game.ViewportWidth != window.innerWidth || game.ViewportHeight != window.innerHeight) {
        game.ViewportResized = true;
    }

    if (game.ViewportResized) {
        game.ViewportWidth = game.SceneCanvas.width = window.innerWidth;
        game.ViewportHeight = game.SceneCanvas.height = window.innerHeight;

        for (let ent = 0; ent < game.World.Signature.length; ent++) {
            if ((game.World.Signature[ent] & QUERY) === QUERY) {
                update(game, ent);
            }
        }
    }
}

function update(game: Game, entity: Entity) {
    let camera = game.World.Camera2D[entity];
    let aspect = game.ViewportWidth / game.ViewportHeight;

    // Dynamically resize to keep unit size constant
    let radius = game.ViewportHeight / game.UnitSize / 2;
    mat2d_from_ortho(camera.Projection, radius * aspect, radius);
}

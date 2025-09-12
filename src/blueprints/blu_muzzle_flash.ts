import {Vec2} from "../../lib/math.js";
import {Tile} from "../../sprites/spritesheet.js";
import {lifespan} from "../components/com_lifespan.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {order, render2d} from "../components/com_render2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";

/**
 * Creates a short-lived muzzle flash visual effect
 */
export function blueprint_muzzle_flash(position: Vec2) {
    return [
        spatial_node2d(),
        local_transform2d(position, 0, [1.5, 1.5]),
        render2d(Tile.Run1, [0, 1, 1, 1]),
        order(0.1), // Render in front of most objects
        lifespan(0.1),
    ];
}

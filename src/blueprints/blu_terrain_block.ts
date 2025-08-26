import {float} from "../../lib/random.js";
import {Tile} from "../../sprites/spritesheet.js";
import {collide2d} from "../components/com_collide2d.js";
import {health} from "../components/com_health.js";
import {label} from "../components/com_label.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {render2d} from "../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../components/com_rigid_body2d.js";
import {Layer} from "../game.js";

export function blueprint_terrain_block(scale: number = 1.0) {
    // Gray color for terrain blocks
    let r = float(0.3, 0.5);

    return [
        label("terrain block"),
        local_transform2d(undefined, 0, [scale, scale]),
        render2d(Tile.Body, [r, r, r, 1]),
        // Static collider on Terrain layer
        collide2d(false, Layer.Terrain, Layer.None, 0.5 * scale),
        rigid_body2d(RigidKind.Static, 0, 0, [0, 0]),
        // Make terrain destructible
        health(scale * 2), // Health scales with size
    ];
}

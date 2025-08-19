import {Vec2} from "../../lib/math.js";
import {boomerang} from "../components/com_boomerang.js";
import {collide2d} from "../components/com_collide2d.js";
import {control_always2d} from "../components/com_control_always2d.js";
import {lifespan} from "../components/com_lifespan.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {move2d} from "../components/com_move2d.js";
import {render2d} from "../components/com_render2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {Game, Layer} from "../game.js";

export function blueprint_boomerang_projectile(
    game: Game,
    thrower_entity: number,
    target_position: Vec2,
    max_range: number,
    speed: number,
) {
    // Calculate maximum lifespan (outward + return journey)
    let max_lifespan = (max_range * 2) / speed + 2; // Extra time for safety

    return [
        spatial_node2d(),
        local_transform2d(undefined, 0, [0.4, 0.4]), // Medium size for boomerang
        render2d("24"), // Use boomerang sprite
        collide2d(true, Layer.Projectile, Layer.Object | Layer.Terrain, [0.2, 0.2]),
        move2d(speed, 0),
        control_always2d([0, 0], 0), // Will be set by boomerang system
        boomerang(thrower_entity, target_position, max_range, speed),
        lifespan(max_lifespan), // Auto-destroy if it takes too long
    ];
}

import {Vec2} from "../../../lib/math.js";
import {vec2_rotate} from "../../../lib/vec2.js";
import {Tile} from "../../../sprites/spritesheet.js";
import {children} from "../../components/com_children.js";
import {collide2d} from "../../components/com_collide2d.js";
import {control_always2d} from "../../components/com_control_always2d.js";
import {deal_damage} from "../../components/com_deal_damage.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {move2d} from "../../components/com_move2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {Layer} from "../../game.js";

const BOOMERANG_MOVE_SPEED = 4;
const BOOMERANG_SPIN_SPEED = 540;
const BOOMERANG_ARC_SPEED = 80; // Increased arc speed for longer circular path

// Boomerang that travels in a complete circular arc back to the thrower
export function blueprint_boomerang(target_direction: Vec2, target_distance: number) {
    // Calculate time for a complete circular arc
    let arc_radius = target_distance / 2;
    let arc_circumference = 2 * Math.PI * arc_radius;
    let travel_time = arc_circumference / BOOMERANG_MOVE_SPEED;

    // Rotate initial direction to start the circular arc
    let arc_direction: Vec2 = [0, 0];
    vec2_rotate(arc_direction, target_direction, Math.PI / 4); // 45 degree offset for circular motion

    return [
        label("boomerang"),

        spatial_node2d(),
        local_transform2d(undefined, 0, [0.4, 0.4]),

        control_always2d(arc_direction, -1), // Initial direction for circular motion
        move2d(BOOMERANG_MOVE_SPEED, BOOMERANG_ARC_SPEED), // Higher arc speed for circular path

        collide2d(true, Layer.Projectile, Layer.Player | Layer.Terrain, 0.1),

        // Complete circular arc - no action needed, just expires naturally
        lifespan(travel_time),

        // Damage throughout flight
        deal_damage(1, {
            cooldown: 0.5,
            destroy_on_hit: false,
        }),

        children(
            // Spinning boomerang sprite
            [
                spatial_node2d(),
                local_transform2d(),
                render2d(Tile.Body),
                control_always2d(null, -1),
                move2d(0, BOOMERANG_SPIN_SPEED),
            ],
        ),
    ];
}

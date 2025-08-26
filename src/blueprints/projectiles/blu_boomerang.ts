import {Vec2} from "../../../lib/math.js";
import {vec2_rotate} from "../../../lib/vec2.js";
import {Tile} from "../../../sprites/spritesheet.js";
import {Action} from "../../actions.js";
import {children} from "../../components/com_children.js";
import {collide2d} from "../../components/com_collide2d.js";
import {control_always2d} from "../../components/com_control_always2d.js";
import {DamageType, deal_damage} from "../../components/com_deal_damage.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {move2d} from "../../components/com_move2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {Layer} from "../../game.js";

const BOOMERANG_MOVE_SPEED = 4;
const BOOMERANG_SPIN_SPEED = 540;
const BOOMERANG_ARC_SPEED = 50;

// Outward boomerang using control_always2d + rotation for arc motion
export function blueprint_boomerang_outward(target_direction: Vec2, max_range: number) {
    // Time to reach max range and return
    let outward_time = max_range / BOOMERANG_MOVE_SPEED;

    // Rotate initial direction to account for arc trajectory
    let arc_direction: Vec2 = [0, 0];
    vec2_rotate(arc_direction, target_direction, Math.PI / 6); // 30 degree offset for arc

    return [
        label("boomerang_outward"),

        spatial_node2d(),
        local_transform2d(undefined, 0, [0.4, 0.4]),

        control_always2d(arc_direction, -1), // Initial direction with arc offset
        move2d(BOOMERANG_MOVE_SPEED, BOOMERANG_ARC_SPEED),

        collide2d(true, Layer.Projectile, Layer.Player | Layer.Terrain, 0.1),

        // Turn around after reaching max range - spawn return boomerang
        lifespan(outward_time, Action.SpawnBoomerangReturn),

        // Damage throughout flight
        deal_damage(1, DamageType.Projectile, {
            cooldown: 0.5,
            piercing: true,
            destroy_on_hit: false,
            shake_radius: 0.3,
            shake_duration: 0.2,
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

// Return boomerang that flies back to the thrower
export function blueprint_boomerang_return(thrower_direction: Vec2) {
    // Rotate initial direction to account for arc trajectory
    let arc_direction: Vec2 = [0, 0];
    vec2_rotate(arc_direction, thrower_direction, Math.PI / 6); // 30 degree offset for arc

    return [
        label("boomerang_return"),

        spatial_node2d(),
        local_transform2d(undefined, 0, [0.4, 0.4]), // Position will be set by copy_position mixin

        collide2d(true, Layer.Projectile, Layer.Player | Layer.Terrain, 0.1),

        control_always2d(arc_direction, -1),
        move2d(BOOMERANG_MOVE_SPEED, BOOMERANG_ARC_SPEED), // Slightly faster return speed for dramatic effect

        // Lifespan added in the action handler.

        // Damage on return trip
        deal_damage(1, DamageType.Projectile, {
            cooldown: 0.5,
            piercing: true,
            destroy_on_hit: false,
            shake_radius: 0.3,
            shake_duration: 0.2,
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

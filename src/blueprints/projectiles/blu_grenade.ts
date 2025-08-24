import {Vec2} from "../../../lib/math.js";
import {Tile} from "../../../sprites/spritesheet.js";
import {collide2d} from "../../components/com_collide2d.js";
import {grenade_behavior} from "../../components/com_grenade_behavior.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {Game, Layer} from "../../game.js";

export function blueprint_grenade(
    game: Game,
    damage: number,
    source: number,
    range: number,
    speed: number,
    target_position: Vec2,
) {
    // Calculate parabolic trajectory
    let time_to_target = range / speed; // Simple approximation
    let initial_velocity_x = target_position[0] / time_to_target;
    let initial_velocity_y =
        (target_position[1] + 0.5 * 9.8 * time_to_target * time_to_target) / time_to_target;

    return [
        spatial_node2d(),
        local_transform2d([0, 0], 0, [0.3, 0.3]), // Small grenade
        render2d(Tile.Body), // Using sprite 23 for grenade

        // Physics integration via RigidBody2D (replaces move2d and control_always2d)
        rigid_body2d(RigidKind.Dynamic, 0.3, 0.01, [0, -9.8]), // Standard gravity for grenades

        // Small collision radius for the grenade itself
        collide2d(true, Layer.Object, Layer.Object, 0.2),

        // Grenade behavior component
        grenade_behavior(
            [initial_velocity_x, initial_velocity_y],
            time_to_target,
            target_position,
            damage,
            source,
        ),

        lifespan(time_to_target + 1.0), // Auto-destroy if doesn't explode
    ];
}

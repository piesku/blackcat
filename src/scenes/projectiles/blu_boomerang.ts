import {Vec2} from "../../../lib/math.js";
import {boomerang} from "../../components/com_boomerang.js";
import {collide2d} from "../../components/com_collide2d.js";
import {control_always2d} from "../../components/com_control_always2d.js";
import {DamageType, deal_damage} from "../../components/com_deal_damage.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {move2d} from "../../components/com_move2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {Game, Layer} from "../../game.js";

export function blueprint_boomerang_projectile(
    game: Game,
    thrower_entity: number,
    target_position: Vec2,
    max_range: number,
    speed: number,
    damage: number = 2,
) {
    // Calculate maximum lifespan (outward + return journey)
    let max_lifespan = (max_range * 2) / speed + 2; // Extra time for safety

    return [
        spatial_node2d(),
        local_transform2d(undefined, 0, [0.4, 0.4]), // Medium size for boomerang
        render2d("24"), // Use boomerang sprite
        collide2d(true, Layer.Projectile, Layer.Object | Layer.Terrain, 0.1),
        move2d(speed, 0),
        control_always2d([0, 0], 0), // Will be set by boomerang system
        boomerang(thrower_entity, target_position, max_range, speed),
        lifespan(max_lifespan), // Auto-destroy if it takes too long

        // Boomerang damage - can hit multiple targets on both paths
        deal_damage(damage, thrower_entity, DamageType.Projectile, {
            cooldown: 0.5, // Brief cooldown to prevent rapid multiple hits on same target
            piercing: true, // Can hit multiple enemies
            destroy_on_hit: false, // Boomerang continues after hitting
            shake_radius: 0.3,
            shake_duration: 0.2,
        }),
    ];
}

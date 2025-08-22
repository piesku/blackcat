import {Vec2} from "../../../lib/math.js";
import {collide2d} from "../../components/com_collide2d.js";
import {control_always2d} from "../../components/com_control_always2d.js";
import {DamageType, deal_damage} from "../../components/com_deal_damage.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {move2d} from "../../components/com_move2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {Game, Layer} from "../../game.js";

export function blueprint_piercing_projectile(
    game: Game,
    damage: number,
    owner_entity: number,
    max_range: number,
    speed: number,
    direction: Vec2 = [0, 1],
) {
    // Calculate lifespan based on range and speed
    let lifespan_seconds = max_range / speed;

    return [
        spatial_node2d(),
        local_transform2d(undefined, 0, [0.3, 0.3]), // Slightly larger for piercing bolt
        render2d("23"), // Use crossbow bolt sprite
        collide2d(true, Layer.Projectile, Layer.Player | Layer.Terrain, 0.075),
        move2d(speed, 0),
        control_always2d(direction, 0),
        deal_damage(damage, owner_entity, DamageType.Piercing, {
            piercing: true,
            destroy_on_hit: false, // Piercing projectiles don't destroy on hit
            shake_duration: 0.15,
        }),
        lifespan(lifespan_seconds), // Auto-destroy after max range time
    ];
}

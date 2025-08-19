import {collide2d} from "../components/com_collide2d.js";
import {control_always2d} from "../components/com_control_always2d.js";
import {DamageType, deal_damage} from "../components/com_deal_damage.js";
import {lifespan} from "../components/com_lifespan.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {move2d} from "../components/com_move2d.js";
import {render2d} from "../components/com_render2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {Game, Layer} from "../game.js";

export function blueprint_projectile(
    game: Game,
    damage: number,
    owner_entity: number,
    max_range: number,
    speed: number,
) {
    // Calculate lifespan based on range and speed
    let lifespan_seconds = max_range / speed;

    return [
        spatial_node2d(),
        local_transform2d(undefined, 0, [0.2, 0.2]), // Small projectile
        render2d("17"), // Use a bullet/projectile sprite
        collide2d(true, Layer.Projectile, Layer.Object | Layer.Terrain, 0.05),
        move2d(speed, 0),
        control_always2d([0, 0], 0), // Will be set by weapon system
        deal_damage(damage, owner_entity, DamageType.Projectile, {
            destroy_on_hit: true,
            shake_duration: 0.15,
        }),
        lifespan(lifespan_seconds), // Auto-destroy after max range time
    ];
}

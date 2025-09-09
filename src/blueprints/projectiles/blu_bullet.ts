import {Tile} from "../../../sprites/spritesheet.js";
import {collide2d} from "../../components/com_collide2d.js";
import {deal_damage} from "../../components/com_deal_damage.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_timed} from "../../components/com_spawn.js";
import {Layer} from "../../game.js";
import {blueprint_bullet_trail} from "../particles/blu_bullet_trail.js";

/**
 * Create a bullet blueprint
 */
export function blueprint_bullet(damage: number) {
    return [
        label("bullet"),

        spatial_node2d(),
        local_transform2d(undefined, 0, [0.2, 0.2]), // Small projectile

        render2d(Tile.Body), // Use a bullet/projectile sprite

        collide2d(true, Layer.Projectile, Layer.Player | Layer.Terrain, 0.05),
        rigid_body2d(RigidKind.Dynamic, 0, 0, [0, 0]),

        deal_damage(damage, {
            destroy_on_hit: true,
        }),

        lifespan(4),

        // Trail particles spawned as projectile moves
        spawn_timed(
            (_game, _spawner) => blueprint_bullet_trail(),
            0.05, // interval: spawn trail particles every 0.05 seconds
            0.0, // spread: no randomization - precise trail
            0.0, // speedMin: trails stay where spawned
            0.0, // speedMax: no movement
            Infinity,
        ),
    ];
}

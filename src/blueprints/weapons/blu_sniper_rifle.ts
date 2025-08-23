import {collide2d} from "../../components/com_collide2d.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {Game, Layer} from "../../game.js";

export function blueprint_sniper_rifle(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d(),
        render2d("22"), // Use a sniper sprite
        collide2d(false, Layer.None, Layer.None, 0.5),
        weapon_ranged(
            3.5, // damage (reduced from 5 for better balance)
            15, // range (very long)
            3.5, // cooldown (very slow)
            20, // projectile speed (very fast)
            1, // projectile count (single shot)
            0.01, // spread (pinpoint accuracy between multiple shots)
            0.08, // scatter (small aiming inaccuracy for balance)
            1.2, // initial timeout (longer delay before first shot)
        ),
    ];
}

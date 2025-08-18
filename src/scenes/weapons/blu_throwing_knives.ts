import {collide2d} from "../../components/com_collide2d.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {Game, Layer} from "../../game.js";

export function blueprint_throwing_knives(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d(),
        render2d("20"), // Use a knife sprite
        collide2d(false, Layer.None, Layer.None, [0.2, 0.2]),
        weapon_ranged(
            1.5, // damage
            6, // range
            2.0, // cooldown
            8, // projectile speed
            3, // projectile count (throws 3 knives)
            0.3, // spread (fan pattern between multiple projectiles)
            0.12, // scatter (higher inaccuracy for throwing)
            0.8, // initial timeout
        ),
    ];
}

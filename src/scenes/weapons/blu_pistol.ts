import {collide2d} from "../../components/com_collide2d.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {Game, Layer} from "../../game.js";

export function blueprint_pistol(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d(),
        render2d("18"), // Use a gun sprite
        collide2d(false, Layer.None, Layer.None, [0.3, 0.3]),
        weapon_ranged(
            2,      // damage
            8,      // range  
            1.5,    // cooldown (seconds)
            12,     // projectile speed
            1,      // projectile count
            0.05    // spread (tight accuracy)
        ),
    ];
}
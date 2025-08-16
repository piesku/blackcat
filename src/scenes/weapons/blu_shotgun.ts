import {collide2d} from "../../components/com_collide2d.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {Game, Layer} from "../../game.js";

export function blueprint_shotgun(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d(),
        render2d("21"), // Use a shotgun sprite
        collide2d(false, Layer.None, Layer.None, [0.7, 0.3]),
        weapon_ranged(
            1.0, // damage per pellet
            4, // range (shorter than pistol)
            2.5, // cooldown (slow)
            10, // projectile speed
            5, // projectile count (5 pellets)
            0.5, // spread (wide cone)
        ),
    ];
}

import {collide2d} from "../../components/com_collide2d.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {weapon_melee} from "../../components/com_weapon.js";
import {Game, Layer} from "../../game.js";

export function blueprint_baseball_bat(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d(),
        render2d("19"), // Use a bat sprite
        collide2d(false, Layer.None, Layer.None, [0.8, 0.3]),
        weapon_melee(
            2.5, // damage
            1.5, // range
            2.0, // cooldown
            3.0, // knockback (high)
            Math.PI / 2, // arc (wide swing)
        ),
    ];
}

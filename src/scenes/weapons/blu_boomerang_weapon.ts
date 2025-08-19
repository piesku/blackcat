import {collide2d} from "../../components/com_collide2d.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {named} from "../../components/com_named.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {Game, Layer} from "../../game.js";

export function blueprint_boomerang_weapon(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d(),
        render2d("25"), // Use boomerang weapon sprite
        named("boomerang"), // Name for identification
        collide2d(false, Layer.None, Layer.None, 0.15),
        weapon_ranged(
            2, // damage: moderate damage (+ return hit)
            8, // range: medium range
            3.0, // cooldown: slow rate of fire
            10, // projectile speed: medium speed
            1, // projectile count: single boomerang
            0.0, // spread: no spread
            0.03, // scatter: slight inaccuracy
            1.0, // initial timeout
        ),
    ];
}

import {collide2d} from "../../components/com_collide2d.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {named} from "../../components/com_named.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {Game, Layer} from "../../game.js";

export function blueprint_crossbow(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d(),
        render2d("22"), // Use crossbow sprite
        named("crossbow"), // Name for identification
        collide2d(false, Layer.None, Layer.None, [0.3, 0.3]),
        weapon_ranged(
            3, // damage: high damage per bolt
            10, // range: long range
            2.5, // cooldown: slow rate of fire
            15, // projectile speed: fast bolts
            1, // projectile count: single bolt
            0.0, // spread: no spread
            0.02, // scatter: very accurate
            0.8, // initial timeout
        ),
    ];
}

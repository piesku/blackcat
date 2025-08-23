import {local_transform2d} from "../../components/com_local_transform2d.js";
import {label} from "../../components/com_label.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {Game} from "../../game.js";

export function blueprint_boomerang_weapon(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d([0.5, 0], 0, [0.8, 0.8]), // Medium offset and size
        render2d("24"), // Using sprite 24 for boomerang
        label("boomerang"), // Name for identification
        weapon_ranged(
            2, // damage: moderate damage, can hit multiple targets
            6, // range: medium range for throwing
            2.5, // cooldown: moderate rate of fire for precision throwing
            5, // projectile speed: boomerang flight speed
            1, // projectile count: single boomerang
            0.0, // spread: no spread for precision
            0.0, // scatter: no scatter for accuracy
            0.3, // initial timeout
        ),
    ];
}

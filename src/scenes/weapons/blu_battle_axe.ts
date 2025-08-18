import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {weapon_melee} from "../../components/com_weapon.js";
import {Game} from "../../game.js";

export function blueprint_battle_axe(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d([0.5, 0], 0, [0.8, 0.8]), // Offset slightly to the right, smaller scale
        render2d("15"), // Using sprite 15 for the axe
        weapon_melee(
            3, // damage: high damage
            1.2, // range: short melee range
            1.5, // cooldown: 1.5 seconds between attacks
            2.0, // knockback: strong knockback
            Math.PI / 4, // arc: 45 degree attack arc
            0.3, // initial timeout
        ),
    ];
}

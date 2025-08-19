import {local_transform2d} from "../../components/com_local_transform2d.js";
import {named} from "../../components/com_named.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {weapon_melee} from "../../components/com_weapon.js";
import {Game} from "../../game.js";

export function blueprint_chainsaw(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d([0.6, 0], 0, [0.9, 0.9]), // Offset right, large scale
        render2d("19"), // Using sprite 19 for chainsaw
        named("chainsaw"), // Name for identification
        weapon_melee(
            1, // damage: lower per-hit but continuous
            1.5, // range: longer than axe
            0.3, // cooldown: very fast continuous hits
            1.5, // knockback: moderate
            Math.PI / 3, // arc: wide 60 degree arc
            0.2, // initial timeout
        ),
    ];
}

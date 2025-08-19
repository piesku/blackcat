import {local_transform2d} from "../../components/com_local_transform2d.js";
import {named} from "../../components/com_named.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {Game} from "../../game.js";

export function blueprint_flamethrower(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d([0.7, 0], 0, [1.0, 1.0]), // Larger weapon offset
        render2d("21"), // Using sprite 21 for flamethrower
        named("flamethrower"), // Name for identification
        weapon_ranged(
            1, // damage: moderate damage per fire zone
            6, // range: medium range
            2.0, // cooldown: slower rate of fire
            8, // projectile speed: fire zones travel forward
            1, // projectile count: single fire zone
            0.0, // spread: no spread between shots
            0.1, // scatter: slight aiming inaccuracy
            0.5, // initial timeout
        ),
    ];
}

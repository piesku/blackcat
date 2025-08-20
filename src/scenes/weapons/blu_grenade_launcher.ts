import {local_transform2d} from "../../components/com_local_transform2d.js";
import {named} from "../../components/com_named.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {Game} from "../../game.js";

export function blueprint_grenade_launcher(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d([0.7, 0], 0, [1.0, 1.0]), // Large weapon offset
        render2d("22"), // Using sprite 22 for grenade launcher
        named("grenade_launcher"), // Name for identification
        weapon_ranged(
            2, // damage: high damage per explosion
            8, // range: long range
            3.0, // cooldown: slow rate of fire
            6, // projectile speed: grenades travel in arc
            1, // projectile count: single grenade
            0.0, // spread: no spread between shots
            0.1, // scatter: slight aiming inaccuracy
            0.5, // initial timeout
        ),
    ];
}

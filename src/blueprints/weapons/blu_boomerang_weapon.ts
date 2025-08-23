import {blueprint_boomerang_projectile} from "../projectiles/blu_boomerang.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {label} from "../../components/com_label.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
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

        // Spawner for boomerang projectiles
        spawn_count(
            blueprint_boomerang_projectile(game, 0, [0, 0], 6, 5), // Will be configured per shot
            1, // count: single boomerang per shot
            0, // interval: instant spawn
            [1, 0], // direction: Forward direction (will be overridden by weapon system)
            0.0, // spread: No spread for precision throwing
            4.5, // speedMin
            5.5, // speedMax
        ),
    ];
}

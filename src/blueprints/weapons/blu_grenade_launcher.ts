import {Tile} from "../../../sprites/spritesheet.js";
import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {Game} from "../../game.js";
import {blueprint_grenade} from "../projectiles/blu_grenade.js";

export function blueprint_grenade_launcher(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d([0, 0], 0, [1.0, 1.0]), // Large weapon offset
        render2d(Tile.Mortar), // Using sprite 22 for grenade launcher
        label("grenade_launcher"), // Name for identification
        weapon_ranged(
            2, // damage: high damage per explosion
            8, // range: long range
            3.0, // cooldown: slow rate of fire
            0.5, // initial timeout
            1, // totalAmount: 1 grenade per shot
        ),

        // Spawner for grenade projectiles
        spawn_count(
            blueprint_grenade(game, 2, 0, 8, 6, [0, 0]), // Will be configured per shot
            0, // interval: instant spawn
            [1, 0], // direction: Forward direction (will be overridden by weapon system)
            0.1, // spread: Slight spread for realism
            5.5, // speedMin
            6.5, // speedMax
        ),
    ];
}

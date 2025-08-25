import {Tile} from "../../../sprites/spritesheet.js";
import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {blueprint_boomerang_projectile} from "../projectiles/blu_boomerang.js";

export function blueprint_boomerang_weapon() {
    return [
        spatial_node2d(),
        local_transform2d([0, 0], 0, [1, 1]), // Medium offset and size
        render2d(Tile.Boomerang), // Using sprite 24 for boomerang
        label("boomerang"), // Name for identification
        weapon_ranged(
            6, // range: medium range for throwing
            2.5, // cooldown: moderate rate of fire for precision throwing
            0.3, // initial timeout
            1, // totalAmount: 1 boomerang per shot
        ),

        // Spawner for boomerang projectiles
        spawn_count(
            () => blueprint_boomerang_projectile(2, -1, [0, 0], 6, 5), // Will be configured per shot
            0, // interval: instant spawn
            null, // direction: Will be set by weapon system
            0.0, // spread: No spread for precision throwing
            4.5, // speedMin
            5.5, // speedMax
        ),
    ];
}

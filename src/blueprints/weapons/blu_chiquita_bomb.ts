import {float} from "../../../lib/random.js";
import {Tile} from "../../../sprites/spritesheet.js";
import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {blueprint_chiquita_main_bomb} from "../projectiles/blu_chiquita_main_bomb.js";

export function blueprint_chiquita_bomb() {
    return [
        spatial_node2d(),
        local_transform2d([0, 0], 0, [1.0, 1.0]), // Standard weapon size
        render2d(Tile.Mortar), // Use mortar sprite for the launcher
        label("chiquita bomb launcher"), // Name for identification
        weapon_ranged(
            8, // range: long range for throwing bombs
            3.5, // cooldown: slower rate of fire for powerful explosive
            float(1, 3), // initial timeout
            1.0, // totalAmount: single shot weapon, no burst
        ),

        // Spawner for main bombs - single bomb per shot
        spawn_count(
            blueprint_chiquita_main_bomb,
            0.0, // interval: no repeated spawning - single shot
            0.1, // spread: Low spread for accurate throwing
            4.0, // speedMin: moderate throwing speed
            6.0, // speedMax: moderate throwing speed
        ),
    ];
}

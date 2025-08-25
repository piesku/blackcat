import {float} from "../../../lib/random.js";
import {Tile} from "../../../sprites/spritesheet.js";
import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {blueprint_explosive_bomb} from "../projectiles/blu_explosive_bomb.js";

export function blueprint_explosives() {
    return [
        spatial_node2d(),
        local_transform2d([0, 0], 0, [1.0, 1.0]), // Standard weapon size
        render2d(Tile.Mortar), // Use mortar sprite for explosives launcher
        label("explosives"), // Name for identification
        weapon_ranged(
            8, // range: long range for throwing bombs
            3.0, // cooldown: slower rate of fire for powerful explosives
            float(1, 3), // initial timeout
            1.0, // totalAmount: single shot weapon, no burst
        ),

        // Spawner for explosive bombs - single bomb per shot
        spawn_count(
            blueprint_explosive_bomb,
            0.0, // interval: no repeated spawning - single shot
            null, // direction: Will be set by weapon system
            0.1, // spread: Low spread for accurate throwing
            4.0, // speedMin: moderate throwing speed
            6.0, // speedMax: moderate throwing speed
            1, // burstCount: single bomb per shot
        ),
    ];
}

import {float} from "../../../lib/random.js";
import {Tile} from "../../../sprites/spritesheet.js";
import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {blueprint_spikeball} from "../projectiles/blu_spikeball.js";

export function blueprint_spikeballs() {
    return [
        spatial_node2d(),
        local_transform2d([0, 0], 0, [1.0, 1.0]), // Standard weapon size
        render2d(Tile.Mortar), // Use mortar sprite (launcher-like appearance)
        label("spikeballs"), // Name for identification
        weapon_ranged(
            7, // range: good range for lobbing spikeballs
            2.8, // cooldown: moderate rate for persistence weapon
            float(0.2, 0.5), // initial timeout
            5.0, // totalAmount
        ),

        // Spawner for spikeballs
        spawn_count(
            () => blueprint_spikeball(2), // 2 damage per hit
            0.001, // interval: all at once
            0.2, // spread: Slight spread for unpredictability
            3.5, // speedMin: moderate launching speed
            4.5, // speedMax: moderate launching speed
        ),
    ];
}

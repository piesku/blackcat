import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {blueprint_spikeball} from "../projectiles/blu_spikeball.js";

export function blueprint_spikeballs() {
    return [
        DEBUG && label("spikeballs"), // Name for identification
        spatial_node2d(),
        local_transform2d(), // Standard weapon size
        weapon_ranged(
            7, // range: good range for lobbing spikeballs
            2.8, // cooldown: moderate rate for persistence weapon
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

import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {blueprint_explosive_bomb} from "../projectiles/blu_explosive_bomb.js";

export function blueprint_explosives() {
    return [
        DEBUG && label("explosives"), // Name for identification
        spatial_node2d(),
        local_transform2d(),
        weapon_ranged(
            8, // range: long range for throwing bombs
            3.0, // cooldown: slower rate of fire for powerful explosives
            1.0, // totalAmount: single shot weapon, no burst
        ),

        // Spawner for explosive bombs - single bomb per shot
        spawn_count(
            blueprint_explosive_bomb,
            0.0, // interval: no repeated spawning - single shot
            0.1, // spread: Low spread for accurate throwing
            4.0, // speedMin: moderate throwing speed
            6.0, // speedMax: moderate throwing speed
            1, // burstCount: single bomb per shot
        ),
    ];
}

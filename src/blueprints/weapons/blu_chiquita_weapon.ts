import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {blueprint_chiquita_main_bomb} from "../projectiles/blu_chiquita_bomb.js";

export function blueprint_chiquita_weapon() {
    return [
        spatial_node2d(),
        local_transform2d(),
        label("chiquita bomb launcher"), // Name for identification
        weapon_ranged(
            8, // range: long range for throwing bombs
            3.5, // cooldown: slower rate of fire for powerful explosive
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

import {children} from "../../components/com_children.js";
import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {blueprint_muzzle_flash_spawner} from "../blu_muzzle_flash_spawner.js";
import {blueprint_larpa_rocket} from "../projectiles/blu_larpa_rocket.js";

export function blueprint_larpa() {
    return [
        DEBUG && label("larpa"), // Name for identification
        spatial_node2d(),
        local_transform2d(),
        weapon_ranged(
            7, // range: good range for rocket launcher
            2.5, // cooldown: moderate rate of fire
            3, // totalAmount: 3 rockets per shot
        ),

        // Spawner for larpa rockets
        spawn_count(
            () => blueprint_larpa_rocket(2.5), // Higher damage than regular projectiles
            0.3, // interval: instant spawn
            0.05, // spread: Very tight spread for precision
            5.0, // speedMin: Fast rocket speed
            6.0, // speedMax
        ),

        // Muzzle flash effect
        children(blueprint_muzzle_flash_spawner(0.3)),
    ];
}

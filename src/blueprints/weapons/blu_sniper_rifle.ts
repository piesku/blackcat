import {children} from "../../components/com_children.js";
import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {blueprint_muzzle_flash_spawner} from "../blu_muzzle_flash_spawner.js";
import {blueprint_bullet} from "../projectiles/blu_bullet.js";

export function blueprint_sniper_rifle() {
    return [
        DEBUG && label("sniper_rifle"), // Name for identification
        spatial_node2d(),
        local_transform2d(),
        weapon_ranged(
            15, // range (very long)
            3.5, // cooldown (very slow)
            1, // totalAmount: 1 bullet per shot
        ),

        // Spawner for sniper bullets
        spawn_count(
            () => blueprint_bullet(3.5),
            0, // interval: instant spawn
            0.01, // spread: Very tight spread for precision
            10, // speedMin
            11, // speedMax
        ),

        // Muzzle flash effect
        children(blueprint_muzzle_flash_spawner(0)), // Instant flash to match instant bullet spawn
    ];
}

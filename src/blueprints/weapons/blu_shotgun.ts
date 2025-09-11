import {children} from "../../components/com_children.js";
import {collide2d} from "../../components/com_collide2d.js";
import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {Layer} from "../../game.js";
import {blueprint_muzzle_flash_spawner} from "../blu_muzzle_flash_spawner.js";
import {blueprint_bullet} from "../projectiles/blu_bullet.js";

export function blueprint_shotgun() {
    return [
        spatial_node2d(),
        local_transform2d(),
        collide2d(false, Layer.None, Layer.None, 0.35),
        label("shotgun"), // Name for identification
        weapon_ranged(
            4, // range (shorter than pistol)
            2.5, // cooldown (slow)
            0.9, // initial timeout
            5, // totalAmount: 5 pellets per shot
        ),

        // Spawner for shotgun pellets
        spawn_count(
            () => blueprint_bullet(1.0),
            0, // interval: instant spawn (all at once)
            0.5, // spread: Wide cone spread for pellets
            9.0, // speedMin
            11.0, // speedMax
        ),

        // Muzzle flash effect
        children(blueprint_muzzle_flash_spawner(0)), // Instant flash to match instant pellet spawn
    ];
}

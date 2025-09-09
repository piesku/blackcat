import {local_transform2d} from "../components/com_local_transform2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {spawn_count} from "../components/com_spawn.js";
import {blueprint_muzzle_flash} from "./blu_muzzle_flash.js";

/**
 * Creates a muzzle flash spawner that creates brief flashes when activated
 * @param interval Time between muzzle flashes (should match weapon's bullet interval)
 */
export function blueprint_muzzle_flash_spawner(interval: number = 0) {
    return [
        spatial_node2d(),
        local_transform2d(), // At weapon position
        spawn_count(
            () => blueprint_muzzle_flash([0, 0]), // Create muzzle flash at spawner location
            interval, // Match the weapon's firing rate
            0, // spread: no spread needed for muzzle flash
            0, // speedMin: muzzle flash doesn't move
            0, // speedMax: muzzle flash doesn't move
        ),
    ];
}

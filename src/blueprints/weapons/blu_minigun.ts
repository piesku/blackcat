import {Tile} from "../../../sprites/spritesheet.js";
import {children} from "../../components/com_children.js";
import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {blueprint_shell_casing} from "../particles/blu_shell_casing.js";
import {blueprint_bullet} from "../projectiles/blu_bullet.js";

export function blueprint_minigun() {
    return [
        spatial_node2d(),
        local_transform2d([0, 0], 0, [1.0, 1.0]), // Standard weapon size
        render2d(Tile.Rifle), // Using rifle sprite for now, could be updated to specific minigun sprite
        label("minigun"), // Name for identification
        weapon_ranged(
            6, // range: medium range
            1.8, // cooldown: fast rate of fire for bursts
            0.2, // initial timeout
            10, // totalAmount: 10 bullets
        ),

        // Spawner for rapid bullet spray - uses count spawner for controlled bursts
        spawn_count(
            blueprint_bullet(1.2),
            1 / 5, // interval: 5 bullets per second
            0.15, // spread: Moderate spread for spray effect
            7.0, // speedMin
            8.0, // speedMax
        ),

        // Child entity for shell casing effects - rotated to eject backwards and slightly up
        children([
            spatial_node2d(),
            local_transform2d([0, 0], 150, [1, 1]), // Rotated to eject backwards and up
            spawn_count(
                (game, spawner) => blueprint_shell_casing(),
                1 / 5, // interval: match bullet spawn rate
                0.3, // spread: casings scatter randomly
                1.0, // speedMin: casings eject with moderate force
                2.0, // speedMax
            ),
        ]),
    ];
}

import {Tile} from "../../../sprites/spritesheet.js";
import {children} from "../../components/com_children.js";
import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_timed} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {Game} from "../../game.js";
import {blueprint_shell_casing} from "../particles/blu_shell_casing.js";
import {blueprint_projectile} from "../projectiles/blu_projectile.js";

export function blueprint_minigun(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d([0, 0], 0, [1.0, 1.0]), // Standard weapon size
        render2d(Tile.Rifle), // Using rifle sprite for now, could be updated to specific minigun sprite
        label("minigun"), // Name for identification
        weapon_ranged(
            1.2, // damage: moderate damage per bullet
            6, // range: medium range
            1.8, // cooldown: fast rate of fire for bursts
            0.2, // initial timeout
        ),

        // Spawner for rapid bullet spray - uses timed spawner for continuous fire
        spawn_timed(
            blueprint_projectile(game, 1.2, 6, 12), // Fast bullets
            0.8, // duration: 0.8 second burst
            0.05, // interval: spawn every 0.05 seconds (20 bullets per second during burst)
            [1, 0], // direction: Forward direction (will be overridden by weapon system)
            0.15, // spread: Moderate spread for spray effect
            7.0, // speedMin
            8.0, // speedMax
            1, // burstCount: single bullet per emission
        ),

        // Child entity for shell casing effects
        children([
            spatial_node2d(),
            local_transform2d([0, 0], 0, [1, 1]), // Same position as parent weapon
            spawn_timed(
                blueprint_shell_casing(),
                0.8, // duration: same as bullet burst
                0.05, // interval: shell casing for each bullet
                [-0.5, 0.3], // direction: eject backwards and slightly up
                0.3, // spread: casings scatter randomly
                1.0, // speedMin: casings eject with moderate force
                2.0, // speedMax
                1, // burstCount: single casing per emission
            ),
        ]),
    ];
}

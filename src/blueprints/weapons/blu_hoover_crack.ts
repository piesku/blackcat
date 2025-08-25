import {float} from "../../../lib/random.js";
import {Tile} from "../../../sprites/spritesheet.js";
import {children} from "../../components/com_children.js";
import {control_always2d} from "../../components/com_control_always2d.js";
import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {move2d} from "../../components/com_move2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {blueprint_hoover_projectile} from "../projectiles/blu_hoover_projectile.js";

export function blueprint_hoover_crack() {
    return [
        spatial_node2d(),
        local_transform2d(),
        render2d(Tile.Rifle), // Using rifle sprite, could be updated to specific spinning emitter sprite
        label("hoover crack"), // Name for identification
        weapon_ranged(
            5, // range: medium range for particle emitter
            2.5, // cooldown: moderate rate of fire
            float(0.3, 1.5), // initial timeout
            1, // totalAmount:
        ),

        children(
            // Spawner for Hoover Crack projectiles - stationary spinning emitters
            [
                spatial_node2d(),
                local_transform2d(),
                control_always2d([0, 0], 1),
                move2d(0, 90),
                spawn_count(
                    blueprint_hoover_projectile,
                    0, // interval
                    null, // direction: Will be set by weapon system
                    Math.PI / 6, // spread: 30 degree spread for projectile placement
                    4.0, // speedMin: Slow movement for spinning emitters
                    5.0, // speedMax: Medium speed so they spread out before stopping
                ),
            ],
        ),
    ];
}

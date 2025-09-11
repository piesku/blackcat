import {blueprint_flame_particle} from "../../blueprints/particles/blu_flame_particle.js";
import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_timed} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";

export function blueprint_flamethrower() {
    return [
        spatial_node2d(),
        local_transform2d([0, 0], 0, [1.0, 1.0]), // Larger weapon offset
        label("flamethrower"), // Name for identification
        weapon_ranged(
            6, // range: medium range
            3.0, // cooldown: slower rate of fire for triggering flame bursts
            0.5, // initial timeout
            1.0, // totalAmount: 1 second flame duration
        ),

        // Spawner for flame cone effect
        spawn_timed(
            (game, spawner) => blueprint_flame_particle(1), // damage=1
            1.0 / 12, // interval: spawn every ~0.083 seconds (12 particles per second)
            Math.PI / 4, // spread: 45 degree cone spread
            3.0, // speedMin
            5.0, // speedMax
        ),
    ];
}

import {blueprint_flame_particle} from "../../blueprints/particles/blu_flame_particle.js";
import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {Game} from "../../game.js";

export function blueprint_flamethrower(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d([0.7, 0], 0, [1.0, 1.0]), // Larger weapon offset
        render2d("21"), // Using sprite 21 for flamethrower
        label("flamethrower"), // Name for identification
        weapon_ranged(
            1, // damage: moderate damage per flame particle
            6, // range: medium range
            3.0, // cooldown: slower rate of fire for triggering flame bursts
            4, // projectile speed: flame particle speed
            1, // projectile count: not used with particle emitter
            0.0, // spread: not used with particle emitter
            0.0, // scatter: not used with particle emitter
            0.5, // initial timeout
        ),

        // Spawner for flame cone effect
        spawn(
            blueprint_flame_particle(1), // damage=1 (spawner source set by spawn system)
            12, // frequency: 12 particles per second (rapid fire)
            {
                direction: [1, 0], // Forward direction (will be overridden by weapon system)
                spread: Math.PI / 4, // 45 degree cone spread
                speedMin: 3.0,
                speedMax: 5.0,
                duration: 0, // Start inactive (0 duration), will be activated by weapon system
                burstCount: 1, // 2 particles per emission
            },
        ),
    ];
}

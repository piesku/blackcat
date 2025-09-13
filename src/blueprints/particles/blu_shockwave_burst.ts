import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {blueprint_shockwave_particle} from "./blu_shockwave_particle.js";

export function blueprint_shockwave_burst(particle_count: number = 8) {
    const SHOCKWAVE_DAMAGE = 0.5; // Hardcoded damage per particle

    return [
        DEBUG && label("shockwave burst"),

        // NO spatial_node2d() - this is a short-lived spawner entity
        local_transform2d([0, 0], 0, [1, 1]),

        // Spawn all particles at once in a full circle
        spawn_count(
            (game, spawner_entity) => blueprint_shockwave_particle(SHOCKWAVE_DAMAGE),
            0, // No interval - spawn all at once
            Math.PI * 2, // Full circle spread
            8.0, // Speed (consistent shockwave speed)
            8.0, // Same speed for all particles
            particle_count, // Spawn this many particles immediately
        ),

        // Self-destruct after spawning
        lifespan(0.2),
    ];
}

import {lifespan} from "../components/com_lifespan.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {move2d} from "../components/com_move2d.js";
import {particle, ParticleType} from "../components/com_particle.js";
import {render2d} from "../components/com_render2d.js";
import {Vec2} from "../../lib/math.js";

export function blueprint_shadow_particle(
    direction: Vec2 = [0, 0],
    speed: number = 0.5,
    lifetime: number = 2.0,
) {
    return [
        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d([0, 0], 0, [0.2, 0.2]), // Start medium size
        render2d("25"), // Shadow sprite (dark/transparent)
        move2d(speed, 0), // No rotation for particles

        // Shadow particle physics and behavior
        particle(ParticleType.Shadow, direction, speed, lifetime, {
            gravity: [0, 0], // No gravity for shadows
            spread: 0.1, // Minimal drift
            initialScale: [0.2, 0.2],
            finalScale: [0.05, 0.05], // Shrink over time
            fadeIn: 0.1, // Quick fade in
            fadeOut: 1.5, // Long fade out for trailing effect
            damping: 0.98, // Very slow deceleration
            destroyOnHit: false, // Shadows don't interact
        }),

        lifespan(lifetime),
    ];
}

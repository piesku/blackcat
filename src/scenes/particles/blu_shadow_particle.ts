import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {particle, ParticleType} from "../../components/com_particle.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";

export function blueprint_shadow_particle() {
    return [
        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d([0, 0], 0, [0.2, 0.2]), // Start medium size
        render2d("25"), // Shadow sprite (dark/transparent)

        // Physics integration via RigidBody2D (replaces move2d)
        rigid_body2d(RigidKind.Dynamic, 0, 0.9, [0, 0]), // No gravity for shadows

        // Shadow particle physics and behavior
        particle(ParticleType.Shadow, {
            spread: 0.1, // Minimal drift
            finalScale: [0.05, 0.05], // Shrink over time
            fadeIn: 0.1, // Quick fade in
            fadeOut: 1.5, // Long fade out for trailing effect
        }),

        lifespan(4),
    ];
}

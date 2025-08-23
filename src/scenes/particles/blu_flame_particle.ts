import {collide2d} from "../../components/com_collide2d.js";
import {DamageType, deal_damage} from "../../components/com_deal_damage.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {particle, ParticleType} from "../../components/com_particle.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";
import {Layer} from "../../game.js";

export function blueprint_flame_particle(damage: number = 1) {
    return [
        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d([0, 0], 0, [0.1, 0.1]), // Start small
        render2d("34"), // Flame sprite

        // Physics integration via RigidBody2D (replaces move2d)
        rigid_body2d(RigidKind.Dynamic, 0, 0.9, [0, 1.0]), // Custom gravity: gentle upward drift (flames rise)

        // Flame particle physics and behavior
        particle(ParticleType.Flame, {
            spread: 0.3, // More turbulence for realistic flame motion
            finalScale: [0.5, 0.5], // Flames grow as they burn
            fadeOut: 0.4, // Long fade out
        }),

        // Collision and damage - particles collide with fighters and terrain but not each other
        collide2d(true, Layer.Particle, Layer.Player | Layer.Terrain, 0.1),
        deal_damage(damage, DamageType.Fire, {
            cooldown: 0.0,
            shake_duration: 0.05,
            destroy_on_hit: true,
        }),

        lifespan(8),
    ];
}

import {Tile} from "../../../sprites/spritesheet.js";
import {collide2d} from "../../components/com_collide2d.js";
import {deal_damage} from "../../components/com_deal_damage.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {particle, ParticleType} from "../../components/com_particle.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";
import {Layer} from "../../game.js";

export function blueprint_debris_particle() {
    return [
        label("debris particle"),

        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d([0, 0], 0, [0.15, 0.15]), // Small debris pieces
        render2d(Tile.Body), // Debris sprite

        // Physics integration via RigidBody2D with realistic gravity
        rigid_body2d(RigidKind.Dynamic, 0, 0.3, [0, -9.8]), // Standard gravity for debris

        // Debris particle physics and behavior
        particle(ParticleType.Flame, 0.8, [0.05, 0.05], 0.6), // spread, finalScale, fadeOut

        // Collision and damage
        collide2d(true, Layer.Particle, Layer.Player | Layer.Terrain, 0.1),
        deal_damage(0.1, {
            cooldown: 0.0,
            destroy_on_hit: true,
        }),

        lifespan(3), // Debris lasts 3 seconds before disappearing
    ];
}

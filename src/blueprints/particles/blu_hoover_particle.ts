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

export function blueprint_hoover_particle(damage: number) {
    return [
        label("hoover particle"),

        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d([0, 0], 0, [0.2, 0.2]),
        render2d(Tile.Body),

        // Physics for spinning motion - high friction, no gravity
        rigid_body2d(RigidKind.Dynamic, 0, 0.9, [0, 0]),

        // Spinning particle with continuous damage
        particle(ParticleType.Spark, 0.8, [0.05, 0.05], 0.3), // spread, finalScale, fadeOut

        // Collision and damage - continuous damage dealing
        collide2d(true, Layer.Particle, Layer.Player | Layer.Terrain, 0.15),
        deal_damage(damage, {
            cooldown: 0.1, // Short cooldown for continuous damage
            shake_duration: 0.02,
            destroy_on_hit: false, // Don't destroy on hit - continuous damage
        }),

        lifespan(6), // Persist for 6 seconds of continuous damage
    ];
}

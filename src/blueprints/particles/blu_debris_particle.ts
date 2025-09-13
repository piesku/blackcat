import {Tile} from "../../../sprites/spritesheet.js";
import {collide2d} from "../../components/com_collide2d.js";
import {deal_damage} from "../../components/com_deal_damage.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {particle} from "../../components/com_particle.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";
import {Layer} from "../../game.js";

export function blueprint_debris_particle() {
    return [
        DEBUG && label("debris particle"),

        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d(),
        render2d(Tile.Part, [0.5, 0.5, 0.5, 1]),

        // Physics integration via RigidBody2D with realistic gravity
        rigid_body2d(RigidKind.Dynamic, 0, 0.3, [0, -9.8]), // Standard gravity for debris

        // Debris particle physics and behavior
        particle(0.8), // spread

        // Collision and damage
        collide2d(Layer.Particle, Layer.Player | Layer.Terrain, 0.1),
        deal_damage(0.1), // Default cooldown=0, destroys on hit

        lifespan(3), // Debris lasts 3 seconds before disappearing
    ];
}

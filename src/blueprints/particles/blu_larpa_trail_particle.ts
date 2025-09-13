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

export function blueprint_larpa_trail_particle() {
    return [
        DEBUG && label("larpa trail particle"),

        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d(),
        render2d(Tile.Part, [0.5, 0, 1, 0.7]), // Purple color for larpa trail

        // Physics integration via RigidBody2D with gravity
        rigid_body2d(RigidKind.Dynamic, 0, 0.2, [0, -5.0]), // Falling particles with gravity

        // Particle behavior - falling damage trail
        particle(0.4), // spread

        // Collision and damage
        collide2d(Layer.Particle, Layer.Player | Layer.Terrain, 0.05),
        deal_damage(0.5), // Default cooldown=0, destroys on hit

        lifespan(2.5), // Trail particles last 2.5 seconds before disappearing
    ];
}

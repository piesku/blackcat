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

export function blueprint_shockwave_particle(damage: number = 0.5) {
    return [
        label("shockwave particle"),

        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d([0, 0], 0, [0.2, 0.2]), // Medium-sized shockwave particles
        render2d(Tile.Die1), // Use body sprite for shockwave visual

        // Physics integration via RigidBody2D - no gravity for energy-based shockwave
        rigid_body2d(RigidKind.Dynamic, 0, 0.2), // Light air resistance, no gravity

        // Shockwave particle physics and behavior
        particle(0.5, [0.1, 0.1], 0.8), // spread, finalScale, fadeOut

        // Collision and damage - damages objects and other fighters
        collide2d(true, Layer.Particle, Layer.Player | Layer.Terrain, 0.1),
        deal_damage(damage), // Default cooldown=0, destroys on hit

        lifespan(1.5), // Shockwave particles last 1.5 seconds before disappearing
    ];
}

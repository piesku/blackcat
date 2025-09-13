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

export function blueprint_hoover_particle(damage: number) {
    return [
        label("hoover particle"),

        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d(),
        render2d(Tile.Part, [0.6, 0.6, 1, 1]), // Light blue color for hoover particles

        // Physics for spinning motion - high friction, no gravity
        rigid_body2d(RigidKind.Dynamic, 0, 0.9, [0, 0]),

        // Spinning particle with continuous damage
        particle(0.8), // spread

        // Collision and damage
        collide2d(Layer.Particle, Layer.Player | Layer.Terrain, 0.15),
        deal_damage(damage),

        lifespan(6), // Persist for 6 seconds of continuous damage
    ];
}

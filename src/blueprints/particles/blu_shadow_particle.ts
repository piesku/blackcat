import {Tile} from "../../../sprites/spritesheet.js";
import {collide2d} from "../../components/com_collide2d.js";
import {deal_damage} from "../../components/com_deal_damage.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {particle} from "../../components/com_particle.js";
import {order, render2d} from "../../components/com_render2d.js";
import {Layer} from "../../game.js";

export function blueprint_shadow_particle() {
    return [
        DEBUG && label("shadow particle"),

        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d(),
        render2d(Tile.Run1, [1, 1, 1, 0.3]),
        order(1),

        // Shadow particle physics and behavior
        particle(0.0), // spread

        // Collision and damage - continuous damage dealing
        collide2d(Layer.Particle, Layer.Player, 1),
        deal_damage(1, 0.1), // 0.1s cooldown, continuous shadow damage

        lifespan(5),
    ];
}

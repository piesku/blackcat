import {Tile} from "../../../sprites/spritesheet.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {particle, ParticleType} from "../../components/com_particle.js";
import {order, render2d} from "../../components/com_render2d.js";

export function blueprint_shadow_particle() {
    return [
        label("shadow particle"),

        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d(),
        render2d(Tile.Body, [1, 1, 1, 0.3]),
        order(1),

        // Shadow particle physics and behavior
        particle(ParticleType.Shadow, 0.0, [0.05, 0.05], 2), // spread, finalScale, fadeOut

        // TODO add deal_damage

        lifespan(3),
    ];
}

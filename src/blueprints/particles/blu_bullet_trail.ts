import {Tile} from "../../../sprites/spritesheet.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {particle} from "../../components/com_particle.js";
import {render2d} from "../../components/com_render2d.js";

export function blueprint_bullet_trail() {
    return [
        label("bullet trail"),

        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d([0, 0], 0, [0.1, 0.1]), // Small elongated trail mark
        render2d(Tile.Die1), // Small particle sprite

        // Trail particle physics and behavior
        particle(0.0, [0.05, 0.05], 1), // spread, finalScale, fadeOut

        lifespan(1), // Short lifespan - trails disappear quickly
    ];
}

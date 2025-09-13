import {Tile} from "../../../sprites/spritesheet.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {particle} from "../../components/com_particle.js";
import {render2d} from "../../components/com_render2d.js";

export function blueprint_bullet_trail() {
    return [
        DEBUG && label("bullet trail"),

        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d(),
        render2d(Tile.Part, [1, 1, 0, 0.8]), // Yellowish color for bullet trails

        // Trail particle physics and behavior
        particle(0.0), // spread

        lifespan(1), // Short lifespan - trails disappear quickly
    ];
}

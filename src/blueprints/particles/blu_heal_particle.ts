import {Tile} from "../../../sprites/spritesheet.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {particle} from "../../components/com_particle.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";

export function blueprint_heal_particle() {
    return [
        label("heal particle"),

        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d([0, 0], 0, [0.3, 0.3]), // Start small and shrink further
        render2d(Tile.Die1, [0, 1, 0, 0.5]), // Green color for healing

        // Physics integration - gentle upward float
        rigid_body2d(RigidKind.Dynamic, 0, 0.95, [0, 2.0]), // Gentle upward drift (healing energy rises)

        // Healing particle physics and behavior
        particle(0.5, [0.01, 0.01], 0.6), // spread, finalScale, fadeOut

        // No collision or damage - healing particles are purely visual

        lifespan(4), // Short lifespan for gentle healing effect
    ];
}

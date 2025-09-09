import {Tile} from "../../../sprites/spritesheet.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {particle, ParticleType} from "../../components/com_particle.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";

export function blueprint_blood_particle() {
    return [
        label("blood particle"),

        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d([0, 0], 0, [0.4, 0.4]), // Start medium-sized for visible splatter
        render2d(Tile.Body, [0.8, 0, 0, 0.9]), // Dark red color for blood

        // Physics integration - slight downward gravity with initial velocity
        rigid_body2d(RigidKind.Dynamic, 0, 0.8, [0, -1.0]), // Slight downward gravity

        // Blood particle physics and behavior
        particle(ParticleType.Flame, 0.8, [0.1, 0.1], 0.4), // spread, finalScale, fadeOut

        // No collision or damage - blood particles are purely visual

        lifespan(1), // Short lifespan for visible blood effect
    ];
}

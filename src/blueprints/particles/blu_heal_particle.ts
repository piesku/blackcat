import {Tile} from "../../../sprites/spritesheet.js";
import {animate_sprite, AnimationId} from "../../components/com_animate_sprite.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {particle} from "../../components/com_particle.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";

export function blueprint_heal_particle() {
    return [
        DEBUG && label("heal particle"),

        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d(),
        render2d(Tile.Heal1),
        animate_sprite({
            [AnimationId.Run]: {
                [Tile.Heal1]: 0.3,
                [Tile.Heal2]: 1,
            },
        }),

        // Physics integration - gentle upward float
        rigid_body2d(RigidKind.Dynamic, 0, 0.95, [0, 2.0]), // Gentle upward drift (healing energy rises)

        // Healing particle physics and behavior
        particle(0.5), // spread

        // No collision or damage - healing particles are purely visual

        lifespan(1),
    ];
}

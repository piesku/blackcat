import {Tile} from "../../../sprites/spritesheet.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {particle, ParticleType} from "../../components/com_particle.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";

export function blueprint_shell_casing() {
    return [
        label("shell casing"),

        // NO spatial_node2d() - enables fast path for particles!
        local_transform2d([0, 0], 0, [0.08, 0.08]), // Small shell casings
        render2d(Tile.Body), // Small metallic shell sprite

        // Physics integration via RigidBody2D - shells fall with gravity
        rigid_body2d(RigidKind.Dynamic, 0, 0.7, [0, -8.0]), // Strong downward gravity for realistic shell drop

        // Shell casing particle physics and behavior
        particle(ParticleType.Debris, {
            spread: 0.2, // Moderate spread for realistic ejection
            fadeOut: 1.0, // Moderate fade out
        }),

        lifespan(3), // Short lifespan - shells disappear after bouncing
    ];
}

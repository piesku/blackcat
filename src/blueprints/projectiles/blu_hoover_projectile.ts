import {Tile} from "../../../sprites/spritesheet.js";
import {collide2d} from "../../components/com_collide2d.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_timed} from "../../components/com_spawn.js";
import {Layer} from "../../game.js";
import {blueprint_hoover_particle} from "../particles/blu_hoover_particle.js";

export function blueprint_hoover_projectile() {
    return [
        label("hoover crack projectile"),
        spatial_node2d(),
        local_transform2d(undefined, 0, [0.3, 0.3]), // Medium-sized spinning emitter
        render2d(Tile.Rifle), // Using rifle sprite for the spinning emitter
        collide2d(false, Layer.Projectile, Layer.Terrain, 0.1), // Doesn't deal direct damage, just spawns particles
        rigid_body2d(RigidKind.Dynamic, 0, 0.8, [0, 0]), // Friction to slow down over time

        // Spawner for continuous spinning particle emission
        spawn_timed(
            () => blueprint_hoover_particle(1), // damage=1 per particle
            1 / 16, // interval: spawn every 1/16 seconds (16 particles per second)
            Math.PI * 2, // spread: Full circle spread for spinning effect
            2.0, // speedMin: Medium speed for spinning particles
            4.0, // speedMax: Faster particles for dynamic spinning
            Infinity,
        ),

        lifespan(6), // Emitter persists for 6 seconds total
    ];
}

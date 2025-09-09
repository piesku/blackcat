import {label} from "../components/com_label.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {spawn_count} from "../components/com_spawn.js";
import {blueprint_blood_particle} from "./particles/blu_blood_particle.js";

export function blueprint_blood_spawner() {
    return [
        label("blood_spawner"),
        spatial_node2d(),
        local_transform2d(),
        spawn_count(
            blueprint_blood_particle,
            0.05, // Fast interval between spawns for dramatic effect
            Math.PI, // Wide spread angle for chaotic blood splatter (full 180 degrees)
            2.0, // Min speed for visible splatter
            4.0, // Max speed for dramatic effect
        ),
    ];
}

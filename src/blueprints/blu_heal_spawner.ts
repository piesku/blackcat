import {label} from "../components/com_label.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {spawn_count} from "../components/com_spawn.js";
import {blueprint_heal_particle} from "./particles/blu_heal_particle.js";

export function blueprint_heal_spawner() {
    return [
        label("heal_spawner"),
        spatial_node2d(),
        local_transform2d([0, 0], 90, [1, 1]), // 90 degrees = upward direction
        spawn_count(
            () => blueprint_heal_particle(),
            0.1, // Interval between spawns (fast for smooth effect)
            Math.PI / 3, // Spread angle for particles
            1.0, // Min speed
            2.5, // Max speed
            0, // Start inactive (healing system will activate)
        ),
    ];
}

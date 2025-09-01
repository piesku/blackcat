import {label} from "../components/com_label.js";
import {lifespan} from "../components/com_lifespan.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {spawn_count} from "../components/com_spawn.js";
import {blueprint_chiquita_banana_simple} from "./projectiles/blu_chiquita_banana_simple.js";

export function blueprint_chiquita_banana_spawner(position: [number, number]) {
    return [
        label("chiquita_banana_spawner"),

        spatial_node2d(),
        local_transform2d(position, 0, [1, 1]),

        // Spawner for banana sub-bombs - immediately active
        spawn_count(
            blueprint_chiquita_banana_simple,
            0, // interval: spawn all bananas almost at once
            Math.PI * 2, // spread: full circle (360 degrees)
            5, // speedMin: banana launch speed
            7, // speedMax: banana launch speed
            5, // initialCount
        ),

        // Self-destruct after spawning bananas
        lifespan(0.1), // Very short lifespan - just long enough to spawn
    ];
}

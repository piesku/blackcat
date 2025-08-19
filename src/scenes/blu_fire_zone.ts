import {fire_zone} from "../components/com_fire_zone.js";
import {lifespan} from "../components/com_lifespan.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {render2d} from "../components/com_render2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {Game} from "../game.js";

export function blueprint_fire_zone(
    game: Game,
    damage: number = 1,
    radius: number = 1.5,
    duration: number = 3.0,
    source: number = -1,
) {
    return [
        spatial_node2d(),
        local_transform2d([0, 0], 0, [radius * 2, radius * 2]), // Scale to show fire area
        render2d("20"), // Using sprite 20 for fire effect
        fire_zone(damage, radius, 0.5, source), // Damage every 0.5 seconds
        lifespan(duration), // Fire zone lasts for specified duration
    ];
}

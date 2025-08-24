import {Tile} from "../../sprites/spritesheet.js";
import {collide2d} from "../components/com_collide2d.js";
import {DamageType, deal_damage} from "../components/com_deal_damage.js";
import {lifespan} from "../components/com_lifespan.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {render2d} from "../components/com_render2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {Game, Layer} from "../game.js";

export function blueprint_fire_zone(
    game: Game,
    damage: number = 1,
    radius: number = 1.5,
    duration: number = 3.0,
) {
    return [
        spatial_node2d(),
        local_transform2d([0, 0], 0, [radius, radius]), // Scale to show fire area
        render2d(Tile.Body), // Using first sprite

        // Fire zone collision detection with large radius
        collide2d(true, Layer.Object, Layer.Player, radius),

        // Fire zone damage - continuous area effect
        deal_damage(damage, DamageType.Fire, {
            cooldown: 0.5, // Fire damage every 0.5 seconds
            shake_duration: 0.1,
            destroy_on_hit: false, // Fire zones don't destroy on hit
        }),

        lifespan(duration), // Fire zone lasts for specified duration
    ];
}

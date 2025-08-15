import {ai_fighter} from "../components/com_ai_fighter.js";
import {animate_sprite} from "../components/com_animate_sprite.js";
import {collide2d} from "../components/com_collide2d.js";
import {disable} from "../components/com_disable.js";
import {health} from "../components/com_health.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {move2d} from "../components/com_move2d.js";
import {render2d} from "../components/com_render2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {Game, Layer} from "../game.js";
import {Has} from "../world.js";

export function blueprint_fighter(game: Game, is_player: boolean) {
    return [
        spatial_node2d(),
        local_transform2d(undefined, 0, [1.5, 1.5]),
        collide2d(true, Layer.Object, Layer.Terrain | Layer.Object, [1.5, 1.5]),
        render2d(is_player ? "6" : "7"), // Different sprites for player vs opponent
        animate_sprite({6: 0.4, 7: 0.4}),
        disable(Has.AnimateSprite),
        health(3), // 3 HP for each fighter
        move2d(2, 0), // Movement controlled by AI (2 units/sec, no rotation)
        ai_fighter(-1), // AI will find target automatically
    ];
}

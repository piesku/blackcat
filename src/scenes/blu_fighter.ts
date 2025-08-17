import {ai_fighter} from "../components/com_ai_fighter.js";
import {animate_sprite} from "../components/com_animate_sprite.js";
import {callback} from "../components/com_callback.js";
import {children} from "../components/com_children.js";
import {collide2d} from "../components/com_collide2d.js";
import {health} from "../components/com_health.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {move2d} from "../components/com_move2d.js";
import {render2d} from "../components/com_render2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {Game, Layer} from "../game.js";
import {apply_upgrades} from "../upgrades/manager.js";

export function blueprint_fighter(game: Game, is_player: boolean) {
    return [
        spatial_node2d(),
        local_transform2d(undefined, 0, [1, 1]),
        collide2d(true, Layer.Object, Layer.Terrain | Layer.Object, [1, 1]),
        render2d("13"),
        animate_sprite({13: Math.random(), 14: Math.random()}),
        health(25), // Increased from 15 to 25 for longer, more interesting battles
        move2d(2, 0), // Movement controlled by AI (2 units/sec, no rotation)
        ai_fighter(-1, is_player), // AI will find target automatically
        children(), // Weapons will be added by apply_upgrades

        // Apply upgrades after entity creation using callback component
        callback((game: Game, entity: number) => {
            let gameUpgrades = is_player ? game.State.playerUpgrades : game.State.opponentUpgrades;
            apply_upgrades(game, entity, gameUpgrades);
        }),
    ];
}

import {blueprint_healthbar} from "../blueprints/blu_healthbar.js";
import {ai_fighter} from "../components/com_ai_fighter.js";
import {animate_sprite} from "../components/com_animate_sprite.js";
import {callback} from "../components/com_callback.js";
import {children} from "../components/com_children.js";
import {collide2d} from "../components/com_collide2d.js";
import {DamageType, deal_damage} from "../components/com_deal_damage.js";
import {health} from "../components/com_health.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {move2d} from "../components/com_move2d.js";
import {render2d} from "../components/com_render2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {Game, Layer} from "../game.js";

export function blueprint_fighter(game: Game, is_player: boolean) {
    // Calculate health based on arena level: base 2 + 2 per arena level
    let baseHealth = 2;
    let arenaLevelBonus = (game.State.currentLevel - 1) * 2; // Level 1 = base health, Level 2 = +2, etc.
    let totalHealth = baseHealth + arenaLevelBonus;

    return [
        spatial_node2d(),
        local_transform2d(undefined, 0, [1, 1]),
        collide2d(true, Layer.Player, Layer.Terrain | Layer.Player, 0.5),
        render2d("13"),
        animate_sprite({13: Math.random(), 14: Math.random()}),
        health(totalHealth),
        move2d(4, 0),
        ai_fighter(-1, is_player), // AI will find target automatically
        children(blueprint_healthbar()), // Add healthbar, weapons will be added by apply_upgrades

        // Fighter-vs-fighter collision damage (low damage, long cooldown)
        callback((game: Game, entity: number) => {
            deal_damage(0.5, entity, DamageType.Hand2Hand, {
                cooldown: 2.0,
                shake_duration: 0.4,
                destroy_on_hit: false, // Fighters don't destroy themselves on collision
            })(game, entity);
        }),
    ];
}

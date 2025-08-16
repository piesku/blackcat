import {ai_fighter} from "../components/com_ai_fighter.js";
import {animate_sprite} from "../components/com_animate_sprite.js";
import {children} from "../components/com_children.js";
import {collide2d} from "../components/com_collide2d.js";
import {health} from "../components/com_health.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {move2d} from "../components/com_move2d.js";
import {render2d} from "../components/com_render2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {upgrade_inventory, UpgradeType} from "../components/com_upgrade_inventory.js";
import {Game, Layer} from "../game.js";
import {blueprint_battle_axe} from "./weapons/blu_battle_axe.js";
import {blueprint_baseball_bat} from "./weapons/blu_baseball_bat.js";
import {blueprint_pistol} from "./weapons/blu_pistol.js";
import {blueprint_shotgun} from "./weapons/blu_shotgun.js";
import {blueprint_sniper_rifle} from "./weapons/blu_sniper_rifle.js";
import {blueprint_throwing_knives} from "./weapons/blu_throwing_knives.js";

export function blueprint_fighter(game: Game, is_player: boolean) {
    if (is_player) {
        // Player loadout: balanced melee + ranged mix
        let weapons: UpgradeType[] = ["battle_axe", "pistol", "throwing_knives"];
        return [
            spatial_node2d(),
            local_transform2d(undefined, 0, [1, 1]),
            collide2d(true, Layer.Object, Layer.Terrain | Layer.Object, [1, 1]),
            render2d("13"),
            animate_sprite({13: Math.random(), 14: Math.random()}),
            health(15),
            move2d(2, 0), // Movement controlled by AI (2 units/sec, no rotation)
            ai_fighter(-1), // AI will find target automatically
            upgrade_inventory(weapons),
            children(
                blueprint_battle_axe(game),
                blueprint_pistol(game),
                blueprint_throwing_knives(game)
            )
        ];
    } else {
        // Opponent loadout: heavy weapons specialist
        let weapons: UpgradeType[] = ["baseball_bat", "shotgun", "sniper_rifle"];
        return [
            spatial_node2d(),
            local_transform2d(undefined, 0, [1, 1]),
            collide2d(true, Layer.Object, Layer.Terrain | Layer.Object, [1, 1]),
            render2d("13"),
            animate_sprite({13: Math.random(), 14: Math.random()}),
            health(15),
            move2d(2, 0), // Movement controlled by AI (2 units/sec, no rotation)
            ai_fighter(-1), // AI will find target automatically
            upgrade_inventory(weapons),
            children(
                blueprint_baseball_bat(game),
                blueprint_shotgun(game),
                blueprint_sniper_rifle(game)
            )
        ];
    }
}

import {ai_fighter} from "../components/com_ai_fighter.js";
import {animate_sprite} from "../components/com_animate_sprite.js";
import {children} from "../components/com_children.js";
import {collide2d} from "../components/com_collide2d.js";
import {health} from "../components/com_health.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {move2d} from "../components/com_move2d.js";
import {render2d} from "../components/com_render2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {Game, Layer} from "../game.js";
import {UpgradeType} from "../upgrades/types.js";
import {blueprint_baseball_bat} from "./weapons/blu_baseball_bat.js";
import {blueprint_battle_axe} from "./weapons/blu_battle_axe.js";
import {blueprint_pistol} from "./weapons/blu_pistol.js";
import {blueprint_shotgun} from "./weapons/blu_shotgun.js";
import {blueprint_sniper_rifle} from "./weapons/blu_sniper_rifle.js";
import {blueprint_throwing_knives} from "./weapons/blu_throwing_knives.js";

// Map upgrade IDs to weapon blueprints
function getWeaponBlueprint(game: Game, upgradeId: string) {
    switch (upgradeId) {
        case "battle_axe":
            return blueprint_battle_axe(game);
        case "baseball_bat":
            return blueprint_baseball_bat(game);
        case "pistol":
            return blueprint_pistol(game);
        case "shotgun":
            return blueprint_shotgun(game);
        case "sniper_rifle":
            return blueprint_sniper_rifle(game);
        case "throwing_knives":
            return blueprint_throwing_knives(game);
        default:
            return blueprint_battle_axe(game); // fallback
    }
}

export function blueprint_fighter(game: Game, is_player: boolean) {
    let gameUpgrades: UpgradeType[];

    if (is_player) {
        // Use player upgrades from persistent game state
        gameUpgrades = game.State.playerUpgrades;
    } else {
        // Use opponent upgrades from game state
        gameUpgrades = game.State.opponentUpgrades;
    }

    // Generate weapon blueprints from upgrade IDs
    let weaponBlueprints = gameUpgrades.map((upgrade) => getWeaponBlueprint(game, upgrade.id));

    return [
        spatial_node2d(),
        local_transform2d(undefined, 0, [1, 1]),
        collide2d(true, Layer.Object, Layer.Terrain | Layer.Object, [1, 1]),
        render2d("13"),
        animate_sprite({13: Math.random(), 14: Math.random()}),
        health(15),
        move2d(2, 0), // Movement controlled by AI (2 units/sec, no rotation)
        ai_fighter(-1), // AI will find target automatically
        children(...weaponBlueprints),
    ];
}

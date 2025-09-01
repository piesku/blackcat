import {Vec4} from "../../lib/math.js";
import {element} from "../../lib/random.js";
import {Tile} from "../../sprites/spritesheet.js";
import {blueprint_healthbar} from "../blueprints/blu_healthbar.js";
import {control_ai} from "../components/com_control_ai.js";
import {aim} from "../components/com_aim.js";
import {children} from "../components/com_children.js";
import {collide2d} from "../components/com_collide2d.js";
import {DamageType, deal_damage} from "../components/com_deal_damage.js";
import {health} from "../components/com_health.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {move2d} from "../components/com_move2d.js";
import {render2d} from "../components/com_render2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {Game, Layer} from "../game.js";

const skin_colors: Vec4[] = [
    [1.0, 0.8, 0.66, 1],
    [1.0, 0.8, 0.66, 1],
    [1.0, 0.8, 0.66, 1],
    [0.33, 0.25, 0.2, 1],
    [0.26, 0.19, 0.15, 1],
];

export function blueprint_eyes(_game: Game, color: Vec4 = [0, 0, 0, 1]) {
    return [spatial_node2d(), local_transform2d(undefined, 0, [1, 1]), render2d(Tile.Eyes, color)];
}

export function blueprint_body(game: Game, skin_color: Vec4) {
    return [
        spatial_node2d(),
        local_transform2d(),
        render2d(Tile.Body, skin_color),
        children(blueprint_eyes(game)),
    ];
}

export function blueprint_fighter(game: Game, is_player: boolean) {
    // Calculate health based on arena level: base 10 + 10 per duel completed
    let baseHealth = 10;
    let arenaLevelBonus = (game.State.currentLevel - 1) * 10; // Level 1 = base health, Level 2 = +10, etc.
    let totalHealth = baseHealth + arenaLevelBonus;

    return [
        spatial_node2d(),
        local_transform2d(),
        collide2d(true, Layer.Player, Layer.Terrain | Layer.Player, 0.5),
        // animate_sprite({[Tile.Body]: Math.random()}),
        health(totalHealth),
        move2d(4, 0),
        aim(0.1), // Target search every 0.1 seconds
        control_ai(is_player), // AI will find target automatically via Aim component
        children(
            blueprint_body(game, element(skin_colors)), // Body sprite as child (includes eyes)
            blueprint_healthbar(),
            // Weapons will be added by apply_upgrades
        ),

        // Fighter-vs-fighter collision damage (low damage, long cooldown)
        deal_damage(0.5, DamageType.Hand2Hand, {
            cooldown: 2.0,
            shake_duration: 0.4,
            destroy_on_hit: false, // Fighters don't destroy themselves on collision
        }),
    ];
}

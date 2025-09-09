import {Vec4} from "../../lib/math.js";
import {element} from "../../lib/random.js";
import {Tile} from "../../sprites/spritesheet.js";

import {aim} from "../components/com_aim.js";
import {children} from "../components/com_children.js";
import {collide2d} from "../components/com_collide2d.js";
import {control_ai} from "../components/com_control_ai.js";
import {deal_damage} from "../components/com_deal_damage.js";
import {health} from "../components/com_health.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {move2d} from "../components/com_move2d.js";
import {render2d} from "../components/com_render2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {Game, Layer} from "../game.js";
import {blueprint_blood_spawner} from "./blu_blood_spawner.js";

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
    // Calculate health based on arena level: base 2 + 2 per duel completed
    let baseHealth = 2;
    let arenaLevelBonus = (game.State.currentLevel - 1) * 2; // Level 1 = base health, Level 2 = +2, etc.
    let totalHealth = baseHealth + arenaLevelBonus;

    let base_speed = 4;

    return [
        spatial_node2d(),
        local_transform2d(),

        control_ai(is_player, base_speed),

        collide2d(true, Layer.Player, Layer.Terrain | Layer.Player, 0.5),
        // animate_sprite({[Tile.Body]: Math.random()}),
        health(totalHealth),
        move2d(base_speed, 0),
        aim(0.1), // Target search every 0.1 seconds
        children(
            blueprint_body(game, element(skin_colors)), // Body sprite as child (includes eyes)
            blueprint_blood_spawner(), // Blood splatter spawner for damage effects
            // Weapons will be added by apply_upgrades
        ),

        // Fighter-vs-fighter collision damage (low damage, long cooldown)
        deal_damage(0.5, {
            cooldown: 2.0,
            shake_duration: 0.4,
            destroy_on_hit: false, // Fighters don't destroy themselves on collision
        }),
    ];
}

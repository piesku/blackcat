import {Vec4} from "../../lib/math.js";
import {Tile} from "../../sprites/spritesheet.js";

import {aim} from "../components/com_aim.js";
import {animate_sprite, Animation} from "../components/com_animate_sprite.js";
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

// Team colors: blue for player, red for opponent
export const PLAYER_TEAM_COLOR: Vec4 = [0.2, 0.4, 0.8, 1]; // Blue
export const OPPONENT_TEAM_COLOR: Vec4 = [0.8, 0.2, 0.2, 1]; // Red

export function blueprint_body(game: Game, is_player: boolean) {
    let team_color = is_player ? PLAYER_TEAM_COLOR : OPPONENT_TEAM_COLOR;
    return [
        spatial_node2d(),
        local_transform2d(),
        render2d(Tile.Run1, team_color),
        animate_sprite(
            {
                [Animation.Run]: {
                    [Tile.Run1]: 0.1,
                    [Tile.Run2]: 0.1,
                    [Tile.Run3]: 0.1,
                    [Tile.Run4]: 0.1,
                    [Tile.Run5]: 0.1,
                    [Tile.Run6]: 0.1,
                    [Tile.Run7]: 0.1,
                    [Tile.Run8]: 0.1,
                },
                [Animation.Hurt]: {
                    [Tile.Hurt1]: 0.1,
                    [Tile.Hurt2]: 0.1,
                    [Tile.Hurt3]: 0.1,
                    [Tile.Hurt4]: 0.1,
                },
                [Animation.Die]: {
                    [Tile.Die1]: 0.3,
                    [Tile.Die2]: 0.4,
                },
            },
            Animation.Run,
        ),
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
        health(totalHealth),
        move2d(base_speed, 0),
        aim(0.1), // Target search every 0.1 seconds
        children(
            blueprint_body(game, is_player), // Body sprite as child (includes eyes)
            blueprint_blood_spawner(), // Blood splatter spawner for damage effects
            // Weapons will be added by apply_upgrades
        ),

        // Fighter-vs-fighter collision damage (low damage, long cooldown)
        deal_damage(0.5, 1.0),
    ];
}

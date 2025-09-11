import {spawn_timed} from "../../components/com_spawn.js";
import {Game} from "../../game.js";
import {blueprint_shadow_particle} from "../particles/blu_shadow_particle.js";
import {blueprint_cat_base} from "./blu_cat_base.js";

// Mr. Gray - Shadow Assassin: High speed + damaging shadow trail
export function blueprint_mr_gray(game: Game, owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            game,
            owner_is_player,
            [0.5, 0.5, 0.5, 1], // gray eye color
            2, // hp (decreased from 3)
            3.2, // move_speed (increased from 2.5)
            1.8, // aggressiveness (increased from 1.5)
            0.2, // patience (decreased from 1.0)
        ),
        // Add shadow trail spawning when moving
        spawn_timed(
            () => blueprint_shadow_particle(),
            0.2, // interval: spawn shadow particles frequently
            0, // spread: no spread, trail behind
            0, // speedMin: stationary particles
            0, // speedMax: stationary particles
            10.0, // initialDuration: active for 10 seconds initially
        ),
        // TODO: Integrate shadow trail with movement system
    ];
}

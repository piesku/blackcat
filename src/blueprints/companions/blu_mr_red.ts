import {Game} from "../../game.js";
import {blueprint_cat_base} from "./blu_cat_base.js";

// Mr. Red - Suicide Bomber: Dies in one hit, explodes on death
export function blueprint_mr_red(game: Game, owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            game,
            owner_is_player,
            [0.8, 0.2, 0.2, 1], // red eye color
            1, // hp (dies in one hit to anything)
            2.5, // move_speed (increased from 2.0)
            1.8, // aggressiveness
            0.5, // patience
        ),
        // TODO: Add destroy_on_hit: true + explosion spawn on death
    ];
}

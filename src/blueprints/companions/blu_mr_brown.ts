import {aim} from "../../components/com_aim.js";
import {Game} from "../../game.js";
import {blueprint_cat_base, cat_colors} from "./blu_cat_base.js";

// Mr. Brown - Loyal Bodyguard: Ultra-low aggression, protects allies
export function blueprint_mr_brown(game: Game, owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            game,
            owner_is_player,
            cat_colors.brown, // color
            4, // hp (increased from 3)
            1.5, // move_speed (decreased from 1.8)
            0.1, // aggressiveness (decreased from 0.3)
            3.0, // patience (increased from 2.5)
        ),
        aim(0.8), // Slow targeting - protection focused - overwrites base aim
        // TODO: Add damage redirection/bodyguard component
    ];
}

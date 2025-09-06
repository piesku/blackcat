import {element} from "../../../lib/random.js";
import {spawn_timed} from "../../components/com_spawn.js";
import {Game} from "../../game.js";
import {blueprint_cat_base, cat_colors} from "./blu_cat_base.js";
import {blueprint_mr_orange} from "./blu_mr_orange.js";
import {blueprint_mr_pink} from "./blu_mr_pink.js";
import {blueprint_mr_white} from "./blu_mr_white.js";
import {blueprint_mr_brown} from "./blu_mr_brown.js";
import {blueprint_mr_blue} from "./blu_mr_blue.js";
import {blueprint_mr_gray} from "./blu_mr_gray.js";
import {blueprint_mr_red} from "./blu_mr_red.js";

// Random cat spawner function for Mr. Black
function random_cat_blueprint(game: Game, owner_is_player: boolean) {
    const cat_blueprints = [
        blueprint_mr_orange,
        blueprint_mr_pink,
        blueprint_mr_white,
        blueprint_mr_brown,
        blueprint_mr_blue,
        blueprint_mr_gray,
        blueprint_mr_red,
    ];

    return element(cat_blueprints)(game, owner_is_player);
}

// Mr. Black - Cat Summoner: Spawns random companion cats periodically
export function blueprint_mr_black(game: Game, owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            game,
            owner_is_player,
            cat_colors.black, // color
            6, // hp
            2.8, // move_speed
            1.8, // aggressiveness
            1.5, // patience
        ),
        // Spawn random cats every 8 seconds
        spawn_timed(
            () => random_cat_blueprint(game, owner_is_player),
            8.0, // interval: 8 seconds between spawns
            Math.PI * 2, // spread: full circle
            0.5, // speedMin
            1.0, // speedMax
            Infinity, // initialDuration: start spawning immediately
        ),
    ];
}

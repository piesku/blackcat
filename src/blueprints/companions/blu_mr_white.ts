import {aim} from "../../components/com_aim.js";
import {children} from "../../components/com_children.js";
import {Game} from "../../game.js";
import {blueprint_shotgun} from "../weapons/blu_shotgun.js";
import {blueprint_cat_base} from "./blu_cat_base.js";

// Mr. White - Defensive Tank: High HP, slow speed, shotgun
export function blueprint_mr_white(game: Game, owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            game,
            owner_is_player,
            [0.9, 0.9, 0.9, 1], // color
            7, // hp (increased from 5)
            1.3, // move_speed (decreased from 1.5)
            0.5, // aggressiveness
            2.5, // patience (increased from 2.0)
        ),
        children(blueprint_shotgun()),
        aim(0.15), // Slightly slower targeting for defensive play - overwrites base aim
    ];
}

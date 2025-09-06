import {aim} from "../../components/com_aim.js";
import {children} from "../../components/com_children.js";
import {Game} from "../../game.js";
import {blueprint_mortar} from "../weapons/blu_mortar.js";
import {blueprint_cat_base, cat_colors} from "./blu_cat_base.js";

// Mr. Blue - Mortar Artillery: Glass cannon with explosive area damage
export function blueprint_mr_blue(game: Game, owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            game,
            owner_is_player,
            cat_colors.blue, // color
            2, // hp (decreased from 4 - glass cannon)
            2.8, // move_speed (increased from 2.2)
            2.0, // aggressiveness (increased from 1.0)
            0.1, // patience (decreased from 1.0)
        ),
        children(blueprint_mortar()),
        aim(0.03), // Fastest targeting for rapid artillery fire - overwrites base aim
    ];
}

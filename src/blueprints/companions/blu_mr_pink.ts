import {aim} from "../../components/com_aim.js";
import {children} from "../../components/com_children.js";
import {Game} from "../../game.js";
import {blueprint_boomerang_weapon} from "../weapons/blu_boomerang_weapon.js";
import {blueprint_cat_base} from "./blu_cat_base.js";

// Mr. Pink - Boomerang Marksman: Ranged combat with return damage
export function blueprint_mr_pink(game: Game, owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            game,
            owner_is_player,
            [1.0, 0.7, 0.8, 1], // pink eye color
            3, // hp
            1.8, // move_speed (decreased from 2.0)
            0.8, // aggressiveness (decreased from 1.2)
            2.0, // patience (increased from 1.0)
        ),
        children(blueprint_boomerang_weapon()),
        aim(0.3), // Slow careful aiming - overwrites base aim
    ];
}

import {aim} from "../../components/com_aim.js";
import {blueprint_cat_base} from "./blu_cat_base.js";

// Mr. Orange - Whirlwind Barbarian: Ultra-fast retargeting and movement
export function blueprint_mr_orange(owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            owner_is_player,
            3, // hp
            4.2, // move_speed
            2.5, // aggressiveness
            0.1, // patience
        ),
        aim(0.02), // Lightning-fast retargeting - overwrites base aim
    ];
}

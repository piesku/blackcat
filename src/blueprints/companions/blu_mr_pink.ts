import {aim} from "../../components/com_aim.js";
import {children} from "../../components/com_children.js";
import {blueprint_homing_missile_weapon} from "../weapons/blu_homing_missile_weapon.js";
import {blueprint_cat_base} from "./blu_cat_base.js";

// Mr. Pink - Homing Missile Specialist: Ranged combat with seeking missiles
export function blueprint_mr_pink(owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            owner_is_player,
            3, // hp
            1.8, // move_speed (decreased from 2.0)
            0.8, // aggressiveness (decreased from 1.2)
            2.0, // patience (increased from 1.0)
        ),
        children(blueprint_homing_missile_weapon()),
        aim(0.3, owner_is_player), // Slow careful aiming - overwrites base aim
    ];
}

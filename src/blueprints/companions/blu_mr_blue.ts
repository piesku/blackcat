import {aim} from "../../components/com_aim.js";
import {children} from "../../components/com_children.js";
import {blueprint_explosives} from "../weapons/blu_explosives.js";
import {blueprint_cat_base} from "./blu_cat_base.js";

// Mr. Blue - Explosive Artillery: Glass cannon with dynamite area damage
export function blueprint_mr_blue(owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            owner_is_player,
            2, // hp (decreased from 4 - glass cannon)
            2.8, // move_speed (increased from 2.2)
            2.0, // aggressiveness (increased from 1.0)
            0.1, // patience (decreased from 1.0)
        ),
        children(blueprint_explosives()),
        aim(0.03, owner_is_player), // Fastest targeting for rapid artillery fire - overwrites base aim
    ];
}

import {Action} from "../../actions.js";
import {deal_damage} from "../../components/com_deal_damage.js";
import {lifespan} from "../../components/com_lifespan.js";
import {blueprint_cat_base} from "./blu_cat_base.js";

// Mr. Red - Suicide Bomber: Dies in one hit, explodes on death
export function blueprint_mr_red(owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            owner_is_player,
            1, // hp (dies in one hit to anything)
            2.5, // move_speed (increased from 2.0)
            2, // aggressiveness
            0.1, // patience
        ),
        deal_damage(5, 0),
        lifespan(10, Action.ExplodeArea),
    ];
}

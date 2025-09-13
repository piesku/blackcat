import {Tile} from "../../../sprites/spritesheet.js";
import {aim} from "../../components/com_aim.js";
import {collide2d} from "../../components/com_collide2d.js";
import {control_always2d} from "../../components/com_control_always2d.js";
import {deal_damage} from "../../components/com_deal_damage.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {move2d} from "../../components/com_move2d.js";
import {render2d} from "../../components/com_render2d.js";
import {Layer} from "../../game.js";

const HOMING_MISSILE_SPEED = 5;
const HOMING_MISSILE_LIFESPAN = 8; // 8 seconds flight time

// Homing missile that seeks the nearest enemy
export function blueprint_homing_missile() {
    return [
        label("homing_missile"),

        local_transform2d(),
        render2d(Tile.Rocket),

        aim(0.1), // Update target every 0.1 seconds
        control_always2d(null, 0), // Direction will be set by aim system
        move2d(HOMING_MISSILE_SPEED, 0),

        collide2d(Layer.Projectile, Layer.Player | Layer.Terrain, 0.15),

        lifespan(HOMING_MISSILE_LIFESPAN),

        // Damage on impact
        deal_damage(2, 1.0), // 2 damage, 1s cooldown
    ];
}

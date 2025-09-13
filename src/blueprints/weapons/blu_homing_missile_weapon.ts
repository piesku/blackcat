import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {weapon_ranged} from "../../components/com_weapon.js";

export function blueprint_homing_missile_weapon() {
    return [
        label("homing_missile_launcher"), // Name for identification

        spatial_node2d(),
        local_transform2d(),
        weapon_ranged(
            8, // range: long range for missile launcher
            3.0, // cooldown: slower rate of fire for powerful homing missiles
            1, // totalAmount: 1 missile per shot
        ),
    ];
}

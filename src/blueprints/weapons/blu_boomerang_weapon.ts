import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {weapon_ranged} from "../../components/com_weapon.js";

export function blueprint_boomerang_weapon() {
    return [
        label("boomerang"), // Name for identification

        spatial_node2d(),
        local_transform2d(),
        weapon_ranged(
            6, // range: medium range for throwing
            2.5, // cooldown: moderate rate of fire for precision throwing
            1, // totalAmount: 1 boomerang per shot (not used for direct instantiation)
        ),
    ];
}

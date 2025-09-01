import {draw_arc} from "../components/com_draw.js";
import {label} from "../components/com_label.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";

/**
 * Aiming reticle - small circle that shows where the player is aiming
 */
export function blueprint_reticle() {
    return [
        spatial_node2d(),
        local_transform2d(),
        draw_arc("rgba(255, 0, 0, 0.5)", 0.1), // Semi-transparent red circle
        label("reticle"),
    ];
}

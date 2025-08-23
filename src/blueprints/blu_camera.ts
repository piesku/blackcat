import {camera2d} from "../components/com_camera2d.js";
import {children} from "../components/com_children.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {Game} from "../game.js";

export function blueprint_camera(_game: Game) {
    // Return parent entity with camera as child
    // This allows shaking the parent without affecting the camera's world position
    return [
        spatial_node2d(),
        local_transform2d(),
        children([spatial_node2d(), local_transform2d(), camera2d([0, 0])]),
    ];
}

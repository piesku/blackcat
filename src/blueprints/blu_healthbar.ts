import {Blueprint} from "../../lib/game.js";
import {draw_rect} from "../components/com_draw.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {Game} from "../game.js";

export function blueprint_healthbar(): Blueprint<Game> {
    return [local_transform2d([0, 0.7], 0), spatial_node2d(), draw_rect("#00ff00", 1, 0.1)];
}

import {Tile} from "../../../sprites/spritesheet.js";
import {Action} from "../../actions.js";
import {collide2d} from "../../components/com_collide2d.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";
import {Layer} from "../../game.js";

export function blueprint_explosive_bomb() {
    return [
        label("explosive bomb"),
        local_transform2d(undefined, 0, [0.3, 0.3]), // Medium-sized bomb
        render2d(Tile.Die1), // Bomb sprite - using Body for now
        collide2d(true, Layer.Projectile, Layer.Player | Layer.Terrain, 0.1),
        rigid_body2d(RigidKind.Dynamic, 0, 0.5, [0, -2]), // Light gravity, slight arc

        // Timeout explosion - bomb explodes after 2 seconds
        lifespan(2.0, Action.ExplodeArea),
    ];
}

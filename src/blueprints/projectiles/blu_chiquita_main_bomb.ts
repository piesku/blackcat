import {Tile} from "../../../sprites/spritesheet.js";
import {Action} from "../../actions.js";
import {collide2d} from "../../components/com_collide2d.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";
import {Layer} from "../../game.js";

export function blueprint_chiquita_main_bomb() {
    return [
        label("chiquita_main_bomb"),
        local_transform2d(undefined, 0, [0.3, 0.3]), // Medium-sized bomb
        render2d(Tile.Die1), // Main bomb sprite
        collide2d(true, Layer.Projectile, Layer.Player | Layer.Terrain, 0.1),
        rigid_body2d(RigidKind.Dynamic, 0, 0.5, [0, -2]), // Light gravity, slight arc

        // Timeout explosion - main bomb explodes after 2 seconds into bananas
        lifespan(2.0, Action.ExplodeBananas),
    ];
}

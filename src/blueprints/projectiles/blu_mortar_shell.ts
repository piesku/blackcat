import {Tile} from "../../../sprites/spritesheet.js";
import {Action} from "../../actions.js";
import {collide2d} from "../../components/com_collide2d.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {Layer} from "../../game.js";

export function blueprint_mortar_shell(lifetime: number) {
    return [
        label("mortar_shell"),
        spatial_node2d(),
        local_transform2d([0, 0], 0, [0.3, 0.3]), // Small grenade
        render2d(Tile.Body), // Using sprite for mortar shell

        // Physics integration via RigidBody2D with gravity
        rigid_body2d(RigidKind.Dynamic, 0.3, 0.01, [0, -9.8]), // Standard gravity for grenades

        // Small collision radius for the mortar shell itself
        collide2d(true, Layer.Object, Layer.Player | Layer.Terrain | Layer.Object, 0.2),

        // Explode after calculated lifetime (simulating hitting the ground)
        lifespan(lifetime, Action.ExplodeArea),
    ];
}

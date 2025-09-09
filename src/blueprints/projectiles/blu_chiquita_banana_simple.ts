import {Tile} from "../../../sprites/spritesheet.js";
import {Action} from "../../actions.js";
import {collide2d} from "../../components/com_collide2d.js";
import {control_always2d} from "../../components/com_control_always2d.js";
import {deal_damage} from "../../components/com_deal_damage.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {move2d} from "../../components/com_move2d.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";
import {Layer} from "../../game.js";

export function blueprint_chiquita_banana_simple() {
    return [
        label("chiquita_banana"),

        local_transform2d([0, 0], 0, [0.2, 0.2]), // Smaller than main bomb
        render2d(Tile.Body), // Banana sprite (using body for now)

        // Physics integration via RigidBody2D
        rigid_body2d(RigidKind.Dynamic, 0.2, 0.1, [0, -2]),

        // Spinning motion
        control_always2d(null, 1),
        move2d(0, 180),

        // Small collision radius for the banana
        collide2d(true, Layer.Object, Layer.Player | Layer.Terrain, 0.15),

        // Damage on impact - bananas explode when they hit something
        deal_damage(3.14, {
            destroy_on_hit: true,
        }),

        // Also explode on timeout like mortar shells - creates explosion area effect
        lifespan(2.0, Action.ExplodeArea),
    ];
}

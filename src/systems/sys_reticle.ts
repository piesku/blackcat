import {vec2_scale} from "../../lib/vec2.js";
import {query_down} from "../components/com_children.js";
import {DrawKind} from "../components/com_draw.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Aim;
const RETICLE_DISTANCE = 1.0; // Distance from fighter to reticle

export function sys_reticle(game: Game) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let aim = game.World.Aim[entity];
            DEBUG: if (!aim) throw new Error("Missing Aim component");

            // Find reticle child entities (draw components with reticle label)
            for (let child of query_down(
                game.World,
                entity,
                Has.LocalTransform2D | Has.Draw | Has.Label,
            )) {
                let child_label = game.World.Label[child];
                let draw = game.World.Draw[child];

                // Only update entities with "reticle" label
                if (child_label.Name === "reticle" && draw.Kind === DrawKind.Arc) {
                    let reticle_transform = game.World.LocalTransform2D[child];
                    if (reticle_transform && aim.TargetEntity !== -1) {
                        // Position reticle in aiming direction
                        vec2_scale(
                            reticle_transform.Translation,
                            aim.DirectionToTarget,
                            RETICLE_DISTANCE,
                        );

                        // Mark as dirty for transform update
                        game.World.Signature[child] |= Has.Dirty;
                    }
                }
            }
        }
    }
}

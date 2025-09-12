/**
 * # sys_render2d_animate
 *
 * Animate sprites (WIP).
 */

import {Entity} from "../../lib/world.js";
import {set_sprite} from "../components/com_render2d.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.AnimateSprite | Has.Render2D;

export function sys_render2d_animate(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            update(game, i, delta);
        }
    }
}

function update(game: Game, entity: Entity, delta: number) {
    let animate = game.World.AnimateSprite[entity];
    let sequence = animate.Sequences[animate.CurrentSequence];
    if (!sequence) return;

    for (let frame_id in sequence.Frames) {
        let frame_timestamp = sequence.Frames[frame_id];
        if (animate.Time < frame_timestamp) {
            set_sprite(game, entity, Number(frame_id));
            break;
        }
    }

    animate.Time += delta;
    if (animate.Time >= sequence.Duration) {
        animate.Time -= sequence.Duration;
    }
}

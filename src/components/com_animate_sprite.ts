/**
 * # AnimateSprite
 *
 * The `AnimateSprite` component cycles through spritesheet tiles.
 */

import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export interface AnimateSprite {
    Frames: Record<number, number>;
    Duration: number;
    Time: number;
}

export function animate_sprite(frames: Record<number, number>) {
    let duration = 0;
    for (let frame_id in frames) {
        let frame_duration = frames[frame_id];
        duration = frames[frame_id] = duration + frame_duration;
    }

    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.AnimateSprite;
        game.World.AnimateSprite[entity] = {
            Frames: frames,
            Duration: duration,
            Time: 0,
        };
    };
}

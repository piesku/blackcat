/**
 * # AnimateSprite
 *
 * The `AnimateSprite` component cycles through spritesheet tiles.
 */

import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export const enum Animation {
    Run,
    Hurt,
    Die,
}

export interface AnimationSequence {
    Frames: Record<number, number>;
    Duration: number;
}

export interface AnimateSprite {
    Sequences: Record<string, AnimationSequence>;
    CurrentSequence: Animation;
    Time: number;
}

export function animate_sprite(
    sequences: Record<string, Record<number, number>>,
    defaultSequence: Animation = Animation.Run,
) {
    let processedSequences: Record<string, AnimationSequence> = {};

    for (let sequence_name in sequences) {
        let duration = 0;
        let processedFrames: Record<number, number> = {};

        for (let frame_tile in sequences[sequence_name]) {
            let frame_duration = sequences[sequence_name][frame_tile];
            duration += frame_duration;
            processedFrames[frame_tile] = duration;
        }
        processedSequences[sequence_name] = {Frames: processedFrames, Duration: duration};
    }

    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.AnimateSprite;
        game.World.AnimateSprite[entity] = {
            Sequences: processedSequences,
            CurrentSequence: defaultSequence,
            Time: 0,
        };
    };
}

export function set_animation(game: Game, entity: Entity, seq: Animation) {
    let animate = game.World.AnimateSprite[entity];
    DEBUG: if (!animate) throw new Error("missing AnimateSprite component");

    if (animate.Sequences[seq]) {
        animate.CurrentSequence = seq;
        animate.Time = 0; // Reset to start of new sequence
    }
}

/**
 * # sys_shake2d
 *
 * Shake entities randomly.
 */

import {ease_out_quint} from "../../lib/easing.js";
import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.LocalTransform2D | Has.Shake;

export function sys_shake2d(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) == QUERY) {
            update(game, i, delta);
        }
    }
}

function update(game: Game, entity: Entity, delta: number) {
    let shake = game.World.Shake[entity];
    let local = game.World.LocalTransform2D[entity];

    // Count down duration
    shake.Duration -= delta;

    if (shake.Duration <= 0) {
        // Stop shaking by removing the Shake component
        game.World.Signature[entity] &= ~Has.Shake;
        // Reset position to [0, 0]
        local.Translation[0] = 0;
        local.Translation[1] = 0;
    } else if (shake.InitialDuration === Infinity) {
        // Infinite duration shake - constant intensity
        local.Translation[0] = (Math.random() - 0.5) * shake.Radius * 2;
        local.Translation[1] = (Math.random() - 0.5) * shake.Radius * 2;
    } else {
        // Calculate intensity using easing function for smooth fade-out
        let intensity = ease_out_quint(shake.Duration / shake.InitialDuration);
        let effective_radius = shake.Radius * intensity;

        // Continue shaking with eased diminishing intensity
        local.Translation[0] = (Math.random() - 0.5) * effective_radius * 2;
        local.Translation[1] = (Math.random() - 0.5) * effective_radius * 2;
    }

    game.World.Signature[entity] |= Has.Dirty;
}

/**
 * # Shake
 *
 * The `Shake` component allows the entity to change its position randomly every
 * frame.
 *
 * It should only be used on child entities whose position relative to the
 * parent is [0, 0, 0].
 */

import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export interface Shake {
    Radius: number;
    Duration: number;
    InitialDuration: number;
}

/**
 * Add `Shake` to an entity.
 *
 * @param radius The radius of the shake, in local units.
 * @param duration The duration of the shake, in seconds. Defaults to Infinity.
 */
export function shake(radius: number, duration: number = Infinity) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.Shake;
        game.World.Shake[entity] = {
            Radius: radius,
            Duration: duration,
            InitialDuration: duration,
        };
    };
}

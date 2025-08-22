/**
 * # Lifespan
 *
 * The `Lifespan` component allows the entity to autodestruct after a certain
 * time. Upon destruction, the entity can emit an `Action`.
 */

import {Entity} from "../../lib/world.js";
import {Action} from "../actions.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export interface Lifespan {
    Lifetime: number; // Total lifetime in seconds
    Age: number; // Current age in seconds (0 when created)
    Action?: Action;
}

/**
 * Add `Lifespan` to an entity.
 *
 * @param lifetime How long the entity should live (in seconds).
 * @param action Optional action to dispatch when the entity is destroyed.
 */
export function lifespan(lifetime: number, action?: Action) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.Lifespan;
        game.World.Lifespan[entity] = {
            Lifetime: lifetime,
            Age: 0,
            Action: action,
        };
    };
}

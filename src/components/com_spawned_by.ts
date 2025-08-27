/**
 * # SpawnedBy
 *
 * The `SpawnedBy` component tracks which fighter entity is responsible
 * for spawning this entity, used for damage attribution.
 */

import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export interface SpawnedBy {
    Fighter: Entity; // The fighter entity responsible for this entity's damage
}

/**
 * Add `SpawnedBy` to an entity for damage attribution.
 *
 * @param fighter The fighter entity responsible for this entity's actions.
 */
export function spawned_by(fighter: number) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.SpawnedBy;
        game.World.SpawnedBy[entity] = {
            Fighter: fighter,
        };
    };
}

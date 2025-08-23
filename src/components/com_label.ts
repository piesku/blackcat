/**
 * # Label
 *
 * The `Label` component stores labeling information for an entity,
 * including its name and spawner relationship for damage attribution.
 */

import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has, World} from "../world.js";

export interface Label {
    Name?: string;
    SpawnedBy?: number;
}

/**
 * Add `Label` to an entity.
 *
 * @param name The name of the entity.
 * @param spawnedBy The entity that spawned this entity.
 */
export function label(name?: string, spawnedBy?: number) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.Label;
        game.World.Label[entity] = {Name: name, SpawnedBy: spawnedBy};
    };
}

/**
 * Find first entity with the given name label.
 *
 * @param world The world to search.
 * @param name The name to search for.
 * @param start_at The entity to start searching at.
 */
export function find_by_name(world: World, name: string, start_at: Entity = 0) {
    for (let i = start_at; i < world.Signature.length; i++) {
        if (world.Signature[i] & Has.Label && world.Label[i].Name === name) {
            return i;
        }
    }
    throw `No entity with name ${name}.`;
}

/**
 * Trace back through the spawner chain to find the original root spawner.
 * This is used for damage attribution - grenades, explosions, etc. can be
 * traced back to the original fighter who spawned them.
 *
 * @param world The world to search in
 * @param entity The entity to trace back from
 * @returns The root spawner entity, or the entity itself if no chain exists
 */
export function get_root_spawner(world: World, entity: Entity): Entity {
    // Check if entity has Label component with spawner tracking
    if (world.Signature[entity] & Has.Label) {
        let label_component = world.Label[entity];
        if (label_component && label_component.SpawnedBy !== undefined) {
            // Recursively trace back through the chain
            return get_root_spawner(world, label_component.SpawnedBy);
        }
    }

    // This entity is the root spawner (no SpawnedBy field)
    return entity;
}

/**
 * # Label
 *
 * The `Label` component stores labeling information for an entity,
 * including its name and spawner relationship for damage attribution.
 */

import {Entity, get_generation, is_entity_alive} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has, World} from "../world.js";

export interface Label {
    Name?: string;
    SpawnedBy?: number;
    SpawnedByGeneration?: number; // Store expected generation of SpawnedBy entity
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

        let spawnedByGeneration =
            spawnedBy !== undefined ? get_generation(game.World, spawnedBy) : undefined;

        game.World.Label[entity] = {
            Name: name,
            SpawnedBy: spawnedBy,
            SpawnedByGeneration: spawnedByGeneration,
        };
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
        DEBUG: if (!label_component) throw new Error("missing label component");

        if (
            label_component.SpawnedBy !== undefined &&
            label_component.SpawnedByGeneration !== undefined
        ) {
            let spawner_id = label_component.SpawnedBy;
            let expected_generation = label_component.SpawnedByGeneration;

            // Validate generation to detect recycled entities
            let current_generation = get_generation(world, spawner_id);
            if (current_generation !== expected_generation) {
                console.warn(
                    `[get_root_spawner] Entity ${spawner_id} generation mismatch ` +
                        `(expected: ${expected_generation}, current: ${current_generation}), treating ${entity} as root`,
                );
                return entity;
            }

            // Check if spawner is alive (has components)
            if (!is_entity_alive(world, spawner_id)) {
                console.warn(
                    `[get_root_spawner] Spawner ${spawner_id} is dead, treating ${entity} as root`,
                );
                return entity;
            }

            // Recursively trace back through the chain
            return get_root_spawner(world, spawner_id);
        }
    }

    // This entity is the root spawner (no SpawnedBy field). Now get the parent fighter.
    let weapon_node = world.SpatialNode2D[entity];
    if (weapon_node && weapon_node.Parent !== undefined) {
        return weapon_node.Parent;
    }

    // If no parent fighter is found, return the entity itself
    return entity;
}

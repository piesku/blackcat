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
    SpawnedBy?: number; // Always points to the fighter entity (root spawner), never intermediate spawners
}

/**
 * Add `Label` to an entity.
 *
 * @param name The name of the entity.
 * @param spawnedBy The fighter entity that ultimately spawned this entity (root spawner).
 */
export function label(name?: string, spawnedBy?: number) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.Label;

        game.World.Label[entity] = {
            Name: name,
            SpawnedBy: spawnedBy,
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
 * Get the root spawner (fighter entity) for damage attribution.
 * SpawnedBy always points directly to the fighter entity.
 *
 * @param world The world to search in
 * @param entity The entity to get the root spawner for
 * @returns The root spawner entity, or the entity itself if no spawner is found
 */
export function get_root_spawner(world: World, entity: Entity): Entity {
    // Check if entity has Label component with spawner info
    if (world.Signature[entity] & Has.Label) {
        let label = world.Label[entity];
        DEBUG: if (!label) throw new Error("missing label component");

        if (label.SpawnedBy !== undefined) {
            return label.SpawnedBy;
        }
    }

    // If no SpawnedBy field, check for parent fighter via spatial hierarchy
    let weapon_node = world.SpatialNode2D[entity];
    if (weapon_node && weapon_node.Parent !== undefined) {
        return weapon_node.Parent;
    }

    // If no parent fighter is found, return the entity itself
    return entity;
}

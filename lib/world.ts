export type Entity = number;

/**
 * The base World class
 *
 * Stores all the component data for all entities, as well as the component
 * masks.
 *
 * Creating and destroying entities is O(1).
 */
export class WorldImpl {
    Capacity: number;
    Signature: Array<number> = [];
    Graveyard: Array<Entity> = [];

    constructor(capacity: number = 10_000) {
        this.Capacity = capacity;
    }
}

// Generation system constants
const GENERATION_SHIFT = 28;
const GENERATION_MASK = 0xf0000000; // Top 4 bits
const COMPONENT_MASK = 0x0fffffff; // Bottom 28 bits

/**
 * Extract generation number from signature (0-15)
 */
export function get_generation(world: WorldImpl, entity: Entity): number {
    return (world.Signature[entity] & GENERATION_MASK) >>> GENERATION_SHIFT;
}

/**
 * Increment generation number for entity, wrapping at 16
 */
export function increment_generation(world: WorldImpl, entity: Entity): void {
    let currentGeneration = get_generation(world, entity);
    let newGeneration = (currentGeneration + 1) % 16;
    // Clear component bits and set new generation
    world.Signature[entity] = (newGeneration & 0xf) << GENERATION_SHIFT;
}

/**
 * Check if entity is alive (has any components)
 */
export function is_entity_alive(world: WorldImpl, entity: Entity): boolean {
    return (world.Signature[entity] & COMPONENT_MASK) !== 0;
}

// Methods are free functions for the sake of serialization and tree-shaking.

export function create_entity(world: WorldImpl) {
    if (world.Graveyard.length > 0) {
        let entity = world.Graveyard.pop()!;
        increment_generation(world, entity);
        return entity;
    }

    if (DEBUG && world.Signature.length > world.Capacity) {
        throw new Error("No more entities available.");
    }

    // Push a new signature and return its index (generation starts at 0)
    return world.Signature.push(0) - 1;
}

export function destroy_entity(world: WorldImpl, entity: Entity) {
    // Clear only the component bits (low 28 bits), preserve generation (high 4 bits)
    world.Signature[entity] &= GENERATION_MASK;

    if (DEBUG && world.Graveyard.includes(entity)) {
        throw new Error("Entity already in graveyard.");
    }

    world.Graveyard.push(entity);
}

/**
 * Find the first entity in the world with the given component mask.
 *
 * @param world The world to query.
 * @param query The component mask to query for.
 * @param start_at Start searching at this entity.
 */
export function first_having(
    world: WorldImpl,
    query: number,
    start_at: Entity = 0,
): Entity | undefined {
    for (let i = start_at; i < world.Signature.length; i++) {
        if ((world.Signature[i] & query) === query) {
            return i;
        }
    }
}

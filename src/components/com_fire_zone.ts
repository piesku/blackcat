/**
 * # Fire Zone
 *
 * The `FireZone` component creates a persistent damage area that harms
 * enemies that enter or remain within it.
 */

import {Game} from "../game.js";
import {Has} from "../world.js";

export interface FireZone {
    Damage: number; // Damage per second
    Radius: number; // Effect radius
    LastDamageTime: number; // Track damage timing
    DamageInterval: number; // Time between damage ticks (seconds)
    Source: number; // Entity that created this fire zone
}

/**
 * Add `FireZone` to an entity.
 *
 * @param damage Damage per second
 * @param radius Effect radius
 * @param damageInterval Time between damage ticks
 * @param source Entity that created this fire zone
 */
export function fire_zone(
    damage: number,
    radius: number,
    damageInterval: number = 0.5,
    source: number = -1,
) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.FireZone;
        game.World.FireZone[entity] = {
            Damage: damage,
            Radius: radius,
            LastDamageTime: 0,
            DamageInterval: damageInterval,
            Source: source,
        };
    };
}

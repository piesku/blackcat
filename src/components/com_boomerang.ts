/**
 * # Boomerang
 *
 * The `Boomerang` component handles the complex trajectory of boomerang projectiles
 * that fly out and then return to their thrower.
 */

import {Vec2} from "../../lib/math.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export const enum BoomerangPhase {
    Outward, // Flying away from thrower
    Returning, // Flying back to thrower
}

export interface Boomerang {
    ThrowerEntity: number;
    OriginalTarget: Vec2; // Where the boomerang was initially aimed
    Phase: BoomerangPhase;
    MaxRange: number; // How far it travels before returning
    Speed: number;
    HitEntities: Set<number>; // Entities hit during both phases
}

/**
 * Add `Boomerang` to an entity.
 *
 * @param thrower_entity Entity that threw the boomerang
 * @param target_position Initial target position
 * @param max_range Maximum distance before returning
 * @param speed Movement speed
 */
export function boomerang(
    thrower_entity: number,
    target_position: Vec2,
    max_range: number,
    speed: number,
) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.Boomerang;
        game.World.Boomerang[entity] = {
            ThrowerEntity: thrower_entity,
            OriginalTarget: [target_position[0], target_position[1]],
            Phase: BoomerangPhase.Outward,
            MaxRange: max_range,
            Speed: speed,
            HitEntities: new Set<number>(),
        };
    };
}

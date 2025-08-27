/**
 * # sys_damage_dealer
 *
 * Unified damage system that handles all types of damage via collision detection:
 * - Projectile hits (small collision radius)
 * - Melee combat (medium collision radius)
 * - Area effects like fire zones (large collision radius)
 * - Fighter-vs-fighter collisions
 *
 * All damage detection uses the collision system - no separate radius detection needed.
 */

import {Collide2D} from "../components/com_collide2d.js";
import {DealDamage} from "../components/com_deal_damage.js";
import {get_root_spawner} from "../components/com_label.js";
import {shake} from "../components/com_shake.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.DealDamage | Has.Collide2D | Has.LocalTransform2D;

export function sys_deal_damage(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let damage_dealer = game.World.DealDamage[entity];
            let collider = game.World.Collide2D[entity];

            if (!damage_dealer || !collider) continue;

            // Update cooldown timer
            if (damage_dealer.LastDamageTime > 0) {
                damage_dealer.LastDamageTime -= delta;
                continue; // Skip if on cooldown
            }

            // All damage detection uses collision system
            handle_collision_damage(game, entity, damage_dealer, collider);
        }
    }
}

/**
 * Handle all damage via collision detection (works for both point and area damage)
 */
function handle_collision_damage(
    game: Game,
    entity: number,
    damage_dealer: DealDamage,
    collider: Collide2D,
) {
    let hit_something = false;

    for (let collision of collider.Collisions) {
        let target_entity = collision.Other;

        // Get original spawner for damage attribution (SpawnedBy now directly points to fighter)
        let original_spawner = get_root_spawner(game.World, entity);

        // Skip self-damage
        if (target_entity === original_spawner) {
            continue;
        }

        // Skip if target has no health
        if (!(game.World.Signature[target_entity] & Has.Health)) continue;

        let target_health = game.World.Health[target_entity];
        if (!target_health.IsAlive) continue;

        // For piercing damage, skip if already hit this entity
        if (damage_dealer.HitEntities && damage_dealer.HitEntities.has(target_entity)) {
            continue;
        }

        // Deal damage
        target_health.PendingDamage.push({
            Amount: damage_dealer.Damage,
            Source: original_spawner,
            Type: damage_dealer.DamageType,
        });

        console.log(
            `[DAMAGE] Entity ${entity} (${damage_dealer.DamageType}) hit target ${target_entity}: adding ${damage_dealer.Damage} damage (original source: ${original_spawner})`,
        );

        // Add to hit list for piercing
        if (damage_dealer.HitEntities) {
            damage_dealer.HitEntities.add(target_entity);
        }

        // Apply screen shake
        if (game.Camera !== undefined && damage_dealer.ShakeRadius && damage_dealer.ShakeDuration) {
            shake(damage_dealer.ShakeRadius, damage_dealer.ShakeDuration)(game, game.Camera);
        }

        hit_something = true;

        // For non-piercing damage, only hit the first target
        if (!damage_dealer.HitEntities) {
            break;
        }
    }

    // Handle post-hit effects
    if (hit_something) {
        // Set cooldown
        damage_dealer.LastDamageTime = damage_dealer.Cooldown;

        // Destroy entity if configured to do so
        if (damage_dealer.DestroyOnHit && !damage_dealer.HitEntities) {
            game.World.Signature[entity] = 0;
        }
    }
}

// All damage now handled via collision detection above
// Area effects use large collision radius instead of separate radius detection

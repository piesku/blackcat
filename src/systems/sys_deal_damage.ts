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

    for (let target_entity of collider.Collisions) {
        // Get original spawner for damage attribution (SpawnedBy now directly points to fighter)
        let original_spawner = get_root_spawner(game.World, entity);

        // Skip self-damage
        if (target_entity === original_spawner) {
            continue;
        }

        // Skip if target has no health
        if (!(game.World.Signature[target_entity] & Has.Health)) continue;

        let target_health = game.World.Health[target_entity];

        // Deal damage
        let final_damage = damage_dealer.Damage;

        // Apply trait-based damage bonus (Brawler trait) and energy scaling
        if (game.World.Signature[original_spawner] & Has.ControlAi) {
            let ai = game.World.ControlAi[original_spawner];
            if (!ai) throw new Error("missing AI component");

            // Apply trait damage bonus
            if (ai.DamageBonus) {
                final_damage += ai.DamageBonus;
            }

            // Apply Weapon Mastery upgrade: energy-based damage scaling
            if (ai.WeaponMasteryScaling) {
                // Energy range: 0.0 (baseline) → 5.0 (maximum)
                // Damage scaling: energy_ratio * scaling_factor (0.2/0.4/0.6)
                let energy_ratio = ai.Energy / 5.0; // 0.0 to 1.0
                let damage_bonus = energy_ratio * ai.WeaponMasteryScaling; // 0% to scaling%
                final_damage *= 1.0 + damage_bonus;
            }
        }

        target_health.PendingDamage.push({
            Amount: final_damage,
            Source: original_spawner,
        });

        // Generate energy from dealing damage (combat-driven energy system)
        if (game.World.Signature[original_spawner] & Has.ControlAi) {
            let attacker_ai = game.World.ControlAi[original_spawner];
            if (!attacker_ai) throw new Error("missing AI component");

            // Gain energy based on damage dealt and upgrade bonus
            if (attacker_ai.EnergyFromDamageDealt > 0) {
                attacker_ai.Energy += final_damage * attacker_ai.EnergyFromDamageDealt;
            }
        }

        // Handle vampiric healing (heal attacker based on damage about to be dealt)
        if (game.World.Signature[original_spawner] & Has.ControlAi) {
            let attacker_ai = game.World.ControlAi[original_spawner];
            if (attacker_ai.VampiricHealing) {
                let attacker_health = game.World.Health[original_spawner];
                if (!attacker_health) throw new Error("attacker missing health component");

                let heal_amount = final_damage / 2; // Heal 1 HP for every 2 damage dealt
                attacker_health.PendingHealing.push({
                    Amount: heal_amount,
                    Source: original_spawner,
                    Type: "vampiric",
                });
                console.log(
                    `[VAMPIRIC] Entity ${original_spawner} vampiric healing ${heal_amount.toFixed(2)} HP from dealing ${final_damage.toFixed(1)} damage to entity ${target_entity}`,
                );
            }
        }

        // Handle mana siphon (drain energy from target and add to attacker)
        if (game.World.Signature[original_spawner] & Has.ControlAi) {
            let attacker_ai = game.World.ControlAi[original_spawner];
            if (attacker_ai.ManaSiphon) {
                if (game.World.Signature[target_entity] & Has.ControlAi) {
                    let target_ai = game.World.ControlAi[target_entity];
                    let siphoned_amount = final_damage * attacker_ai.ManaSiphon;

                    // Drain from target
                    target_ai.Energy = Math.max(0, target_ai.Energy - siphoned_amount);

                    // Add to attacker
                    attacker_ai.Energy += siphoned_amount;

                    console.log(
                        `[MANA SIPHON] Entity ${original_spawner} siphoned ${siphoned_amount.toFixed(2)} energy from entity ${target_entity}`,
                    );
                }
            }
        }

        // Apply screen shake based on damage amount
        if (game.Camera !== undefined) {
            let shake_radius = Math.min(1.0, final_damage * 0.2); // Scale with damage (0.2 to 1.0+)
            let shake_duration = Math.min(0.5, final_damage * 0.1); // Scale with damage (0.1 to 0.5+)
            shake(shake_radius, shake_duration)(game, game.Camera);
        }

        hit_something = true;
    }

    // Handle post-hit effects
    if (hit_something) {
        // Set cooldown (if cooldown is 0, this will be 0 and allow immediate destruction)
        damage_dealer.LastDamageTime = damage_dealer.Cooldown;

        // Destroy entity if cooldown is 0 (instant/projectile damage)
        if (damage_dealer.Cooldown === 0) {
            // If entity has lifespan, expire it to trigger lifespan's on-destroy actions
            if (game.World.Signature[entity] & Has.Lifespan) {
                let lifespan = game.World.Lifespan[entity];
                lifespan.Age = lifespan.Lifetime; // Will be destroyed by sys_lifespan
            }
        }
    }
}

// All damage now handled via collision detection above
// Area effects use large collision radius instead of separate radius detection

import {rand} from "../../lib/random.js";
import {vec2_distance_squared} from "../../lib/vec2.js";
import {query_down} from "../components/com_children.js";
import {AiState} from "../components/com_control_ai.js";

import {Health} from "../components/com_health.js";
import {SpawnMode} from "../components/com_spawn.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Health;

export function sys_health(game: Game, _delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let health = game.World.Health[entity];

            if (!health.IsAlive) {
                continue;
            }

            // Check for Phase Walk invincibility during dashing
            if (game.World.Signature[entity] & Has.ControlAi) {
                let ai = game.World.ControlAi[entity];
                DEBUG: if (!ai) throw new Error("missing component");

                if (ai.PhaseWalkEnabled && ai.State === AiState.Dashing) {
                    console.log(
                        `[PHASE_WALK] Entity ${entity} is invincible while dashing - ignoring all damage`,
                    );
                    // Clear all pending damage while dashing
                    health.PendingDamage.length = 0;
                }
            }

            // Process all pending damage instances
            let total_damage = 0;
            let reflect_targets: Array<{entity: number; amount: number}> = [];

            for (let damage_instance of health.PendingDamage) {
                let final_damage = calculate_armor_reduction(game, entity, health, damage_instance);

                // Handle reflect damage (before damage is applied)
                if (health.ReflectDamage && health.ReflectDamage > 0) {
                    reflect_targets.push({
                        entity: damage_instance.Source,
                        amount: health.ReflectDamage,
                    });
                }

                // Handle Mirror Armor - 100% reflect but take 50% self-damage
                // Skip mirror armor for self-inflicted recoil damage to prevent infinite loops
                if (health.MirrorArmor && damage_instance.Type !== "mirror_recoil") {
                    reflect_targets.push({
                        entity: damage_instance.Source,
                        amount: damage_instance.Amount, // Reflect full original damage
                    });

                    // Add self-damage (50% of reflected amount)
                    let self_damage = damage_instance.Amount * 0.5;
                    health.PendingDamage.push({
                        Amount: self_damage,
                        Source: entity, // Self-inflicted
                        Type: "mirror_recoil",
                    });

                    console.log(
                        `[MIRROR_ARMOR] Entity ${entity} reflecting ${damage_instance.Amount.toFixed(1)} damage and taking ${self_damage.toFixed(1)} recoil`,
                    );
                }

                total_damage += final_damage;

                console.log(
                    `[HEALTH] Entity ${entity} taking ${final_damage.toFixed(1)} damage (${damage_instance.Amount.toFixed(1)} before armor) from entity ${damage_instance.Source}`,
                );
            }

            let health_before = health.Current;

            // Apply final damage
            if (total_damage > 0) {
                health.Current = Math.max(0, health.Current - total_damage);
                health.LastDamageTime = game.Time;

                // Generate energy from taking damage (combat-driven energy system)
                if (game.World.Signature[entity] & Has.ControlAi) {
                    let ai = game.World.ControlAi[entity];
                    DEBUG: if (!ai) throw new Error("missing AI component");

                    // Gain energy based on damage taken and upgrade bonus
                    if (ai.EnergyFromDamageTaken > 0) {
                        let energy_gain = total_damage * ai.EnergyFromDamageTaken;

                        ai.Energy += energy_gain;
                    }
                }
            }

            if (health.IsAlive && health.Current <= 0) {
                health.IsAlive = false;
                console.log(
                    `[DEATH] Entity ${entity} died from ${total_damage.toFixed(1)} damage - marked as dead`,
                );
                // Entity destruction will be handled next frame after duel_manager has chance to run
            }

            // Apply reflected damage
            for (let reflect of reflect_targets) {
                if (game.World.Signature[reflect.entity] & Has.Health) {
                    let source_health = game.World.Health[reflect.entity];
                    if (source_health.IsAlive) {
                        source_health.PendingDamage.push({
                            Amount: reflect.amount,
                            Source: entity,
                            Type: "reflect",
                        });
                        console.log(
                            `[REFLECT] Entity ${entity} reflecting ${reflect.amount} damage back to entity ${reflect.entity}`,
                        );
                    }
                }
            }

            // Process all pending healing instances
            let total_healing = 0;

            for (let healing_instance of health.PendingHealing) {
                // Only heal if not at max health
                if (health.Current < health.Max) {
                    total_healing += healing_instance.Amount;
                    console.log(
                        `[HEALING] Entity ${entity} receiving ${healing_instance.Amount.toFixed(2)} healing from entity ${healing_instance.Source}`,
                    );
                }
            }

            // Apply healing
            if (total_healing > 0) {
                let health_before_heal = health.Current;
                health.Current = Math.min(health.Max, health.Current + total_healing);
                let actual_healing = health.Current - health_before_heal;

                console.log(
                    `[HEALING] Entity ${entity} healed ${actual_healing.toFixed(2)} HP (${health_before_heal.toFixed(1)} -> ${health.Current.toFixed(1)})`,
                );

                // Activate healing particle effects on heal spawner child entity
                activate_heal_particles(game, entity);
            }

            // Process regeneration (Regenerative Mesh armor)
            if (
                health.RegenerationRate &&
                health.RegenerationRate > 0 &&
                health.Current < health.Max
            ) {
                let regen_amount = health.RegenerationRate * _delta;
                let health_before_regen = health.Current;
                health.Current = Math.min(health.Max, health.Current + regen_amount);
                let actual_regen = health.Current - health_before_regen;

                if (actual_regen > 0) {
                    console.log(
                        `[REGEN] Entity ${entity} regenerated ${actual_regen.toFixed(2)} HP (${health_before_regen.toFixed(1)} -> ${health.Current.toFixed(1)})`,
                    );
                }
            }

            // Clear processed damage and healing
            health.PendingDamage.length = 0;
            health.PendingHealing.length = 0;
        }
    }
}

function calculate_armor_reduction(
    game: Game,
    defender_entity: number,
    health: Health,
    damage_instance: {Amount: number; Source: number; Type?: string},
): number {
    let final_damage = damage_instance.Amount;

    // Evasion: Chance to completely avoid damage (checked first, before other armor)
    if (health.EvasionChance && health.EvasionChance > 0) {
        let roll = rand(); // Random number between 0 and 1
        if (roll < health.EvasionChance) {
            console.log(
                `[ARMOR] Evasion activated (${(health.EvasionChance * 100).toFixed(1)}% chance, rolled ${(roll * 100).toFixed(1)}%) - completely avoiding ${damage_instance.Amount.toFixed(1)} damage`,
            );
            return 0; // Completely avoid all damage
        }
    }

    // Scrap Armor: Ignore first damage instance
    if (health.IgnoreFirstDamage && !health.FirstDamageIgnored) {
        health.FirstDamageIgnored = true;
        console.log(
            `[ARMOR] Scrap Armor activated - ignoring ${damage_instance.Amount.toFixed(1)} damage`,
        );
        return 0;
    }

    // Last Stand: 75% damage reduction when at 1 HP
    if (health.LastStand && health.Current <= 1) {
        let reduction = final_damage * 0.75;
        final_damage -= reduction;
        console.log(
            `[ARMOR] Last Stand activated - 75% damage reduction (reducing by ${reduction.toFixed(1)})`,
        );
    }

    // Proximity Barrier: Reduce damage from nearby enemies
    if (health.ProximityBarrier && health.ProximityBarrier > 0) {
        let is_close_range = check_proximity(game, defender_entity, damage_instance.Source);
        if (is_close_range) {
            let reduction = final_damage * health.ProximityBarrier;
            final_damage -= reduction;
            console.log(
                `[ARMOR] Proximity Barrier: ${(health.ProximityBarrier * 100).toFixed(0)}% reduction from nearby enemy - reducing by ${reduction.toFixed(1)}`,
            );
        }
    }

    // Percentage damage reduction
    if (health.DamageReduction && health.DamageReduction > 0) {
        let reduction = final_damage * health.DamageReduction;
        final_damage -= reduction;
        console.log(
            `[ARMOR] Damage reduction: ${(health.DamageReduction * 100).toFixed(0)}% - reducing by ${reduction.toFixed(1)}`,
        );
    }

    // Flat damage reduction (applied last, minimum 1 damage)
    if (health.FlatDamageReduction && health.FlatDamageReduction > 0) {
        let original_damage = final_damage;
        final_damage = Math.max(1, final_damage - health.FlatDamageReduction);
        let actual_reduction = original_damage - final_damage;

        if (actual_reduction > 0) {
            console.log(
                `[ARMOR] Flat damage reduction: -${health.FlatDamageReduction} (actual: -${actual_reduction.toFixed(1)}, minimum 1 damage enforced)`,
            );
        }
    }

    return final_damage;
}

function check_proximity(game: Game, defender: number, attacker: number): boolean {
    // Define melee range distance (same as AI system uses)
    const MELEE_RANGE_SQUARED = 1.2 * 1.2; // Base separation distance from AI system

    let defender_transform = game.World.LocalTransform2D[defender];
    let attacker_transform = game.World.LocalTransform2D[attacker];

    if (!defender_transform || !attacker_transform) {
        return false; // Can't calculate distance without transforms
    }

    let dist_sq = vec2_distance_squared(
        defender_transform.Translation,
        attacker_transform.Translation,
    );
    return dist_sq <= MELEE_RANGE_SQUARED;
}

function activate_heal_particles(game: Game, entity: number) {
    for (let child_entity of query_down(game.World, entity, Has.Spawn | Has.Label)) {
        let label = game.World.Label[child_entity];
        if (label && label.Name === "heal_spawner") {
            let spawn = game.World.Spawn[child_entity];
            if (spawn.Mode === SpawnMode.Count) {
                // Add particles for healing effect
                spawn.RemainingCount ||= 1;
            }
            break; // Found the heal spawner, no need to continue
        }
    }
}

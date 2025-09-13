import {rand} from "../../lib/random.js";
import {AnimationId, set_animation} from "../components/com_animate_sprite.js";
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

            // Entity is alive if it has Health component - no need to check further

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
                if (health.ReflectDamage > 0 && damage_instance.Type !== "reflect") {
                    reflect_targets.push({
                        entity: damage_instance.Source,
                        amount: Math.min(health.ReflectDamage, final_damage),
                    });
                }

                total_damage += final_damage;
            }

            // Apply final damage
            if (total_damage > 0) {
                health.Current = Math.max(0, health.Current - total_damage);
                health.LastDamageTime = game.Time;

                // Activate blood splatter particles when taking damage
                activate_blood_particles(game, entity, total_damage);

                // Generate energy from taking damage (combat-driven energy system)
                if (game.World.Signature[entity] & Has.ControlAi) {
                    let ai = game.World.ControlAi[entity];
                    DEBUG: if (!ai) throw new Error("missing AI component");

                    // Gain energy based on damage taken and upgrade bonus
                    if (ai.EnergyFromDamageTaken > 0) {
                        ai.Energy += total_damage * ai.EnergyFromDamageTaken;
                    }
                }
            }

            if (health.Current <= 0) {
                console.log(
                    `[DEATH] Entity ${entity} died from ${total_damage.toFixed(1)} damage - removing Health component`,
                );

                for (let entity_child of query_down(game.World, entity, Has.AnimateSprite)) {
                    set_animation(game, entity_child, AnimationId.Die);
                }

                // Remove Health component to mark entity as dead
                game.World.Signature[entity] &= ~Has.Health;

                // Entity destruction will be handled next frame after duel_manager has chance to run
            }

            // Apply reflected damage
            for (let reflect of reflect_targets) {
                if (game.World.Signature[reflect.entity] & Has.Health) {
                    let source_health = game.World.Health[reflect.entity];
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
                activate_heal_particles(game, entity, total_healing);
            }

            // Process regeneration (Regenerative Mesh armor)
            if (health.RegenerationRate > 0 && health.Current < health.Max) {
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
    if (health.EvasionChance > 0) {
        let roll = rand(); // Random number between 0 and 1
        if (roll < health.EvasionChance) {
            console.log(
                `[ARMOR] Evasion activated (${(health.EvasionChance * 100).toFixed(1)}% chance, rolled ${(roll * 100).toFixed(1)}%) - completely avoiding ${damage_instance.Amount.toFixed(1)} damage`,
            );
            return 0; // Completely avoid all damage
        }
    }

    // Resonance Shield: Reduce damage based on current energy
    if (health.ResonanceShield && health.ResonanceShield > 0) {
        if (game.World.Signature[defender_entity] & Has.ControlAi) {
            let ai = game.World.ControlAi[defender_entity];
            // Reduction is proportional to energy, capped at 90%
            let reduction_percentage = Math.min(0.9, ai.Energy * health.ResonanceShield);
            if (reduction_percentage > 0) {
                let reduction = final_damage * reduction_percentage;
                final_damage -= reduction;
                console.log(
                    `[ARMOR] Resonance Shield: ${(reduction_percentage * 100).toFixed(0)}% reduction from ${ai.Energy.toFixed(1)} energy (reducing by ${reduction.toFixed(1)})`,
                );
            }
        }
    }

    // Percentage damage reduction
    if (health.DamageReduction > 0) {
        let reduction = final_damage * health.DamageReduction;
        final_damage -= reduction;
        console.log(
            `[ARMOR] Damage reduction: ${(health.DamageReduction * 100).toFixed(0)}% - reducing by ${reduction.toFixed(1)}`,
        );
    }

    // Flat damage reduction (applied last, minimum 1 damage)
    if (health.FlatDamageReduction > 0) {
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

function activate_heal_particles(game: Game, entity: number, healing_amount: number) {
    for (let child_entity of query_down(game.World, entity, Has.Spawn | Has.Label)) {
        let label = game.World.Label[child_entity];
        if (label && label.Name === "heal_spawner") {
            let spawn = game.World.Spawn[child_entity];
            if (spawn.Mode === SpawnMode.Count) {
                // Add particles for healing effect
                spawn.Count += healing_amount * healing_amount;
            }
            break; // Found the heal spawner, no need to continue
        }
    }
}

function activate_blood_particles(game: Game, entity: number, damage: number) {
    for (let child_entity of query_down(game.World, entity, Has.Spawn | Has.Label)) {
        let label = game.World.Label[child_entity];
        if (label && label.Name === "blood_spawner") {
            let spawn = game.World.Spawn[child_entity];
            if (spawn.Mode === SpawnMode.Count) {
                // Add blood particles based on damage amount (more damage = more blood)
                spawn.Count += damage * damage;
            }
            break; // Found the blood spawner, no need to continue
        }
    }
}

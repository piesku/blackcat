import {query_down} from "../components/com_children.js";
import {DrawKind} from "../components/com_draw.js";
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

            // Process all pending damage instances
            let total_damage = 0;
            let reflect_targets: Array<{entity: number; amount: number}> = [];

            for (let damage_instance of health.PendingDamage) {
                let final_damage = calculate_armor_reduction(health, damage_instance.Amount);

                // Handle reflect damage (before damage is applied)
                if (health.ReflectDamage && health.ReflectDamage > 0) {
                    reflect_targets.push({
                        entity: damage_instance.Source,
                        amount: health.ReflectDamage,
                    });
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
            }

            if (health.IsAlive && health.Current <= 0) {
                health.IsAlive = false;
                console.log(
                    `[DEATH] Entity ${entity} died from ${total_damage.toFixed(1)} damage - marked as dead`,
                );
                // Entity destruction will be handled next frame after duel_manager has chance to run
            } else {
                console.log(
                    `[HEALTH] Entity ${entity} HP: ${health_before.toFixed(1)} -> ${health.Current.toFixed(1)}`,
                );
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

            // Clear processed damage and healing
            health.PendingDamage.length = 0;
            health.PendingHealing.length = 0;

            // Update healthbar
            update_healthbar(game, entity);
        }
    }
}

function calculate_armor_reduction(health: Health, incoming_damage: number): number {
    let final_damage = incoming_damage;

    // Scrap Armor: Ignore first damage instance
    if (health.IgnoreFirstDamage && !health.FirstDamageIgnored) {
        health.FirstDamageIgnored = true;
        console.log(
            `[ARMOR] Scrap Armor activated - ignoring ${incoming_damage.toFixed(1)} damage`,
        );
        return 0;
    }

    // Percentage damage reduction
    if (health.DamageReduction && health.DamageReduction > 0) {
        let reduction = final_damage * health.DamageReduction;
        final_damage -= reduction;
        console.log(
            `[ARMOR] Damage reduction: ${(health.DamageReduction * 100).toFixed(0)}% - reducing by ${reduction.toFixed(1)}`,
        );
    }

    return final_damage;
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

function update_healthbar(game: Game, entity: number) {
    let health = game.World.Health[entity];

    for (let healthbar_entity of query_down(
        game.World,
        entity,
        Has.LocalTransform2D | Has.Draw | Has.Label,
    )) {
        let healthbar_label = game.World.Label[healthbar_entity];
        let healthbar_draw = game.World.Draw[healthbar_entity];
        let healthbar_transform = game.World.LocalTransform2D[healthbar_entity];

        // Only update entities with "healthbar" label
        if (healthbar_label.Name === "healthbar") {
            // Calculate health percentage
            let health_percentage = health.Max > 0 ? health.Current / health.Max : 0;

            // Update healthbar width based on health percentage
            healthbar_transform.Scale[0] = health_percentage; // Scale from 0 to 1

            // Offset the healthbar to the left so it shrinks from the right side
            // When scale is 1.0, offset is 0. When scale is 0.5, offset is -0.25, etc.
            let max_width = 1; // From blueprint: draw_rect width is 1
            let offset_x = -(max_width * (1 - health_percentage)) / 2;
            healthbar_transform.Translation[0] = offset_x;

            // Type-safe access to DrawRect properties
            if (healthbar_draw.Kind === DrawKind.Rect) {
                healthbar_draw.Width = max_width * health_percentage; // Scale the draw width too

                // Update healthbar color based on health percentage
                if (health_percentage > 0.6) {
                    healthbar_draw.Color = "#00ff00"; // Green
                } else if (health_percentage > 0.3) {
                    healthbar_draw.Color = "#ffff00"; // Yellow
                } else {
                    healthbar_draw.Color = "#ff0000"; // Red
                }
            }
        }
    }
}

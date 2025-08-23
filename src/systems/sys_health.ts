import {query_down} from "../components/com_children.js";
import {DrawKind} from "../components/com_draw.js";
import {Health} from "../components/com_health.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Health;

export function sys_health(game: Game, _delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let health = game.World.Health[entity];

            if (!health.IsAlive || health.PendingDamage.length === 0) {
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

            // Apply final damage
            if (total_damage > 0) {
                let health_before = health.Current;
                health.Current = Math.max(0, health.Current - total_damage);
                health.LastDamageTime = game.Time;

                if (health.Current <= 0) {
                    health.IsAlive = false;
                    console.log(
                        `[DEATH] Entity ${entity} died from ${total_damage.toFixed(1)} damage`,
                    );

                    // Disable movement for dead entities
                    if (game.World.Signature[entity] & Has.ControlAlways2D) {
                        game.World.Signature[entity] &= ~Has.ControlAlways2D;
                    }
                } else {
                    console.log(
                        `[HEALTH] Entity ${entity} HP: ${health_before.toFixed(1)} -> ${health.Current.toFixed(1)}`,
                    );
                }
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

            // Clear processed damage
            health.PendingDamage.length = 0;

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

function update_healthbar(game: Game, entity: number) {
    let health = game.World.Health[entity];

    for (let healthbar_entity of query_down(game.World, entity, Has.Draw)) {
        let healthbar_draw = game.World.Draw[healthbar_entity];
        let healthbar_transform = game.World.LocalTransform2D[healthbar_entity];

        if (healthbar_draw && healthbar_transform) {
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

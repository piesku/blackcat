import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Health;

export function sys_health(game: Game, delta: number) {
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
        }
    }
}

function calculate_armor_reduction(health: any, incoming_damage: number): number {
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

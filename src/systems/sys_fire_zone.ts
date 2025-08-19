import {Vec2} from "../../lib/math.js";
import {vec2_length, vec2_subtract} from "../../lib/vec2.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.FireZone | Has.LocalTransform2D;

export function sys_fire_zone(game: Game, delta: number) {
    for (let fire_entity = 0; fire_entity < game.World.Signature.length; fire_entity++) {
        if ((game.World.Signature[fire_entity] & QUERY) === QUERY) {
            let fire_zone = game.World.FireZone[fire_entity];
            let fire_transform = game.World.LocalTransform2D[fire_entity];

            if (!fire_zone || !fire_transform) continue;

            // Update damage timing
            fire_zone.LastDamageTime -= delta;

            // Check if it's time to damage entities
            if (fire_zone.LastDamageTime <= 0) {
                fire_zone.LastDamageTime = fire_zone.DamageInterval;

                // Find all entities with health within the fire zone radius
                for (
                    let target_entity = 0;
                    target_entity < game.World.Signature.length;
                    target_entity++
                ) {
                    if (target_entity === fire_entity) continue; // Skip self
                    if (target_entity === fire_zone.Source) continue; // Skip source entity
                    if (!(game.World.Signature[target_entity] & Has.Health)) continue;
                    if (!(game.World.Signature[target_entity] & Has.LocalTransform2D)) continue;

                    let target_health = game.World.Health[target_entity];
                    let target_transform = game.World.LocalTransform2D[target_entity];

                    if (!target_health.IsAlive) continue;

                    // Calculate distance to fire zone center
                    let distance_vec: Vec2 = [0, 0];
                    vec2_subtract(
                        distance_vec,
                        target_transform.Translation,
                        fire_transform.Translation,
                    );
                    let distance = vec2_length(distance_vec);

                    // If target is within fire zone radius, apply damage
                    if (distance <= fire_zone.Radius) {
                        target_health.PendingDamage.push({
                            Amount: fire_zone.Damage,
                            Source: fire_zone.Source,
                            Type: "fire",
                        });

                        console.log(
                            `[FIRE] Fire zone ${fire_entity} damaged entity ${target_entity} for ${fire_zone.Damage} fire damage (distance: ${distance.toFixed(2)})`,
                        );
                    }
                }
            }
        }
    }
}

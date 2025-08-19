import {Vec2} from "../../lib/math.js";
import {vec2_distance, vec2_length, vec2_normalize, vec2_subtract} from "../../lib/vec2.js";
import {BoomerangPhase} from "../components/com_boomerang.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Boomerang | Has.LocalTransform2D | Has.ControlAlways2D | Has.Collide2D;

export function sys_boomerang(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let boomerang = game.World.Boomerang[entity];
            let transform = game.World.LocalTransform2D[entity];
            let control = game.World.ControlAlways2D[entity];
            let collider = game.World.Collide2D[entity];

            if (!boomerang || !transform || !control || !collider) continue;

            // Handle collisions (damage enemies on both outward and return paths)
            for (let collision of collider.Collisions) {
                let target_entity = collision.Other;

                // Skip if hit its thrower
                if (target_entity === boomerang.ThrowerEntity) continue;

                // Skip if target has no health
                if (!(game.World.Signature[target_entity] & Has.Health)) continue;

                let target_health = game.World.Health[target_entity];
                if (!target_health.IsAlive) continue;

                // Skip if already hit this entity (boomerang can only hit each entity once)
                if (boomerang.HitEntities.has(target_entity)) continue;

                // Add to hit list first
                boomerang.HitEntities.add(target_entity);

                // Add damage - different damage for outward vs return path
                let damage_amount = boomerang.Phase === BoomerangPhase.Outward ? 2 : 1;
                target_health.PendingDamage.push({
                    Amount: damage_amount,
                    Source: boomerang.ThrowerEntity,
                    Type: "boomerang",
                });

                console.log(
                    `[BOOMERANG] Entity ${entity} (${boomerang.Phase === BoomerangPhase.Outward ? "outward" : "returning"}) hit target ${target_entity} for ${damage_amount} damage`,
                );
            }

            // Update boomerang movement based on phase
            if (boomerang.Phase === BoomerangPhase.Outward) {
                // Check if reached max range
                let thrower_transform = game.World.LocalTransform2D[boomerang.ThrowerEntity];
                if (thrower_transform) {
                    let distance_to_thrower = vec2_distance(
                        transform.Translation,
                        thrower_transform.Translation,
                    );

                    if (distance_to_thrower >= boomerang.MaxRange) {
                        // Switch to returning phase
                        boomerang.Phase = BoomerangPhase.Returning;
                        console.log(
                            `[BOOMERANG] Entity ${entity} reached max range, returning to thrower`,
                        );
                    }
                }
            }

            // Set movement direction based on phase
            if (boomerang.Phase === BoomerangPhase.Returning) {
                let thrower_transform = game.World.LocalTransform2D[boomerang.ThrowerEntity];
                if (thrower_transform) {
                    // Move towards thrower
                    let to_thrower: Vec2 = [0, 0];
                    vec2_subtract(to_thrower, thrower_transform.Translation, transform.Translation);

                    let distance_to_thrower = vec2_length(to_thrower);

                    // If close enough to thrower, destroy the boomerang
                    if (distance_to_thrower < 0.5) {
                        console.log(
                            `[BOOMERANG] Entity ${entity} returned to thrower ${boomerang.ThrowerEntity}`,
                        );
                        game.World.Signature[entity] = 0; // Destroy boomerang
                        continue;
                    }

                    vec2_normalize(to_thrower, to_thrower);
                    control.Direction = [to_thrower[0], to_thrower[1]];
                } else {
                    // Thrower is gone, destroy boomerang
                    game.World.Signature[entity] = 0;
                    continue;
                }
            } else {
                // Outward phase - continue towards original target
                let to_target: Vec2 = [0, 0];
                vec2_subtract(to_target, boomerang.OriginalTarget, transform.Translation);
                vec2_normalize(to_target, to_target);
                control.Direction = [to_target[0], to_target[1]];
            }
        }
    }
}

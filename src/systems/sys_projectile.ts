import {damage_entity} from "../components/com_health.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Projectile | Has.Collide2D;

export function sys_projectile(game: Game, _delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let projectile = game.World.Projectile[entity];
            let collider = game.World.Collide2D[entity];

            if (!projectile || !collider) continue;

            // Check for collisions with valid targets
            for (let collision of collider.Collisions) {
                let target_entity = collision.Other;

                // Skip if projectile hit its owner
                if (target_entity === projectile.OwnerEntity) continue;

                // Skip if target has no health
                if (!(game.World.Signature[target_entity] & Has.Health)) continue;

                let target_health = game.World.Health[target_entity];
                if (!target_health.IsAlive) continue;

                // Deal damage to target
                let health_before = target_health.Current;
                damage_entity(game, target_entity, projectile.Damage);
                let health_after = target_health.Current;
                let is_alive = target_health.IsAlive;

                console.log(
                    `[PROJECTILE] Entity ${entity} hit target ${target_entity}: ${projectile.Damage} damage, HP ${health_before.toFixed(1)} -> ${health_after.toFixed(1)} (${is_alive ? "alive" : "DEAD"})`,
                );

                // Add screen shake for impact
                if (game.World.Signature[target_entity] & Has.Shake) {
                    let shake = game.World.Shake[target_entity];
                    shake.Radius = Math.max(shake.Radius, projectile.Damage * 0.3);
                }

                // Destroy the projectile after hitting a target
                game.World.Signature[entity] = 0;
                break; // Only hit one target per projectile
            }
        }
    }
}

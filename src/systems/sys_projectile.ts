import {shake} from "../components/com_shake.js";
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

                // Add damage to pending queue instead of applying directly
                target_health.PendingDamage.push({
                    Amount: projectile.Damage,
                    Source: projectile.OwnerEntity,
                    Type: "projectile",
                });

                console.log(
                    `[PROJECTILE] Entity ${entity} hit target ${target_entity}: adding ${projectile.Damage} projectile damage to pending queue`,
                );

                // Add screen shake for impact
                if (game.Camera !== undefined) {
                    let shake_radius = 0.5; // Fixed radius for all shakes
                    let shake_duration = 0.15; // 150ms shake for projectile hit
                    shake(shake_radius, shake_duration)(game, game.Camera);
                }

                // Destroy the projectile after hitting a target
                game.World.Signature[entity] = 0;
                break; // Only hit one target per projectile
            }
        }
    }
}

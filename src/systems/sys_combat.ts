import {shake} from "../components/com_shake.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Health | Has.Collide2D | Has.LocalTransform2D;
const DAMAGE_COOLDOWN = 2.0; // 2 seconds between collision damage instances (reduced priority)

export function sys_combat(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let health = game.World.Health[entity];
            let collide = game.World.Collide2D[entity];

            if (!health.IsAlive) {
                continue;
            }

            // Check for collisions with other fighters
            for (let collision of collide.Collisions) {
                let other_entity = collision.Other;
                if (other_entity === entity) continue;

                let other_health = game.World.Health[other_entity];
                if (!other_health || !other_health.IsAlive) continue;

                // Only damage if enough time has passed since last damage
                // Reduced collision damage since weapons are now primary damage source
                if (game.Time - health.LastDamageTime > DAMAGE_COOLDOWN) {
                    let damage_amount = 0.5; // Reduced from 1 to 0.5
                    health.PendingDamage.push({
                        Amount: damage_amount,
                        Source: other_entity,
                        Type: "collision",
                    });

                    console.log(
                        `[COLLISION] Entity ${entity} <-> ${other_entity}: adding ${damage_amount} collision damage to pending queue`,
                    );

                    // Add screen shake for dramatic effect
                    if (game.Camera !== undefined) {
                        let shake_radius = 0.5; // Fixed radius for all shakes
                        let shake_duration = 0.4; // 400ms shake for collision
                        shake(shake_radius, shake_duration)(game, game.Camera);
                    }

                    // Note: Death handling is now done in sys_health after damage processing
                }
            }
        }
    }
}

import {damage_entity} from "../components/com_health.js";
import {Game} from "../game.js";
import {Has, World} from "../world.js";

const QUERY = Has.Health | Has.Collide2D | Has.LocalTransform2D;
const DAMAGE_COOLDOWN = 1.0; // 1 second between damage instances

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
                if (game.Running - health.LastDamageTime > DAMAGE_COOLDOWN) {
                    damage_entity(game, entity, 1);

                    // Add screen shake for dramatic effect
                    if (game.World.Signature[entity] & Has.Shake) {
                        let shake = game.World.Shake[entity];
                        shake.Radius = Math.max(shake.Radius, 2.0);
                    }

                    // If health reaches 0, disable movement
                    if (!health.IsAlive && game.World.Signature[entity] & Has.ControlAlways2D) {
                        game.World.Signature[entity] &= ~Has.ControlAlways2D;
                    }
                }
            }
        }
    }
}

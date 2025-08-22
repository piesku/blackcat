import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Spawn | Has.SpatialNode2D | Has.Move2D;

export function sys_shadow_trail(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let spawner = game.World.Spawn[entity];
            let movement = game.World.Move2D[entity];

            if (!spawner || !movement) continue;

            // Only emit particles when entity is moving
            let is_moving =
                movement.Direction &&
                (Math.abs(movement.Direction[0]) > 0.1 || Math.abs(movement.Direction[1]) > 0.1);

            if (is_moving) {
                // Entity is moving - ensure spawner is active with long duration
                if (spawner.Duration <= 0.1) {
                    spawner.Duration = 10.0; // Give it a long duration while moving
                }
            } else {
                // Entity stopped moving - gradually reduce duration to stop spawning
                spawner.Duration = Math.max(0, spawner.Duration - delta * 5.0); // Fade out over 0.2 seconds
            }
        }
    }
}

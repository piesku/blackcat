import {destroy_all} from "../components/com_children.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Health;

/**
 * Clean up dead entities, respecting victory/defeat delay periods.
 * This system runs after sys_duel_manager to ensure DuelEndData is set before cleanup.
 */
export function sys_cleanup_dead(game: Game, _delta: number) {
    // Only clean up dead entities if no duel end delay is active
    // During victory/defeat delays, preserve dead entities for visual feedback
    if (game.DuelEndData) {
        return; // Preserve all entities during delay period
    }

    // Find and destroy all dead entities
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let health = game.World.Health[entity];

            if (!health.IsAlive) {
                console.log(`[CLEANUP] Destroying dead entity ${entity}`);
                destroy_all(game.World, entity);
            }
        }
    }
}

import {instantiate} from "../../lib/game.js";
import {vec2_length} from "../../lib/vec2.js";
import {blueprint_explosion} from "../blueprints/blu_explosion.js";
import {MortarBehavior} from "../components/com_mortar_behavior.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.MortarBehavior | Has.LocalTransform2D | Has.RigidBody2D | Has.Collide2D;

export function sys_mortar(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let mortar = game.World.MortarBehavior[entity];
            let transform = game.World.LocalTransform2D[entity];
            let rigid_body = game.World.RigidBody2D[entity];
            let collider = game.World.Collide2D[entity];

            if (!mortar || !transform || !rigid_body || !collider) continue;

            // Update flight time (domain-specific logic)
            mortar.FlightTime += delta;

            // Check if mortar shell should explode
            let distance_to_target = vec2_length([
                transform.Translation[0] - mortar.TargetPosition[0],
                transform.Translation[1] - mortar.TargetPosition[1],
            ]);

            let hit_something =
                collider.Collisions.length > 0 &&
                // TODO Position the mortar such that this isn't necessary
                collider.Collisions.some((collision) => collision.Other !== mortar.Source);

            let should_explode =
                hit_something ||
                mortar.FlightTime >= mortar.TimeToTarget ||
                distance_to_target < 0.5;

            if (should_explode) {
                explode_mortar_shell(game, entity, mortar);
            }
        }
    }
}

function explode_mortar_shell(game: Game, entity: number, mortar: MortarBehavior) {
    let transform = game.World.LocalTransform2D[entity];
    DEBUG: if (!transform) throw new Error("missing component");

    let [x, y] = transform.Translation;
    console.log(`[MORTAR] Mortar shell ${entity} exploding at (${x.toFixed(2)}, ${y.toFixed(2)})`);

    // Create explosion with debris particles
    instantiate(
        game,
        blueprint_explosion(
            [x, y],
            mortar.Damage * 2, // Explosion damage is higher
            2.0, // Large explosion radius
            0.5, // Brief explosion duration
        ),
    );

    // Destroy the mortar shell
    game.World.Signature[entity] = 0;
}

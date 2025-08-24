import {instantiate} from "../../lib/game.js";
import {vec2_length} from "../../lib/vec2.js";
import {blueprint_fire_zone} from "../blueprints/blu_fire_zone.js";
import {GrenadeBehavior} from "../components/com_grenade_behavior.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.GrenadeBehavior | Has.LocalTransform2D | Has.RigidBody2D;

export function sys_grenade(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let grenade = game.World.GrenadeBehavior[entity];
            let transform = game.World.LocalTransform2D[entity];
            let rigid_body = game.World.RigidBody2D[entity];

            if (!grenade || !transform || !rigid_body) continue;

            // Update flight time (domain-specific logic)
            grenade.FlightTime += delta;

            // Check if grenade should explode
            let distance_to_target = vec2_length([
                transform.Translation[0] - grenade.TargetPosition[0],
                transform.Translation[1] - grenade.TargetPosition[1],
            ]);

            let should_explode =
                grenade.FlightTime >= grenade.TimeToTarget || distance_to_target < 0.5;

            if (should_explode) {
                explode_grenade(game, entity, grenade);
            }
        }
    }
}

function explode_grenade(game: Game, grenade_entity: number, grenade: GrenadeBehavior) {
    let transform = game.World.LocalTransform2D[grenade_entity];
    DEBUG: if (!transform) throw new Error("missing component");

    console.log(
        `[GRENADE] Grenade ${grenade_entity} exploding at (${transform.Translation[0].toFixed(2)}, ${transform.Translation[1].toFixed(2)})`,
    );

    // Create explosion area (reuse fire zone with different visual)
    let explosion_entity = instantiate(
        game,
        blueprint_fire_zone(
            game,
            grenade.Damage * 2, // Explosion damage is higher
            2.0, // Large explosion radius
            0.5, // Brief explosion duration
        ),
    );

    // Set explosion position
    let explosion_transform = game.World.LocalTransform2D[explosion_entity];
    if (explosion_transform) {
        explosion_transform.Translation[0] = transform.Translation[0];
        explosion_transform.Translation[1] = transform.Translation[1];
    }

    // Destroy the grenade
    game.World.Signature[grenade_entity] = 0;

    // TODO: Add explosive screen shake and particle effects
}

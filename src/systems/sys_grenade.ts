import {instantiate} from "../../lib/game.js";
import {vec2_length, vec2_subtract} from "../../lib/vec2.js";
import {blueprint_fire_zone} from "../scenes/blu_fire_zone.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.GrenadeBehavior | Has.LocalTransform2D | Has.ControlAlways2D;

export function sys_grenade(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let grenade = game.World.GrenadeBehavior[entity];
            let transform = game.World.LocalTransform2D[entity];
            let control = game.World.ControlAlways2D[entity];

            if (!grenade || !transform || !control) continue;

            // Update flight time
            grenade.FlightTime += delta;

            // Calculate current position using parabolic trajectory
            let t = grenade.FlightTime;
            let velocity_x = grenade.InitialVelocity[0];
            let velocity_y = grenade.InitialVelocity[1] - grenade.Gravity * t;

            // Update control direction to follow trajectory
            if (control.Direction) {
                control.Direction[0] = velocity_x;
                control.Direction[1] = velocity_y;
            }

            // Check if grenade should explode (reached target time or position)
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

function explode_grenade(game: Game, grenade_entity: number, grenade: any) {
    let transform = game.World.LocalTransform2D[grenade_entity];
    if (!transform) return;

    console.log(
        `[GRENADE] Grenade ${grenade_entity} exploding at (${transform.Translation[0].toFixed(2)}, ${transform.Translation[1].toFixed(2)})`,
    );

    // Create explosion area (reuse fire zone with different visual)
    let explosion_entity = instantiate(
        game,
        blueprint_fire_zone(
            game,
            grenade.Damage * 2, // Explosion damage is higher
            3.0, // Large explosion radius
            0.5, // Brief explosion duration
            grenade.Source, // Original attacker
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

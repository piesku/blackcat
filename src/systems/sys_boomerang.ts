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

            DEBUG: if (!boomerang || !transform || !control || !collider)
                throw new Error("missing component");

            // Damage is now handled by sys_damage_dealer via DamageDealer component

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

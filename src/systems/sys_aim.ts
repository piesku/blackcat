import {RAD_TO_DEG, Vec2} from "../../lib/math.js";
import {vec2_length, vec2_normalize, vec2_subtract} from "../../lib/vec2.js";
import {query_down} from "../components/com_children.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Aim | Has.LocalTransform2D | Has.Children;
const QUERY_TARGET = Has.Health | Has.LocalTransform2D | Has.ControlAi;

export function sys_aim(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let aim = game.World.Aim[entity];
            let transform = game.World.LocalTransform2D[entity];
            DEBUG: if (!aim || !transform) throw new Error("missing component");

            aim.SinceLastUpdate += delta;

            // Check if it's time to update target or if current target is invalid
            let should_update = aim.SinceLastUpdate >= aim.UpdateInterval;
            let target_invalid = !is_target_valid(game, aim.TargetEntity);

            if (should_update || target_invalid) {
                aim.SinceLastUpdate = 0;
                aim.TargetEntity = find_nearest_enemy(game, entity);
            }

            // Update distance and direction to current target
            if (aim.TargetEntity !== -1 && is_target_valid(game, aim.TargetEntity)) {
                let target_transform = game.World.LocalTransform2D[aim.TargetEntity];
                if (target_transform) {
                    let to_target: Vec2 = [0, 0];
                    vec2_subtract(to_target, target_transform.Translation, transform.Translation);
                    aim.DistanceToTarget = vec2_length(to_target);

                    if (aim.DistanceToTarget > 0.01) {
                        vec2_normalize(aim.DirectionToTarget, to_target);

                        // Calculate rotation in degrees
                        aim.RotationToTarget =
                            Math.atan2(aim.DirectionToTarget[1], aim.DirectionToTarget[0]) *
                            RAD_TO_DEG;

                        // Flip the body sprite to face the target
                        flip_body_sprite_to_target(game, entity, aim.DirectionToTarget);
                    } else {
                        aim.DirectionToTarget[0] = 0;
                        aim.DirectionToTarget[1] = 0;
                        aim.RotationToTarget = 0;
                    }
                }
            } else {
                // No valid target
                aim.TargetEntity = -1;
                aim.DistanceToTarget = Infinity;
                aim.DirectionToTarget[0] = 0;
                aim.DirectionToTarget[1] = 0;
                aim.RotationToTarget = 0;
            }
        }
    }
}

function is_target_valid(game: Game, target_entity: number): boolean {
    if (target_entity === -1) return false;
    return (game.World.Signature[target_entity] & QUERY_TARGET) === QUERY_TARGET;
}

function find_nearest_enemy(game: Game, entity: number): number {
    let transform = game.World.LocalTransform2D[entity];
    if (!transform) return -1;

    let my_ai = game.World.ControlAi[entity];

    let nearest_entity = -1;
    let nearest_distance = Infinity;

    for (let other = 0; other < game.World.Signature.length; other++) {
        if (other === entity) continue;
        if (!is_target_valid(game, other)) continue;

        // Skip entities on the same team
        let other_ai = game.World.ControlAi[other];
        if (other_ai && other_ai.IsPlayer === my_ai.IsPlayer) {
            // Same team!
            continue;
        }

        let other_transform = game.World.LocalTransform2D[other];
        let distance_vec: Vec2 = [0, 0];
        vec2_subtract(distance_vec, other_transform.Translation, transform.Translation);
        let distance = vec2_length(distance_vec);

        if (distance < nearest_distance) {
            nearest_distance = distance;
            nearest_entity = other;
        }
    }

    return nearest_entity;
}

function flip_body_sprite_to_target(game: Game, entity: number, direction_to_target: Vec2) {
    // Find the body sprite child (first child with Render2D component)
    let body_entity = -1;
    for (let child of query_down(game.World, entity, Has.Render2D)) {
        if (child !== entity) {
            // Skip the parent entity itself
            body_entity = child;
            break;
        }
    }

    if (body_entity === -1) return; // No body sprite found

    let body_transform = game.World.LocalTransform2D[body_entity];
    if (!body_transform) return;

    // Flip the body sprite based on target direction
    // If target is to the left (negative x), flip the sprite (negative scale)
    // If target is to the right (positive x), don't flip (positive scale)
    let should_flip = direction_to_target[0] < 0;
    let new_scale_x = should_flip ? -1 : 1;

    // Only update if the scale changed to avoid unnecessary dirty marking
    if (body_transform.Scale[0] !== new_scale_x) {
        body_transform.Scale[0] = new_scale_x;
        game.World.Signature[body_entity] |= Has.Dirty;
    }
}

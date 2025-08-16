import {Vec2} from "../../lib/math.js";
import {vec2_add, vec2_length, vec2_normalize, vec2_scale, vec2_subtract} from "../../lib/vec2.js";
import {AIFighter, AIState} from "../components/com_ai_fighter.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.AIFighter | Has.LocalTransform2D | Has.Health | Has.Move2D;
// Base distances that scale with movement speed
const BASE_CIRCLE_DISTANCE = 2.0; // Wider circling for dramatic buildup
const BASE_DASH_TRIGGER_DISTANCE = 2.5; // Start considering dash attacks within this range
const BASE_DASH_TARGET_DISTANCE = 0.8; // Dash to this close distance
const BASE_RETREAT_DISTANCE = 4.0;
const LOW_HEALTH_THRESHOLD = 1;
const BASE_DASH_SPEED_MULTIPLIER = 3.0; // How much faster dash movement is
const BASE_MOVE_SPEED = 2.0; // Reference speed for scaling calculations

export function sys_ai_fighter(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let ai = game.World.AIFighter[entity];
            let transform = game.World.LocalTransform2D[entity];
            let health = game.World.Health[entity];
            let move = game.World.Move2D[entity];

            if (!health.IsAlive || !move) continue;

            // Calculate speed scaling factor for distance thresholds
            let speed_scale = move.MoveSpeed / BASE_MOVE_SPEED;
            let scaled_distances = {
                circle: BASE_CIRCLE_DISTANCE * speed_scale,
                dash_trigger: BASE_DASH_TRIGGER_DISTANCE * speed_scale,
                dash_target: BASE_DASH_TARGET_DISTANCE * speed_scale,
                retreat: BASE_RETREAT_DISTANCE * speed_scale,
            };

            // Find target if we don't have one, or if current target is dead
            if (ai.TargetEntity === -1 || !is_target_valid(game, ai.TargetEntity)) {
                ai.TargetEntity = find_nearest_enemy(game, entity);
                if (ai.TargetEntity === -1) {
                    // No valid targets - stop moving completely (prepare for victory animation)
                    if (ai.State === AIState.Attacking) {
                        change_state(ai, AIState.Circling, game.Time);
                    }
                    // Stop all movement when victorious
                    let move = game.World.Move2D[entity];
                    if (move) {
                        move.Direction[0] = 0;
                        move.Direction[1] = 0;
                        game.World.Signature[entity] |= Has.Dirty;
                    }
                    continue;
                }
            }

            let target_transform = game.World.LocalTransform2D[ai.TargetEntity];
            if (!target_transform) continue;

            // Calculate distance to target
            let to_target: Vec2 = [0, 0];
            vec2_subtract(to_target, target_transform.Translation, transform.Translation);
            let distance = vec2_length(to_target);

            // Check if target is retreating (moving away from us)
            let target_move = game.World.Move2D[ai.TargetEntity];
            let is_target_retreating = false;
            if (target_move && (target_move.Direction[0] !== 0 || target_move.Direction[1] !== 0)) {
                // Calculate target's movement direction relative to us
                let target_movement: Vec2 = [target_move.Direction[0], target_move.Direction[1]];
                let dot_product =
                    target_movement[0] * to_target[0] + target_movement[1] * to_target[1];
                // If dot product is negative, target is moving away from us
                is_target_retreating = dot_product < -0.3; // Threshold to avoid false positives
            }

            // Update AI state based on conditions
            update_ai_state(
                game,
                entity,
                distance,
                delta,
                scaled_distances,
                speed_scale,
                is_target_retreating,
            );

            // Execute behavior based on current state
            let movement: Vec2 = [0, 0];
            switch (ai.State) {
                case AIState.Circling:
                    circle_movement(
                        movement,
                        to_target,
                        distance,
                        ai.CircleDirection,
                        scaled_distances.circle,
                    );
                    break;
                case AIState.Pursuing:
                    // Move directly toward retreating target - aggressive pursuit!
                    vec2_normalize(movement, to_target);
                    vec2_scale(movement, movement, 1.2); // Slightly faster than normal movement
                    break;
                case AIState.Attacking:
                    attack_movement(movement, to_target, speed_scale);
                    break;
                case AIState.Retreating:
                    retreat_movement(movement, to_target);
                    break;
                case AIState.Stunned:
                    // No movement when stunned
                    break;
            }

            // Apply movement directly to Move2D component
            if (move) {
                move.Direction[0] = movement[0];
                move.Direction[1] = movement[1];
                // Mark entity as dirty since we modified its movement
                game.World.Signature[entity] |= Has.Dirty;
            }
        }
    }
}

function is_target_valid(game: Game, target_entity: number): boolean {
    if (target_entity === -1) return false;
    if (!(game.World.Signature[target_entity] & Has.Health)) return false;

    let target_health = game.World.Health[target_entity];
    return target_health && target_health.IsAlive;
}

function find_nearest_enemy(game: Game, entity: number): number {
    let transform = game.World.LocalTransform2D[entity];
    let nearest_entity = -1;
    let nearest_distance = Infinity;

    for (let other = 0; other < game.World.Signature.length; other++) {
        if (other === entity) continue;
        if (!is_target_valid(game, other)) continue;
        if (!(game.World.Signature[other] & Has.LocalTransform2D)) continue;

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

function update_ai_state(
    game: Game,
    entity: number,
    distance: number,
    delta: number,
    scaled_distances: any,
    speed_scale: number,
    is_target_retreating: boolean,
) {
    let ai = game.World.AIFighter[entity];
    let health = game.World.Health[entity];

    ai.StateTimer += delta;
    ai.AttackCooldown = Math.max(0, ai.AttackCooldown - delta);

    // Scale time-based durations inversely with speed to maintain consistent behavior
    let time_scale = 1.0 / Math.sqrt(speed_scale); // Square root to moderate the scaling

    // Check for low health -> retreat
    if (health.Current <= LOW_HEALTH_THRESHOLD && ai.State !== AIState.Retreating) {
        change_state(ai, AIState.Retreating, game.Time);
        return;
    }

    // Check for recent damage -> stunned briefly
    if (game.Time - health.LastDamageTime < 0.3 * time_scale && ai.State !== AIState.Stunned) {
        change_state(ai, AIState.Stunned, game.Time);
        return;
    }

    switch (ai.State) {
        case AIState.Circling:
            // If target is retreating, switch to pursuing state
            if (is_target_retreating) {
                console.log(
                    `[AI] Entity entering PURSUING state for retreating target at distance ${distance.toFixed(2)}`,
                );
                change_state(ai, AIState.Pursuing, game.Time);
            }
            // Normal dash attack trigger: within range, cooldown ready, and random chance
            else if (
                distance < scaled_distances.dash_trigger &&
                ai.AttackCooldown <= 0 &&
                Math.random() < 0.3
            ) {
                console.log(
                    `[AI] Entity initiating DASH ATTACK at distance ${distance.toFixed(2)} (trigger: ${scaled_distances.dash_trigger.toFixed(2)})`,
                );
                change_state(ai, AIState.Attacking, game.Time);
                ai.AttackCooldown = (2.0 + Math.random() * 1.5) * time_scale; // Scale cooldown with speed
            }
            // Randomly change circle direction for dynamic movement
            else if (
                ai.StateTimer > (1.0 + Math.random() * 1.5) * time_scale &&
                Math.random() < 0.5
            ) {
                ai.CircleDirection *= -1;
                ai.StateTimer = 0;
                console.log(`[AI] Entity changing circle direction`);
            }
            break;

        case AIState.Pursuing:
            // Attack immediately when close enough
            if (distance < scaled_distances.dash_trigger && ai.AttackCooldown <= 0) {
                console.log(
                    `[AI] Entity attacking from PURSUING state at distance ${distance.toFixed(2)}`,
                );
                change_state(ai, AIState.Attacking, game.Time);
                ai.AttackCooldown = (1.0 + Math.random() * 0.5) * time_scale; // Shorter cooldown for pursued targets
            }
            // Return to circling if target stops retreating
            else if (!is_target_retreating) {
                console.log(`[AI] Target stopped retreating, returning to circling`);
                change_state(ai, AIState.Circling, game.Time);
            }
            break;

        case AIState.Attacking:
            // Stop attacking after dash duration (scaled) or if target moved away
            let attack_duration = 1.2 * time_scale;
            if (ai.StateTimer > attack_duration || distance > scaled_distances.dash_trigger) {
                console.log(
                    `[AI] Entity ending dash attack (timer: ${ai.StateTimer.toFixed(2)}, duration: ${attack_duration.toFixed(2)}, distance: ${distance.toFixed(2)})`,
                );
                change_state(ai, AIState.Circling, game.Time);
            }
            break;

        case AIState.Retreating:
            // Return to circling when at safe distance and health recovered
            if (distance > scaled_distances.retreat && health.Current > LOW_HEALTH_THRESHOLD) {
                change_state(ai, AIState.Circling, game.Time);
            }
            break;

        case AIState.Stunned:
            // Short stun duration (scaled)
            if (ai.StateTimer > 0.3 * time_scale) {
                change_state(ai, AIState.Circling, game.Time);
            }
            break;
    }
}

function change_state(ai: AIFighter, new_state: AIState, time: number) {
    let old_state_name = getAIStateName(ai.State);
    let new_state_name = getAIStateName(new_state);

    console.log(`[AI] State change: ${old_state_name} -> ${new_state_name}`);

    ai.State = new_state;
    ai.LastStateChange = time;
    ai.StateTimer = 0;
}

function getAIStateName(state: AIState): string {
    switch (state) {
        case AIState.Circling:
            return "Circling";
        case AIState.Pursuing:
            return "Pursuing";
        case AIState.Attacking:
            return "Attacking";
        case AIState.Retreating:
            return "Retreating";
        case AIState.Stunned:
            return "Stunned";
        default:
            return "Unknown";
    }
}

function circle_movement(
    out: Vec2,
    to_target: Vec2,
    distance: number,
    direction: number,
    circle_distance: number,
) {
    if (distance < 0.1) return;

    // Occasionally spiral inward for dramatic tension
    let target_distance = circle_distance;
    if (Math.random() < 0.15) {
        target_distance = circle_distance * 0.7; // Get closer but not too close
        console.log(`[AI] Spiraling inward to distance ${target_distance.toFixed(2)}`);
    }

    let distance_factor = (distance - target_distance) / target_distance;

    // Normalize to_target
    let normalized: Vec2 = [0, 0];
    vec2_normalize(normalized, to_target);

    // Create perpendicular vector for circling
    let perpendicular: Vec2 = [-normalized[1] * direction, normalized[0] * direction];

    // Combine radial and tangential movement with stronger inward bias
    vec2_scale(normalized, normalized, distance_factor * 0.7); // Stronger radial component
    vec2_scale(perpendicular, perpendicular, 0.6); // Weaker tangential component

    vec2_add(out, normalized, perpendicular);
    vec2_normalize(out, out);
}

function attack_movement(out: Vec2, to_target: Vec2, speed_scale: number) {
    // DASH directly toward target at high speed
    vec2_normalize(out, to_target);
    // Cap the dash speed multiplier to prevent overshooting at high base speeds
    let effective_multiplier = Math.min(
        BASE_DASH_SPEED_MULTIPLIER,
        BASE_DASH_SPEED_MULTIPLIER / Math.sqrt(speed_scale),
    );
    vec2_scale(out, out, effective_multiplier);
}

function retreat_movement(out: Vec2, to_target: Vec2) {
    // Move away from target
    vec2_normalize(out, to_target);
    vec2_scale(out, out, -1);
}

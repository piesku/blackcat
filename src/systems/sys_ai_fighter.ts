import {Vec2} from "../../lib/math.js";
import {vec2_add, vec2_length, vec2_normalize, vec2_scale, vec2_subtract} from "../../lib/vec2.js";
import {AIState} from "../components/com_ai_fighter.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.AIFighter | Has.LocalTransform2D | Has.Health | Has.Move2D;
const CIRCLE_DISTANCE = 2.0;        // Wider circling for dramatic buildup
const DASH_TRIGGER_DISTANCE = 2.5;  // Start considering dash attacks within this range
const DASH_TARGET_DISTANCE = 0.8;   // Dash to this close distance  
const RETREAT_DISTANCE = 4.0;
const LOW_HEALTH_THRESHOLD = 1;
const DASH_SPEED_MULTIPLIER = 3.0;   // How much faster dash movement is

export function sys_ai_fighter(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let ai = game.World.AIFighter[entity];
            let transform = game.World.LocalTransform2D[entity];
            let health = game.World.Health[entity];

            if (!health.IsAlive) continue;

            // Find target if we don't have one
            if (ai.TargetEntity === -1) {
                ai.TargetEntity = find_nearest_enemy(game, entity);
                if (ai.TargetEntity === -1) continue;
            }

            let target_transform = game.World.LocalTransform2D[ai.TargetEntity];
            if (!target_transform) continue;

            // Calculate distance to target
            let to_target: Vec2 = [0, 0];
            vec2_subtract(to_target, target_transform.Translation, transform.Translation);
            let distance = vec2_length(to_target);

            // Update AI state based on conditions
            update_ai_state(game, entity, distance, delta);

            // Execute behavior based on current state
            let movement: Vec2 = [0, 0];
            switch (ai.State) {
                case AIState.Circling:
                    circle_movement(movement, to_target, distance, ai.CircleDirection);
                    break;
                case AIState.Attacking:
                    attack_movement(movement, to_target);
                    break;
                case AIState.Retreating:
                    retreat_movement(movement, to_target);
                    break;
                case AIState.Stunned:
                    // No movement when stunned
                    break;
            }

            // Apply movement directly to Move2D component
            let move = game.World.Move2D[entity];
            if (move) {
                move.Direction[0] = movement[0];
                move.Direction[1] = movement[1];
                // Mark entity as dirty since we modified its movement
                game.World.Signature[entity] |= Has.Dirty;
            }
        }
    }
}

function find_nearest_enemy(game: Game, entity: number): number {
    let transform = game.World.LocalTransform2D[entity];
    let nearest_entity = -1;
    let nearest_distance = Infinity;

    for (let other = 0; other < game.World.Signature.length; other++) {
        if (other === entity) continue;
        if (!(game.World.Signature[other] & Has.Health)) continue;
        if (!(game.World.Signature[other] & Has.LocalTransform2D)) continue;

        let other_health = game.World.Health[other];
        if (!other_health.IsAlive) continue;

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

function update_ai_state(game: Game, entity: number, distance: number, delta: number) {
    let ai = game.World.AIFighter[entity];
    let health = game.World.Health[entity];

    ai.StateTimer += delta;
    ai.AttackCooldown = Math.max(0, ai.AttackCooldown - delta);

    // Check for low health -> retreat
    if (health.Current <= LOW_HEALTH_THRESHOLD && ai.State !== AIState.Retreating) {
        change_state(ai, AIState.Retreating, game.Running);
        return;
    }

    // Check for recent damage -> stunned briefly
    if (game.Running - health.LastDamageTime < 0.3 && ai.State !== AIState.Stunned) {
        change_state(ai, AIState.Stunned, game.Running);
        return;
    }

    switch (ai.State) {
        case AIState.Circling:
            // Dash attack trigger: within range, cooldown ready, and random chance
            if (distance < DASH_TRIGGER_DISTANCE && ai.AttackCooldown <= 0 && Math.random() < 0.3) {
                console.log(`[AI] Entity initiating DASH ATTACK at distance ${distance.toFixed(2)}`);
                change_state(ai, AIState.Attacking, game.Running);
                ai.AttackCooldown = 2.0 + Math.random() * 1.5; // 2-3.5 second cooldown
            }
            // Randomly change circle direction for dynamic movement
            else if (ai.StateTimer > (1.0 + Math.random() * 1.5) && Math.random() < 0.5) {
                ai.CircleDirection *= -1;
                ai.StateTimer = 0;
                console.log(`[AI] Entity changing circle direction`);
            }
            break;

        case AIState.Attacking:
            // Stop attacking after dash duration or if target moved away
            if (ai.StateTimer > 1.2 || distance > DASH_TRIGGER_DISTANCE) {
                console.log(`[AI] Entity ending dash attack (timer: ${ai.StateTimer.toFixed(2)}, distance: ${distance.toFixed(2)})`);
                change_state(ai, AIState.Circling, game.Running);
            }
            break;

        case AIState.Retreating:
            // Return to circling when at safe distance and health recovered
            if (distance > RETREAT_DISTANCE && health.Current > LOW_HEALTH_THRESHOLD) {
                change_state(ai, AIState.Circling, game.Running);
            }
            break;

        case AIState.Stunned:
            // Short stun duration
            if (ai.StateTimer > 0.3) {
                change_state(ai, AIState.Circling, game.Running);
            }
            break;
    }
}

function change_state(ai: any, new_state: AIState, time: number) {
    let old_state_name = getAIStateName(ai.State);
    let new_state_name = getAIStateName(new_state);
    
    console.log(`[AI] State change: ${old_state_name} -> ${new_state_name}`);
    
    ai.State = new_state;
    ai.LastStateChange = time;
    ai.StateTimer = 0;
}

function getAIStateName(state: AIState): string {
    switch (state) {
        case AIState.Circling: return "Circling";
        case AIState.Attacking: return "Attacking";
        case AIState.Retreating: return "Retreating";
        case AIState.Stunned: return "Stunned";
        default: return "Unknown";
    }
}

function circle_movement(out: Vec2, to_target: Vec2, distance: number, direction: number) {
    if (distance < 0.1) return;

    // Occasionally spiral inward for dramatic tension
    let target_distance = CIRCLE_DISTANCE;
    if (Math.random() < 0.15) {
        target_distance = CIRCLE_DISTANCE * 0.7; // Get closer but not too close
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

function attack_movement(out: Vec2, to_target: Vec2) {
    // DASH directly toward target at high speed
    vec2_normalize(out, to_target);
    vec2_scale(out, out, DASH_SPEED_MULTIPLIER); // Much faster than normal movement
}

function retreat_movement(out: Vec2, to_target: Vec2) {
    // Move away from target
    vec2_normalize(out, to_target);
    vec2_scale(out, out, -1);
}

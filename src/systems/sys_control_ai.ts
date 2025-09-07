import {Vec2} from "../../lib/math.js";
import {float} from "../../lib/random.js";
import {vec2_add, vec2_length, vec2_normalize, vec2_scale, vec2_subtract} from "../../lib/vec2.js";
import {AbilityType, has_ability} from "../components/com_abilities.js";
import {AiState, ControlAi} from "../components/com_control_ai.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.ControlAi | Has.LocalTransform2D | Has.Health | Has.Move2D | Has.Aim;
// Enhanced AI parameters for more dramatic combat
const BASE_CIRCLE_DISTANCE = 2.5; // Wider circling for dramatic buildup
const BASE_DASH_TRIGGER_DISTANCE = 4.5; // Much longer range for dramatic dash attacks
const BASE_DASH_TARGET_DISTANCE = 0.6; // Dash closer for impact
const BASE_RETREAT_DISTANCE = 5.0; // Longer retreat distance
const BASE_SEPARATION_DISTANCE = 1.2; // Minimum separation to prevent lock-ins
const LOW_HEALTH_THRESHOLD = 1;
const BASE_DASH_SPEED_MULTIPLIER = 4.0; // Higher speed for more dramatic dashes
const BASE_PREPARE_DURATION = 0.8; // Wind-up time for dash attacks
const BASE_MOVE_SPEED = 2.0; // Reference speed for scaling calculations

interface ScaledDistances {
    circle: number;
    dash_trigger: number;
    dash_target: number;
    retreat: number;
    separation: number;
}

export function sys_control_ai(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let ai = game.World.ControlAi[entity];
            let health = game.World.Health[entity];
            let move = game.World.Move2D[entity];
            let aim = game.World.Aim[entity];

            if (!health.IsAlive || !move || !aim) continue;

            // Player entities use the same AI movement logic as opponents
            // Their speed is controlled by the energy system in sys_control_player

            // Calculate speed scaling factor for distance thresholds
            let speed_scale = move.MoveSpeed / BASE_MOVE_SPEED;

            // Check for Dash Master ability (+100% dash range)
            let dash_range = BASE_DASH_TRIGGER_DISTANCE;
            if (has_ability(game, entity, AbilityType.DashMaster)) {
                dash_range *= 2.0;
            }
            // Apply trait-based dash range multiplier (Brawler reduces range)
            if (ai.DashRangeMultiplier) {
                dash_range *= ai.DashRangeMultiplier;
            }

            let scaled_distances = {
                circle: BASE_CIRCLE_DISTANCE * speed_scale,
                dash_trigger: dash_range * speed_scale * ai.Aggressiveness,
                dash_target: BASE_DASH_TARGET_DISTANCE * speed_scale,
                retreat: BASE_RETREAT_DISTANCE * speed_scale,
                separation: BASE_SEPARATION_DISTANCE * speed_scale,
            };

            // Use target from Aim component
            if (aim.TargetEntity === -1) {
                // No valid targets - stop moving completely (prepare for victory animation)
                if (ai.State === AiState.Dashing) {
                    change_state(ai, AiState.Circling, game.Time);
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

            let target_transform = game.World.LocalTransform2D[aim.TargetEntity];
            if (!target_transform) continue;

            // Calculate separation force to prevent collision lock-ins
            calculate_separation_force(
                game,
                entity,
                ai,
                scaled_distances.separation || BASE_SEPARATION_DISTANCE * speed_scale,
            );

            // Check if target is retreating (moving away from us)
            let target_move = game.World.Move2D[aim.TargetEntity];
            let is_target_retreating = false;
            if (target_move && (target_move.Direction[0] !== 0 || target_move.Direction[1] !== 0)) {
                // Calculate target's movement direction relative to us
                let target_movement: Vec2 = [target_move.Direction[0], target_move.Direction[1]];
                let dot_product =
                    target_movement[0] * aim.DirectionToTarget[0] +
                    target_movement[1] * aim.DirectionToTarget[1];
                // If dot product is negative, target is moving away from us
                is_target_retreating = dot_product < -0.3; // Threshold to avoid false positives
            }

            // Update AI state based on conditions
            update_ai_state(
                game,
                entity,
                delta,
                scaled_distances,
                speed_scale,
                is_target_retreating,
            );

            // Execute behavior based on current state
            let movement: Vec2 = [0, 0];
            switch (ai.State) {
                case AiState.Circling:
                    // Check if target is separating and adjust movement accordingly
                    let target_ai = game.World.ControlAi[aim.TargetEntity];
                    let target_separating = target_ai && target_ai.State === AiState.Separating;

                    circle_movement(
                        movement,
                        aim.DirectionToTarget,
                        aim.DistanceToTarget,
                        ai.CircleDirection,
                        scaled_distances.circle,
                        ai.SeparationForce,
                        target_separating,
                    );
                    break;
                case AiState.Preparing:
                    prepare_movement(
                        movement,
                        ai.PrepareDirection,
                        ai.StateTimer,
                        BASE_PREPARE_DURATION * (1.0 / Math.sqrt(speed_scale)),
                    );
                    break;
                case AiState.Pursuing:
                    // Move directly toward retreating target - aggressive pursuit!
                    vec2_normalize(movement, aim.DirectionToTarget);
                    vec2_scale(movement, movement, 1.2 * ai.Aggressiveness); // Personality affects pursuit speed
                    break;
                case AiState.Dashing:
                    attack_movement(
                        movement,
                        aim.DirectionToTarget,
                        speed_scale,
                        ai.Aggressiveness,
                        ai.DashSpeedMultiplier,
                    );
                    break;
                case AiState.Retreating:
                    retreat_movement(movement, aim.DirectionToTarget, ai.SeparationForce);
                    break;
                case AiState.Separating:
                    separation_movement(movement, ai.SeparationForce);
                    break;
                case AiState.Stunned:
                    // No movement when stunned
                    break;
            }

            // Apply movement directly to Move2D component
            if (move) {
                move.Direction[0] = movement[0];
                move.Direction[1] = movement[1];

                // Scale movement speed based on AI energy, smoothing out extreme values.
                // For opponent fighters, energy is pre-set and constant.
                move.MoveSpeed = ai.BaseMoveSpeed * Math.sqrt(ai.Energy);

                // Apply berserker mode speed bonus when at low health
                if (
                    ai.BerserkerMode &&
                    health.Current / health.Max <= ai.BerserkerMode.LowHealthThreshold
                ) {
                    move.MoveSpeed *= ai.BerserkerMode.SpeedBonus;
                }

                // Mark entity as dirty since we modified its movement
                game.World.Signature[entity] |= Has.Dirty;
            }
        }
    }
}

function update_ai_state(
    game: Game,
    entity: number,
    delta: number,
    scaled_distances: ScaledDistances,
    speed_scale: number,
    is_target_retreating: boolean,
) {
    let ai = game.World.ControlAi[entity];
    let health = game.World.Health[entity];
    let aim = game.World.Aim[entity];

    ai.StateTimer += delta;
    ai.AttackCooldown = Math.max(0, ai.AttackCooldown - delta);

    // Scale time-based durations inversely with speed to maintain consistent behavior
    let time_scale = 1.0 / Math.sqrt(speed_scale); // Square root to moderate the scaling

    // Use trait-based retreat threshold (Cautious trait can increase it)
    let retreat_threshold = ai.RetreatHealthThreshold || LOW_HEALTH_THRESHOLD;

    // Reset retreat flag when health recovers
    if (health.Current > retreat_threshold) {
        ai.HasRetreatedAtLowHealth = false;
    }

    // Check for low health -> retreat (only if haven't retreated yet at this health level)
    if (
        health.Current <= retreat_threshold &&
        ai.State !== AiState.Retreating &&
        !ai.HasRetreatedAtLowHealth
    ) {
        ai.HasRetreatedAtLowHealth = true; // Mark that we've retreated at this health level
        change_state(ai, AiState.Retreating, game.Time);
        return;
    }

    // Check for recent damage -> stunned briefly
    if (game.Time - health.LastDamageTime < 0.3 * time_scale && ai.State !== AiState.Stunned) {
        change_state(ai, AiState.Stunned, game.Time);
        return;
    }

    switch (ai.State) {
        case AiState.Circling:
            // Check if too close - force separation (but only for higher entity ID to avoid both separating)
            if (aim.DistanceToTarget < scaled_distances.separation) {
                let target_ai = game.World.ControlAi[aim.TargetEntity];
                if (target_ai && target_ai.State === AiState.Separating) {
                    // Target is already separating, stay in circling but move away
                    console.log(`[AI] Entity staying in circling while target separates`);
                } else if (entity > aim.TargetEntity) {
                    // Only higher entity ID separates to avoid both separating
                    change_state(ai, AiState.Separating, game.Time);
                } else {
                    // Lower entity ID continues circling but with stronger separation bias
                    console.log(
                        `[AI] Entity ${entity} yielding separation to higher priority entity ${aim.TargetEntity}`,
                    );
                }
            }
            // If target is retreating, switch to pursuing state
            else if (is_target_retreating) {
                console.log(
                    `[AI] Entity entering PURSUING state for retreating target at distance ${aim.DistanceToTarget.toFixed(2)}`,
                );
                change_state(ai, AiState.Pursuing, game.Time);
            }
            // Enhanced dash attack trigger: longer range, personality-based timing
            else if (
                aim.DistanceToTarget < scaled_distances.dash_trigger &&
                ai.AttackCooldown <= 0 &&
                ai.StateTimer > ai.Patience * time_scale &&
                float(0, 1) < 0.2 * ai.Aggressiveness
            ) {
                // Store attack direction and enter preparing state
                ai.PrepareDirection[0] = aim.DirectionToTarget[0];
                ai.PrepareDirection[1] = aim.DirectionToTarget[1];
                vec2_normalize(ai.PrepareDirection, ai.PrepareDirection);
                console.log(
                    `[AI] Entity PREPARING DASH ATTACK at distance ${aim.DistanceToTarget.toFixed(2)} (trigger: ${scaled_distances.dash_trigger.toFixed(2)})`,
                );
                change_state(ai, AiState.Preparing, game.Time);
                ai.AttackCooldown = (1.5 + float(0, 2.0)) * time_scale * ai.Patience;
            }
            // Personality-based circle direction changes
            else if (ai.StateTimer > ai.Patience * time_scale && float(0, 1) < 0.4) {
                ai.CircleDirection *= -1;
                ai.StateTimer = 0;
                console.log(`[AI] Entity changing circle direction`);
            }
            break;

        case AiState.Pursuing:
            // Attack immediately when close enough
            if (aim.DistanceToTarget < scaled_distances.dash_trigger && ai.AttackCooldown <= 0) {
                console.log(
                    `[AI] Entity dashing from PURSUING state at distance ${aim.DistanceToTarget.toFixed(2)}`,
                );
                change_state(ai, AiState.Dashing, game.Time);
                ai.AttackCooldown = (1.0 + Math.random() * 0.5) * time_scale; // Shorter cooldown for pursued targets
            }
            // Return to circling if target stops retreating
            else if (!is_target_retreating) {
                console.log(`[AI] Target stopped retreating, returning to circling`);
                change_state(ai, AiState.Circling, game.Time);
            }
            break;

        case AiState.Preparing:
            // Complete preparation phase and launch attack
            let prepare_duration = (BASE_PREPARE_DURATION * time_scale) / ai.Aggressiveness;
            if (ai.StateTimer > prepare_duration) {
                console.log(
                    `[AI] Entity launching DASH ATTACK after ${prepare_duration.toFixed(2)}s preparation`,
                );
                change_state(ai, AiState.Dashing, game.Time);
            }
            break;

        case AiState.Dashing:
            // Longer, more dramatic dash duration
            let attack_duration = (1.5 + 0.5 * ai.Aggressiveness) * time_scale;
            if (
                ai.StateTimer > attack_duration ||
                aim.DistanceToTarget > scaled_distances.dash_trigger * 1.5
            ) {
                console.log(
                    `[AI] Entity ending dash attack (timer: ${ai.StateTimer.toFixed(2)}, duration: ${attack_duration.toFixed(2)}, distance: ${aim.DistanceToTarget.toFixed(2)})`,
                );
                change_state(ai, AiState.Circling, game.Time);
            }
            break;

        case AiState.Separating:
            // Return to circling when adequately separated OR after timeout
            let separation_timeout = 2.0 * time_scale; // Max 2 seconds in separating state
            if (
                aim.DistanceToTarget > scaled_distances.separation * 1.5 ||
                ai.StateTimer > separation_timeout
            ) {
                console.log(
                    `[AI] Entity returning to circling after separation (distance: ${aim.DistanceToTarget.toFixed(2)}, timer: ${ai.StateTimer.toFixed(2)})`,
                );
                change_state(ai, AiState.Circling, game.Time);
            }
            break;

        case AiState.Retreating:
            // Return to circling when at safe distance and health recovered, OR after timeout
            let retreat_timeout = 3.0 * time_scale; // Max 3 seconds in retreat to prevent stalemates
            if (
                (aim.DistanceToTarget > scaled_distances.retreat &&
                    health.Current > retreat_threshold) ||
                ai.StateTimer > retreat_timeout
            ) {
                if (ai.StateTimer > retreat_timeout) {
                    console.log(
                        `[AI] Entity ${entity} ending retreat due to timeout (${ai.StateTimer.toFixed(2)}s)`,
                    );
                }
                change_state(ai, AiState.Circling, game.Time);
            }
            break;

        case AiState.Stunned:
            // Short stun duration (scaled)
            if (ai.StateTimer > 0.3 * time_scale) {
                change_state(ai, AiState.Circling, game.Time);
            }
            break;
    }
}

function change_state(ai: ControlAi, new_state: AiState, time: number) {
    let old_state_name = getAIStateName(ai.State);
    let new_state_name = getAIStateName(new_state);

    console.log(`[AI] State change: ${old_state_name} -> ${new_state_name}`);

    ai.State = new_state;
    ai.LastStateChange = time;
    ai.StateTimer = 0;
}

function getAIStateName(state: AiState): string {
    switch (state) {
        case AiState.Circling:
            return "Circling";
        case AiState.Preparing:
            return "Preparing";
        case AiState.Pursuing:
            return "Pursuing";
        case AiState.Dashing:
            return "Dashing";
        case AiState.Retreating:
            return "Retreating";
        case AiState.Stunned:
            return "Stunned";
        case AiState.Separating:
            return "Separating";
        default:
            return "Unknown";
    }
}

function circle_movement(
    out: Vec2,
    to_target: Readonly<Vec2>,
    distance: number,
    direction: number,
    circle_distance: number,
    separation_force: Readonly<Vec2>,
    target_separating: boolean = false,
) {
    if (distance < 0.1) return;

    let target_distance = circle_distance;
    let distance_factor = (distance - target_distance) / target_distance;

    // Normalize to_target
    let normalized: Vec2 = [0, 0];
    vec2_normalize(normalized, to_target);

    // Create perpendicular vector for circling
    let perpendicular: Vec2 = [-normalized[1] * direction, normalized[0] * direction];

    if (target_separating) {
        // If target is separating, prioritize moving away (stronger radial outward movement)
        vec2_scale(normalized, normalized, Math.min(distance_factor * -1.2, -0.8)); // Move away strongly
        vec2_scale(perpendicular, perpendicular, 0.3); // Reduce circling
    } else {
        // Normal circling behavior
        vec2_scale(normalized, normalized, distance_factor * 0.6);
        vec2_scale(perpendicular, perpendicular, 0.7);
    }

    vec2_add(out, normalized, perpendicular);

    // Apply separation force to prevent collision lock-ins
    vec2_add(out, out, separation_force);

    vec2_normalize(out, out);
}

function attack_movement(
    out: Vec2,
    to_target: Readonly<Vec2>,
    speed_scale: number,
    aggressiveness: number,
    dash_speed_multiplier: number = 1,
) {
    // Enhanced DASH with higher speed and personality
    vec2_normalize(out, to_target);
    // Dramatic speed multiplier that scales with aggressiveness
    let effective_multiplier = BASE_DASH_SPEED_MULTIPLIER * aggressiveness;
    // Apply trait-based dash speed multiplier (Lightning Reflexes boost)
    effective_multiplier *= dash_speed_multiplier;
    // Less restrictive capping for more dramatic attacks
    effective_multiplier = Math.min(
        effective_multiplier,
        (BASE_DASH_SPEED_MULTIPLIER * 1.5) / Math.sqrt(speed_scale),
    );
    vec2_scale(out, out, effective_multiplier);
}

function retreat_movement(out: Vec2, to_target: Readonly<Vec2>, separation_force: Readonly<Vec2>) {
    // Move away from target with separation consideration
    vec2_normalize(out, to_target);
    vec2_scale(out, out, -0.8); // Slower retreat for strategic positioning

    // Add separation force for better collision avoidance
    vec2_add(out, out, separation_force);
    vec2_normalize(out, out);
}

function prepare_movement(
    out: Vec2,
    prepare_direction: Readonly<Vec2>,
    state_timer: number,
    prepare_duration: number,
) {
    // Slight movement during preparation (wind-up effect)
    let progress = Math.min(state_timer / prepare_duration, 1.0);
    let intensity = Math.sin(progress * Math.PI) * 0.3; // Oscillating movement

    vec2_scale(out, prepare_direction, intensity);
}

function separation_movement(out: Vec2, separation_force: Readonly<Vec2>) {
    // Move based on separation force, with fallback for zero force
    let force_length = vec2_length(separation_force);

    if (force_length > 0.01) {
        // Use separation force direction
        vec2_normalize(out, separation_force);
        vec2_scale(out, out, 1.5); // Strong separation movement
    } else {
        // Fallback: move in a random direction to break deadlock
        let angle = float(0, Math.PI * 2);
        out[0] = Math.cos(angle);
        out[1] = Math.sin(angle);
        vec2_scale(out, out, 1.2); // Moderate random movement
    }
}

function calculate_separation_force(
    game: Game,
    entity: number,
    ai: ControlAi,
    separation_distance: number,
) {
    ai.SeparationForce[0] = 0;
    ai.SeparationForce[1] = 0;

    let transform = game.World.LocalTransform2D[entity];
    DEBUG: if (!transform) throw new Error("missing component");

    // Check all other entities for collision avoidance
    for (let other = 0; other < game.World.Signature.length; other++) {
        if (other === entity) continue;
        if (!(game.World.Signature[other] & Has.LocalTransform2D)) continue;

        let other_transform = game.World.LocalTransform2D[other];
        let to_other: Vec2 = [0, 0];
        vec2_subtract(to_other, other_transform.Translation, transform.Translation);
        let distance = vec2_length(to_other);

        // Apply separation force if too close
        if (distance < separation_distance) {
            if (distance > 0.01) {
                // Normal separation when not overlapping
                let force_strength = (separation_distance - distance) / separation_distance;
                vec2_normalize(to_other, to_other);
                vec2_scale(to_other, to_other, -force_strength * 0.8); // Push away
                vec2_add(ai.SeparationForce, ai.SeparationForce, to_other);
            } else {
                // Emergency separation for overlapping entities
                // Use entity ID to determine separation direction to avoid both going same way
                let angle = (entity * 1.618) % (Math.PI * 2); // Golden ratio for good distribution
                let emergency_force: Vec2 = [Math.cos(angle), Math.sin(angle)];
                vec2_scale(emergency_force, emergency_force, 1.0);
                vec2_add(ai.SeparationForce, ai.SeparationForce, emergency_force);
            }
        }
    }

    // Normalize the total separation force
    if (vec2_length(ai.SeparationForce) > 0.1) {
        vec2_normalize(ai.SeparationForce, ai.SeparationForce);
        vec2_scale(ai.SeparationForce, ai.SeparationForce, 0.6); // Moderate force
    }
}

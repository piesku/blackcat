import {Vec2} from "../../lib/math.js";
import {float} from "../../lib/random.js";
import {vec2_add, vec2_normalize, vec2_scale} from "../../lib/vec2.js";
import {AnimationId, set_animation} from "../components/com_animate_sprite.js";
import {query_down} from "../components/com_children.js";
import {AiState, ControlAi} from "../components/com_control_ai.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.ControlAi | Has.LocalTransform2D | Has.Health | Has.Move2D | Has.Aim;

// AI parameters
const BASE_CIRCLE_DISTANCE = 2.5;
const BASE_DASH_TRIGGER_DISTANCE = 4.5;
const BASE_SEPARATION_DISTANCE = 1.2;
const BASE_DASH_SPEED_MULTIPLIER = 4.0;
const BASE_MOVE_SPEED = 2.0;
const BASE_MANA_GENERATION_RATE = 0.1;

interface ScaledDistances {
    Circle: number;
    DashTrigger: number;
    Separation: number;
}

// --- Main System ---

export function sys_control_ai(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let ai = game.World.ControlAi[entity];
            let health = game.World.Health[entity];
            let move = game.World.Move2D[entity];
            let aim = game.World.Aim[entity];

            if (!move || !aim) {
                continue;
            }

            ai.StateTimer += delta;
            ai.AttackCooldown = Math.max(0, ai.AttackCooldown - delta);

            // No target? Stop moving.
            if (aim.TargetEntity === -1) {
                move.Direction[0] = 0;
                move.Direction[1] = 0;
                continue;
            }

            // --- Calculations ---

            let speed_scale = move.MoveSpeed / BASE_MOVE_SPEED;
            let time_scale = 1.0 / Math.sqrt(speed_scale);

            let dash_range = BASE_DASH_TRIGGER_DISTANCE;
            if (ai.DashRangeMultiplier) {
                dash_range *= ai.DashRangeMultiplier;
            }

            let scaled_distances: ScaledDistances = {
                Circle: BASE_CIRCLE_DISTANCE * speed_scale,
                DashTrigger: dash_range * speed_scale * ai.Aggressiveness,
                Separation: BASE_SEPARATION_DISTANCE * speed_scale,
            };

            // --- State Machine & Movement ---

            // Stun check overrides everything.
            if (
                game.Time - health.LastDamageTime < 0.3 * time_scale &&
                ai.State !== AiState.Stunned
            ) {
                change_state(ai, AiState.Stunned, game.Time);
                for (let entity_child of query_down(game.World, entity, Has.AnimateSprite)) {
                    set_animation(game, entity_child, AnimationId.Hurt);
                }
            }

            let movement: Vec2 = [0, 0];
            switch (ai.State) {
                case AiState.Circling:
                    handle_circling(game, entity, time_scale, scaled_distances, movement);
                    break;
                case AiState.Dashing:
                    handle_dashing(game, entity, time_scale, scaled_distances, movement);
                    break;
                case AiState.Stunned:
                    handle_stunned(game, entity, time_scale);
                    break;
                case AiState.Separating:
                    handle_separating(game, entity, time_scale, scaled_distances, movement);
                    break;
            }

            // --- Apply Movement ---

            move.Direction[0] = movement[0];
            move.Direction[1] = movement[1];
            move.MoveSpeed = ai.BaseMoveSpeed * Math.sqrt(ai.Energy);

            // Base mana generation from movement for all entities
            if (movement[0] !== 0 || movement[1] !== 0) {
                // Base rate: small amount of mana when moving
                let base_mana_rate = move.MoveSpeed * BASE_MANA_GENERATION_RATE * delta;

                // Kinetic Charger upgrade: additional mana generation based on multiplier
                let charger_rate = move.MoveSpeed * ai.EnergyFromMovement * delta;

                ai.Energy += base_mana_rate + charger_rate;
            }

            game.World.Signature[entity] |= Has.Dirty;
        }
    }
}

// --- State Handlers ---

function handle_circling(
    game: Game,
    entity: number,
    time_scale: number,
    scaled_distances: ScaledDistances,
    out_movement: Vec2,
) {
    let ai = game.World.ControlAi[entity];
    let aim = game.World.Aim[entity];

    // State transitions
    if (aim.DistanceToTarget < scaled_distances.Separation && float(0, 1) < 0.3) {
        change_state(ai, AiState.Separating, game.Time);
        return; // No movement this frame, will be handled by Separating state next frame
    } else if (
        aim.DistanceToTarget < scaled_distances.DashTrigger &&
        ai.AttackCooldown <= 0 &&
        ai.StateTimer > ai.Patience * time_scale &&
        float(0, 1) < 0.2 * ai.Aggressiveness
    ) {
        change_state(ai, AiState.Dashing, game.Time);
        ai.AttackCooldown = (1.5 + float(0, 2.0)) * time_scale * ai.Patience;
        return;
    } else if (ai.StateTimer > ai.Patience * time_scale && float(0, 1) < 0.4) {
        ai.CircleDirection *= -1;
        ai.StateTimer = 0;
    }

    // Movement logic
    let to_target = aim.DirectionToTarget;
    let distance = aim.DistanceToTarget;
    if (distance < 0.1) return;

    let target_distance = scaled_distances.Circle;
    let distance_factor = (distance - target_distance) / target_distance;

    let normalized: Vec2 = [0, 0];
    vec2_normalize(normalized, to_target);

    let perpendicular: Vec2 = [
        -normalized[1] * ai.CircleDirection,
        normalized[0] * ai.CircleDirection,
    ];

    vec2_scale(normalized, normalized, distance_factor * 0.6);
    vec2_scale(perpendicular, perpendicular, 0.7);

    vec2_add(out_movement, normalized, perpendicular);
    vec2_normalize(out_movement, out_movement);
}

function handle_dashing(
    game: Game,
    entity: number,
    time_scale: number,
    scaled_distances: ScaledDistances,
    out_movement: Vec2,
) {
    let ai = game.World.ControlAi[entity];
    let aim = game.World.Aim[entity];
    let move = game.World.Move2D[entity]!;

    // State transitions
    let attack_duration = (1.5 + 0.5 * ai.Aggressiveness) * time_scale;
    if (
        aim.DistanceToTarget < 0.1 || // Reached target
        ai.StateTimer > attack_duration
    ) {
        change_state(ai, AiState.Circling, game.Time);
        return;
    }

    // Movement logic
    vec2_normalize(out_movement, aim.DirectionToTarget);
    let speed_scale = move.MoveSpeed / BASE_MOVE_SPEED;
    let effective_multiplier =
        BASE_DASH_SPEED_MULTIPLIER * ai.Aggressiveness * (ai.DashSpeedMultiplier || 1);
    effective_multiplier = Math.min(
        effective_multiplier,
        (BASE_DASH_SPEED_MULTIPLIER * 1.5) / Math.sqrt(speed_scale),
    );
    vec2_scale(out_movement, out_movement, effective_multiplier);
}

function handle_stunned(game: Game, entity: number, time_scale: number) {
    let ai = game.World.ControlAi[entity];
    // State transitions
    if (ai.StateTimer > 0.3 * time_scale) {
        change_state(ai, AiState.Circling, game.Time);
        for (let entity_child of query_down(game.World, entity, Has.AnimateSprite)) {
            set_animation(game, entity_child, AnimationId.Run);
        }
    }
    // No movement
}

function handle_separating(
    game: Game,
    entity: number,
    time_scale: number,
    scaled_distances: ScaledDistances,
    out_movement: Vec2,
) {
    let ai = game.World.ControlAi[entity];
    let aim = game.World.Aim[entity];

    // State transitions
    let separation_timeout = 2.0 * time_scale;
    if (
        aim.DistanceToTarget > scaled_distances.Separation * 1.5 ||
        ai.StateTimer > separation_timeout
    ) {
        change_state(ai, AiState.Circling, game.Time);
        return;
    }

    // Movement logic: move directly away from target
    vec2_normalize(out_movement, aim.DirectionToTarget);
    vec2_scale(out_movement, out_movement, -0.8); // Negative to move away, slower than normal
}

// --- Utility Functions ---

function change_state(ai: ControlAi, new_state: AiState, time: number) {
    if (ai.State === new_state) {
        return;
    }

    let fighter_type = ai.IsPlayer ? "Player" : "Opponent";
    console.log(`[AI] ${fighter_type} ${ai.State} → ${new_state}`);

    ai.State = new_state;
    ai.LastStateChange = time;
    ai.StateTimer = 0;
}

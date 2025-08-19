import {Game} from "../game.js";
import {Has} from "../world.js";
import {float} from "../../lib/random.js";

export interface AIFighter {
    State: AIState;
    LastStateChange: number; // Game time in seconds when state last changed
    StateTimer: number;
    TargetEntity: number;
    CircleDirection: number; // 1 or -1 for clockwise/counterclockwise
    AttackCooldown: number;
    IsPlayer: boolean; // True for player fighters, false for opponents

    // Enhanced personality and randomness
    Aggressiveness: number; // 0.0-2.0, affects attack frequency and distance
    Patience: number; // 0.5-2.0, affects how long they circle before attacking

    // New state data
    PrepareDirection: [number, number]; // Direction for preparing dash attack
    SeparationForce: [number, number]; // Collision avoidance force
    HasRetreatedAtLowHealth: boolean; // Prevents repeated retreating at same health level
}

export const enum AIState {
    Circling,
    Preparing, // New: Wind-up state before dash attack
    Dashing,
    Retreating,
    Stunned,
    Pursuing,
    Separating, // New: Active collision avoidance
}

export function ai_fighter(target_entity: number = -1, is_player: boolean = false) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.AIFighter;

        let aggressiveness: number;
        let patience: number;
        let initial_delay: number;
        let attack_delay: number;
        let circle_direction: number;

        if (is_player) {
            // Player fighters have consistent default traits (for future upgrade system)
            aggressiveness = 1.0; // Balanced default
            patience = 1.0; // Balanced default
            initial_delay = 0.5; // Minimal delay for responsiveness
            attack_delay = 0.5; // Quick to engage
            circle_direction = 1; // Consistent clockwise
        } else {
            // Opponent fighters use sequential random numbers for deterministic variety
            aggressiveness = 0.5 + float(0, 1.5); // Range: 0.5-2.0
            patience = 0.7 + float(0, 1.3); // Range: 0.7-2.0
            initial_delay = float(0, 3.0); // Staggered initial delays 0-3 seconds
            attack_delay = float(0, 2.0); // Staggered initial attack delays 0-2 seconds
            circle_direction = float(0, 1) > 0.5 ? 1 : -1;
        }

        game.World.AIFighter[entity] = {
            State: AIState.Circling,
            LastStateChange: game.Time,
            StateTimer: initial_delay,
            TargetEntity: target_entity,
            CircleDirection: circle_direction,
            AttackCooldown: attack_delay,
            IsPlayer: is_player,

            // Personality traits
            Aggressiveness: aggressiveness,
            Patience: patience,

            // State vectors
            PrepareDirection: [0, 0],
            SeparationForce: [0, 0],
            HasRetreatedAtLowHealth: false,
        };
    };
}

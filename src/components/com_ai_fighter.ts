import {Game} from "../game.js";
import {Has} from "../world.js";

export interface AIFighter {
    State: AIState;
    LastStateChange: number; // Game time in seconds when state last changed
    StateTimer: number;
    TargetEntity: number;
    CircleDirection: number; // 1 or -1 for clockwise/counterclockwise
    AttackCooldown: number;
}

export const enum AIState {
    Circling,
    Attacking,
    Retreating,
    Stunned,
}

export function ai_fighter(target_entity: number = -1) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.AIFighter;
        game.World.AIFighter[entity] = {
            State: AIState.Circling,
            LastStateChange: game.Time, // Use game time in seconds
            StateTimer: Math.random() * 2.0, // Random initial delay 0-2 seconds
            TargetEntity: target_entity,
            CircleDirection: Math.random() > 0.5 ? 1 : -1,
            AttackCooldown: Math.random() * 1.0, // Random initial attack delay 0-1 second
        };
    };
}

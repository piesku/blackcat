import {Game} from "../game.js";

export interface AIFighter {
    State: AIState;
    LastStateChange: number;
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
        game.World.AIFighter[entity] = {
            State: AIState.Circling,
            LastStateChange: game.Running,
            StateTimer: 0,
            TargetEntity: target_entity,
            CircleDirection: Math.random() > 0.5 ? 1 : -1,
            AttackCooldown: 0,
        };
    };
}
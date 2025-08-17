import {AIState} from "../components/com_ai_fighter.js";

export function getAIStateName(state: AIState): string {
    switch (state) {
        case AIState.Circling:
            return "Circling";
        case AIState.Attacking:
            return "Attacking";
        case AIState.Retreating:
            return "Retreating";
        case AIState.Stunned:
            return "Stunned";
        case AIState.Pursuing:
            return "Pursuing";
        default:
            return "Unknown";
    }
}

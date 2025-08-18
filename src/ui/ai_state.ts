import {AIState} from "../components/com_ai_fighter.js";

export function getAIStateName(state: AIState): string {
    switch (state) {
        case AIState.Circling:
            return "Circling";
        case AIState.Preparing:
            return "Preparing";
        case AIState.Dashing:
            return "Dashing";
        case AIState.Retreating:
            return "Retreating";
        case AIState.Stunned:
            return "Stunned";
        case AIState.Pursuing:
            return "Pursuing";
        case AIState.Separating:
            return "Separating";
        default:
            return "Unknown";
    }
}

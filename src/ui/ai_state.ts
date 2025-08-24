import {AiState} from "../components/com_control_ai.js";

export function getAIStateName(state: AiState): string {
    switch (state) {
        case AiState.Circling:
            return "Circling";
        case AiState.Preparing:
            return "Preparing";
        case AiState.Dashing:
            return "Dashing";
        case AiState.Retreating:
            return "Retreating";
        case AiState.Stunned:
            return "Stunned";
        case AiState.Pursuing:
            return "Pursuing";
        case AiState.Separating:
            return "Separating";
        default:
            return "Unknown";
    }
}

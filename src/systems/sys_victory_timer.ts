import {Action, dispatch} from "../actions.js";
import {Game, GameView} from "../game.js";

const AUTO_ADVANCE_TIME = 5.0; // 5 seconds
let victoryTimer = 0;

// TODO: use a sys_poll Task or setTimeout in the action handler.
export function sys_victory_timer(game: Game, delta: number) {
    // Only run in victory view
    if (game.CurrentView !== GameView.Victory) {
        // Reset timer when not in victory view
        victoryTimer = AUTO_ADVANCE_TIME;
        return;
    }

    // Skip auto-advance for final victory
    if (game.ViewData?.isFinalVictory) {
        return;
    }

    // Count down timer
    victoryTimer -= delta;

    // Auto-advance when timer expires
    if (victoryTimer <= 0) {
        dispatch(game, Action.ViewTransition, {view: GameView.UpgradeSelection});
        victoryTimer = AUTO_ADVANCE_TIME; // Reset for next time
    }
}

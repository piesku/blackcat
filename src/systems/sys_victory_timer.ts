import {Action, dispatch} from "../actions.js";
import {Game, GameView} from "../game.js";

export function sys_victory_timer(game: Game, delta: number) {
    // Only run in victory view
    if (game.CurrentView !== GameView.Victory || !game.VictoryData) {
        return;
    }

    // Skip auto-advance for final victory
    if (game.VictoryData.IsFinalVictory) {
        return;
    }

    // Count down timer
    game.VictoryData.TimeRemaining -= delta;

    // Ensure it doesn't go below 0
    if (game.VictoryData.TimeRemaining < 0) {
        game.VictoryData.TimeRemaining = 0;
    }

    // Auto-advance when timer expires
    if (game.VictoryData.TimeRemaining <= 0) {
        dispatch(game, Action.ViewTransition, {view: GameView.UpgradeSelection});
    }
}

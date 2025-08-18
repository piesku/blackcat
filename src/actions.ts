import {Game, GameView} from "./game.js";
import {scene_arena} from "./scenes/sce_arena.js";
import {UpgradeType} from "./upgrades/types.js";
import {save_game_state, clear_game_state} from "./store.js";
import {generateOpponentUpgrades, calculatePopulation, createFreshGameState} from "./state.js";

export const enum Action {
    NoOp,
    DuelVictory,
    DuelDefeat,
    UpgradeSelected,
    ViewTransition,
    RestartRun,
    ClearSave,
}

export function dispatch(game: Game, action: Action, payload?: unknown) {
    switch (action) {
        case Action.NoOp: {
            break;
        }
        case Action.DuelVictory: {
            // Update progression
            game.State.currentLevel++;
            game.State.population = calculatePopulation(game.State.currentLevel);

            // Check for final victory
            if (game.State.currentLevel > 33) {
                // Final victory - clear save and show special ending
                clear_game_state();
                game.SetView(GameView.Victory, {isFinalVictory: true});
            } else {
                // Generate next opponent's upgrades for preview in upgrade selection
                game.State.opponentUpgrades = generateOpponentUpgrades(game.State.currentLevel);

                // Save state before showing upgrade selection so player always comes back to selection screen
                save_game_state(game.State);

                // Regular victory - show victory screen
                game.SetView(GameView.Victory);
            }
            break;
        }
        case Action.DuelDefeat: {
            // Clear save state on defeat
            clear_game_state();
            game.SetView(GameView.Defeat);
            break;
        }
        case Action.UpgradeSelected: {
            let selectedUpgrade = payload as UpgradeType;

            // Add upgrade to player collection
            game.State.playerUpgrades.push(selectedUpgrade);

            // No need to save after upgrade selection - already saved before upgrade selection screen
            // This allows player to try different upgrades against same opponent if they reload

            // Opponent upgrades are already generated during victory
            // Switch to arena and start new duel
            game.SetView(GameView.Arena);
            scene_arena(game);
            break;
        }
        case Action.ViewTransition: {
            let transitionPayload = payload as {view: GameView; data?: any};

            // Clear cached upgrade choices when transitioning to upgrade selection
            if (transitionPayload.view === GameView.UpgradeSelection) {
                game.SetView(transitionPayload.view, {}); // Clear ViewData for fresh upgrade choices
            } else {
                game.SetView(transitionPayload.view, transitionPayload.data);
            }
            break;
        }
        case Action.RestartRun: {
            // Reset to new run state
            game.State = createFreshGameState();

            // Clear save state
            clear_game_state();

            // Start with upgrade selection
            game.SetView(GameView.UpgradeSelection);
            break;
        }
        case Action.ClearSave: {
            // Clear save state on demand
            clear_game_state();
            break;
        }
    }
}

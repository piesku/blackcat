import {Game, GameView, VictoryData} from "./game.js";
import {scene_arena} from "./scenes/sce_arena.js";
import {UpgradeType} from "./upgrades/types.js";
import {save_game_state, clear_game_state} from "./store.js";
import {
    generateOpponentUpgrades,
    generatePlayerUpgradeChoices,
    calculatePopulation,
    createFreshGameState,
} from "./state.js";

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
                game.SetView(GameView.Victory, {IsFinalVictory: true, TimeRemaining: Infinity});
            } else {
                // Generate next opponent's upgrades for preview in upgrade selection
                game.State.opponentUpgrades = generateOpponentUpgrades(
                    game.State.currentLevel,
                    game.State.runSeed,
                );

                // Generate player's upgrade choices for the next selection (deterministic, can't be re-rolled)
                game.State.availableUpgradeChoices = generatePlayerUpgradeChoices(
                    game.State.currentLevel,
                    game.State.playerUpgrades,
                    game.State.runSeed,
                );

                // Save state before showing upgrade selection so player always comes back to selection screen
                save_game_state(game.State);

                // Regular victory - show victory screen with 5-second countdown
                game.SetView(GameView.Victory, {IsFinalVictory: false, TimeRemaining: 5.0});
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
            let selectedIndex = payload as number;
            let selectedUpgrade = game.State.availableUpgradeChoices[selectedIndex];

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
            let transitionPayload = payload as {view: GameView};
            game.SetView(transitionPayload.view);
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

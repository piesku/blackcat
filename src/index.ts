import {dispatch, Action} from "./actions.js";
import {Game, GameView} from "./game.js";
import {load_game_state, has_game_state} from "./store.js";
import {generatePlayerUpgradeChoices} from "./state.js";

async function initializeGame() {
    let game = new Game();

    // Try to load saved state
    let savedState = null;
    if (has_game_state()) {
        try {
            savedState = load_game_state();
        } catch (e) {
            console.error("Failed to load saved state:", e);
        }
    }

    if (savedState) {
        // Resume from saved state
        game.State = savedState;
        game.State.isNewRun = false; // Mark as resumed

        // Migration: ensure availableUpgradeChoices exists for older save states
        if (!game.State.availableUpgradeChoices || game.State.availableUpgradeChoices.length === 0) {
            game.State.availableUpgradeChoices = generatePlayerUpgradeChoices(game.State.currentLevel, game.State.playerUpgrades);
        }

        // Start on upgrade selection screen when resuming
        game.SetView(GameView.UpgradeSelection);

        console.log(
            `Resumed game at level ${savedState.currentLevel} with ${savedState.playerUpgrades.length} upgrades`,
        );
    } else {
        // Start fresh run
        dispatch(game, Action.RestartRun);

        console.log("Started new game");
    }

    game.Start();

    // @ts-ignore
    window.$ = dispatch.bind(null, game);

    // @ts-ignore
    window.game = game;
}

// Initialize the game
initializeGame().catch(console.error);

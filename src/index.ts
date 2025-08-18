import {dispatch, Action} from "./actions.js";
import {Game, GameView, createDefaultGameState} from "./game.js";
import {createGameStore} from "./store.js";

async function initializeGame() {
    let game = new Game();

    // Initialize storage
    try {
        game.Store = await createGameStore();
        console.log("Game store initialized successfully");
    } catch (e) {
        console.error("Failed to initialize game store:", e);
        // Continue without persistence
    }

    // Try to load saved state
    let savedState = null;
    if (game.Store) {
        try {
            savedState = await game.Store.loadGameState();
        } catch (e) {
            console.error("Failed to load saved state:", e);
        }
    }

    if (savedState) {
        // Resume from saved state
        game.State = savedState;
        game.State.isNewRun = false; // Mark as resumed

        // Start on upgrade selection screen when resuming
        game.SetView(GameView.UpgradeSelection);

        console.log(
            `Resumed game at level ${savedState.currentLevel} with ${savedState.playerUpgrades.length} upgrades`,
        );
    } else {
        // Start fresh run
        game.State = {
            currentLevel: 1,
            playerUpgrades: [],
            opponentUpgrades: [],
            population: 8_000_000_000,
            isNewRun: true,
        };

        // Generate opponent upgrades for level 1
        dispatch(game, Action.RestartRun);

        console.log("Started new game");
    }

    game.Start();

    // @ts-ignore
    window.$ = dispatch.bind(null, game);

    // @ts-ignore
    window.game = game;
}

// Initialize the game asynchronously
initializeGame().catch(console.error);

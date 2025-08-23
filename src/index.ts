import {Action, dispatch} from "./actions.js";
import {SceneGraphInspector} from "./debug.js";
import {Game, GameView} from "./game.js";
import {has_game_state, load_game_state} from "./store.js";

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

if (DEBUG) {
    // @ts-ignore
    window.game = game;
    // Initialize debug inspector
    new SceneGraphInspector(game);
}

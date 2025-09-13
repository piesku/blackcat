import {Action, dispatch} from "./actions.js";
import {SceneGraphInspector} from "./debug.js";
import {Game, GameView} from "./game.js";
import {has_game_state, load_game_state} from "./store.js";

// Wait for spritesheet to load before initializing game
let spritesheet_image = document.querySelector("img")!;

function init() {
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
        game.State.isNewRun = false;
        game.CurrentView = GameView.UpgradeSelection;
    } else {
        // Start fresh run
        dispatch(game, Action.RestartRun);
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
}

if (spritesheet_image.complete) {
    // Image already loaded
    init();
} else {
    // Wait for image to load
    spritesheet_image.onload = init;
}

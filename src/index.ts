import {dispatch, Action} from "./actions.js";
import {Game, GameView, createDefaultGameState} from "./game.js";

let game = new Game();

// Start with fresh run - reset state to beginning
game.State = {
    currentLevel: 1,
    playerUpgrades: [],
    opponentUpgrades: [],
    population: 8_000_000_000,
    isNewRun: true,
};

// Generate opponent upgrades for level 1
dispatch(game, Action.RestartRun);

game.Start();

// @ts-ignore
window.$ = dispatch.bind(null, game);

// @ts-ignore
window.game = game;

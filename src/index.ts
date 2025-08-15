import {dispatch} from "./actions.js";
import {Game} from "./game.js";
import {scene_arena} from "./scenes/sce_arena.js";

let game = new Game();
scene_arena(game);
game.Start();

// @ts-ignore
window.$ = dispatch.bind(null, game);

// @ts-ignore
window.game = game;

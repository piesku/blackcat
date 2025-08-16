import {instantiate} from "../../lib/game.js";
import {draw_arc, draw_rect} from "../components/com_draw.js";
import {local_transform2d, set_position} from "../components/com_local_transform2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {Game, WORLD_CAPACITY} from "../game.js";
import {
    ARENA_CENTER_X,
    ARENA_CENTER_Y,
    ARENA_HEIGHT,
    ARENA_RADIUS,
    ARENA_WIDTH,
} from "../maps/arena.js";
import {apply_upgrades} from "../upgrades/manager.js";
import {World} from "../world.js";
import {blueprint_camera} from "./blu_camera.js";
import {blueprint_fighter} from "./blu_fighter.js";

export function scene_arena(game: Game) {
    game.ViewportResized = true;

    game.World = new World(WORLD_CAPACITY);
    game.World.BackgroundColor = [0.1, 0.1, 0.2, 1.0] as any; // Dark blue background
    game.World.Width = ARENA_WIDTH;
    game.World.Height = ARENA_HEIGHT;

    // Top-down camera at center of arena
    instantiate(game, [...blueprint_camera(game), set_position(ARENA_CENTER_X, ARENA_CENTER_Y)]);

    // Arena background
    instantiate(game, [
        spatial_node2d(),
        local_transform2d(),
        set_position(ARENA_CENTER_X, ARENA_CENTER_Y),
        draw_rect("#2D2D3A", ARENA_WIDTH, ARENA_HEIGHT),
    ]);

    // Arena circle boundary
    instantiate(game, [
        spatial_node2d(),
        local_transform2d(),
        set_position(ARENA_CENTER_X, ARENA_CENTER_Y),
        draw_arc("#444455", ARENA_RADIUS),
    ]);

    // Player fighter (left side)
    let player = instantiate(game, [
        ...blueprint_fighter(game, true),
        set_position(ARENA_CENTER_X - 4, ARENA_CENTER_Y),
    ]);

    // Opponent fighter (right side)
    let opponent = instantiate(game, [
        ...blueprint_fighter(game, false),
        set_position(ARENA_CENTER_X + 4, ARENA_CENTER_Y),
    ]);

    // Apply upgrades from game state
    apply_upgrades(game, player, game.State.playerUpgrades);

    // Give opponent no upgrades for now (TODO: randomize based on level)
    apply_upgrades(game, opponent, []);
}

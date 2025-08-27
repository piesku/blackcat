import {instantiate} from "../lib/game.js";
import {Vec2} from "../lib/math.js";
import {vec2_normalize, vec2_subtract} from "../lib/vec2.js";
import {blueprint_chiquita_banana_spawner} from "./blueprints/blu_chiquita_banana_spawner.js";
import {blueprint_explosion} from "./blueprints/blu_explosion.js";
import {blueprint_boomerang_return} from "./blueprints/projectiles/blu_boomerang.js";
import {get_root_spawner, label} from "./components/com_label.js";
import {spawned_by} from "./components/com_spawned_by.js";
import {lifespan} from "./components/com_lifespan.js";
import {copy_position} from "./components/com_local_transform2d.js";
import {Game, GameView} from "./game.js";
import {scene_arena} from "./scenes/sce_arena.js";
import {
    calculatePopulation,
    createFreshGameState,
    generateOpponentUpgrades,
    generatePlayerUpgradeChoices,
} from "./state.js";
import {clear_game_state, save_game_state} from "./store.js";

export const enum Action {
    NoOp,
    DuelVictory,
    DuelDefeat,
    UpgradeSelected,
    ViewTransition,
    RestartRun,
    ClearSave,
    ExplodeArea,
    ExplodeBananas,
    SpawnBoomerangReturn,
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
        case Action.ExplodeArea: {
            let bomb_entity = payload as number;
            let bomb_transform = game.World.LocalTransform2D[bomb_entity];
            DEBUG: if (!bomb_transform) throw new Error("missing transform component");

            let [x, y] = bomb_transform.Translation;
            console.log(
                `[EXPLOSIVES] Bomb ${bomb_entity} explodesing at (${x.toFixed(2)}, ${y.toFixed(2)})`,
            );
            instantiate(game, blueprint_explosion([x, y], 3, 1.5, 0.2));
            break;
        }
        case Action.ExplodeBananas: {
            let bomb_entity = payload as number;
            let bomb_transform = game.World.LocalTransform2D[bomb_entity];
            DEBUG: if (!bomb_transform) throw new Error("missing transform component");

            let [x, y] = bomb_transform.Translation;
            console.log(
                `[CHIQUITA] Main bomb ${bomb_entity} exploding at (${x.toFixed(2)}, ${y.toFixed(2)}) `,
            );

            // Create dedicated banana spawner at explosion location
            instantiate(game, blueprint_chiquita_banana_spawner([x, y]));

            break;
        }
        case Action.SpawnBoomerangReturn: {
            // The payload is the outward boomerang entity that just expired
            let outward_boomerang = payload as number;
            let boomerang_transform = game.World.LocalTransform2D[outward_boomerang];
            DEBUG: if (!boomerang_transform) throw new Error("missing boomerang transform");

            let boomerang_lifespan = game.World.Lifespan[outward_boomerang];
            DEBUG: if (!boomerang_lifespan) throw new Error("missing boomerang lifespan");

            // Use get_root_spawner to get the original thrower (now directly stored)
            let thrower_entity = get_root_spawner(game.World, outward_boomerang);
            let thrower_transform = game.World.LocalTransform2D[thrower_entity];

            if (!thrower_transform) {
                console.log(
                    `[BOOMERANG] Thrower ${thrower_entity} no longer exists, boomerang lost`,
                );
                break;
            }

            console.log(
                `[BOOMERANG] Spawning return boomerang from (${boomerang_transform.Translation[0].toFixed(2)}, ${boomerang_transform.Translation[1].toFixed(2)}) to thrower ${thrower_entity}`,
            );

            // Calculate direction from current position back to thrower
            let to_thrower: Vec2 = [0, 0];
            vec2_subtract(
                to_thrower,
                thrower_transform.Translation,
                boomerang_transform.Translation,
            );
            vec2_normalize(to_thrower, to_thrower);

            // Spawn the return boomerang at current location
            instantiate(game, [
                ...blueprint_boomerang_return(to_thrower),
                copy_position(boomerang_transform.Translation), // Spawn at outward boomerang's position
                lifespan(boomerang_lifespan.Lifetime), // Same lifespan as outward boomerang
                label("boomerang_return"),
                spawned_by(thrower_entity),
            ]);

            break;
        }
    }
}

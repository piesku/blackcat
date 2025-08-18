import {Game, GameView} from "./game.js";
import {scene_arena} from "./scenes/sce_arena.js";
import {ALL_UPGRADES, UpgradeType} from "./upgrades/types.js";
import {createSeededRandom} from "./random.js";

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
                if (game.Store) {
                    game.Store.clearGameState().catch(console.error);
                }
                game.SetView(GameView.Victory, {isFinalVictory: true});
            } else {
                // Generate next opponent's upgrades for preview in upgrade selection
                game.State.opponentUpgrades = generateOpponentUpgrades(game.State.currentLevel);

                // Save state after victory
                if (game.Store) {
                    game.Store.saveGameState(game.State).catch(console.error);
                }

                // Regular victory - show victory screen
                game.SetView(GameView.Victory);
            }
            break;
        }
        case Action.DuelDefeat: {
            // Clear save state on defeat
            if (game.Store) {
                game.Store.clearGameState().catch(console.error);
            }
            game.SetView(GameView.Defeat);
            break;
        }
        case Action.UpgradeSelected: {
            let selectedUpgrade = payload as UpgradeType;

            // Add upgrade to player collection
            game.State.playerUpgrades.push(selectedUpgrade);

            // Save state after upgrade selection
            if (game.Store) {
                game.Store.saveGameState(game.State).catch(console.error);
            }

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
            game.State = {
                currentLevel: 1,
                playerUpgrades: [],
                opponentUpgrades: generateOpponentUpgrades(1),
                population: 8_000_000_000,
                isNewRun: true,
            };

            // Clear save state
            if (game.Store) {
                game.Store.clearGameState().catch(console.error);
            }

            // Start with upgrade selection
            game.SetView(GameView.UpgradeSelection);
            break;
        }
        case Action.ClearSave: {
            // Clear save state on demand
            if (game.Store) {
                game.Store.clearGameState().catch(console.error);
            }
            break;
        }
    }
}

function calculatePopulation(level: number): number {
    // Exponential decay: each victory halves the population
    return Math.max(1, Math.floor(8_000_000_000 / Math.pow(2, level - 1)));
}

function generateOpponentUpgrades(arenaLevel: number): UpgradeType[] {
    // Use seeded random for consistent upgrades per arena level
    let rng = createSeededRandom(arenaLevel);

    let availableUpgrades = ALL_UPGRADES.filter((upgrade) => {
        if (upgrade.category === "armor") return true;
        return [
            "battle_axe",
            "baseball_bat",
            "pistol",
            "shotgun",
            "sniper_rifle",
            "throwing_knives",
        ].includes(upgrade.id);
    });

    // Create a copy to avoid modifying the original array
    let shufflableUpgrades = [...availableUpgrades];
    rng.shuffle(shufflableUpgrades);

    let selectedUpgrades: UpgradeType[] = [];
    let upgradeCount = arenaLevel;

    // Select first N upgrades from shuffled array (no duplicates)
    for (let i = 0; i < upgradeCount && i < shufflableUpgrades.length; i++) {
        selectedUpgrades.push(shufflableUpgrades[i]);
    }

    return selectedUpgrades;
}

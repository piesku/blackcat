import {Game, GameView} from "./game.js";
import {scene_arena} from "./scenes/sce_arena.js";
import {ALL_UPGRADES, UpgradeType} from "./upgrades/types.js";

export const enum Action {
    NoOp,
    DuelVictory,
    DuelDefeat,
    UpgradeSelected,
    ViewTransition,
    RestartRun,
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
                // Final victory - show special ending
                game.SetView(GameView.Victory, {isFinalVictory: true});
            } else {
                // Regular victory - show victory screen
                game.SetView(GameView.Victory);
            }
            break;
        }
        case Action.DuelDefeat: {
            game.SetView(GameView.Defeat);
            break;
        }
        case Action.UpgradeSelected: {
            let selectedUpgrade = payload as UpgradeType;

            // Add upgrade to player collection
            game.State.playerUpgrades.push(selectedUpgrade);

            // Generate new opponent upgrades
            game.State.opponentUpgrades = generateOpponentUpgrades(game.State.currentLevel);

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

            // Start with upgrade selection
            game.SetView(GameView.UpgradeSelection);
            break;
        }
    }
}

function calculatePopulation(level: number): number {
    // Exponential decay: each victory halves the population
    return Math.max(1, Math.floor(8_000_000_000 / Math.pow(2, level - 1)));
}

function generateOpponentUpgrades(arenaLevel: number): UpgradeType[] {
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

    let selectedUpgrades: UpgradeType[] = [];
    let upgradeCount = arenaLevel;

    for (let i = 0; i < upgradeCount && availableUpgrades.length > 0; i++) {
        let randomIndex = Math.floor(Math.random() * availableUpgrades.length);
        let selectedUpgrade = availableUpgrades[randomIndex];
        selectedUpgrades.push(selectedUpgrade);
        availableUpgrades.splice(randomIndex, 1);
    }

    return selectedUpgrades;
}

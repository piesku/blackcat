import {ALL_UPGRADES, UpgradeType, WEAPON_UPGRADES, ARMOR_UPGRADES} from "./upgrades/types.js";
import {set_seed, integer, shuffle} from "../lib/random.js";

export interface GameState {
    currentLevel: number; // 1-33 duels
    playerUpgrades: UpgradeType[]; // Player's accumulated upgrades
    opponentUpgrades: UpgradeType[]; // Current opponent's upgrades
    availableUpgradeChoices: UpgradeType[]; // Player's available upgrade choices for selection
    population: number; // Narrative countdown (8 billion -> 1)
    isNewRun: boolean; // Fresh start vs resumed
    runSeed: number; // Unique seed for this run, regenerated for each new run
}

export function generateOpponentUpgrades(arenaLevel: number, runSeed: number): UpgradeType[] {
    // Use seeded random for consistent upgrades per arena level within a run
    set_seed(runSeed + arenaLevel * 12345);

    let availableUpgrades = ALL_UPGRADES.filter((upgrade) => {
        if (upgrade.category === "armor") return true;
        return ["flamethrower", "shotgun", "sniper_rifle", "mortar", "boomerang"].includes(
            upgrade.id,
        );
    });

    // Shuffle array using Fisher-Yates with lib/random
    let shufflableUpgrades = shuffle(availableUpgrades);

    let selectedUpgrades: UpgradeType[] = [];
    let upgradeCount = arenaLevel;

    // Select first N upgrades from shuffled array (no duplicates)
    for (let i = 0; i < upgradeCount && i < shufflableUpgrades.length; i++) {
        selectedUpgrades.push(shufflableUpgrades[i]);
    }

    return selectedUpgrades;
}

export function generatePlayerUpgradeChoices(
    arenaLevel: number,
    playerUpgrades: UpgradeType[],
    runSeed: number,
): UpgradeType[] {
    // Use seeded random for consistent upgrade choices per arena level (different seed than opponent)
    set_seed(runSeed + arenaLevel * 54321 + 98765);

    // Generate 3 random upgrade choices excluding already owned upgrades
    let availableUpgrades = ALL_UPGRADES.filter(
        (upgrade) => !playerUpgrades.some((owned) => owned.id === upgrade.id),
    );

    // Shuffle available upgrades using seeded random
    let shufflableUpgrades = shuffle(availableUpgrades);

    let choices: UpgradeType[] = [];
    for (let i = 0; i < 3 && i < shufflableUpgrades.length; i++) {
        choices.push(shufflableUpgrades[i]);
    }

    return choices;
}

export function calculatePopulation(level: number): number {
    // Exponential decay: each victory halves the population
    return Math.max(1, Math.floor(8_000_000_000 / Math.pow(2, level - 1)));
}

export function createFreshGameState(): GameState {
    let initialPlayerUpgrades: UpgradeType[] = [];
    let runSeed = Math.floor(Math.random() * 1000000); // Generate random run seed

    return {
        currentLevel: 1,
        playerUpgrades: initialPlayerUpgrades,
        opponentUpgrades: generateOpponentUpgrades(1, runSeed),
        availableUpgradeChoices: generatePlayerUpgradeChoices(1, initialPlayerUpgrades, runSeed),
        population: 8_000_000_000,
        isNewRun: true,
        runSeed: runSeed,
    };
}

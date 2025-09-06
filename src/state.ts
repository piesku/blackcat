import {
    ALL_UPGRADES,
    UpgradeType,
    UpgradeRarity,
    WEAPON_UPGRADES,
    ARMOR_UPGRADES,
} from "./upgrades/types.js";
import {set_seed, integer, shuffle, float} from "../lib/random.js";

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

    // Use weighted selection based on rarity instead of simple shuffle
    let choices: UpgradeType[] = [];
    for (let i = 0; i < 3 && availableUpgrades.length > 0; i++) {
        let selectedUpgrade = selectUpgradeByRarity(availableUpgrades);
        choices.push(selectedUpgrade);
        // Remove selected upgrade to prevent duplicates
        availableUpgrades = availableUpgrades.filter((u) => u.id !== selectedUpgrade.id);
    }

    return choices;
}

// Weighted selection based on upgrade rarity
function selectUpgradeByRarity(availableUpgrades: UpgradeType[]): UpgradeType {
    // Calculate total weight based on rarity
    let totalWeight = 0;
    for (let upgrade of availableUpgrades) {
        totalWeight += getRarityWeight(upgrade.rarity);
    }

    // Generate random number from 0 to totalWeight
    let randomWeight = float() * totalWeight;

    // Select upgrade based on cumulative weights
    let cumulativeWeight = 0;
    for (let upgrade of availableUpgrades) {
        cumulativeWeight += getRarityWeight(upgrade.rarity);
        if (randomWeight <= cumulativeWeight) {
            return upgrade;
        }
    }

    // Fallback (should never happen)
    return availableUpgrades[availableUpgrades.length - 1];
}

// Get weight for rarity (higher weight = more likely to be selected)
function getRarityWeight(rarity: UpgradeRarity): number {
    switch (rarity) {
        case UpgradeRarity.Common:
            return 70; // 70% chance
        case UpgradeRarity.Uncommon:
            return 25; // 25% chance
        case UpgradeRarity.Rare:
            return 5; // 5% chance
        default:
            return 70; // Default to common
    }
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

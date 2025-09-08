import {float, set_seed, shuffle} from "../lib/random.js";
import {
    ALL_UPGRADES_LIST,
    UpgradeCategory,
    UpgradeId,
    UpgradeRarity,
    UpgradeType,
} from "./upgrades/types.js";

export interface GameState {
    currentLevel: number; // 1-33 duels
    playerUpgrades: UpgradeId[]; // Player's accumulated upgrade ids
    opponentUpgrades: UpgradeId[]; // Current opponent's upgrade ids
    availableUpgradeChoices: UpgradeId[]; // Player's available upgrade choice ids for selection
    population: number; // Narrative countdown (8 billion -> 1)
    isNewRun: boolean; // Fresh start vs resumed
    runSeed: number; // Unique seed for this run, regenerated for each new run
}

export function generateOpponentUpgrades(arenaLevel: number, runSeed: number): UpgradeId[] {
    // Use seeded random for consistent upgrades per arena level within a run
    set_seed(runSeed + arenaLevel * 12345);

    // Shuffle array using Fisher-Yates with lib/random
    let shufflableUpgrades = shuffle(ALL_UPGRADES_LIST);

    let selectedUpgrades: UpgradeId[] = [];
    let upgradeCount = arenaLevel;

    // Select first N upgrades from shuffled array (no duplicates)
    for (let i = 0; i < upgradeCount && i < shufflableUpgrades.length; i++) {
        selectedUpgrades.push(shufflableUpgrades[i].id);
    }

    return selectedUpgrades;
}

export function generatePlayerUpgradeChoices(
    arenaLevel: number,
    playerUpgrades: UpgradeId[],
    runSeed: number,
): UpgradeId[] {
    // Use seeded random for consistent upgrade choices per arena level (different seed than opponent)
    set_seed(runSeed + arenaLevel * 54321 + 98765);

    // Generate 3 random upgrade choices excluding already owned upgrades
    let availableUpgrades = ALL_UPGRADES_LIST.filter(
        (upgrade) => !playerUpgrades.includes(upgrade.id),
    );

    // For the first duel, ensure at least one weapon is offered
    let selectedIds: UpgradeId[] = [];
    if (arenaLevel === 1) {
        // First choice: guaranteed weapon
        let availableWeapons = availableUpgrades.filter(
            (upgrade) => upgrade.category === UpgradeCategory.Weapon,
        );
        if (availableWeapons.length > 0) {
            let weaponUpgrade = selectUpgradeByRarity(availableWeapons);
            selectedIds.push(weaponUpgrade.id);
            availableUpgrades = availableUpgrades.filter((u) => u.id !== weaponUpgrade.id);
        }
    }

    // Fill remaining slots with weighted selection
    while (selectedIds.length < 3 && availableUpgrades.length > 0) {
        let selectedUpgrade = selectUpgradeByRarity(availableUpgrades);
        selectedIds.push(selectedUpgrade.id);
        // Remove selected upgrade to prevent duplicates
        availableUpgrades = availableUpgrades.filter((u) => u.id !== selectedUpgrade.id);
    }

    return selectedIds;
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
    let initialPlayerUpgrades: UpgradeId[] = [];
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

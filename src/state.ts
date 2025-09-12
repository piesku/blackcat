import {float, set_seed, shuffle} from "../lib/random.js";
import {
    ALL_UPGRADES_LIST,
    UpgradeCategory,
    UpgradeId,
    UpgradeInstance,
    UpgradeRarity,
    UpgradeType,
} from "./upgrades/types.js";

export interface GameState {
    currentLevel: number; // 1-33 duels
    playerUpgrades: UpgradeInstance[]; // Player's accumulated upgrades with tiers
    opponentUpgrades: UpgradeInstance[]; // Current opponent's upgrades with tiers
    availableUpgradeChoices: UpgradeInstance[]; // Player's available upgrade choices for selection
    population: number; // Narrative countdown (8 billion -> 1)
    isNewRun: boolean; // Fresh start vs resumed
    runSeed: number; // Unique seed for this run, regenerated for each new run
}

export function generateOpponentUpgrades(arenaLevel: number, runSeed: number): UpgradeInstance[] {
    // Use seeded random for consistent upgrades per arena level within a run
    set_seed(runSeed + arenaLevel * 12345);

    let upgradeBudget = arenaLevel; // Each arena level gives 1 upgrade point
    let selectedUpgrades: UpgradeInstance[] = [];
    let availableUpgrades = shuffle(ALL_UPGRADES_LIST);

    // Fill budget with upgrades, prioritizing higher tiers when possible
    while (upgradeBudget > 0 && availableUpgrades.length > 0) {
        let upgrade = selectUpgradeByRarity(availableUpgrades);
        let maxTier = upgrade.Tiers.length;

        // Randomly choose tier based on available budget (Tier 3 costs 3 points, etc.)
        let affordableTier = Math.min(maxTier, upgradeBudget);
        let selectedTier =
            float() < 0.7 ? 1 : Math.min(affordableTier, Math.floor(float() * maxTier) + 1);

        selectedUpgrades.push({
            id: upgrade.Id,
            tier: selectedTier,
        });

        upgradeBudget -= selectedTier;

        // Remove selected upgrade to prevent duplicates
        availableUpgrades = availableUpgrades.filter((u) => u.Id !== upgrade.Id);
    }

    return selectedUpgrades;
}

export function generatePlayerUpgradeChoices(
    arenaLevel: number,
    playerUpgrades: UpgradeInstance[],
    runSeed: number,
): UpgradeInstance[] {
    set_seed(runSeed + arenaLevel * 54321 + 98765);

    // Check what upgrades player already owns
    let ownedUpgradeIds = new Set(playerUpgrades.map((u) => u.id));

    let choices: UpgradeInstance[] = [];

    // For the first duel, ensure at least one weapon is offered
    if (arenaLevel === 1) {
        let availableWeapons = ALL_UPGRADES_LIST.filter(
            (upgrade) => upgrade.Category === UpgradeCategory.Weapon,
        );

        if (availableWeapons.length > 0) {
            let weaponUpgrade = selectUpgradeByRarity(availableWeapons);
            choices.push({id: weaponUpgrade.Id, tier: 1});
        }
    }

    // Fill remaining slots with weighted selection
    while (choices.length < 3) {
        let availableUpgrades = ALL_UPGRADES_LIST.filter((u) => {
            // Skip if already selected in this choice set
            if (choices.some((choice) => choice.id === u.Id)) {
                return false;
            }

            if (!ownedUpgradeIds.has(u.Id)) {
                return true; // New upgrade available
            }

            // Check if we can upgrade existing upgrade to higher tier
            let existing = playerUpgrades.find((p) => p.id === u.Id);
            return existing && existing.tier < u.Tiers.length;
        });

        if (availableUpgrades.length === 0) break;

        // Calculate what tier each upgrade would be if selected
        let upgradesWithTiers = availableUpgrades.map((upgrade) => {
            let existingUpgrade = playerUpgrades.find((p) => p.id === upgrade.Id);
            let tier = existingUpgrade ? existingUpgrade.tier + 1 : 1;
            return {upgrade, tier};
        });

        let selectedUpgradeWithTier = selectUpgradeByTierRarity(upgradesWithTiers);
        choices.push({id: selectedUpgradeWithTier.upgrade.Id, tier: selectedUpgradeWithTier.tier});
    }

    return choices;
}

// Get tier-adjusted rarity for selection and display
export function getTierRarity(baseRarity: UpgradeRarity, tier: number): UpgradeRarity {
    // Tier 1 = base rarity, Tier 2 = +1, Tier 3 = +2 (capped at Legendary)
    return Math.min(UpgradeRarity.Legendary, baseRarity + (tier - 1));
}

// Weighted selection based on tier-adjusted rarity
function selectUpgradeByTierRarity(upgradesWithTiers: {upgrade: UpgradeType; tier: number}[]): {
    upgrade: UpgradeType;
    tier: number;
} {
    // Calculate total weight based on tier-adjusted rarity
    let totalWeight = 0;
    for (let item of upgradesWithTiers) {
        let tierRarity = getTierRarity(item.upgrade.Rarity, item.tier);
        totalWeight += getRarityWeight(tierRarity);
    }

    // Generate random number from 0 to totalWeight
    let randomWeight = float() * totalWeight;

    // Select upgrade based on cumulative weights
    let cumulativeWeight = 0;
    for (let item of upgradesWithTiers) {
        let tierRarity = getTierRarity(item.upgrade.Rarity, item.tier);
        cumulativeWeight += getRarityWeight(tierRarity);
        if (randomWeight <= cumulativeWeight) {
            return item;
        }
    }

    // Fallback (should never happen)
    return upgradesWithTiers[upgradesWithTiers.length - 1];
}

// Weighted selection based on upgrade rarity
function selectUpgradeByRarity(availableUpgrades: UpgradeType[]): UpgradeType {
    // Calculate total weight based on rarity
    let totalWeight = 0;
    for (let upgrade of availableUpgrades) {
        totalWeight += getRarityWeight(upgrade.Rarity);
    }

    // Generate random number from 0 to totalWeight
    let randomWeight = float() * totalWeight;

    // Select upgrade based on cumulative weights
    let cumulativeWeight = 0;
    for (let upgrade of availableUpgrades) {
        cumulativeWeight += getRarityWeight(upgrade.Rarity);
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
            return 4; // 4% chance
        case UpgradeRarity.Legendary:
            return 1; // 1% chance
        default:
            return 70; // Default to common
    }
}

export function calculatePopulation(level: number): number {
    // Exponential decay: each victory halves the population
    return Math.max(1, Math.floor(8_000_000_000 / Math.pow(2, level - 1)));
}

export function addPlayerUpgrade(
    playerUpgrades: UpgradeInstance[],
    upgradeId: UpgradeId,
): UpgradeInstance[] {
    // Find existing upgrade instance
    let existingIndex = playerUpgrades.findIndex((u) => u.id === upgradeId);

    if (existingIndex >= 0) {
        // Upgrade existing to next tier
        let updated = [...playerUpgrades];
        updated[existingIndex] = {
            id: upgradeId,
            tier: updated[existingIndex].tier + 1,
        };
        return updated;
    } else {
        // Add new upgrade at tier 1
        return [...playerUpgrades, {id: upgradeId, tier: 1}];
    }
}

export function createFreshGameState(): GameState {
    let initialPlayerUpgrades: UpgradeInstance[] = [];
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

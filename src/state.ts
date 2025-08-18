import {ALL_UPGRADES, UpgradeType, WEAPON_UPGRADES, ARMOR_UPGRADES} from "./upgrades/types.js";
import {set_seed, integer, shuffle} from "../lib/random.js";

export interface GameState {
    currentLevel: number; // 1-33 duels
    playerUpgrades: UpgradeType[]; // Player's accumulated upgrades
    opponentUpgrades: UpgradeType[]; // Current opponent's upgrades
    population: number; // Narrative countdown (8 billion -> 1)
    isNewRun: boolean; // Fresh start vs resumed
}

export function generateOpponentUpgrades(arenaLevel: number): UpgradeType[] {
    // Use seeded random for consistent upgrades per arena level
    set_seed(arenaLevel * 12345 + 67890);

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

export function calculatePopulation(level: number): number {
    // Exponential decay: each victory halves the population
    return Math.max(1, Math.floor(8_000_000_000 / Math.pow(2, level - 1)));
}

export function createFreshGameState(): GameState {
    return {
        currentLevel: 1,
        playerUpgrades: [],
        opponentUpgrades: generateOpponentUpgrades(1),
        population: 8_000_000_000,
        isNewRun: true,
    };
}

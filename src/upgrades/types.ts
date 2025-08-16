export interface UpgradeType {
    id: string;          // "battle_axe", "scrap_armor", etc.
    category: UpgradeCategory;
    name: string;        // Display name
    description: string; // UI description
    tier?: number;       // For power scaling (optional)
    data?: any;          // Upgrade-specific parameters (optional)
}

export const enum UpgradeCategory {
    Weapon = "weapon",
    Armor = "armor", 
    Ability = "ability",
    Companion = "companion",
    Special = "special"
}

export interface GameState {
    currentLevel: number;           // 1-33 duels
    playerUpgrades: UpgradeType[];  // Player's accumulated upgrades
    population: number;             // Narrative countdown (8 billion -> 1)
    isNewRun: boolean;              // Fresh start vs resumed
}

// Weapon upgrade definitions
export const WEAPON_UPGRADES: UpgradeType[] = [
    {
        id: "battle_axe",
        category: UpgradeCategory.Weapon,
        name: "Battle Axe",
        description: "Heavy melee weapon with high damage and short range"
    },
    {
        id: "pistol", 
        category: UpgradeCategory.Weapon,
        name: "Single-Shot Pistol",
        description: "Ranged weapon that fires bullets at enemies"
    },
    {
        id: "baseball_bat",
        category: UpgradeCategory.Weapon, 
        name: "Baseball Bat",
        description: "Melee weapon with knockback effect"
    },
    {
        id: "throwing_knives",
        category: UpgradeCategory.Weapon,
        name: "Throwing Knives", 
        description: "Multiple projectiles with spread pattern"
    }
];

// All upgrades registry (weapons only for now)
export const ALL_UPGRADES: UpgradeType[] = [
    ...WEAPON_UPGRADES
];
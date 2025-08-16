export interface UpgradeType {
    id: string; // "battle_axe", "scrap_armor", etc.
    category: UpgradeCategory;
    name: string; // Display name
    description: string; // UI description
    tier?: number; // For power scaling (optional)
    data?: any; // Upgrade-specific parameters (optional)
}

export const enum UpgradeCategory {
    Weapon = "weapon",
    Armor = "armor",
    Ability = "ability",
    Companion = "companion",
    Special = "special",
}

export interface GameState {
    currentLevel: number; // 1-33 duels
    playerUpgrades: UpgradeType[]; // Player's accumulated upgrades
    population: number; // Narrative countdown (8 billion -> 1)
    isNewRun: boolean; // Fresh start vs resumed
}

// Weapon upgrade definitions
export const WEAPON_UPGRADES: UpgradeType[] = [
    {
        id: "battle_axe",
        category: UpgradeCategory.Weapon,
        name: "Battle Axe",
        description: "Heavy melee weapon with high damage and short range",
    },
    {
        id: "pistol",
        category: UpgradeCategory.Weapon,
        name: "Single-Shot Pistol",
        description: "Ranged weapon that fires bullets at enemies",
    },
    {
        id: "baseball_bat",
        category: UpgradeCategory.Weapon,
        name: "Baseball Bat",
        description: "Melee weapon with knockback effect",
    },
    {
        id: "throwing_knives",
        category: UpgradeCategory.Weapon,
        name: "Throwing Knives",
        description: "Multiple projectiles with spread pattern",
    },
    {
        id: "shotgun",
        category: UpgradeCategory.Weapon,
        name: "Shotgun",
        description: "Spread shot ranged weapon with multiple projectiles",
    },
    {
        id: "sniper_rifle",
        category: UpgradeCategory.Weapon,
        name: "Sniper Rifle",
        description: "High-damage, long-range precision weapon",
    },
    {
        id: "dual_pistols",
        category: UpgradeCategory.Weapon,
        name: "Dual Pistols",
        description: "Rapid-fire dual wielded pistols",
    },
    {
        id: "chainsaw",
        category: UpgradeCategory.Weapon,
        name: "Chainsaw",
        description: "Continuous damage melee weapon",
    },
    {
        id: "crossbow",
        category: UpgradeCategory.Weapon,
        name: "Crossbow",
        description: "Silent ranged weapon with piercing bolts",
    },
    {
        id: "grenade_launcher",
        category: UpgradeCategory.Weapon,
        name: "Grenade Launcher",
        description: "Explosive area-of-effect ranged weapon",
    },
];

// All upgrades registry (weapons only for now)
export const ALL_UPGRADES: UpgradeType[] = [...WEAPON_UPGRADES];

// Utility function to get upgrade display name by ID
export function getUpgradeDisplayName(upgradeId: string): string {
    const upgrade = ALL_UPGRADES.find((u) => u.id === upgradeId);
    return upgrade?.name || upgradeId;
}

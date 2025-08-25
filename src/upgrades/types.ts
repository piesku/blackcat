export interface UpgradeType {
    id: string; // "battle_axe", "scrap_armor", etc.
    category: UpgradeCategory;
    name: string; // Display name
    description: string; // UI description
    tier?: number; // For power scaling (optional)
    data?: Record<string, unknown>; // Upgrade-specific parameters (optional)
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

// Weapon upgrade definitions - Ranged only, particle-focused
export const WEAPON_UPGRADES: UpgradeType[] = [
    {
        id: "flamethrower",
        category: UpgradeCategory.Weapon,
        name: "Flamethrower",
        description: "Emits a cone of flame particles that damage enemies",
    },
    {
        id: "shotgun",
        category: UpgradeCategory.Weapon,
        name: "Shotgun",
        description: "Spread shot ranged weapon with multiple projectiles",
    },
    {
        id: "minigun",
        category: UpgradeCategory.Weapon,
        name: "Minigun",
        description: "High rate of fire bullet spray with ejecting shell casings",
    },
    {
        id: "sniper_rifle",
        category: UpgradeCategory.Weapon,
        name: "Rifle",
        description: "High-damage, long-range precision weapon with muzzle flash",
    },
    {
        id: "mortar",
        category: UpgradeCategory.Weapon,
        name: "Mortar",
        description: "High-arc explosive shells with area damage",
    },
    {
        id: "boomerang",
        category: UpgradeCategory.Weapon,
        name: "Boomerang",
        description: "Returning projectile that deals damage on the way out and back",
    },
    {
        id: "explosives",
        category: UpgradeCategory.Weapon,
        name: "Explosives",
        description: "Thrown bombs that explode on timeout with debris particles",
    },
    {
        id: "spikeballs",
        category: UpgradeCategory.Weapon,
        name: "Spikeballs",
        description: "Bouncing projectiles that persist and ricochet around the arena",
    },
    {
        id: "larpa",
        category: UpgradeCategory.Weapon,
        name: "Larpa",
        description: "Rockets leaving falling particle damage trails",
    },
    {
        id: "hoover_crack",
        category: UpgradeCategory.Weapon,
        name: "Hoover Crack",
        description: "Spinning particle emitter dealing continuous damage",
    },
    {
        id: "chiquita_bomb",
        category: UpgradeCategory.Weapon,
        name: "Chiquita Bomb",
        description: "Bomb spawning multiple banana sub-bombs",
    },
];

// Armor upgrade definitions
export const ARMOR_UPGRADES: UpgradeType[] = [
    {
        id: "scrap_armor",
        category: UpgradeCategory.Armor,
        name: "Scrap Armor",
        description: "Ignores the first damage instance you take in combat",
    },
    {
        id: "spiked_vest",
        category: UpgradeCategory.Armor,
        name: "Spiked Vest",
        description: "Reflects 1 damage back to attackers",
    },
    {
        id: "bonus_hp",
        category: UpgradeCategory.Armor,
        name: "+2 HP",
        description: "Increases maximum health by 2 points",
    },
    {
        id: "damage_reduction",
        category: UpgradeCategory.Armor,
        name: "Reinforced Plating",
        description: "Reduces all damage taken by 25%",
    },
];

// Ability upgrade definitions
export const ABILITY_UPGRADES: UpgradeType[] = [
    {
        id: "shadow_trail",
        category: UpgradeCategory.Ability,
        name: "Shadow Trail",
        description: "Movement leaves damaging shadow particles behind you",
    },
];

// All upgrades registry
export const ALL_UPGRADES: UpgradeType[] = [
    ...WEAPON_UPGRADES,
    ...ARMOR_UPGRADES,
    ...ABILITY_UPGRADES,
];

// Utility function to get upgrade display name by ID
export function getUpgradeDisplayName(upgradeId: string): string {
    const upgrade = ALL_UPGRADES.find((u) => u.id === upgradeId);
    return upgrade?.name || upgradeId;
}

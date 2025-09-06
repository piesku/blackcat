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
    Energy = "energy",
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
        id: "vitality_boost",
        category: UpgradeCategory.Armor,
        name: "Vitality Boost",
        description: "Increases maximum health by 50%",
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

// Companion upgrade definitions - Cat allies
export const COMPANION_UPGRADES: UpgradeType[] = [
    {
        id: "mr_black",
        category: UpgradeCategory.Companion,
        name: "Mr. Black",
        description: "Most powerful cat companion, disables enemy upgrades",
    },
    {
        id: "mr_orange",
        category: UpgradeCategory.Companion,
        name: "Mr. Orange",
        description: "Fast melee attacker cat with 3 HP and aggressive personality",
    },
    {
        id: "mr_pink",
        category: UpgradeCategory.Companion,
        name: "Mr. Pink",
        description: "Ranged sniper cat with precision attacks",
    },
    {
        id: "mr_white",
        category: UpgradeCategory.Companion,
        name: "Mr. White",
        description: "Tank cat with 5 HP and powerful ranged attacks",
    },
    {
        id: "mr_brown",
        category: UpgradeCategory.Companion,
        name: "Mr. Brown",
        description: "Support cat that heals owner periodically",
    },
    {
        id: "mr_blue",
        category: UpgradeCategory.Companion,
        name: "Mr. Blue",
        description: "Berserker cat that gets stronger when injured",
    },
    {
        id: "mr_gray",
        category: UpgradeCategory.Companion,
        name: "Mr. Gray",
        description: "Stealth cat with invisibility phases",
    },
    {
        id: "mr_red",
        category: UpgradeCategory.Companion,
        name: "Mr. Red",
        description: "Sacrifice cat that explodes when killed",
    },
];

// Energy upgrade definitions - Modify energy system parameters
export const ENERGY_UPGRADES: UpgradeType[] = [
    {
        id: "energy_efficiency",
        category: UpgradeCategory.Energy,
        name: "Energy Efficiency",
        description: "Click rapidly to boost combat performance",
        data: {energyPerTap: 0.3}, // Standard tapping rate
    },
    {
        id: "adrenaline_rush",
        category: UpgradeCategory.Energy,
        name: "Adrenaline Rush",
        description: "Each click provides 67% more energy",
        data: {energyPerTap: 0.5}, // Enhanced tapping rate
    },
    {
        id: "slow_metabolism",
        category: UpgradeCategory.Energy,
        name: "Slow Metabolism",
        description: "Energy decays 50% slower",
        data: {energyDecayRate: 0.5}, // Slower energy decay
    },
    {
        id: "basic_healing",
        category: UpgradeCategory.Energy,
        name: "Basic Healing",
        description: "Hold to restore 1 HP per second",
        data: {healingRate: 1.0}, // Basic healing rate
    },
    {
        id: "rapid_healing",
        category: UpgradeCategory.Energy,
        name: "Rapid Healing",
        description: "Hold to restore 2 HP per second",
        data: {healingRate: 2.0}, // Double healing rate
    },
    {
        id: "energy_conservation",
        category: UpgradeCategory.Energy,
        name: "Energy Conservation",
        description: "Healing drains energy 50% slower",
        data: {healingDrainStrength: 0.5}, // Slower energy drain while healing
    },
    {
        id: "power_stability",
        category: UpgradeCategory.Energy,
        name: "Power Stability",
        description: "Power decays 75% slower",
        data: {powerDecayRate: 4.0}, // Much slower power decay (16.0 -> 4.0)
    },
    {
        id: "hypermetabolism",
        category: UpgradeCategory.Energy,
        name: "Hypermetabolism",
        description: "Energy decays twice as fast but enables powerful 3 HP/s healing",
        data: {energyDecayRate: 2.0, healingRate: 3.0}, // Trade-off upgrade
    },
    {
        id: "combat_stimulant",
        category: UpgradeCategory.Energy,
        name: "Combat Stimulant",
        description: "Supercharged tapping and instant power recovery for aggressive playstyles",
        data: {energyPerTap: 0.8, powerDecayRate: 32.0}, // Very high tapping, very fast power decay
    },
];

// All upgrades registry
export const ALL_UPGRADES: UpgradeType[] = [
    ...WEAPON_UPGRADES,
    ...ARMOR_UPGRADES,
    ...ABILITY_UPGRADES,
    ...COMPANION_UPGRADES,
    ...ENERGY_UPGRADES,
];

// Utility function to get upgrade display name by ID
export function getUpgradeDisplayName(upgradeId: string): string {
    const upgrade = ALL_UPGRADES.find((u) => u.id === upgradeId);
    return upgrade?.name || upgradeId;
}

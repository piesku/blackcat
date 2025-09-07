export const enum UpgradeRarity {
    Common = "common", // 70% chance - basic upgrades
    Uncommon = "uncommon", // 25% chance - enhanced upgrades
    Rare = "rare", // 5% chance - powerful upgrades
}

export interface UpgradeType {
    id: string; // "battle_axe", "scrap_armor", etc.
    category: UpgradeCategory;
    name: string; // Display name
    description: string; // UI description
    rarity: UpgradeRarity; // Determines selection probability
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
        rarity: UpgradeRarity.Uncommon,
    },
    {
        id: "shotgun",
        category: UpgradeCategory.Weapon,
        name: "Shotgun",
        description: "Spread shot ranged weapon with multiple projectiles",
        rarity: UpgradeRarity.Common,
    },
    {
        id: "minigun",
        category: UpgradeCategory.Weapon,
        name: "Minigun",
        description: "High rate of fire bullet spray with ejecting shell casings",
        rarity: UpgradeRarity.Rare,
    },
    {
        id: "sniper_rifle",
        category: UpgradeCategory.Weapon,
        name: "Rifle",
        description: "High-damage, long-range precision weapon with muzzle flash",
        rarity: UpgradeRarity.Common,
    },
    {
        id: "mortar",
        category: UpgradeCategory.Weapon,
        name: "Mortar",
        description: "High-arc explosive shells with area damage",
        rarity: UpgradeRarity.Uncommon,
    },
    {
        id: "boomerang",
        category: UpgradeCategory.Weapon,
        name: "Boomerang",
        description: "Returning projectile that deals damage on the way out and back",
        rarity: UpgradeRarity.Uncommon,
    },
    {
        id: "explosives",
        category: UpgradeCategory.Weapon,
        name: "Explosives",
        description: "Thrown bombs that explode on timeout with debris particles",
        rarity: UpgradeRarity.Common,
    },
    {
        id: "spikeballs",
        category: UpgradeCategory.Weapon,
        name: "Spikeballs",
        description: "Bouncing projectiles that persist and ricochet around the arena",
        rarity: UpgradeRarity.Common,
    },
    {
        id: "larpa",
        category: UpgradeCategory.Weapon,
        name: "Larpa",
        description: "Rockets leaving falling particle damage trails",
        rarity: UpgradeRarity.Rare,
    },
    {
        id: "hoover_crack",
        category: UpgradeCategory.Weapon,
        name: "Hoover Crack",
        description: "Spinning particle emitter dealing continuous damage",
        rarity: UpgradeRarity.Rare,
    },
    {
        id: "chiquita_bomb",
        category: UpgradeCategory.Weapon,
        name: "Chiquita Bomb",
        description: "Bomb spawning multiple banana sub-bombs",
        rarity: UpgradeRarity.Rare,
    },
];

// Armor upgrade definitions
export const ARMOR_UPGRADES: UpgradeType[] = [
    {
        id: "scrap_armor",
        category: UpgradeCategory.Armor,
        name: "Scrap Armor",
        description: "Ignores the first damage instance you take in combat",
        rarity: UpgradeRarity.Common,
    },
    {
        id: "spiked_vest",
        category: UpgradeCategory.Armor,
        name: "Spiked Vest",
        description: "Reflects +1 damage back to attackers (stacks with other reflection)",
        rarity: UpgradeRarity.Common,
    },
    {
        id: "vitality_boost",
        category: UpgradeCategory.Armor,
        name: "Vitality Boost",
        description: "Increases maximum health by +50% of current max (stacks additively)",
        rarity: UpgradeRarity.Uncommon,
    },
    {
        id: "damage_reduction",
        category: UpgradeCategory.Armor,
        name: "Reinforced Plating",
        description: "Reduces all damage taken by 25%",
        rarity: UpgradeRarity.Uncommon,
    },
    {
        id: "regenerative_mesh",
        category: UpgradeCategory.Armor,
        name: "Regenerative Mesh",
        description: "Slowly heal during combat (0.3 HP/s)",
        rarity: UpgradeRarity.Uncommon,
    },
    {
        id: "mirror_armor",
        category: UpgradeCategory.Armor,
        name: "Mirror Armor",
        description: "100% reflect damage but you take 50% of reflected amount",
        rarity: UpgradeRarity.Rare,
    },
    {
        id: "proximity_barrier",
        category: UpgradeCategory.Armor,
        name: "Proximity Barrier",
        description: "Reduce damage from enemies within melee range by 40%",
        rarity: UpgradeRarity.Uncommon,
    },
    {
        id: "last_stand",
        category: UpgradeCategory.Armor,
        name: "Last Stand",
        description: "Take 75% less damage when at 1 HP",
        rarity: UpgradeRarity.Rare,
    },
    {
        id: "thick_hide",
        category: UpgradeCategory.Armor,
        name: "Thick Hide",
        description: "Gain +1 HP and reduce damage from attacks by 1 (minimum 1)",
        rarity: UpgradeRarity.Uncommon,
    },
    {
        id: "tough_skin",
        category: UpgradeCategory.Armor,
        name: "Tough Skin",
        description: "Reduce all damage by 1 (minimum 1 damage)",
        rarity: UpgradeRarity.Common,
    },
];

// Ability upgrade definitions
export const ABILITY_UPGRADES: UpgradeType[] = [
    {
        id: "vampiric",
        category: UpgradeCategory.Ability,
        name: "Vampiric",
        description: "Heal 1 HP for every 2 damage you deal to enemies",
        rarity: UpgradeRarity.Uncommon,
    },
    {
        id: "shadow_trail",
        category: UpgradeCategory.Ability,
        name: "Shadow Trail",
        description: "Movement leaves damaging shadow particles behind you",
        rarity: UpgradeRarity.Uncommon,
    },
    {
        id: "piercing_shots",
        category: UpgradeCategory.Ability,
        name: "Piercing Shots",
        description: "Projectiles go through first enemy and continue",
        rarity: UpgradeRarity.Uncommon,
    },
    {
        id: "phase_walk",
        category: UpgradeCategory.Ability,
        name: "Phase Walk",
        description: "Invincibility for the entire duration of dash attacks",
        rarity: UpgradeRarity.Rare,
    },
    {
        id: "dash_master",
        category: UpgradeCategory.Ability,
        name: "Dash Master",
        description: "+100% dash range",
        rarity: UpgradeRarity.Common,
    },
];

// Companion upgrade definitions - Cat allies
export const COMPANION_UPGRADES: UpgradeType[] = [
    {
        id: "mr_black",
        category: UpgradeCategory.Companion,
        name: "Mr. Black",
        description: "Most powerful cat companion, disables enemy upgrades",
        rarity: UpgradeRarity.Rare,
    },
    {
        id: "mr_orange",
        category: UpgradeCategory.Companion,
        name: "Mr. Orange",
        description: "Fast melee attacker cat with 3 HP and aggressive personality",
        rarity: UpgradeRarity.Common,
    },
    {
        id: "mr_pink",
        category: UpgradeCategory.Companion,
        name: "Mr. Pink",
        description: "Ranged sniper cat with precision attacks",
        rarity: UpgradeRarity.Common,
    },
    {
        id: "mr_white",
        category: UpgradeCategory.Companion,
        name: "Mr. White",
        description: "Tank cat with 5 HP and powerful ranged attacks",
        rarity: UpgradeRarity.Uncommon,
    },
    {
        id: "mr_brown",
        category: UpgradeCategory.Companion,
        name: "Mr. Brown",
        description: "Support cat that heals owner periodically",
        rarity: UpgradeRarity.Uncommon,
    },
    {
        id: "mr_blue",
        category: UpgradeCategory.Companion,
        name: "Mr. Blue",
        description: "Berserker cat that gets stronger when injured",
        rarity: UpgradeRarity.Common,
    },
    {
        id: "mr_gray",
        category: UpgradeCategory.Companion,
        name: "Mr. Gray",
        description: "Stealth cat with invisibility phases",
        rarity: UpgradeRarity.Rare,
    },
    {
        id: "mr_red",
        category: UpgradeCategory.Companion,
        name: "Mr. Red",
        description: "Sacrifice cat that explodes when killed",
        rarity: UpgradeRarity.Uncommon,
    },
];

// Energy upgrade definitions - Modify energy system parameters
export const ENERGY_UPGRADES: UpgradeType[] = [
    {
        id: "energy_efficiency",
        category: UpgradeCategory.Energy,
        name: "Energy Efficiency",
        description: "Click rapidly to boost combat performance (+0.3 energy per tap)",
        rarity: UpgradeRarity.Common,
        data: {energyPerTap: 0.3}, // Standard tapping rate
    },
    {
        id: "adrenaline_rush",
        category: UpgradeCategory.Energy,
        name: "Adrenaline Rush",
        description:
            "Enhanced clicking efficiency (+0.5 energy per tap, stacks with other tapping bonuses)",
        rarity: UpgradeRarity.Uncommon,
        data: {energyPerTap: 0.5}, // Enhanced tapping rate
    },
    {
        id: "slow_metabolism",
        category: UpgradeCategory.Energy,
        name: "Slow Metabolism",
        description: "Energy decays 50% slower",
        rarity: UpgradeRarity.Common,
        data: {energyDecayRate: 0.5}, // Slower energy decay
    },
    {
        id: "basic_healing",
        category: UpgradeCategory.Energy,
        name: "Basic Healing",
        description: "Hold to restore +1 HP per second (stacks with other healing)",
        rarity: UpgradeRarity.Common,
        data: {healingRate: 1.0}, // Additive healing rate
    },
    {
        id: "rapid_healing",
        category: UpgradeCategory.Energy,
        name: "Rapid Healing",
        description: "Hold to restore +2 HP per second (stacks with other healing)",
        rarity: UpgradeRarity.Uncommon,
        data: {healingRate: 2.0}, // Additive healing rate
    },
    {
        id: "energy_conservation",
        category: UpgradeCategory.Energy,
        name: "Energy Conservation",
        description: "Healing drains energy 50% slower",
        rarity: UpgradeRarity.Uncommon,
        data: {healingDrainStrength: 0.5}, // Slower energy drain while healing
    },
    {
        id: "power_stability",
        category: UpgradeCategory.Energy,
        name: "Power Stability",
        description: "Power decays 75% slower",
        rarity: UpgradeRarity.Common,
        data: {powerDecayRate: 4.0}, // Much slower power decay (16.0 -> 4.0)
    },
    {
        id: "hypermetabolism",
        category: UpgradeCategory.Energy,
        name: "Hypermetabolism",
        description: "Energy decays twice as fast but enables powerful +3 HP/s healing",
        rarity: UpgradeRarity.Rare,
        data: {energyDecayRate: 2.0, healingRate: 3.0}, // Trade-off upgrade
    },
    {
        id: "combat_stimulant",
        category: UpgradeCategory.Energy,
        name: "Combat Stimulant",
        description:
            "Supercharged tapping (+0.8 energy per tap) and instant power recovery (stacks with other tapping bonuses)",
        rarity: UpgradeRarity.Rare,
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

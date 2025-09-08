import {UpgradeCategory, UpgradeId, UpgradeRarity, UpgradeType} from "./types.js";

// Weapon upgrade definitions - Ranged only, particle-focused
export const WEAPON_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.Flamethrower]: {
        id: UpgradeId.Flamethrower,
        category: UpgradeCategory.Weapon,
        name: "Flamethrower",
        description: "Emits a cone of flame particles that damage enemies",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Shotgun]: {
        id: UpgradeId.Shotgun,
        category: UpgradeCategory.Weapon,
        name: "Shotgun",
        description: "Spread shot ranged weapon with multiple projectiles",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Minigun]: {
        id: UpgradeId.Minigun,
        category: UpgradeCategory.Weapon,
        name: "Minigun",
        description: "High rate of fire bullet spray with ejecting shell casings",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.SniperRifle]: {
        id: UpgradeId.SniperRifle,
        category: UpgradeCategory.Weapon,
        name: "Rifle",
        description: "High-damage, long-range precision weapon with muzzle flash",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Mortar]: {
        id: UpgradeId.Mortar,
        category: UpgradeCategory.Weapon,
        name: "Mortar",
        description: "High-arc explosive shells with area damage",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Boomerang]: {
        id: UpgradeId.Boomerang,
        category: UpgradeCategory.Weapon,
        name: "Boomerang",
        description: "Returning projectile that deals damage on the way out and back",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Explosives]: {
        id: UpgradeId.Explosives,
        category: UpgradeCategory.Weapon,
        name: "Explosives",
        description: "Thrown bombs that explode on timeout with debris particles",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Spikeballs]: {
        id: UpgradeId.Spikeballs,
        category: UpgradeCategory.Weapon,
        name: "Spikeballs",
        description: "Bouncing projectiles that persist and ricochet around the arena",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Larpa]: {
        id: UpgradeId.Larpa,
        category: UpgradeCategory.Weapon,
        name: "Larpa",
        description: "Rockets leaving falling particle damage trails",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.HooverCrack]: {
        id: UpgradeId.HooverCrack,
        category: UpgradeCategory.Weapon,
        name: "Hoover Crack",
        description: "Spinning particle emitter dealing continuous damage",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.ChiquitaBomb]: {
        id: UpgradeId.ChiquitaBomb,
        category: UpgradeCategory.Weapon,
        name: "Chiquita Bomb",
        description: "Bomb spawning multiple banana sub-bombs",
        rarity: UpgradeRarity.Rare,
    },
};

// Armor upgrade definitions
export const ARMOR_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.ScrapArmor]: {
        id: UpgradeId.ScrapArmor,
        category: UpgradeCategory.Armor,
        name: "Scrap Armor",
        description: "Ignores the first damage instance you take in combat",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.SpikedVest]: {
        id: UpgradeId.SpikedVest,
        category: UpgradeCategory.Armor,
        name: "Spiked Vest",
        description: "Reflects +1 damage back to attackers (stacks with other reflection)",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.VitalityBoost]: {
        id: UpgradeId.VitalityBoost,
        category: UpgradeCategory.Armor,
        name: "Vitality Boost",
        description: "Increases maximum health by +50% of current max (stacks additively)",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.DamageReduction]: {
        id: UpgradeId.DamageReduction,
        category: UpgradeCategory.Armor,
        name: "Reinforced Plating",
        description: "Reduces all damage taken by 25%",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.RegenerativeMesh]: {
        id: UpgradeId.RegenerativeMesh,
        category: UpgradeCategory.Armor,
        name: "Regenerative Mesh",
        description: "Slowly heal during combat (0.3 HP/s)",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.MirrorArmor]: {
        id: UpgradeId.MirrorArmor,
        category: UpgradeCategory.Armor,
        name: "Mirror Armor",
        description: "100% reflect damage but you take 50% of reflected amount",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.ProximityBarrier]: {
        id: UpgradeId.ProximityBarrier,
        category: UpgradeCategory.Armor,
        name: "Proximity Barrier",
        description: "Reduce damage from enemies within melee range by 40%",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.LastStand]: {
        id: UpgradeId.LastStand,
        category: UpgradeCategory.Armor,
        name: "Last Stand",
        description: "Take 75% less damage when at 1 HP",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.ThickHide]: {
        id: UpgradeId.ThickHide,
        category: UpgradeCategory.Armor,
        name: "Thick Hide",
        description: "Gain +1 HP and reduce damage from attacks by 1 (minimum 1)",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.ToughSkin]: {
        id: UpgradeId.ToughSkin,
        category: UpgradeCategory.Armor,
        name: "Tough Skin",
        description: "Reduce all damage by 1 (minimum 1 damage)",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Evasion]: {
        id: UpgradeId.Evasion,
        category: UpgradeCategory.Armor,
        name: "Evasion",
        description: "+25% chance to completely avoid damage",
        rarity: UpgradeRarity.Uncommon,
    },
};

// Ability upgrade definitions
export const ABILITY_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.Vampiric]: {
        id: UpgradeId.Vampiric,
        category: UpgradeCategory.Ability,
        name: "Vampiric",
        description: "Heal 1 HP for every 2 damage you deal to enemies",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.ShadowTrail]: {
        id: UpgradeId.ShadowTrail,
        category: UpgradeCategory.Ability,
        name: "Shadow Trail",
        description: "Movement leaves damaging shadow particles behind you",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.PiercingShots]: {
        id: UpgradeId.PiercingShots,
        category: UpgradeCategory.Ability,
        name: "Piercing Shots",
        description: "Projectiles go through first enemy and continue",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.PhaseWalk]: {
        id: UpgradeId.PhaseWalk,
        category: UpgradeCategory.Ability,
        name: "Phase Walk",
        description: "Invincibility for the entire duration of dash attacks",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.DashMaster]: {
        id: UpgradeId.DashMaster,
        category: UpgradeCategory.Ability,
        name: "Dash Master",
        description: "+100% dash range",
        rarity: UpgradeRarity.Common,
    },
};

// Companion upgrade definitions - Cat allies
export const COMPANION_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.MrBlack]: {
        id: UpgradeId.MrBlack,
        category: UpgradeCategory.Companion,
        name: "Mr. Black",
        description: "Most powerful cat companion, disables enemy upgrades",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.MrOrange]: {
        id: UpgradeId.MrOrange,
        category: UpgradeCategory.Companion,
        name: "Mr. Orange",
        description: "Fast melee attacker cat with 3 HP and aggressive personality",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.MrPink]: {
        id: UpgradeId.MrPink,
        category: UpgradeCategory.Companion,
        name: "Mr. Pink",
        description: "Ranged sniper cat with precision attacks",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.MrWhite]: {
        id: UpgradeId.MrWhite,
        category: UpgradeCategory.Companion,
        name: "Mr. White",
        description: "Tank cat with 5 HP and powerful ranged attacks",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.MrBrown]: {
        id: UpgradeId.MrBrown,
        category: UpgradeCategory.Companion,
        name: "Mr. Brown",
        description: "Support cat that heals owner periodically",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.MrBlue]: {
        id: UpgradeId.MrBlue,
        category: UpgradeCategory.Companion,
        name: "Mr. Blue",
        description: "Berserker cat that gets stronger when injured",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.MrGray]: {
        id: UpgradeId.MrGray,
        category: UpgradeCategory.Companion,
        name: "Mr. Gray",
        description: "Stealth cat with invisibility phases",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.MrRed]: {
        id: UpgradeId.MrRed,
        category: UpgradeCategory.Companion,
        name: "Mr. Red",
        description: "Sacrifice cat that explodes when killed",
        rarity: UpgradeRarity.Uncommon,
    },
};

// Energy upgrade definitions - Combat-driven energy system
export const ENERGY_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.CombatVeteran]: {
        id: UpgradeId.CombatVeteran,
        category: UpgradeCategory.Energy,
        name: "Combat Veteran",
        description: "Gain +0.3 energy per damage dealt to enemies",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.BattleFury]: {
        id: UpgradeId.BattleFury,
        category: UpgradeCategory.Energy,
        name: "Battle Fury",
        description: "Enhanced combat energy generation (+0.5 energy per damage dealt, stacks)",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.AdrenalineSurge]: {
        id: UpgradeId.AdrenalineSurge,
        category: UpgradeCategory.Energy,
        name: "Adrenaline Surge",
        description: "Gain +0.2 energy per damage taken (pain fuels power)",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.BerserkersFocus]: {
        id: UpgradeId.BerserkersFocus,
        category: UpgradeCategory.Energy,
        name: "Berserker's Focus",
        description: "Double energy generation when below 50% health",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.SlowMetabolism]: {
        id: UpgradeId.SlowMetabolism,
        category: UpgradeCategory.Energy,
        name: "Slow Metabolism",
        description: "Energy decays 50% slower",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.CombatMedic]: {
        id: UpgradeId.CombatMedic,
        category: UpgradeCategory.Energy,
        name: "Combat Medic",
        description: "Auto-heal +1 HP per second when energy > 50% (stacks with other healing)",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.FieldSurgeon]: {
        id: UpgradeId.FieldSurgeon,
        category: UpgradeCategory.Energy,
        name: "Field Surgeon",
        description: "Auto-heal +2 HP per second when energy > 50% (stacks with other healing)",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Hypermetabolism]: {
        id: UpgradeId.Hypermetabolism,
        category: UpgradeCategory.Energy,
        name: "Hypermetabolism",
        description: "Energy decays twice as fast but enables powerful +3 HP/s auto-healing",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.WeaponMastery]: {
        id: UpgradeId.WeaponMastery,
        category: UpgradeCategory.Energy,
        name: "Weapon Mastery",
        description: "Gain +0.8 energy per damage dealt and +25% weapon damage when energy > 75%",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.PainTolerance]: {
        id: UpgradeId.PainTolerance,
        category: UpgradeCategory.Energy,
        name: "Pain Tolerance",
        description: "Gain +0.4 energy per damage taken and reduce damage by 1 (minimum 1)",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.ShockwaveBurst]: {
        id: UpgradeId.ShockwaveBurst,
        category: UpgradeCategory.Energy,
        name: "Shockwave Burst",
        description:
            "Automatically spawn damaging particles in all directions when energy reaches maximum",
        rarity: UpgradeRarity.Rare,
    },
};

// Trait upgrade definitions - Combat & behavioral enhancement
export const TRAIT_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.LightningReflexes]: {
        id: UpgradeId.LightningReflexes,
        category: UpgradeCategory.Trait,
        name: "Lightning Reflexes",
        description: "+50% movement speed and dash speed",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.QuickDraw]: {
        id: UpgradeId.QuickDraw,
        category: UpgradeCategory.Trait,
        name: "Quick Draw",
        description: "+40% attack speed (faster weapon cooldowns)",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Brawler]: {
        id: UpgradeId.Brawler,
        category: UpgradeCategory.Trait,
        name: "Brawler",
        description: "Higher aggressiveness, shorter dash range but +1 damage to all attacks",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Vitality]: {
        id: UpgradeId.Vitality,
        category: UpgradeCategory.Trait,
        name: "Vitality",
        description: "+2 maximum health",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.BerserkerMode]: {
        id: UpgradeId.BerserkerMode,
        category: UpgradeCategory.Trait,
        name: "Berserker Mode",
        description: "+50% attack speed and movement when below 25% HP",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Pacifist]: {
        id: UpgradeId.Pacifist,
        category: UpgradeCategory.Trait,
        name: "Pacifist",
        description: "Much lower aggressiveness but +3 max health and +50% damage reduction",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.Cautious]: {
        id: UpgradeId.Cautious,
        category: UpgradeCategory.Trait,
        name: "Cautious",
        description: "Lower aggressiveness but +1 max health and better retreat timing",
        rarity: UpgradeRarity.Common,
    },
};

// All upgrades registry
export const ALL_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    ...WEAPON_UPGRADES_MAP,
    ...ARMOR_UPGRADES_MAP,
    ...ABILITY_UPGRADES_MAP,
    ...COMPANION_UPGRADES_MAP,
    ...ENERGY_UPGRADES_MAP,
    ...TRAIT_UPGRADES_MAP,
};

export const ALL_UPGRADES_LIST: UpgradeType[] = Object.values(ALL_UPGRADES_MAP) as UpgradeType[];

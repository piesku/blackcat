import {UpgradeCategory, UpgradeId, UpgradeRarity, UpgradeType} from "./types.js";

// Weapon upgrade definitions - Ranged only, particle-focused
export const WEAPON_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.Flamethrower]: {
        id: UpgradeId.Flamethrower,
        category: UpgradeCategory.Weapon,
        name: "Flamethrower",
        description: "Cone of flames",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Shotgun]: {
        id: UpgradeId.Shotgun,
        category: UpgradeCategory.Weapon,
        name: "Shotgun",
        description: "Spread shot",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Minigun]: {
        id: UpgradeId.Minigun,
        category: UpgradeCategory.Weapon,
        name: "Minigun",
        description: "Rapid fire spray",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.SniperRifle]: {
        id: UpgradeId.SniperRifle,
        category: UpgradeCategory.Weapon,
        name: "Rifle",
        description: "Long-range precision",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Mortar]: {
        id: UpgradeId.Mortar,
        category: UpgradeCategory.Weapon,
        name: "Mortar",
        description: "Arc explosives",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Boomerang]: {
        id: UpgradeId.Boomerang,
        category: UpgradeCategory.Weapon,
        name: "Boomerang",
        description: "Returns to sender",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Explosives]: {
        id: UpgradeId.Explosives,
        category: UpgradeCategory.Weapon,
        name: "Explosives",
        description: "Timed bombs",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Spikeballs]: {
        id: UpgradeId.Spikeballs,
        category: UpgradeCategory.Weapon,
        name: "Spikeballs",
        description: "Bouncing ricochets",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Larpa]: {
        id: UpgradeId.Larpa,
        category: UpgradeCategory.Weapon,
        name: "Larpa",
        description: "Trail damage",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.HooverCrack]: {
        id: UpgradeId.HooverCrack,
        category: UpgradeCategory.Weapon,
        name: "Hoover Crack",
        description: "Spinning damage",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.ChiquitaBomb]: {
        id: UpgradeId.ChiquitaBomb,
        category: UpgradeCategory.Weapon,
        name: "Chiquita Bomb",
        description: "Banana cluster bomb",
        rarity: UpgradeRarity.Rare,
    },
};

// Armor upgrade definitions
export const ARMOR_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.ScrapArmor]: {
        id: UpgradeId.ScrapArmor,
        category: UpgradeCategory.Enhancement,
        name: "Scrap Armor",
        description: "Block first hit",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.SpikedVest]: {
        id: UpgradeId.SpikedVest,
        category: UpgradeCategory.Enhancement,
        name: "Spiked Vest",
        description: "+1 damage reflect",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.DamageReduction]: {
        id: UpgradeId.DamageReduction,
        category: UpgradeCategory.Enhancement,
        name: "Reinforced Plating",
        description: "-25% damage taken",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.RegenerativeMesh]: {
        id: UpgradeId.RegenerativeMesh,
        category: UpgradeCategory.Enhancement,
        name: "Regenerative Mesh",
        description: "+0.3 HP/sec regen",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.MirrorArmor]: {
        id: UpgradeId.MirrorArmor,
        category: UpgradeCategory.Enhancement,
        name: "Mirror Armor",
        description: "100% reflect, 50% self",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.ProximityBarrier]: {
        id: UpgradeId.ProximityBarrier,
        category: UpgradeCategory.Enhancement,
        name: "Proximity Barrier",
        description: "-40% melee damage",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.LastStand]: {
        id: UpgradeId.LastStand,
        category: UpgradeCategory.Enhancement,
        name: "Last Stand",
        description: "-75% damage at 1 HP",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.ThickHide]: {
        id: UpgradeId.ThickHide,
        category: UpgradeCategory.Enhancement,
        name: "Thick Hide",
        description: "+1 HP, -1 damage",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Evasion]: {
        id: UpgradeId.Evasion,
        category: UpgradeCategory.Enhancement,
        name: "Evasion",
        description: "25% dodge chance",
        rarity: UpgradeRarity.Uncommon,
    },
};

// Ability upgrade definitions
export const ABILITY_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.Vampiric]: {
        id: UpgradeId.Vampiric,
        category: UpgradeCategory.Enhancement,
        name: "Vampiric",
        description: "50% lifesteal",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.ShadowTrail]: {
        id: UpgradeId.ShadowTrail,
        category: UpgradeCategory.Special,
        name: "Shadow Trail",
        description: "Damage trail",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.PhaseWalk]: {
        id: UpgradeId.PhaseWalk,
        category: UpgradeCategory.Enhancement,
        name: "Phase Walk",
        description: "Invincible dashes",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.DashMaster]: {
        id: UpgradeId.DashMaster,
        category: UpgradeCategory.Enhancement,
        name: "Dash Master",
        description: "2x dash range",
        rarity: UpgradeRarity.Common,
    },
};

// Companion upgrade definitions - Cat allies
export const COMPANION_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.MrBlack]: {
        id: UpgradeId.MrBlack,
        category: UpgradeCategory.Companion,
        name: "Mr. Black",
        description: "Disables enemy upgrades",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.MrOrange]: {
        id: UpgradeId.MrOrange,
        category: UpgradeCategory.Companion,
        name: "Mr. Orange",
        description: "Fast melee, 3 HP",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.MrPink]: {
        id: UpgradeId.MrPink,
        category: UpgradeCategory.Companion,
        name: "Mr. Pink",
        description: "Ranged sniper",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.MrWhite]: {
        id: UpgradeId.MrWhite,
        category: UpgradeCategory.Companion,
        name: "Mr. White",
        description: "Tank, 5 HP",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.MrBrown]: {
        id: UpgradeId.MrBrown,
        category: UpgradeCategory.Companion,
        name: "Mr. Brown",
        description: "Healer support",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.MrBlue]: {
        id: UpgradeId.MrBlue,
        category: UpgradeCategory.Companion,
        name: "Mr. Blue",
        description: "Rage when hurt",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.MrGray]: {
        id: UpgradeId.MrGray,
        category: UpgradeCategory.Companion,
        name: "Mr. Gray",
        description: "Stealth mode",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.MrRed]: {
        id: UpgradeId.MrRed,
        category: UpgradeCategory.Companion,
        name: "Mr. Red",
        description: "Explodes on death",
        rarity: UpgradeRarity.Uncommon,
    },
};

// Energy upgrade definitions - Combat-driven energy system
export const ENERGY_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.CombatVeteran]: {
        id: UpgradeId.CombatVeteran,
        category: UpgradeCategory.Enhancement,
        name: "Combat Veteran",
        description: "+0.3 energy/damage",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.BattleFury]: {
        id: UpgradeId.BattleFury,
        category: UpgradeCategory.Enhancement,
        name: "Battle Fury",
        description: "+0.5 energy/damage",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.AdrenalineSurge]: {
        id: UpgradeId.AdrenalineSurge,
        category: UpgradeCategory.Enhancement,
        name: "Adrenaline Surge",
        description: "+0.2 energy when hit",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.SlowMetabolism]: {
        id: UpgradeId.SlowMetabolism,
        category: UpgradeCategory.Enhancement,
        name: "Slow Metabolism",
        description: "-50% energy decay",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.CombatMedic]: {
        id: UpgradeId.CombatMedic,
        category: UpgradeCategory.Enhancement,
        name: "Combat Medic",
        description: "+1 HP/s at >50% energy",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.FieldSurgeon]: {
        id: UpgradeId.FieldSurgeon,
        category: UpgradeCategory.Enhancement,
        name: "Field Surgeon",
        description: "+2 HP/s at >50% energy",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Hypermetabolism]: {
        id: UpgradeId.Hypermetabolism,
        category: UpgradeCategory.Enhancement,
        name: "Hypermetabolism",
        description: "+3 HP/s, 2x decay",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.WeaponMastery]: {
        id: UpgradeId.WeaponMastery,
        category: UpgradeCategory.Enhancement,
        name: "Weapon Mastery",
        description: "+0.8 energy, +25% dmg",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.PainTolerance]: {
        id: UpgradeId.PainTolerance,
        category: UpgradeCategory.Enhancement,
        name: "Pain Tolerance",
        description: "+0.4 energy, -1 dmg",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.ShockwaveBurst]: {
        id: UpgradeId.ShockwaveBurst,
        category: UpgradeCategory.Enhancement,
        name: "Shockwave Burst",
        description: "Burst at max energy",
        rarity: UpgradeRarity.Rare,
    },
};

// Trait upgrade definitions - Combat & behavioral enhancement
export const TRAIT_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.LightningReflexes]: {
        id: UpgradeId.LightningReflexes,
        category: UpgradeCategory.Enhancement,
        name: "Lightning Reflexes",
        description: "+50% speed",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.QuickDraw]: {
        id: UpgradeId.QuickDraw,
        category: UpgradeCategory.Enhancement,
        name: "Quick Draw",
        description: "+40% attack speed",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Brawler]: {
        id: UpgradeId.Brawler,
        category: UpgradeCategory.Enhancement,
        name: "Brawler",
        description: "+1 damage, aggressive",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Vitality]: {
        id: UpgradeId.Vitality,
        category: UpgradeCategory.Enhancement,
        name: "Vitality",
        description: "+2 max HP",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.BerserkerMode]: {
        id: UpgradeId.BerserkerMode,
        category: UpgradeCategory.Enhancement,
        name: "Berserker",
        description: "+50% speed at <25% HP",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Pacifist]: {
        id: UpgradeId.Pacifist,
        category: UpgradeCategory.Enhancement,
        name: "Pacifist",
        description: "+3 HP, -50% damage",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.Cautious]: {
        id: UpgradeId.Cautious,
        category: UpgradeCategory.Enhancement,
        name: "Cautious",
        description: "+1 HP, defensive",
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

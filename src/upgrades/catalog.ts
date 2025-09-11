import {UpgradeCategory, UpgradeId, UpgradeRarity, UpgradeType} from "./types.js";

// Weapon upgrade definitions - Ranged only, particle-focused
export const WEAPON_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.Flamethrower]: {
        id: UpgradeId.Flamethrower,
        category: UpgradeCategory.Weapon,
        name: "Flamethrower",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Shotgun]: {
        id: UpgradeId.Shotgun,
        category: UpgradeCategory.Weapon,
        name: "Shotgun",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Minigun]: {
        id: UpgradeId.Minigun,
        category: UpgradeCategory.Weapon,
        name: "Minigun",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.SniperRifle]: {
        id: UpgradeId.SniperRifle,
        category: UpgradeCategory.Weapon,
        name: "Sniper rifle",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Mortar]: {
        id: UpgradeId.Mortar,
        category: UpgradeCategory.Weapon,
        name: "Mortar",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Boomerang]: {
        id: UpgradeId.Boomerang,
        category: UpgradeCategory.Weapon,
        name: "Boomerang",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Explosives]: {
        id: UpgradeId.Explosives,
        category: UpgradeCategory.Weapon,
        name: "Dynamite",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Spikeballs]: {
        id: UpgradeId.Spikeballs,
        category: UpgradeCategory.Weapon,
        name: "Spikeballs",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Larpa]: {
        id: UpgradeId.Larpa,
        category: UpgradeCategory.Weapon,
        name: "Larpa",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.HooverCrack]: {
        id: UpgradeId.HooverCrack,
        category: UpgradeCategory.Weapon,
        name: "Hoover crack",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.ChiquitaBomb]: {
        id: UpgradeId.ChiquitaBomb,
        category: UpgradeCategory.Weapon,
        name: "Chiquita bomb",
        rarity: UpgradeRarity.Rare,
    },
};

// Armor upgrade definitions
export const ARMOR_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.ScrapArmor]: {
        id: UpgradeId.ScrapArmor,
        category: UpgradeCategory.Enhancement,
        name: "Block first hit",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.SpikedVest]: {
        id: UpgradeId.SpikedVest,
        category: UpgradeCategory.Enhancement,
        name: "Reflect +1 damage",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.DamageReduction]: {
        id: UpgradeId.DamageReduction,
        category: UpgradeCategory.Enhancement,
        name: "Take -25% damage",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.RegenerativeMesh]: {
        id: UpgradeId.RegenerativeMesh,
        category: UpgradeCategory.Enhancement,
        name: "Regen +0.3 HP/s",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.MirrorArmor]: {
        id: UpgradeId.MirrorArmor,
        category: UpgradeCategory.Enhancement,
        name: "100% reflect, 50% self",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.ProximityBarrier]: {
        id: UpgradeId.ProximityBarrier,
        category: UpgradeCategory.Enhancement,
        name: "-40% melee damage",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.LastStand]: {
        id: UpgradeId.LastStand,
        category: UpgradeCategory.Enhancement,
        name: "-75% damage at 1 hp",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.ThickHide]: {
        id: UpgradeId.ThickHide,
        category: UpgradeCategory.Enhancement,
        name: "+1 hp, -1 damage",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Evasion]: {
        id: UpgradeId.Evasion,
        category: UpgradeCategory.Enhancement,
        name: "25% dodge chance",
        rarity: UpgradeRarity.Uncommon,
    },
};

// Ability upgrade definitions
export const ABILITY_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.Vampiric]: {
        id: UpgradeId.Vampiric,
        category: UpgradeCategory.Enhancement,
        name: "50% lifesteal",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.ShadowTrail]: {
        id: UpgradeId.ShadowTrail,
        category: UpgradeCategory.Special,
        name: "Shadow trail",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.PhaseWalk]: {
        id: UpgradeId.PhaseWalk,
        category: UpgradeCategory.Enhancement,
        name: "Invincible dash",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.DashMaster]: {
        id: UpgradeId.DashMaster,
        category: UpgradeCategory.Enhancement,
        name: "2x dash range",
        rarity: UpgradeRarity.Common,
    },
};

// Companion upgrade definitions - Cat allies
export const COMPANION_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.MrBlack]: {
        id: UpgradeId.MrBlack,
        category: UpgradeCategory.Companion,
        name: "Spawn Cat",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.MrOrange]: {
        id: UpgradeId.MrOrange,
        category: UpgradeCategory.Companion,
        name: "Melee Cat",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.MrPink]: {
        id: UpgradeId.MrPink,
        category: UpgradeCategory.Companion,
        name: "Sniper Cat",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.MrWhite]: {
        id: UpgradeId.MrWhite,
        category: UpgradeCategory.Companion,
        name: "Tank Cat",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.MrBrown]: {
        id: UpgradeId.MrBrown,
        category: UpgradeCategory.Companion,
        name: "Bodyguard Cat",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.MrBlue]: {
        id: UpgradeId.MrBlue,
        category: UpgradeCategory.Companion,
        name: "Berserker Cat",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.MrGray]: {
        id: UpgradeId.MrGray,
        category: UpgradeCategory.Companion,
        name: "Stealth Cat",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.MrRed]: {
        id: UpgradeId.MrRed,
        category: UpgradeCategory.Companion,
        name: "Suicide Cat",
        rarity: UpgradeRarity.Uncommon,
    },
};

// Energy upgrade definitions - Combat-driven energy system
export const ENERGY_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.CombatVeteran]: {
        id: UpgradeId.CombatVeteran,
        category: UpgradeCategory.Enhancement,
        name: "+0.3 power/damage",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.BattleFury]: {
        id: UpgradeId.BattleFury,
        category: UpgradeCategory.Enhancement,
        name: "+0.5 power/damage",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.AdrenalineSurge]: {
        id: UpgradeId.AdrenalineSurge,
        category: UpgradeCategory.Enhancement,
        name: "+0.2 power when hit",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.SlowMetabolism]: {
        id: UpgradeId.SlowMetabolism,
        category: UpgradeCategory.Enhancement,
        name: "-50% power decay",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.CombatMedic]: {
        id: UpgradeId.CombatMedic,
        category: UpgradeCategory.Enhancement,
        name: "+1 HP/s at >50% power",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.FieldSurgeon]: {
        id: UpgradeId.FieldSurgeon,
        category: UpgradeCategory.Enhancement,
        name: "+2 HP/s at >50% power",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Hypermetabolism]: {
        id: UpgradeId.Hypermetabolism,
        category: UpgradeCategory.Enhancement,
        name: "+3 HP/s, 2x power decay",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.WeaponMastery]: {
        id: UpgradeId.WeaponMastery,
        category: UpgradeCategory.Enhancement,
        name: "+0.8 power, +25% dmg",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.PainTolerance]: {
        id: UpgradeId.PainTolerance,
        category: UpgradeCategory.Enhancement,
        name: "+0.4 power, -1 dmg",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.ShockwaveBurst]: {
        id: UpgradeId.ShockwaveBurst,
        category: UpgradeCategory.Enhancement,
        name: "Burst at max power",
        rarity: UpgradeRarity.Rare,
    },
};

// Trait upgrade definitions - Combat & behavioral enhancement
export const TRAIT_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.LightningReflexes]: {
        id: UpgradeId.LightningReflexes,
        category: UpgradeCategory.Enhancement,
        name: "+50% move speed",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.QuickDraw]: {
        id: UpgradeId.QuickDraw,
        category: UpgradeCategory.Enhancement,
        name: "+40% attack speed",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Brawler]: {
        id: UpgradeId.Brawler,
        category: UpgradeCategory.Enhancement,
        name: "+1 damage, aggressive",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Vitality]: {
        id: UpgradeId.Vitality,
        category: UpgradeCategory.Enhancement,
        name: "+2 max HP",
        rarity: UpgradeRarity.Common,
    },
    [UpgradeId.BerserkerMode]: {
        id: UpgradeId.BerserkerMode,
        category: UpgradeCategory.Enhancement,
        name: "+50% speed at <25% HP",
        rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Pacifist]: {
        id: UpgradeId.Pacifist,
        category: UpgradeCategory.Enhancement,
        name: "+3 HP, -50% damage",
        rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.Cautious]: {
        id: UpgradeId.Cautious,
        category: UpgradeCategory.Enhancement,
        name: "+1 HP, defensive",
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

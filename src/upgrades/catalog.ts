import {UpgradeCategory, UpgradeId, UpgradeRarity, UpgradeType} from "./types.js";

// Weapon upgrade definitions - Ranged only, particle-focused
export const WEAPON_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.Flamethrower]: {
        Id: UpgradeId.Flamethrower,
        Category: UpgradeCategory.Weapon,
        Name: "Flamethrower",
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Shotgun]: {
        Id: UpgradeId.Shotgun,
        Category: UpgradeCategory.Weapon,
        Name: "Shotgun",
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Minigun]: {
        Id: UpgradeId.Minigun,
        Category: UpgradeCategory.Weapon,
        Name: "Minigun",
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.SniperRifle]: {
        Id: UpgradeId.SniperRifle,
        Category: UpgradeCategory.Weapon,
        Name: "Sniper rifle",
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Mortar]: {
        Id: UpgradeId.Mortar,
        Category: UpgradeCategory.Weapon,
        Name: "Mortar",
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Boomerang]: {
        Id: UpgradeId.Boomerang,
        Category: UpgradeCategory.Weapon,
        Name: "Boomerang",
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Explosives]: {
        Id: UpgradeId.Explosives,
        Category: UpgradeCategory.Weapon,
        Name: "Dynamite",
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Spikeballs]: {
        Id: UpgradeId.Spikeballs,
        Category: UpgradeCategory.Weapon,
        Name: "Spikeballs",
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Larpa]: {
        Id: UpgradeId.Larpa,
        Category: UpgradeCategory.Weapon,
        Name: "Larpa",
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.HooverCrack]: {
        Id: UpgradeId.HooverCrack,
        Category: UpgradeCategory.Weapon,
        Name: "Hoover crack",
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.ChiquitaBomb]: {
        Id: UpgradeId.ChiquitaBomb,
        Category: UpgradeCategory.Weapon,
        Name: "Chiquita bomb",
        Rarity: UpgradeRarity.Rare,
    },
};

// Armor upgrade definitions
export const ARMOR_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.ScrapArmor]: {
        Id: UpgradeId.ScrapArmor,
        Category: UpgradeCategory.Enhancement,
        Name: "Scrap Armor",
        Description: "Absorb first damage taken",
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.SpikedVest]: {
        Id: UpgradeId.SpikedVest,
        Category: UpgradeCategory.Enhancement,
        Name: "Spiked Vest",
        Description: "Reflect +1 damage",
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.DamageReduction]: {
        Id: UpgradeId.DamageReduction,
        Category: UpgradeCategory.Enhancement,
        Name: "Damage Reduction",
        Description: "Reduce all damage by 25%",
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.RegenerativeMesh]: {
        Id: UpgradeId.RegenerativeMesh,
        Category: UpgradeCategory.Enhancement,
        Name: "Regeneration",
        Description: "Heal +0.3 life per second",
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.MirrorArmor]: {
        Id: UpgradeId.MirrorArmor,
        Category: UpgradeCategory.Enhancement,
        Name: "Mirror Armor",
        Description: "Reflect all damage, take 50%",
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.LastStand]: {
        Id: UpgradeId.LastStand,
        Category: UpgradeCategory.Enhancement,
        Name: "Last Stand",
        Description: "75% damage reduction at 1 life",
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.ThickHide]: {
        Id: UpgradeId.ThickHide,
        Category: UpgradeCategory.Enhancement,
        Name: "Thick Hide",
        Description: "+1 max life, reduce damage by 1",
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Evasion]: {
        Id: UpgradeId.Evasion,
        Category: UpgradeCategory.Enhancement,
        Name: "Evasion",
        Description: "25% chance to dodge attacks",
        Rarity: UpgradeRarity.Uncommon,
    },
};

// Ability upgrade definitions
export const ABILITY_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.Vampiric]: {
        Id: UpgradeId.Vampiric,
        Category: UpgradeCategory.Enhancement,
        Name: "Vampiric",
        Description: "50% lifesteal",
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.ShadowTrail]: {
        Id: UpgradeId.ShadowTrail,
        Category: UpgradeCategory.Special,
        Name: "Shadow Wake",
        Description: "Leave damaging shadow particles",
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.PhaseWalk]: {
        Id: UpgradeId.PhaseWalk,
        Category: UpgradeCategory.Enhancement,
        Name: "Phase Walk",
        Description: "Invulnerable while dashing",
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.DashMaster]: {
        Id: UpgradeId.DashMaster,
        Category: UpgradeCategory.Enhancement,
        Name: "Dash Master",
        Description: "Double dash range",
        Rarity: UpgradeRarity.Common,
    },
};

// Companion upgrade definitions - Cat allies
export const COMPANION_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.MrBlack]: {
        Id: UpgradeId.MrBlack,
        Category: UpgradeCategory.Companion,
        Name: "Black Cat",
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.MrOrange]: {
        Id: UpgradeId.MrOrange,
        Category: UpgradeCategory.Companion,
        Name: "Melee Cat",
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.MrPink]: {
        Id: UpgradeId.MrPink,
        Category: UpgradeCategory.Companion,
        Name: "Sniper Cat",
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.MrWhite]: {
        Id: UpgradeId.MrWhite,
        Category: UpgradeCategory.Companion,
        Name: "Tank Cat",
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.MrBrown]: {
        Id: UpgradeId.MrBrown,
        Category: UpgradeCategory.Companion,
        Name: "Bodyguard Cat",
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.MrBlue]: {
        Id: UpgradeId.MrBlue,
        Category: UpgradeCategory.Companion,
        Name: "Berserker Cat",
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.MrGray]: {
        Id: UpgradeId.MrGray,
        Category: UpgradeCategory.Companion,
        Name: "Stealth Cat",
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.MrRed]: {
        Id: UpgradeId.MrRed,
        Category: UpgradeCategory.Companion,
        Name: "Suicide Cat",
        Rarity: UpgradeRarity.Uncommon,
    },
};

// Energy upgrade definitions - Combat-driven energy system
export const ENERGY_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.CombatVeteran]: {
        Id: UpgradeId.CombatVeteran,
        Category: UpgradeCategory.Enhancement,
        Name: "Combat Veteran",
        Description: "+0.3 mana per damage dealt",
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.BattleFury]: {
        Id: UpgradeId.BattleFury,
        Category: UpgradeCategory.Enhancement,
        Name: "Battle Fury",
        Description: "+0.5 mana per damage dealt",
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.AdrenalineSurge]: {
        Id: UpgradeId.AdrenalineSurge,
        Category: UpgradeCategory.Enhancement,
        Name: "Adrenaline Surge",
        Description: "+0.2 mana when hit",
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.SlowMetabolism]: {
        Id: UpgradeId.SlowMetabolism,
        Category: UpgradeCategory.Enhancement,
        Name: "Slow Metabolism",
        Description: "Mana decays 50% slower",
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.CombatMedic]: {
        Id: UpgradeId.CombatMedic,
        Category: UpgradeCategory.Enhancement,
        Name: "Combat Medic",
        Description: "+1 life/s when mana >50%",
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.FieldSurgeon]: {
        Id: UpgradeId.FieldSurgeon,
        Category: UpgradeCategory.Enhancement,
        Name: "Field Surgeon",
        Description: "+2 life/s when mana >50%",
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Hypermetabolism]: {
        Id: UpgradeId.Hypermetabolism,
        Category: UpgradeCategory.Enhancement,
        Name: "Hypermetabolism",
        Description: "+3 life/s, but 2x mana decay",
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.WeaponMastery]: {
        Id: UpgradeId.WeaponMastery,
        Category: UpgradeCategory.Enhancement,
        Name: "Weapon Mastery",
        Description: "+0.8 mana/damage, +25% damage",
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.PainTolerance]: {
        Id: UpgradeId.PainTolerance,
        Category: UpgradeCategory.Enhancement,
        Name: "Pain Tolerance",
        Description: "+0.4 mana/damage, -1 damage taken",
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.ShockwaveBurst]: {
        Id: UpgradeId.ShockwaveBurst,
        Category: UpgradeCategory.Enhancement,
        Name: "Shockwave Burst",
        Description: "Damage burst at full mana",
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.KineticCharger]: {
        Id: UpgradeId.KineticCharger,
        Category: UpgradeCategory.Enhancement,
        Name: "Kinetic Charger",
        Description: "Gain mana while moving",
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.ManaSiphon]: {
        Id: UpgradeId.ManaSiphon,
        Category: UpgradeCategory.Enhancement,
        Name: "Mana Siphon",
        Description: "Drain mana when dealing damage",
        Rarity: UpgradeRarity.Rare,
    },
};

// Trait upgrade definitions - Combat & behavioral enhancement
export const TRAIT_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.LightningReflexes]: {
        Id: UpgradeId.LightningReflexes,
        Category: UpgradeCategory.Enhancement,
        Name: "Lightning Reflexes",
        Description: "+50% movement speed",
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.QuickDraw]: {
        Id: UpgradeId.QuickDraw,
        Category: UpgradeCategory.Enhancement,
        Name: "Quick Draw",
        Description: "+40% attack speed",
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Brawler]: {
        Id: UpgradeId.Brawler,
        Category: UpgradeCategory.Enhancement,
        Name: "Brawler",
        Description: "+1 damage, more aggressive",
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Vitality]: {
        Id: UpgradeId.Vitality,
        Category: UpgradeCategory.Enhancement,
        Name: "Vitality",
        Description: "+2 maximum life",
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.BerserkerMode]: {
        Id: UpgradeId.BerserkerMode,
        Category: UpgradeCategory.Enhancement,
        Name: "Berserker Mode",
        Description: "+50% speed when life <25%",
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Pacifist]: {
        Id: UpgradeId.Pacifist,
        Category: UpgradeCategory.Enhancement,
        Name: "Pacifist",
        Description: "+3 max life, -50% damage dealt",
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.Cautious]: {
        Id: UpgradeId.Cautious,
        Category: UpgradeCategory.Enhancement,
        Name: "Cautious",
        Description: "+1 max life, defensive",
        Rarity: UpgradeRarity.Common,
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

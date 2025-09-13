import {UpgradeCategory, UpgradeId, UpgradeRarity, UpgradeType} from "./types.js";

// Weapon upgrade definitions - Ranged only, particle-focused
export const WEAPON_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.Flamethrower]: {
        Id: UpgradeId.Flamethrower,
        Category: UpgradeCategory.Weapon,
        Name: "Flamethrower",
        Tiers: ["Buuuurn!"],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Shotgun]: {
        Id: UpgradeId.Shotgun,
        Category: UpgradeCategory.Weapon,
        Name: "Shotgun",
        Tiers: ["Hasta la vista, baby!"],
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Minigun]: {
        Id: UpgradeId.Minigun,
        Category: UpgradeCategory.Weapon,
        Name: "Minigun",
        Tiers: ["Trrrrtrtrtrtrt!"],
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.SniperRifle]: {
        Id: UpgradeId.SniperRifle,
        Category: UpgradeCategory.Weapon,
        Name: "Sniper rifle",
        Tiers: ["High-damage, long-range"],
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.HomingMissile]: {
        Id: UpgradeId.HomingMissile,
        Category: UpgradeCategory.Weapon,
        Name: "Homing Missile",
        Tiers: ["Seeking destruction"],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Explosives]: {
        Id: UpgradeId.Explosives,
        Category: UpgradeCategory.Weapon,
        Name: "Dynamite",
        Tiers: ["Hold that for me?"],
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Spikeballs]: {
        Id: UpgradeId.Spikeballs,
        Category: UpgradeCategory.Weapon,
        Name: "Spikeballs",
        Tiers: ["Hush hush"],
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Larpa]: {
        Id: UpgradeId.Larpa,
        Category: UpgradeCategory.Weapon,
        Name: "Larpa",
        Tiers: ["Rockets. With particles."],
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.HooverCrack]: {
        Id: UpgradeId.HooverCrack,
        Category: UpgradeCategory.Weapon,
        Name: "Hoover crack",
        Tiers: ["Particle vortex"],
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.ChiquitaBomb]: {
        Id: UpgradeId.ChiquitaBomb,
        Category: UpgradeCategory.Weapon,
        Name: "Chiquita bomb",
        Tiers: ["Banananana!"],
        Rarity: UpgradeRarity.Rare,
    },
};

// Armor upgrade definitions
export const ARMOR_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.SpikedVest]: {
        Id: UpgradeId.SpikedVest,
        Category: UpgradeCategory.Enhancement,
        Name: "Spiked Vest",
        Tiers: [
            "Reflect +1 damage when hit",
            "Reflect +2 damage when hit",
            "Reflect +3 damage when hit",
        ],
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.DamageReduction]: {
        Id: UpgradeId.DamageReduction,
        Category: UpgradeCategory.Enhancement,
        Name: "Damage Reduction",
        Tiers: ["Reduce all damage by 15%", "Reduce all damage by 25%", "Reduce all damage by 35%"],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.RegenerativeMesh]: {
        Id: UpgradeId.RegenerativeMesh,
        Category: UpgradeCategory.Enhancement,
        Name: "Regeneration",
        Tiers: [
            "Heal +0.2 life per second",
            "Heal +0.3 life per second",
            "Heal +0.5 life per second",
        ],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.MirrorArmor]: {
        Id: UpgradeId.MirrorArmor,
        Category: UpgradeCategory.Enhancement,
        Name: "Mirror Armor",
        Tiers: [
            "Reflect +1 damage when hit",
            "Reflect +2 damage when hit",
            "Reflect +3 damage when hit",
        ],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.LastStand]: {
        Id: UpgradeId.LastStand,
        Category: UpgradeCategory.Enhancement,
        Name: "Last Stand",
        Tiers: [
            "50% damage reduction at <25% health",
            "75% damage reduction at <25% health",
            "90% damage reduction at <25% health",
        ],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.ThickHide]: {
        Id: UpgradeId.ThickHide,
        Category: UpgradeCategory.Enhancement,
        Name: "Thick Hide",
        Tiers: [
            "+1 max life, reduce damage by 1",
            "+2 max life, reduce damage by 2",
            "+3 max life, reduce damage by 3",
        ],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Evasion]: {
        Id: UpgradeId.Evasion,
        Category: UpgradeCategory.Enhancement,
        Name: "Evasion",
        Tiers: [
            "15% chance to dodge attacks",
            "25% chance to dodge attacks",
            "35% chance to dodge attacks",
        ],
        Rarity: UpgradeRarity.Uncommon,
    },
};

// Ability upgrade definitions
export const ABILITY_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.Vampiric]: {
        Id: UpgradeId.Vampiric,
        Category: UpgradeCategory.Enhancement,
        Name: "Vampiric",
        Tiers: ["25% lifesteal", "50% lifesteal", "75% lifesteal"],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.ShadowTrail]: {
        Id: UpgradeId.ShadowTrail,
        Category: UpgradeCategory.Special,
        Name: "Shadow Wake",
        Tiers: ["Leave damaging shadow particles behind you"],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.PhaseWalk]: {
        Id: UpgradeId.PhaseWalk,
        Category: UpgradeCategory.Enhancement,
        Name: "Phase Walk",
        Tiers: [
            "Invulnerable for 50% of dash",
            "Invulnerable for 75% of dash",
            "Invulnerable for 100% of dash",
        ],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.DashMaster]: {
        Id: UpgradeId.DashMaster,
        Category: UpgradeCategory.Enhancement,
        Name: "Dash Master",
        Tiers: ["+50% dash range", "+100% dash range", "+150% dash range"],
        Rarity: UpgradeRarity.Common,
    },
};

// Companion upgrade definitions - Cat allies
export const COMPANION_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.MrBlack]: {
        Id: UpgradeId.MrBlack,
        Category: UpgradeCategory.Companion,
        Name: "Spawn Cat",
        Tiers: ["Cat summoner"],
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.MrOrange]: {
        Id: UpgradeId.MrOrange,
        Category: UpgradeCategory.Companion,
        Name: "Melee Cat",
        Tiers: ["Whirlwind barbarian"],
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.MrPink]: {
        Id: UpgradeId.MrPink,
        Category: UpgradeCategory.Companion,
        Name: "Sniper Cat",
        Tiers: ["Boomerang marksman"],
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.MrWhite]: {
        Id: UpgradeId.MrWhite,
        Category: UpgradeCategory.Companion,
        Name: "Tank Cat",
        Tiers: ["Defensive support"],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.MrBrown]: {
        Id: UpgradeId.MrBrown,
        Category: UpgradeCategory.Companion,
        Name: "Bodyguard Cat",
        Tiers: ["Loyal bodyguard"],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.MrBlue]: {
        Id: UpgradeId.MrBlue,
        Category: UpgradeCategory.Companion,
        Name: "Berserker Cat",
        Tiers: ["Explosive artillery"],
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.MrGray]: {
        Id: UpgradeId.MrGray,
        Category: UpgradeCategory.Companion,
        Name: "Stealth Cat",
        Tiers: ["Shadow assassin"],
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.MrRed]: {
        Id: UpgradeId.MrRed,
        Category: UpgradeCategory.Companion,
        Name: "Suicide Cat",
        Tiers: ["Kaboom!"],
        Rarity: UpgradeRarity.Uncommon,
    },
};

// Energy upgrade definitions - Combat-driven energy system
export const ENERGY_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.CombatVeteran]: {
        Id: UpgradeId.CombatVeteran,
        Category: UpgradeCategory.Enhancement,
        Name: "Combat Veteran",
        Tiers: [
            "+0.3 mana per damage dealt",
            "+0.5 mana per damage dealt",
            "+0.7 mana per damage dealt",
        ],
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.SlowMetabolism]: {
        Id: UpgradeId.SlowMetabolism,
        Category: UpgradeCategory.Enhancement,
        Name: "Slow Metabolism",
        Tiers: ["Mana decays 25% slower", "Mana decays 50% slower", "Mana decays 75% slower"],
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.CombatMedic]: {
        Id: UpgradeId.CombatMedic,
        Category: UpgradeCategory.Enhancement,
        Name: "Combat Medic",
        Tiers: [
            "+1 life/s (scales with mana)",
            "+2 life/s (scales with mana)",
            "+3 life/s (scales with mana)",
        ],
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Hypermetabolism]: {
        Id: UpgradeId.Hypermetabolism,
        Category: UpgradeCategory.Enhancement,
        Name: "Hypermetabolism",
        Tiers: ["+3 life/s, but 2x mana decay"],
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.WeaponMastery]: {
        Id: UpgradeId.WeaponMastery,
        Category: UpgradeCategory.Enhancement,
        Name: "Weapon Mastery",
        Tiers: [
            "Damage scales with mana (up to +20%)",
            "Damage scales with mana (up to +40%)",
            "Damage scales with mana (up to +60%)",
        ],
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.PainTolerance]: {
        Id: UpgradeId.PainTolerance,
        Category: UpgradeCategory.Enhancement,
        Name: "Pain Tolerance",
        Tiers: [
            "+0.2 mana per damage taken",
            "+0.4 mana per damage taken",
            "+0.6 mana per damage taken",
        ],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.ShockwaveBurst]: {
        Id: UpgradeId.ShockwaveBurst,
        Category: UpgradeCategory.Enhancement,
        Name: "Shockwave Burst",
        Tiers: ["Damage burst at full mana"],
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.KineticCharger]: {
        Id: UpgradeId.KineticCharger,
        Category: UpgradeCategory.Enhancement,
        Name: "Kinetic Charger",
        Tiers: ["Gain mana while moving", "Gain 2x mana while moving", "Gain 3x mana while moving"],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.ManaSiphon]: {
        Id: UpgradeId.ManaSiphon,
        Category: UpgradeCategory.Enhancement,
        Name: "Mana Siphon",
        Tiers: [
            "Drain 25% of damage dealt as mana",
            "Drain 50% of damage dealt as mana",
            "Drain 75% of damage dealt as mana",
        ],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.ResonanceShield]: {
        Id: UpgradeId.ResonanceShield,
        Category: UpgradeCategory.Enhancement,
        Name: "Resonance Shield",
        Tiers: [
            "25% damage reduction at full mana",
            "50% damage reduction at full mana",
            "75% damage reduction at full mana",
        ],
        Rarity: UpgradeRarity.Uncommon,
    },
};

// Trait upgrade definitions - Combat & behavioral enhancement
export const TRAIT_UPGRADES_MAP: Partial<Record<UpgradeId, UpgradeType>> = {
    [UpgradeId.LightningReflexes]: {
        Id: UpgradeId.LightningReflexes,
        Category: UpgradeCategory.Enhancement,
        Name: "Lightning Reflexes",
        Tiers: ["+25% movement speed", "+50% movement speed", "+75% movement speed"],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.QuickDraw]: {
        Id: UpgradeId.QuickDraw,
        Category: UpgradeCategory.Enhancement,
        Name: "Quick Draw",
        Tiers: ["+25% attack speed", "+40% attack speed", "+60% attack speed"],
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Brawler]: {
        Id: UpgradeId.Brawler,
        Category: UpgradeCategory.Enhancement,
        Name: "Brawler",
        Tiers: [
            "+1 damage, more aggressive",
            "+2 damage, more aggressive",
            "+3 damage, more aggressive",
        ],
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.Vitality]: {
        Id: UpgradeId.Vitality,
        Category: UpgradeCategory.Enhancement,
        Name: "Vitality",
        Tiers: ["+2 maximum life", "+3 maximum life", "+4 maximum life"],
        Rarity: UpgradeRarity.Common,
    },
    [UpgradeId.BerserkerMode]: {
        Id: UpgradeId.BerserkerMode,
        Category: UpgradeCategory.Enhancement,
        Name: "Berserker Mode",
        Tiers: ["+50% speed when life <25%"],
        Rarity: UpgradeRarity.Uncommon,
    },
    [UpgradeId.Pacifist]: {
        Id: UpgradeId.Pacifist,
        Category: UpgradeCategory.Enhancement,
        Name: "Pacifist",
        Tiers: ["+3 max life, -50% damage dealt"],
        Rarity: UpgradeRarity.Rare,
    },
    [UpgradeId.Cautious]: {
        Id: UpgradeId.Cautious,
        Category: UpgradeCategory.Enhancement,
        Name: "Cautious",
        Tiers: ["+1 max life, defensive", "+2 max life, defensive", "+3 max life, defensive"],
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

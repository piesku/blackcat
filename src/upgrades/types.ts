export const enum UpgradeRarity {
    Common, // 70% chance - basic upgrades
    Uncommon, // 25% chance - enhanced upgrades
    Rare, // 5% chance - powerful upgrades
}

// Numeric upgrade IDs for optimal compression
export const enum UpgradeId {
    // Weapons
    Flamethrower,
    Shotgun,
    Minigun,
    SniperRifle,
    Mortar,
    Boomerang,
    Explosives,
    Spikeballs,
    Larpa,
    HooverCrack,
    ChiquitaBomb,

    // Armor
    ScrapArmor,
    SpikedVest,
    VitalityBoost,
    DamageReduction,
    RegenerativeMesh,
    MirrorArmor,
    ProximityBarrier,
    LastStand,
    ThickHide,
    ToughSkin,
    Evasion,

    // Abilities
    Vampiric,
    ShadowTrail,
    PiercingShots,
    PhaseWalk,
    DashMaster,

    // Companions
    MrBlack,
    MrOrange,
    MrPink,
    MrWhite,
    MrBrown,
    MrBlue,
    MrGray,
    MrRed,

    // Energy
    CombatVeteran,
    BattleFury,
    AdrenalineSurge,
    BerserkersFocus,
    SlowMetabolism,
    CombatMedic,
    FieldSurgeon,
    Hypermetabolism,
    WeaponMastery,
    PainTolerance,
    ShockwaveBurst,

    // Traits
    LightningReflexes,
    QuickDraw,
    Brawler,
    Vitality,
    BerserkerMode,
    Pacifist,
    Cautious,

    // Last entry to determine length
    Length,
}

export interface UpgradeType {
    id: UpgradeId; // Numeric ID for optimal compression
    category: UpgradeCategory;
    name: string; // Display name
    description: string; // UI description
    rarity: UpgradeRarity; // Determines selection probability
    tier?: number; // For power scaling (optional)
}

export enum UpgradeCategory {
    Weapon = "Weapon",
    Armor = "Armor",
    Ability = "Ability",
    Companion = "Companion",
    Energy = "Energy",
    Trait = "Trait",
    Special = "Special",
}

export interface GameState {
    currentLevel: number; // 1-33 duels
    playerUpgrades: UpgradeType[]; // Player's accumulated upgrades
    population: number; // Narrative countdown (8 billion -> 1)
    isNewRun: boolean; // Fresh start vs resumed
}
// Re-export upgrade data from catalog so modules can import from types.ts
export {ALL_UPGRADES_LIST, ALL_UPGRADES_MAP} from "./catalog.js";

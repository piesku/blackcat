export const enum UpgradeRarity {
    Common, // 70% chance - basic upgrades
    Uncommon, // 25% chance - enhanced upgrades
    Rare, // 5% chance - powerful upgrades
}

// Numeric upgrade IDs for optimal compression
export const enum UpgradeId {
    // === Weapons (Child entities with blueprints) ===
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

    // === Companions (Root entities with blueprints) ===
    MrBlack,
    MrOrange,
    MrPink,
    MrWhite,
    MrBrown,
    MrBlue,
    MrGray,
    MrRed,

    // === Enhancements (ControlAi property modifications) ===
    // Combat properties
    ScrapArmor,
    SpikedVest,
    DamageReduction,
    RegenerativeMesh,
    MirrorArmor,
    ProximityBarrier,
    LastStand,
    ThickHide,
    Evasion,
    Vampiric,
    PiercingShots,
    PhaseWalk,
    DashMaster,

    // Energy properties
    CombatVeteran,
    BattleFury,
    AdrenalineSurge,
    SlowMetabolism,
    CombatMedic,
    FieldSurgeon,
    Hypermetabolism,
    WeaponMastery,
    PainTolerance,
    ShockwaveBurst,

    // Behavioral properties
    LightningReflexes,
    QuickDraw,
    Brawler,
    Vitality,
    BerserkerMode,
    Pacifist,
    Cautious,

    // === Special (Unique mechanics) ===
    ShadowTrail, // Spawn system attachment - unique mechanic

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
    Weapon = "Weapon", // Child entities with blueprints
    Companion = "Companion", // Root entities with blueprints
    Enhancement = "Enhancement", // ControlAi property modifications (combat, energy, behavioral)
    Special = "Special", // Unique mechanics that don't fit patterns
}

export interface GameState {
    currentLevel: number; // 1-33 duels
    playerUpgrades: UpgradeType[]; // Player's accumulated upgrades
    population: number; // Narrative countdown (8 billion -> 1)
    isNewRun: boolean; // Fresh start vs resumed
}
// Re-export upgrade data from catalog so modules can import from types.ts
export {ALL_UPGRADES_LIST, ALL_UPGRADES_MAP} from "./catalog.js";

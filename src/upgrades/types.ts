export const enum UpgradeRarity {
    Common, // 70% chance - basic upgrades
    Uncommon, // 25% chance - enhanced upgrades
    Rare, // 5% chance - powerful upgrades
    Legendary, // Tier-3 upgrades only - 1% chance
}

// Numeric upgrade IDs for optimal compression
export const enum UpgradeId {
    // === Weapons (Child entities with blueprints) ===
    Flamethrower,
    Shotgun,
    Minigun,
    SniperRifle,
    HomingMissile,
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
    DamageReduction,
    RegenerativeMesh,
    ThickHide,
    Evasion,
    Vampiric,
    PhaseWalk,
    DashMaster,

    // Energy properties
    CombatVeteran,
    SlowMetabolism,
    CombatMedic,
    Hypermetabolism,
    WeaponMastery,
    PainTolerance,
    ShockwaveBurst,
    KineticCharger,
    ManaSiphon,

    // Behavioral properties
    LightningReflexes,
    QuickDraw,
    Brawler,
    Vitality,
    Cautious,

    // === Special (Unique mechanics) ===
    ShadowTrail, // Spawn system attachment - unique mechanic

    // Last entry to determine length
    Length,
}

export interface UpgradeType {
    Id: UpgradeId; // Numeric ID for optimal compression
    Category: UpgradeCategory;
    Name: string; // Display name
    Tiers: string[]; // Tier descriptions - single element for single-tier, multiple for tiered
    Rarity: UpgradeRarity; // Determines selection probability
}

export interface UpgradeInstance {
    id: UpgradeId; // Which upgrade this is
    tier: number; // Current tier (1-based: 1, 2, or 3)
}

export const enum UpgradeCategory {
    Weapon, // Child entities with blueprints
    Companion, // Root entities with blueprints
    Enhancement, // ControlAi property modifications (combat, energy, behavioral)
    Special, // Unique mechanics that don't fit patterns
}

export interface GameState {
    currentLevel: number; // 1-33 duels
    playerUpgrades: UpgradeInstance[]; // Player's accumulated upgrades with tiers
    population: number; // Narrative countdown (8 billion -> 1)
    isNewRun: boolean; // Fresh start vs resumed
}
// Re-export upgrade data from catalog so modules can import from types.ts
export {ALL_UPGRADES_LIST, ALL_UPGRADES_MAP} from "./catalog.js";

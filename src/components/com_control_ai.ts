import {float} from "../../lib/random.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

// Default energy system parameters (can be overridden by upgrades)
const DEFAULT_ENERGY_FROM_DAMAGE_DEALT = 0.0; // Combat energy generation disabled by default
const DEFAULT_ENERGY_FROM_DAMAGE_TAKEN = 0.0; // Combat energy generation disabled by default
const DEFAULT_ENERGY_DECAY_RATE = 1.0;
const DEFAULT_HEALING_RATE = 0.0; // Healing disabled by default

// Default shockwave burst parameters
const DEFAULT_SHOCKWAVE_BURST_ENABLED = false;

export interface ControlAi {
    State: AiState;
    LastStateChange: number; // Game time in seconds when state last changed
    StateTimer: number;
    CircleDirection: number; // 1 or -1 for clockwise/counterclockwise
    AttackCooldown: number;
    IsPlayer: boolean; // True for player fighters, false for opponents

    // Enhanced personality and randomness
    Aggressiveness: number; // 0.0-2.0, affects attack frequency and distance
    Patience: number; // 0.5-2.0, affects how long they circle before attacking

    // New state data
    PrepareDirection: [number, number]; // Direction for preparing dash attack
    SeparationForce: [number, number]; // Collision avoidance force
    HasRetreatedAtLowHealth: boolean; // Prevents repeated retreating at same health level

    // Player energy control
    Energy: number; // For player entities: unified energy affecting movement speed, weapon cooldowns, and rate of fire (seconds)
    BaseMoveSpeed: number; // Original movement speed before energy scaling

    // Combat-driven energy upgrade properties (initialized to defaults, modified by upgrades)
    EnergyFromDamageDealt: number; // Energy gain per damage dealt (0.0 = disabled)
    EnergyFromDamageTaken: number; // Energy gain per damage taken (0.0 = disabled)
    EnergyDecayRate: number; // Energy decay rate toward baseline
    HealingRate: number; // Base healing rate multiplier (HP/s when energy > threshold)

    // Visual scaling properties
    BaseScale?: number; // Original scale for size scaling calculations
    ShockwaveBurstTriggered?: boolean; // Prevents shockwave spam

    // Shockwave burst upgrade properties
    ShockwaveBurstEnabled: boolean; // Whether shockwave burst upgrade is active

    // Ability upgrade flags (optional - only set when abilities are applied)
    VampiricHealing?: boolean; // Vampiric upgrade - heal based on damage dealt
    PiercingShots?: boolean; // Piercing Shots upgrade - projectiles continue through enemies
    PhaseWalkEnabled?: boolean; // Phase Walk upgrade - invincibility during dashing
    DashMasterEnabled?: boolean; // Dash Master upgrade - +100% dash range
    WeaponMasteryEnabled?: boolean; // Weapon Mastery upgrade - +25% damage when energy > 75%

    // Trait upgrade properties (optional - only set when traits are applied)
    DashSpeedMultiplier?: number; // Lightning Reflexes dash speed boost
    DashRangeMultiplier?: number; // Brawler dash range reduction
    AttackSpeedMultiplier?: number; // Quick Draw attack speed boost
    DamageBonus?: number; // Brawler damage bonus
    BerserkerMode?: {
        LowHealthThreshold: number;
        SpeedBonus: number;
        AttackBonus: number;
    }; // Berserker trait
    RetreatHealthThreshold?: number; // Cautious trait retreat threshold
}

export const enum AiState {
    Circling,
    Preparing, // New: Wind-up state before dash attack
    Dashing,
    Retreating,
    Stunned,
    Pursuing,
    Separating, // New: Active collision avoidance
}

export function control_ai(is_player: boolean, base_move_speed: number) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.ControlAi;

        let aggressiveness: number;
        let patience: number;
        let initial_delay: number;
        let attack_delay: number;
        let circle_direction: number;

        if (is_player) {
            // Player fighters have consistent default traits (for future upgrade system)
            aggressiveness = 1.0; // Balanced default
            patience = 1.0; // Balanced default
            initial_delay = 0.5; // Minimal delay for responsiveness
            attack_delay = 0.5; // Quick to engage
            circle_direction = 1; // Consistent clockwise
        } else {
            // Opponent fighters use sequential random numbers for deterministic variety
            aggressiveness = 0.5 + float(0, 1.5); // Range: 0.5-2.0
            patience = 0.7 + float(0, 1.3); // Range: 0.7-2.0
            initial_delay = float(0, 3.0); // Staggered initial delays 0-3 seconds
            attack_delay = float(0, 2.0); // Staggered initial attack delays 0-2 seconds
            circle_direction = float(0, 1) > 0.5 ? 1 : -1;
        }

        game.World.ControlAi[entity] = {
            State: AiState.Circling,
            LastStateChange: game.Time,
            StateTimer: initial_delay,
            CircleDirection: circle_direction,
            AttackCooldown: attack_delay,
            IsPlayer: is_player,
            Energy: is_player ? 1.0 : float(0.7, 1.1), // Start player at base energy
            BaseMoveSpeed: base_move_speed,

            // Personality traits
            Aggressiveness: aggressiveness,
            Patience: patience,

            // State vectors
            PrepareDirection: [0, 0],
            SeparationForce: [0, 0],
            HasRetreatedAtLowHealth: false,

            // Combat-driven energy upgrade properties (initialized to defaults)
            EnergyFromDamageDealt: DEFAULT_ENERGY_FROM_DAMAGE_DEALT,
            EnergyFromDamageTaken: DEFAULT_ENERGY_FROM_DAMAGE_TAKEN,
            EnergyDecayRate: DEFAULT_ENERGY_DECAY_RATE,
            HealingRate: DEFAULT_HEALING_RATE,

            // Shockwave burst properties (initialized to defaults)
            ShockwaveBurstEnabled: DEFAULT_SHOCKWAVE_BURST_ENABLED,
        };
    };
}

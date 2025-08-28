import {float} from "../../lib/random.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export const enum CombatStance {
    Balanced, // Default behavior (for opponents)
    Aggressive, // High damage, low defense, fast attacks
    Defensive, // High defense, patient play, long retreats
    Berserker, // All-or-nothing, no retreating, extreme speed
}

export interface StanceCombatModifiers {
    // AI Personality modifiers
    AggressivenessMultiplier: number;
    PatienceMultiplier: number;

    // Combat stat modifiers
    DamageMultiplier: number;
    HealthModifier: number; // Added/subtracted from max health
    MoveSpeedMultiplier: number;
    AttackCooldownMultiplier: number;

    // Behavioral flags
    CanRetreat: boolean;
    ForceDashAttacks: boolean; // Skip circling, go straight to dashing
}

// Stance configuration - balanced around risk/reward trade-offs
export const STANCE_MODIFIERS: Record<CombatStance, StanceCombatModifiers> = {
    [CombatStance.Balanced]: {
        AggressivenessMultiplier: 1.0,
        PatienceMultiplier: 1.0,
        DamageMultiplier: 1.0,
        HealthModifier: 0,
        MoveSpeedMultiplier: 1.0,
        AttackCooldownMultiplier: 1.0,
        CanRetreat: true,
        ForceDashAttacks: false,
    },

    [CombatStance.Aggressive]: {
        AggressivenessMultiplier: 1.8, // Much more aggressive
        PatienceMultiplier: 0.6, // Less patient, attacks sooner
        DamageMultiplier: 1.25, // +25% damage output
        HealthModifier: -1, // -1 max health (glass cannon)
        MoveSpeedMultiplier: 1.3, // +30% movement speed
        AttackCooldownMultiplier: 0.7, // -30% attack cooldown (faster attacks)
        CanRetreat: true, // Still retreats when low health
        ForceDashAttacks: false, // Still does normal behavior cycles
    },

    [CombatStance.Defensive]: {
        AggressivenessMultiplier: 0.7, // Less aggressive
        PatienceMultiplier: 1.5, // Much more patient
        DamageMultiplier: 0.8, // -20% damage output
        HealthModifier: 1, // +1 max health
        MoveSpeedMultiplier: 0.9, // -10% movement speed
        AttackCooldownMultiplier: 1.3, // +30% attack cooldown (slower attacks)
        CanRetreat: true, // Enhanced retreating behavior
        ForceDashAttacks: false, // Normal behavior patterns
    },

    [CombatStance.Berserker]: {
        AggressivenessMultiplier: 2.5, // Extremely aggressive
        PatienceMultiplier: 0.3, // Almost no patience
        DamageMultiplier: 1.5, // +50% damage output
        HealthModifier: 0, // No health change
        MoveSpeedMultiplier: 1.4, // +40% movement speed
        AttackCooldownMultiplier: 0.5, // -50% attack cooldown
        CanRetreat: false, // Never retreats, fights to the death
        ForceDashAttacks: true, // Skips circling, goes straight to attacks
    },
};

export interface ControlAi {
    State: AiState;
    LastStateChange: number; // Game time in seconds when state last changed
    StateTimer: number;
    CircleDirection: number; // 1 or -1 for clockwise/counterclockwise
    AttackCooldown: number;
    IsPlayer: boolean; // True for player fighters, false for opponents

    // Combat stance for player fighters (opponents always use Balanced)
    Stance: CombatStance;

    // Base personality traits (before stance modifiers)
    BaseAggressiveness: number; // Base 0.0-2.0, modified by stance
    BasePatience: number; // Base 0.5-2.0, modified by stance

    // Effective personality traits (after stance modifiers applied)
    Aggressiveness: number; // Used by AI system
    Patience: number; // Used by AI system

    // New state data
    PrepareDirection: [number, number]; // Direction for preparing dash attack
    SeparationForce: [number, number]; // Collision avoidance force
    HasRetreatedAtLowHealth: boolean; // Prevents repeated retreating at same health level
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

export function control_ai(
    is_player: boolean = false,
    stance: CombatStance = CombatStance.Balanced,
) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.ControlAi;

        let base_aggressiveness: number;
        let base_patience: number;
        let initial_delay: number;
        let attack_delay: number;
        let circle_direction: number;

        if (is_player) {
            // Player fighters have consistent base traits
            base_aggressiveness = 1.0; // Balanced base
            base_patience = 1.0; // Balanced base
            initial_delay = 0.5; // Minimal delay for responsiveness
            attack_delay = 0.5; // Quick to engage
            circle_direction = 1; // Consistent clockwise
        } else {
            // Opponent fighters use sequential random numbers for deterministic variety
            base_aggressiveness = 0.5 + float(0, 1.5); // Range: 0.5-2.0
            base_patience = 0.7 + float(0, 1.3); // Range: 0.7-2.0
            initial_delay = float(0, 3.0); // Staggered initial delays 0-3 seconds
            attack_delay = float(0, 2.0); // Staggered initial attack delays 0-2 seconds
            circle_direction = float(0, 1) > 0.5 ? 1 : -1;
            // Opponents always use balanced stance
            stance = CombatStance.Balanced;
        }

        // Apply stance modifiers to get effective personality traits
        let stance_modifiers = STANCE_MODIFIERS[stance];
        let effective_aggressiveness =
            base_aggressiveness * stance_modifiers.AggressivenessMultiplier;
        let effective_patience = base_patience * stance_modifiers.PatienceMultiplier;

        game.World.ControlAi[entity] = {
            State: AiState.Circling,
            LastStateChange: game.Time,
            StateTimer: initial_delay,
            CircleDirection: circle_direction,
            AttackCooldown: attack_delay,
            IsPlayer: is_player,

            // Stance information
            Stance: stance,

            // Base personality traits
            BaseAggressiveness: base_aggressiveness,
            BasePatience: base_patience,

            // Effective personality traits (after stance modifiers)
            Aggressiveness: effective_aggressiveness,
            Patience: effective_patience,

            // State vectors
            PrepareDirection: [0, 0],
            SeparationForce: [0, 0],
            HasRetreatedAtLowHealth: false,
        };
    };
}

// Helper function to apply a new stance to an existing AI component
export function apply_stance(ai: ControlAi, stance: CombatStance) {
    ai.Stance = stance;
    let stance_modifiers = STANCE_MODIFIERS[stance];
    ai.Aggressiveness = ai.BaseAggressiveness * stance_modifiers.AggressivenessMultiplier;
    ai.Patience = ai.BasePatience * stance_modifiers.PatienceMultiplier;
}

// Helper functions for stance descriptions
export function getStanceName(stance: CombatStance): string {
    switch (stance) {
        case CombatStance.Balanced:
            return "Balanced";
        case CombatStance.Aggressive:
            return "Aggressive";
        case CombatStance.Defensive:
            return "Defensive";
        case CombatStance.Berserker:
            return "Berserker";
        default:
            return "Unknown";
    }
}

export function getStanceDescription(stance: CombatStance): string {
    switch (stance) {
        case CombatStance.Balanced:
            return "Standard fighting style with balanced offense and defense.";
        case CombatStance.Aggressive:
            return "Fast attacks and high damage, but reduced health. Great against slow enemies.";
        case CombatStance.Defensive:
            return "Patient fighting with extra health and damage reduction. Survives burst damage.";
        case CombatStance.Berserker:
            return "All-out assault with no retreating. Extreme damage and speed, win or die.";
        default:
            return "Unknown stance.";
    }
}

export function getStanceEmoji(stance: CombatStance): string {
    switch (stance) {
        case CombatStance.Balanced:
            return "⚖️";
        case CombatStance.Aggressive:
            return "⚔️";
        case CombatStance.Defensive:
            return "🛡️";
        case CombatStance.Berserker:
            return "🔥";
        default:
            return "❓";
    }
}

// Helper function to check if AI can retreat based on stance
export function can_retreat(ai: ControlAi): boolean {
    let stance_modifiers = STANCE_MODIFIERS[ai.Stance];
    return stance_modifiers.CanRetreat;
}

// Helper function to check if AI should force dash attacks (skip circling)
export function should_force_dash_attacks(ai: ControlAi): boolean {
    let stance_modifiers = STANCE_MODIFIERS[ai.Stance];
    return stance_modifiers.ForceDashAttacks;
}

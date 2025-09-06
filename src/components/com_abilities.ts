import {Game} from "../game.js";
import {Has} from "../world.js";

/**
 * Component for tracking passive and triggered abilities
 */
export interface Abilities {
    /** Active passive abilities */
    Passive: AbilityType[];

    /** Active triggered abilities with their state */
    Triggered: TriggeredAbility[];
}

export const enum AbilityType {
    Vampiric = "vampiric",
    Ricochet = "ricochet",
    ShadowTrail = "shadow_trail",
    PiercingShots = "piercing_shots",
    DoubleShot = "double_shot",
    PhaseWalk = "phase_walk",
    BattleAxeMastery = "battle_axe_mastery",
    BaseballBatSwing = "baseball_bat_swing",
    ChainsawFury = "chainsaw_fury",
    SecondWind = "second_wind",
    ShockWave = "shock_wave",
}

export interface TriggeredAbility {
    Type: AbilityType;
    /** Whether this ability has been used (for once-per-fight abilities) */
    Used?: boolean;
    /** Cooldown remaining (for abilities with cooldowns) */
    Cooldown?: number;
}

/**
 * Add abilities component to an entity
 */
export function abilities(
    passive_abilities: AbilityType[] = [],
    triggered_abilities: AbilityType[] = [],
) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.Abilities;
        game.World.Abilities[entity] = {
            Passive: [...passive_abilities],
            Triggered: triggered_abilities.map((type) => ({Type: type, Used: false})),
        };
    };
}

/**
 * Check if an entity has a specific ability
 */
export function has_ability(game: Game, entity: number, ability: AbilityType): boolean {
    if (!(game.World.Signature[entity] & Has.Abilities)) return false;

    let abilities_comp = game.World.Abilities[entity];
    return (
        abilities_comp.Passive.includes(ability) ||
        abilities_comp.Triggered.some((t: TriggeredAbility) => t.Type === ability)
    );
}

/**
 * Check if a triggered ability is available (not used and not on cooldown)
 */
export function is_triggered_ability_available(
    game: Game,
    entity: number,
    ability: AbilityType,
): boolean {
    if (!(game.World.Signature[entity] & Has.Abilities)) return false;

    let abilities_comp = game.World.Abilities[entity];
    let triggered = abilities_comp.Triggered.find((t: TriggeredAbility) => t.Type === ability);
    return !!(triggered && !triggered.Used && (!triggered.Cooldown || triggered.Cooldown <= 0));
}

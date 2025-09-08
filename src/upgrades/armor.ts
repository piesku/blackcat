import {Game} from "../game.js";
import {Has} from "../world.js";

export function apply_scrap_armor(game: Game, entity: number) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Scrap Armor to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];
    health.IgnoreFirstDamage = true;
    health.FirstDamageIgnored = false; // Reset the flag
}

export function apply_spiked_vest(game: Game, entity: number, reflect_amount: number = 1) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Spiked Vest to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];
    health.ReflectDamage = (health.ReflectDamage || 0) + reflect_amount; // Stack with existing reflect
}

export function apply_vitality_boost(game: Game, entity: number) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Vitality Boost to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Increase max health by 50% (rounded up)
    let bonus_hp = Math.ceil(health.Max * 0.5);
    health.Max += bonus_hp;
    health.Current += bonus_hp; // Also heal by the bonus amount
}

export function apply_damage_reduction(
    game: Game,
    entity: number,
    reduction_percent: number = 0.25,
) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Damage Reduction to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Stack damage reduction multiplicatively to prevent going over 100%
    let existing_reduction = health.DamageReduction || 0;
    let remaining_damage = 1 - existing_reduction;
    let new_reduction = remaining_damage * reduction_percent;
    health.DamageReduction = existing_reduction + new_reduction;
}

export function apply_regenerative_mesh(game: Game, entity: number, regen_rate: number = 0.3) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Regenerative Mesh to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Stack regeneration rates additively
    health.RegenerationRate = (health.RegenerationRate || 0) + regen_rate;
}

export function apply_mirror_armor(game: Game, entity: number) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Mirror Armor to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Mirror Armor provides 100% reflect but with self-damage
    health.MirrorArmor = true;
}

export function apply_proximity_barrier(
    game: Game,
    entity: number,
    reduction_percent: number = 0.4,
) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Proximity Barrier to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Stack proximity barrier multiplicatively to prevent going over 100%
    let existing_reduction = health.ProximityBarrier || 0;
    let remaining_damage = 1 - existing_reduction;
    let new_reduction = remaining_damage * reduction_percent;
    health.ProximityBarrier = existing_reduction + new_reduction;
}

export function apply_last_stand(game: Game, entity: number) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Last Stand to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Enable Last Stand ability
    health.LastStand = true;
}

export function apply_thick_hide(game: Game, entity: number) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Thick Hide to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Add +1 HP (both max and current)
    health.Max += 1;
    health.Current += 1;

    // Add flat damage reduction (stacks additively)
    health.FlatDamageReduction = (health.FlatDamageReduction || 0) + 1;
}

export function apply_tough_skin(game: Game, entity: number) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Tough Skin to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Add flat damage reduction (stacks additively with Thick Hide)
    health.FlatDamageReduction = (health.FlatDamageReduction || 0) + 1;
}

export function apply_evasion(game: Game, entity: number, evasion_chance: number = 0.25) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Evasion to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Stack evasion chances multiplicatively to prevent going over 100%
    let existing_evasion = health.EvasionChance || 0;
    let remaining_vulnerability = 1 - existing_evasion;
    let new_evasion = remaining_vulnerability * evasion_chance;
    health.EvasionChance = existing_evasion + new_evasion;
}

export function apply_pain_tolerance(game: Game, entity: number) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Pain Tolerance to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Add flat damage reduction of 1 (same as Tough Skin, stacks additively)
    health.FlatDamageReduction = (health.FlatDamageReduction || 0) + 1;
}

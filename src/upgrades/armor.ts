import {Game} from "../game.js";
import {Has} from "../world.js";

export function apply_scrap_armor(game: Game, entity: number) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Scrap Armor to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];
    health.IgnoreFirstDamage = true;
    health.FirstDamageIgnored = false; // Reset the flag

    console.log(
        `[UPGRADE] Applied Scrap Armor to entity ${entity} - will ignore first damage instance`,
    );
}

export function apply_spiked_vest(game: Game, entity: number, reflect_amount: number = 1) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Spiked Vest to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];
    health.ReflectDamage = (health.ReflectDamage || 0) + reflect_amount; // Stack with existing reflect

    console.log(
        `[UPGRADE] Applied Spiked Vest to entity ${entity} - reflecting ${reflect_amount} damage (total: ${health.ReflectDamage})`,
    );
}

export function apply_vitality_boost(game: Game, entity: number) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Vitality Boost to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Increase max health by 50% (rounded up)
    let bonus_hp = Math.ceil(health.Max * 0.5);
    health.Max += bonus_hp;
    health.Current += bonus_hp; // Also heal by the bonus amount

    console.log(
        `[UPGRADE] Applied Vitality Boost (+${bonus_hp} HP) to entity ${entity} - Max HP now ${health.Max}, Current HP now ${health.Current}`,
    );
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

    console.log(
        `[UPGRADE] Applied ${(reduction_percent * 100).toFixed(0)}% Damage Reduction to entity ${entity} - total reduction now ${(health.DamageReduction * 100).toFixed(1)}%`,
    );
}

export function apply_regenerative_mesh(game: Game, entity: number, regen_rate: number = 0.3) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Regenerative Mesh to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Stack regeneration rates additively
    health.RegenerationRate = (health.RegenerationRate || 0) + regen_rate;

    console.log(
        `[UPGRADE] Applied Regenerative Mesh (+${regen_rate} HP/s) to entity ${entity} - total regen rate now ${health.RegenerationRate} HP/s`,
    );
}

export function apply_mirror_armor(game: Game, entity: number) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Mirror Armor to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Mirror Armor provides 100% reflect but with self-damage
    health.MirrorArmor = true;

    console.log(
        `[UPGRADE] Applied Mirror Armor to entity ${entity} - 100% damage reflection with 50% self-damage`,
    );
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

    console.log(
        `[UPGRADE] Applied Proximity Barrier (${(reduction_percent * 100).toFixed(0)}%) to entity ${entity} - total proximity barrier now ${(health.ProximityBarrier * 100).toFixed(1)}% damage reduction from nearby enemies`,
    );
}

export function apply_last_stand(game: Game, entity: number) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Last Stand to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Enable Last Stand ability
    health.LastStand = true;

    console.log(
        `[UPGRADE] Applied Last Stand to entity ${entity} - 75% damage reduction when at 1 HP`,
    );
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

    console.log(
        `[UPGRADE] Applied Thick Hide to entity ${entity} - +1 HP (now ${health.Max}/${health.Current}) and +1 flat damage reduction (total: ${health.FlatDamageReduction})`,
    );
}

export function apply_tough_skin(game: Game, entity: number) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Tough Skin to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Add flat damage reduction (stacks additively with Thick Hide)
    health.FlatDamageReduction = (health.FlatDamageReduction || 0) + 1;

    console.log(
        `[UPGRADE] Applied Tough Skin to entity ${entity} - +1 flat damage reduction (total: ${health.FlatDamageReduction})`,
    );
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

    console.log(
        `[UPGRADE] Applied Evasion (${(evasion_chance * 100).toFixed(0)}%) to entity ${entity} - total evasion chance now ${(health.EvasionChance * 100).toFixed(1)}%`,
    );
}

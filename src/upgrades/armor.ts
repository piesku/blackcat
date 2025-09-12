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
    health.ReflectDamage += reflect_amount; // Stack with existing reflect
    health.FlatDamageReduction++;
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
    let remaining_damage = 1 - health.DamageReduction;
    let new_reduction = remaining_damage * reduction_percent;
    health.DamageReduction += new_reduction;
}

export function apply_regenerative_mesh(game: Game, entity: number, regen_rate: number = 0.3) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Regenerative Mesh to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Stack regeneration rates additively
    health.RegenerationRate += +regen_rate;
}

export function apply_mirror_armor(game: Game, entity: number) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Mirror Armor to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];
    health.MirrorArmor = true;
}

export function apply_last_stand(game: Game, entity: number) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Last Stand to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];
    health.LastStand = true;
}

export function apply_thick_hide(game: Game, entity: number) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Thick Hide to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];
    health.Max += 1;
    health.Current += 1;
    health.FlatDamageReduction++;
}

export function apply_evasion(game: Game, entity: number, evasion_chance: number = 0.25) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Evasion to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];

    // Stack evasion chances multiplicatively to prevent going over 100%
    let remaining_vulnerability = 1 - health.EvasionChance;
    let new_evasion = remaining_vulnerability * evasion_chance;
    health.EvasionChance += new_evasion;
}

export function apply_pain_tolerance(game: Game, entity: number) {
    DEBUG: if (!(game.World.Signature[entity] & Has.Health))
        throw new Error(`Cannot apply Pain Tolerance to entity ${entity} - no Health component`);

    let health = game.World.Health[entity];
    health.FlatDamageReduction++;
}

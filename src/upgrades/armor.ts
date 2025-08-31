import {Game} from "../game.js";
import {Has} from "../world.js";

export function apply_scrap_armor(game: Game, entity: number) {
    if (!(game.World.Signature[entity] & Has.Health)) {
        console.warn(`[ARMOR] Cannot apply Scrap Armor to entity ${entity} - no Health component`);
        return;
    }

    let health = game.World.Health[entity];
    health.IgnoreFirstDamage = true;
    health.FirstDamageIgnored = false; // Reset the flag

    console.log(
        `[UPGRADE] Applied Scrap Armor to entity ${entity} - will ignore first damage instance`,
    );
}

export function apply_spiked_vest(game: Game, entity: number, reflect_amount: number = 1) {
    if (!(game.World.Signature[entity] & Has.Health)) {
        console.warn(`[ARMOR] Cannot apply Spiked Vest to entity ${entity} - no Health component`);
        return;
    }

    let health = game.World.Health[entity];
    health.ReflectDamage = (health.ReflectDamage || 0) + reflect_amount; // Stack with existing reflect

    console.log(
        `[UPGRADE] Applied Spiked Vest to entity ${entity} - reflecting ${reflect_amount} damage (total: ${health.ReflectDamage})`,
    );
}

export function apply_vitality_boost(game: Game, entity: number) {
    if (!(game.World.Signature[entity] & Has.Health)) {
        console.warn(
            `[ARMOR] Cannot apply Vitality Boost to entity ${entity} - no Health component`,
        );
        return;
    }

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
    if (!(game.World.Signature[entity] & Has.Health)) {
        console.warn(
            `[ARMOR] Cannot apply Damage Reduction to entity ${entity} - no Health component`,
        );
        return;
    }

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

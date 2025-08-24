import {Game} from "../game.js";
import {Has} from "../world.js";

export interface Weapon {
    Damage: number;
    Range: number;
    Cooldown: number;
    LastAttackTime: number;
    TotalAmount: number; // For Count mode: total bullets, For Timed mode: total duration
}

export function weapon_ranged(
    damage: number,
    range: number,
    cooldown: number,
    initialTimeout: number = 0.5,
    totalAmount: number = 1,
) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.Weapon;
        game.World.Weapon[entity] = {
            Damage: damage,
            Range: range,
            Cooldown: cooldown,
            LastAttackTime: initialTimeout,
            TotalAmount: totalAmount,
        };
    };
}

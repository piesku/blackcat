import {Game} from "../game.js";
import {Has} from "../world.js";

export interface Weapon {
    Range: number;
    Cooldown: number;
    LastAttackTime: number;
    TotalAmount: number; // For Count mode: total bullets, For Timed mode: total duration
    PlayerWantsToFire: boolean; // Set by sys_control_player, consumed by sys_control_weapon
}

export function weapon_ranged(
    range: number,
    cooldown: number,
    initialTimeout: number = 0.5,
    totalAmount: number = 1,
) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.Weapon;
        game.World.Weapon[entity] = {
            Range: range,
            Cooldown: cooldown,
            LastAttackTime: initialTimeout,
            TotalAmount: totalAmount,
            PlayerWantsToFire: false,
        };
    };
}

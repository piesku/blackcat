import {float} from "../../lib/random.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export interface Weapon {
    Range: number;
    Cooldown: number;
    SinceLast: number; // Countdown timer until next attack is allowed
    TotalAmount: number; // For Count mode: total bullets, For Timed mode: total duration
}

export function weapon_ranged(range: number, cooldown: number, totalAmount: number = 1) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.Weapon;
        game.World.Weapon[entity] = {
            Range: range,
            Cooldown: cooldown,
            SinceLast: float(0, cooldown),
            TotalAmount: totalAmount,
        };
    };
}

import {Game} from "../game.js";
import {Has} from "../world.js";

// Simplified weapon component - ranged only
export interface Weapon {
    Damage: number;
    Range: number;
    Cooldown: number;
    LastAttackTime: number;
}

export function weapon_ranged(
    damage: number,
    range: number,
    cooldown: number,
    initialTimeout: number = 0.5,
) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.Weapon;
        game.World.Weapon[entity] = {
            Damage: damage,
            Range: range,
            Cooldown: cooldown,
            LastAttackTime: initialTimeout,
        };
    };
}

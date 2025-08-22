import {Game} from "../game.js";
import {Has} from "../world.js";

// Simplified weapon component - ranged only
export interface Weapon {
    Damage: number;
    Range: number;
    Cooldown: number;
    LastAttackTime: number;
    ProjectileSpeed: number;
    ProjectileCount: number;
    Spread: number; // Spread angle in radians between multiple projectiles
    Scatter: number; // Random scatter angle in radians for aiming inaccuracy
}

export function weapon_ranged(
    damage: number,
    range: number,
    cooldown: number,
    projectileSpeed: number = 5.0,
    projectileCount: number = 1,
    spread: number = 0.1,
    scatter: number = 0.05,
    initialTimeout: number = 0.5,
) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.Weapon;
        game.World.Weapon[entity] = {
            Damage: damage,
            Range: range,
            Cooldown: cooldown,
            LastAttackTime: initialTimeout,
            ProjectileSpeed: projectileSpeed,
            ProjectileCount: projectileCount,
            Spread: spread,
            Scatter: scatter,
        };
    };
}

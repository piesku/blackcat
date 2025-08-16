import {Game} from "../game.js";
import {Has} from "../world.js";

export const enum WeaponKind {
    Melee,
    Ranged
}

export interface WeaponMelee {
    Kind: WeaponKind.Melee;
    Damage: number;
    Range: number;
    Cooldown: number;
    LastAttackTime: number;
    Knockback: number;
    Arc: number; // Attack arc in radians
}

export interface WeaponRanged {
    Kind: WeaponKind.Ranged;
    Damage: number;
    Range: number;
    Cooldown: number;
    LastAttackTime: number;
    ProjectileSpeed: number;
    ProjectileCount: number;
    Spread: number; // Spread angle in radians
}

export type Weapon = WeaponMelee | WeaponRanged;

export function weapon_melee(damage: number, range: number, cooldown: number, knockback: number = 1.0, arc: number = Math.PI / 3) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.Weapon;
        game.World.Weapon[entity] = {
            Kind: WeaponKind.Melee,
            Damage: damage,
            Range: range,
            Cooldown: cooldown,
            LastAttackTime: 0,
            Knockback: knockback,
            Arc: arc
        };
    };
}

export function weapon_ranged(damage: number, range: number, cooldown: number, projectileSpeed: number = 5.0, projectileCount: number = 1, spread: number = 0.1) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.Weapon;
        game.World.Weapon[entity] = {
            Kind: WeaponKind.Ranged,
            Damage: damage,
            Range: range,
            Cooldown: cooldown,
            LastAttackTime: 0,
            ProjectileSpeed: projectileSpeed,
            ProjectileCount: projectileCount,
            Spread: spread
        };
    };
}
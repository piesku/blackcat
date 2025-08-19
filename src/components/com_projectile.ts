import {Game} from "../game.js";
import {Has} from "../world.js";

export interface Projectile {
    Damage: number;
    OwnerEntity: number;
    IsPiercing?: boolean; // Piercing projectiles go through enemies
    HitEntities?: Set<number>; // Track which entities were already hit (for piercing)
}

export function projectile(damage: number, owner_entity: number, is_piercing: boolean = false) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.Projectile;
        game.World.Projectile[entity] = {
            Damage: damage,
            OwnerEntity: owner_entity,
            IsPiercing: is_piercing,
            HitEntities: is_piercing ? new Set<number>() : undefined,
        };
    };
}

import {Game} from "../game.js";
import {Has} from "../world.js";

export interface Projectile {
    Damage: number;
    OwnerEntity: number;
}

export function projectile(damage: number, owner_entity: number) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.Projectile;
        game.World.Projectile[entity] = {
            Damage: damage,
            OwnerEntity: owner_entity,
        };
    };
}
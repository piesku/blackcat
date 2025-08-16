import {Game} from "../game.js";
import {Has} from "../world.js";

export interface Health {
    Max: number;
    Current: number;
    LastDamageTime: number;
    IsAlive: boolean;
}

export function health(max: number = 3) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.Health;
        game.World.Health[entity] = {
            Max: max,
            Current: max,
            LastDamageTime: 0,
            IsAlive: true,
        };
    };
}

export function damage_entity(game: Game, entity: number, amount: number) {
    let health_data = game.World.Health[entity];
    if (health_data && health_data.IsAlive) {
        health_data.Current = Math.max(0, health_data.Current - amount);
        health_data.LastDamageTime = game.Now;

        if (health_data.Current <= 0) {
            health_data.IsAlive = false;
        }
    }
}

export function heal_entity(game: Game, entity: number, amount: number) {
    let health_data = game.World.Health[entity];
    if (health_data && health_data.IsAlive) {
        health_data.Current = Math.min(health_data.Max, health_data.Current + amount);
    }
}

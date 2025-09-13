import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export interface Particle {
    Spread: number; // Random spread factor for turbulence
}

export function particle(spread: number = 0.1) {
    return (game: Game, entity: Entity) => {
        let p: Particle = {
            Spread: spread,
        };

        game.World.Particle[entity] = p;
        game.World.Signature[entity] |= Has.Particle;
    };
}

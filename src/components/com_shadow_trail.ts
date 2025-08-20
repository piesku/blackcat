import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export interface ShadowTrail {
    ParticleFrequency: number; // Particles per second
    LastEmissionTime: number; // Time since last particle
    TrailIntensity: number; // How many particles to emit (0.5-2.0)
    Active: boolean; // Whether trail is currently active
}

export function shadow_trail(frequency: number = 8.0, intensity: number = 1.0) {
    return (game: Game, entity: Entity) => {
        let trail: ShadowTrail = {
            ParticleFrequency: frequency,
            LastEmissionTime: 0,
            TrailIntensity: intensity,
            Active: true,
        };

        game.World.ShadowTrail[entity] = trail;
        game.World.Signature[entity] |= Has.ShadowTrail;
    };
}

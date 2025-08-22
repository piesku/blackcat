import {Vec2} from "../../lib/math.js";
import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export const enum ParticleType {
    Generic,
    Flame,
    Shadow,
    Smoke,
    Spark,
    Blood,
    Debris,
}

export interface Particle {
    Type: ParticleType;
    Spread: number; // Random spread factor for turbulence

    // Visual properties that change over time
    InitialScale: Vec2; // Starting scale
    FinalScale: Vec2; // Ending scale (for growth/shrinkage)
    FadeIn: number; // Time to fade in (0 = instant)
    FadeOut: number; // Time to fade out (0 = instant at death)
}

export function particle(
    type: ParticleType = ParticleType.Generic,
    options: Partial<{
        spread: number;
        initialScale: Vec2;
        finalScale: Vec2;
        fadeIn: number;
        fadeOut: number;
    }> = {},
) {
    return (game: Game, entity: Entity) => {
        let p: Particle = {
            Type: type,
            Spread: options.spread || 0.1,

            InitialScale: options.initialScale || [0.15, 0.15],
            FinalScale: options.finalScale || [0.05, 0.05],
            FadeIn: options.fadeIn || 0.0,
            FadeOut: options.fadeOut || 0.2,
        };

        game.World.Particle[entity] = p;
        game.World.Signature[entity] |= Has.Particle;
    };
}

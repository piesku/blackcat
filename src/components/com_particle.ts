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
    Direction: Vec2; // Movement direction
    Speed: number; // Base speed
    InitialSpeed: number; // Speed at creation (for deceleration effects)
    Gravity: Vec2; // Acceleration (x, y) - allows for wind effects
    Spread: number; // Random spread factor for turbulence
    Age: number; // Time since creation
    Lifetime: number; // Total lifetime

    // Visual properties that change over time
    InitialScale: Vec2; // Starting scale
    FinalScale: Vec2; // Ending scale (for growth/shrinkage)
    FadeIn: number; // Time to fade in (0 = instant)
    FadeOut: number; // Time to fade out (0 = instant at death)

    // Physics properties
    Damping: number; // Speed reduction over time (1.0 = no damping, 0.5 = half speed each second)
    Bounce: number; // Bounce factor when hitting surfaces (0 = no bounce, 1 = perfect bounce)

    // Behavior flags
    DestroyOnHit: boolean; // Whether particle should be destroyed when hitting something
    AffectedByWind: boolean; // Whether particle responds to wind/external forces
}

export function particle(
    type: ParticleType = ParticleType.Generic,
    direction: Vec2 = [1, 0],
    speed: number = 3.0,
    lifetime: number = 1.0,
    options: Partial<{
        gravity: Vec2;
        spread: number;
        initialScale: Vec2;
        finalScale: Vec2;
        fadeIn: number;
        fadeOut: number;
        damping: number;
        bounce: number;
        destroyOnHit: boolean;
        affectedByWind: boolean;
    }> = {},
) {
    return (game: Game, entity: Entity) => {
        let p: Particle = {
            Type: type,
            Direction: [direction[0], direction[1]],
            Speed: speed,
            InitialSpeed: speed,
            Gravity: options.gravity || [0, 0],
            Spread: options.spread || 0.1,
            Age: 0,
            Lifetime: lifetime,

            InitialScale: options.initialScale || [0.15, 0.15],
            FinalScale: options.finalScale || [0.05, 0.05],
            FadeIn: options.fadeIn || 0.0,
            FadeOut: options.fadeOut || 0.2,

            Damping: options.damping || 1.0,
            Bounce: options.bounce || 0.0,

            DestroyOnHit: options.destroyOnHit ?? true,
            AffectedByWind: options.affectedByWind ?? true,
        };

        game.World.Particle[entity] = p;
        game.World.Signature[entity] |= Has.Particle;
    };
}

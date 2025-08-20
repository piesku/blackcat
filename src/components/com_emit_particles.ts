import {Blueprint} from "../../lib/game.js";
import {Vec2} from "../../lib/math.js";
import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

interface ParticleCreator {
    (game: Game, direction: Vec2, speed: number): Blueprint<Game>;
}

export interface EmitParticles {
    Creator: ParticleCreator;
    Frequency: number; // Particles per second
    SinceLast: number; // Time since last emission

    // Emission shape and spread
    Direction: Vec2; // Base emission direction (in parent's space)
    Spread: number; // Cone angle in radians (0 = straight line, π = full circle)
    SpeedMin: number; // Minimum particle speed
    SpeedMax: number; // Maximum particle speed

    // Duration control (similar to Shake component)
    Duration: number; // How long to emit particles (Infinity = infinite)
    Age: number; // How long this emitter has been active

    // Emission pattern
    BurstCount: number; // How many particles to emit at once (1 = single particles)
    Active: boolean; // Whether emitter is currently active
}

export function emit_particles(
    creator: ParticleCreator,
    frequency: number,
    options: Partial<{
        direction: Vec2;
        spread: number;
        speedMin: number;
        speedMax: number;
        duration: number;
        burstCount: number;
        active: boolean;
    }> = {},
) {
    return (game: Game, entity: Entity) => {
        const emitter: EmitParticles = {
            Creator: creator,
            Frequency: frequency,
            SinceLast: 0,

            Direction: options.direction || [0, 1], // Default: upward
            Spread: options.spread || 0, // Default: no spread
            SpeedMin: options.speedMin || 3.0,
            SpeedMax: options.speedMax || 3.0,

            Duration: options.duration ?? Infinity, // Default: infinite
            Age: 0,

            BurstCount: options.burstCount || 1,
            Active: options.active ?? true,
        };

        game.World.EmitParticles[entity] = emitter;
        game.World.Signature[entity] |= Has.EmitParticles;
    };
}

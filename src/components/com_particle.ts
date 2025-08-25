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
    FinalScale: Vec2; // Ending scale (for growth/shrinkage) - initial scale comes from LocalTransform2D
    FadeOutDuration: number; // Time to fade out (0 = instant at death)
}

export function particle(
    type: ParticleType = ParticleType.Generic,
    spread: number = 0.1,
    final_scale: Vec2 = [0.05, 0.05],
    fade_out_duration: number = 0.2,
) {
    return (game: Game, entity: Entity) => {
        let p: Particle = {
            Type: type,
            Spread: spread,
            FinalScale: final_scale,
            FadeOutDuration: fade_out_duration,
        };

        game.World.Particle[entity] = p;
        game.World.Signature[entity] |= Has.Particle;
    };
}

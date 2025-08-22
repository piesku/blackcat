import {Entity} from "../../lib/world.js";
import {spawn} from "./com_spawn.js";
import {Game} from "../game.js";
import {blueprint_shadow_particle} from "../scenes/particles/blu_shadow_particle.js";

export function shadow_trail(frequency: number = 8.0, intensity: number = 1.0) {
    return spawn(
        (game, direction, speed) => blueprint_shadow_particle(game, direction, speed, intensity),
        frequency,
        {
            direction: [0, 0], // Stationary shadows
            spread: 0, // No spread for trails
            speedMin: 0.2, // Very slow drift
            speedMax: 0.2,
            duration: Infinity, // Infinite duration - controlled by movement
            burstCount: 1, // Single particle per emission
        },
    );
}

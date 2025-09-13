import {float} from "../../lib/random.js";
import {Particle} from "../components/com_particle.js";
import {set_color} from "../components/com_render2d.js";
import {RigidBody2D} from "../components/com_rigid_body2d.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Particle | Has.LocalTransform2D | Has.Render2D | Has.Lifespan;

export function sys_particles(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let particle = game.World.Particle[entity];
            let transform = game.World.LocalTransform2D[entity];
            let lifespan = game.World.Lifespan[entity];

            DEBUG: if (!particle || !transform || !lifespan) throw new Error("missing component");

            if (game.World.Signature[entity] & Has.RigidBody2D) {
                // Apply particle-specific physics by modifying rigid body acceleration
                let rigid_body = game.World.RigidBody2D[entity];
                DEBUG: if (!rigid_body) throw new Error("missing component");
                update_particle_physics(particle, rigid_body);
            }

            // Handle visual effects
            // Calculate age factor (0 = just born, 1 = about to die)
            let age_factor = Math.min(lifespan.Age / lifespan.Lifetime, 1.0);
            update_particle_visuals(game, entity, age_factor);

            // Mark transform as dirty for the render system
            //game.World.Signature[entity] |= Has.Dirty;
        }
    }
}

function update_particle_physics(particle: Particle, rigid_body: RigidBody2D) {
    // Apply spread/turbulence for natural motion using acceleration
    if (particle.Spread > 0) {
        let spread_x = float(-particle.Spread, particle.Spread);
        let spread_y = float(-particle.Spread, particle.Spread);
        rigid_body.Acceleration[0] += spread_x;
        rigid_body.Acceleration[1] += spread_y;
    }
}

function update_particle_visuals(game: Game, entity: number, age_factor: number) {
    let render = game.World.Render2D[entity];
    DEBUG: if (!render) throw new Error("missing component");

    // Fade out proportionally to age - particles become more transparent as they age
    let alpha = render.Color[3] * (1.0 - age_factor);

    // Apply alpha to rendering using set_color helper
    let current_color = game.World.Render2D[entity].Color;
    set_color(game, entity, [
        current_color[0], // Red (preserve original color)
        current_color[1], // Green
        current_color[2], // Blue
        alpha, // Alpha (fade effect)
    ]);
}

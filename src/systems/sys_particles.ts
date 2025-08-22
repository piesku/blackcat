import {float} from "../../lib/random.js";
import {Lifespan} from "../components/com_lifespan.js";
import {LocalTransform2D} from "../components/com_local_transform2d.js";
import {Particle} from "../components/com_particle.js";
import {set_color} from "../components/com_render2d.js";
import {RigidBody2D} from "../components/com_rigid_body2d.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Particle | Has.LocalTransform2D | Has.Render2D | Has.RigidBody2D | Has.Lifespan;

export function sys_particles(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let particle = game.World.Particle[entity];
            let transform = game.World.LocalTransform2D[entity];
            let render = game.World.Render2D[entity];
            let rigid_body = game.World.RigidBody2D[entity];
            let lifespan = game.World.Lifespan[entity];

            DEBUG: if (!particle || !transform || !render || !rigid_body || !lifespan)
                throw new Error("missing component");

            // Apply particle-specific physics by modifying rigid body acceleration
            update_particle_physics(particle, rigid_body);

            // Handle visual effects
            update_particle_visuals(game, entity, particle, transform, lifespan);

            // Mark transform as dirty for the render system
            game.World.Signature[entity] |= Has.Dirty;
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

    // Particle damping is now handled by RigidBody2D.Drag in sys_physics2d_integrate
}

function update_particle_visuals(
    game: Game,
    entity: number,
    particle: Particle,
    transform: LocalTransform2D,
    lifespan: Lifespan,
) {
    // Calculate age factor (0 = just born, 1 = about to die)
    let age_factor = Math.min(lifespan.Age / lifespan.Lifetime, 1.0);

    // Handle fade in
    let alpha = 1.0;
    if (particle.FadeIn > 0 && lifespan.Age < particle.FadeIn) {
        alpha = lifespan.Age / particle.FadeIn;
    }

    // Handle fade out
    if (particle.FadeOut > 0) {
        let fade_start_time = lifespan.Lifetime - particle.FadeOut;
        if (lifespan.Age >= fade_start_time) {
            let fade_progress = (lifespan.Age - fade_start_time) / particle.FadeOut;
            alpha *= 1.0 - fade_progress;
        }
    }

    // Interpolate scale from initial to final
    let scale_x =
        particle.InitialScale[0] + (particle.FinalScale[0] - particle.InitialScale[0]) * age_factor;
    let scale_y =
        particle.InitialScale[1] + (particle.FinalScale[1] - particle.InitialScale[1]) * age_factor;

    // Apply visual changes
    transform.Scale[0] = scale_x;
    transform.Scale[1] = scale_y;

    // Apply alpha to rendering using set_color helper
    let current_color = game.World.Render2D[entity].Color;
    set_color(game, entity, [
        current_color[0], // Red (preserve original color)
        current_color[1], // Green
        current_color[2], // Blue
        alpha, // Alpha (fade effect)
    ]);
}

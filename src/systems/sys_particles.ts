import {float} from "../../lib/random.js";
import {vec2_scale} from "../../lib/vec2.js";
import {set_color} from "../components/com_render2d.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Particle | Has.LocalTransform2D | Has.Render2D | Has.RigidBody2D;

export function sys_particles(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let particle = game.World.Particle[entity];
            let transform = game.World.LocalTransform2D[entity];
            let render = game.World.Render2D[entity];
            let rigid_body = game.World.RigidBody2D[entity];

            if (!particle || !transform || !render || !rigid_body) continue;

            // Update particle age (domain-specific logic)
            particle.Age += delta;

            // Apply particle-specific physics by modifying rigid body acceleration
            update_particle_physics(particle, rigid_body, delta);

            // Handle visual effects
            update_particle_visuals(game, entity, particle, transform, delta);

            // Mark transform as dirty for the render system
            game.World.Signature[entity] |= Has.Dirty;
        }
    }
}

function update_particle_physics(particle: any, rigid_body: any, delta: number) {
    // Apply spread/turbulence for natural motion using acceleration
    if (particle.Spread > 0) {
        let spread_x = float(-particle.Spread, particle.Spread);
        let spread_y = float(-particle.Spread, particle.Spread);
        rigid_body.Acceleration[0] += spread_x;
        rigid_body.Acceleration[1] += spread_y;
    }

    // Apply particle-specific damping (overrides rigid body drag)
    if (particle.Damping < 1.0 && particle.Damping > 0) {
        let damping_factor = Math.pow(particle.Damping, delta);
        vec2_scale(rigid_body.VelocityLinear, rigid_body.VelocityLinear, damping_factor);
    }
}

function update_particle_visuals(
    game: Game,
    entity: number,
    particle: any,
    transform: any,
    delta: number,
) {
    // Calculate age factor (0 = just born, 1 = about to die)
    let age_factor = Math.min(particle.Age / particle.Lifetime, 1.0);

    // Handle fade in
    let alpha = 1.0;
    if (particle.FadeIn > 0 && particle.Age < particle.FadeIn) {
        alpha = particle.Age / particle.FadeIn;
    }

    // Handle fade out
    if (particle.FadeOut > 0) {
        let fade_start_time = particle.Lifetime - particle.FadeOut;
        if (particle.Age >= fade_start_time) {
            let fade_progress = (particle.Age - fade_start_time) / particle.FadeOut;
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

import {Vec2} from "../../lib/math.js";
import {float} from "../../lib/random.js";
import {vec2_add, vec2_length, vec2_scale} from "../../lib/vec2.js";
import {set_color} from "../components/com_render2d.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Particle | Has.LocalTransform2D | Has.Move2D | Has.Render2D;

export function sys_particles(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let particle = game.World.Particle[entity];
            let transform = game.World.LocalTransform2D[entity];
            let movement = game.World.Move2D[entity];
            let render = game.World.Render2D[entity];

            if (!particle || !transform || !movement || !render) continue;

            update_particle_physics(particle, delta);
            update_particle_movement(particle, movement);
            update_particle_visuals(game, entity, particle, transform, delta);

            // Mark transform as dirty for the render system
            game.World.Signature[entity] |= Has.Dirty;
        }
    }
}

function update_particle_physics(particle: any, delta: number) {
    // Update particle age
    particle.Age += delta;

    // Apply gravity
    if (particle.Gravity[0] !== 0 || particle.Gravity[1] !== 0) {
        let gravity_this_frame: Vec2 = [particle.Gravity[0] * delta, particle.Gravity[1] * delta];
        vec2_add(particle.Direction, particle.Direction, gravity_this_frame);
    }

    // Apply spread/turbulence for natural motion
    if (particle.Spread > 0) {
        let spread_x = float(-particle.Spread, particle.Spread) * delta;
        let spread_y = float(-particle.Spread, particle.Spread) * delta;
        particle.Direction[0] += spread_x;
        particle.Direction[1] += spread_y;
    }

    // Apply damping (speed reduction over time)
    if (particle.Damping < 1.0 && particle.Damping > 0) {
        let damping_factor = Math.pow(particle.Damping, delta);
        particle.Speed *= damping_factor;
    }

    // Handle wind effects (could be extended later)
    if (particle.AffectedByWind) {
        // TODO: Add global wind system
    }
}

function update_particle_movement(particle: any, movement: any) {
    // Update movement direction and speed based on particle physics
    if (movement.Direction) {
        let current_speed = vec2_length(particle.Direction);
        if (current_speed > 0) {
            // Normalize direction and apply current speed
            movement.Direction[0] = particle.Direction[0] / current_speed;
            movement.Direction[1] = particle.Direction[1] / current_speed;
            movement.MoveSpeed = current_speed * particle.Speed;
        } else {
            movement.Direction[0] = 0;
            movement.Direction[1] = 0;
            movement.MoveSpeed = 0;
        }
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

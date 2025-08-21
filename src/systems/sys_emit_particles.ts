import {instantiate} from "../../lib/game.js";
import {mat2d_get_translation} from "../../lib/mat2d.js";
import {Vec2} from "../../lib/math.js";
import {float} from "../../lib/random.js";
import {vec2_normalize, vec2_rotate} from "../../lib/vec2.js";
import {Entity} from "../../lib/world.js";
import {EmitParticles} from "../components/com_emit_particles.js";
import {copy_position} from "../components/com_local_transform2d.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.EmitParticles | Has.SpatialNode2D;

export function sys_emit_particles(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            update_emitter(game, entity, delta);
        }
    }
}

const world_position: Vec2 = [0, 0];
const emission_direction: Vec2 = [0, 0];

function update_emitter(game: Game, entity: Entity, delta: number) {
    let emitter = game.World.EmitParticles[entity];
    let spatial_node = game.World.SpatialNode2D[entity];

    DEBUG: if (!emitter || !spatial_node) throw new Error("missing component");

    if (emitter.Duration < 0) {
        emitter.Duration = 0;
        return;
    }

    emitter.Duration -= delta;
    emitter.SinceLast += delta;

    let emission_interval = 1.0 / emitter.Frequency;

    if (emitter.SinceLast >= emission_interval) {
        emitter.SinceLast = 0;

        // Get emitter's world position
        mat2d_get_translation(world_position, spatial_node.World);

        // Emit burst of particles
        for (let i = 0; i < emitter.BurstCount; i++) {
            emit_single_particle(game, emitter, world_position);
        }
    }
}

function emit_single_particle(game: Game, emitter: EmitParticles, position: Vec2) {
    // Check if we can create more entities
    if (game.World.Signature.length - game.World.Graveyard.length >= game.World.Capacity) {
        console.warn("Cannot emit particle: world at maximum capacity");
        return;
    }

    // Calculate emission direction with spread
    emission_direction[0] = emitter.Direction[0];
    emission_direction[1] = emitter.Direction[1];

    // Apply random spread
    if (emitter.Spread > 0) {
        let spread_angle = float(-emitter.Spread / 2, emitter.Spread / 2);
        vec2_rotate(emission_direction, emission_direction, spread_angle);
    }

    // Normalize direction
    vec2_normalize(emission_direction, emission_direction);

    // Random speed within range
    let speed = float(emitter.SpeedMin, emitter.SpeedMax);

    // Create particle with calculated direction and speed
    let particle_blueprint = emitter.Creator(game, emission_direction, speed);

    // Instantiate particle at emitter position
    let particle_entity = instantiate(game, [...particle_blueprint, copy_position(position)]);

    // Set initial velocity after all components are set up
    let particle = game.World.Particle[particle_entity];
    let rigid_body = game.World.RigidBody2D[particle_entity];
    if (particle && rigid_body) {
        rigid_body.VelocityLinear[0] = emission_direction[0] * speed;
        rigid_body.VelocityLinear[1] = emission_direction[1] * speed;
    }
}

import {instantiate} from "../../lib/game.js";
import {mat2d_get_translation} from "../../lib/mat2d.js";
import {Vec2} from "../../lib/math.js";
import {copy_position} from "../components/com_local_transform2d.js";
import {Game} from "../game.js";
import {blueprint_shadow_particle} from "../scenes/particles/blu_shadow_particle.js";
import {Has} from "../world.js";

const QUERY = Has.ShadowTrail | Has.SpatialNode2D | Has.Move2D;

export function sys_shadow_trail(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let trail = game.World.ShadowTrail[entity];
            let spatial_node = game.World.SpatialNode2D[entity];
            let movement = game.World.Move2D[entity];

            if (!trail || !spatial_node || !movement) continue;
            if (!trail.Active) continue;

            // Only emit particles when entity is moving
            let is_moving =
                movement.Direction &&
                (Math.abs(movement.Direction[0]) > 0.1 || Math.abs(movement.Direction[1]) > 0.1);

            if (!is_moving) continue;

            // Update emission timing
            trail.LastEmissionTime += delta;
            let emission_interval = 1.0 / trail.ParticleFrequency;

            if (trail.LastEmissionTime >= emission_interval) {
                trail.LastEmissionTime = 0;

                emit_shadow_particle(game, entity, trail, spatial_node);
            }
        }
    }
}

const world_position: Vec2 = [0, 0];

function emit_shadow_particle(game: Game, entity: number, trail: any, spatial_node: any) {
    // Check if we can create more entities
    if (game.World.Signature.length - game.World.Graveyard.length >= game.World.Capacity) {
        return;
    }

    // Get entity's current world position
    mat2d_get_translation(world_position, spatial_node.World);

    // Create shadow particle with minimal movement (stays mostly in place)
    let shadow_direction: Vec2 = [0, 0]; // Stationary
    let particle_speed = 0.2; // Very slow drift
    let particle_lifetime = 1.5 + trail.TrailIntensity * 0.5; // Longer trails for higher intensity

    let particle_entity = instantiate(
        game,
        blueprint_shadow_particle(shadow_direction, particle_speed, particle_lifetime),
    );

    // Set particle position to entity's current location
    let particle_transform = game.World.LocalTransform2D[particle_entity];
    if (particle_transform) {
        copy_position([world_position[0], world_position[1]])(game, particle_entity);
    }
}

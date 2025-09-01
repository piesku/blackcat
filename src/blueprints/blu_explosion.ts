import {Vec2} from "../../lib/math.js";
import {integer} from "../../lib/random.js";
import {collide2d} from "../components/com_collide2d.js";
import {DamageType, deal_damage} from "../components/com_deal_damage.js";
import {lifespan} from "../components/com_lifespan.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {spawn_count} from "../components/com_spawn.js";
import {Layer} from "../game.js";
import {blueprint_debris_particle} from "./particles/blu_debris_particle.js";

export function blueprint_explosion(
    position: Vec2,
    damage: number = 3,
    radius: number = 1.5,
    duration: number = 0.2,
) {
    return [
        spatial_node2d(),
        local_transform2d(position),
        collide2d(true, Layer.Object, Layer.Player, radius), // Explosion collision radius
        deal_damage(damage, DamageType.Explosion, {
            cooldown: 0.0, // Instant damage
            shake_duration: 0.5, // Big screen shake
            destroy_on_hit: false, // Hit multiple targets
        }),
        lifespan(duration), // Brief explosion area

        spawn_count(
            blueprint_debris_particle,
            0.001, // Very rapid spawning
            2 * Math.PI, // Full 360 degree spread
            3.0, // speedMin: debris flies fast
            8.0, // speedMax: debris flies fast
            integer(30, 60), // initialCount
        ),
    ];
}

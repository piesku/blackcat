import {Tile} from "../../../sprites/spritesheet.js";
import {collide2d} from "../../components/com_collide2d.js";
import {deal_damage} from "../../components/com_deal_damage.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_timed} from "../../components/com_spawn.js";
import {Layer} from "../../game.js";
import {blueprint_larpa_trail_particle} from "../particles/blu_larpa_trail_particle.js";

export function blueprint_larpa_rocket(damage: number) {
    return [
        DEBUG && label("larpa rocket"),
        spatial_node2d(),
        local_transform2d(),
        render2d(Tile.Rocket),
        collide2d(Layer.Projectile, Layer.Player | Layer.Terrain, 0.08),
        rigid_body2d(RigidKind.Dynamic, 0, 0, [0, 0]),
        deal_damage(damage), // Default cooldown=0, destroys on hit
        lifespan(5), // Longer flight time than regular projectiles

        // Spawner for falling particle damage trail
        spawn_timed(
            () => blueprint_larpa_trail_particle(),
            0.1, // interval: spawn trail particle every 0.1 seconds
            0.2, // spread: slight horizontal spread
            0.5, // speedMin: slow falling speed
            1.5, // speedMax
            Infinity,
        ),
    ];
}

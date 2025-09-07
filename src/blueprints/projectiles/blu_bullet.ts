import {Tile} from "../../../sprites/spritesheet.js";
import {AbilityType, has_ability} from "../../components/com_abilities.js";
import {collide2d} from "../../components/com_collide2d.js";
import {DamageType, deal_damage} from "../../components/com_deal_damage.js";
import {get_root_spawner} from "../../components/com_label.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_timed} from "../../components/com_spawn.js";
import {Game} from "../../game.js";
import {Layer} from "../../game.js";
import {blueprint_bullet_trail} from "../particles/blu_bullet_trail.js";

/**
 * Create a bullet blueprint that automatically checks for piercing shots ability
 * Must be called with game and spawner_entity parameters from the spawn system
 */
export function blueprint_bullet(damage: number) {
    return (game: Game, spawner_entity: number) => {
        // Find the fighter entity who owns this weapon/spawner
        let fighter_entity = get_root_spawner(game.World, spawner_entity);

        // Check if fighter has piercing shots ability
        let has_piercing = has_ability(game, fighter_entity, AbilityType.PiercingShots);

        return [
            label("bullet"),

            spatial_node2d(),
            local_transform2d(undefined, 0, [0.2, 0.2]), // Small projectile

            render2d(Tile.Body), // Use a bullet/projectile sprite

            collide2d(true, Layer.Projectile, Layer.Player | Layer.Terrain, 0.05),
            rigid_body2d(RigidKind.Dynamic, 0, 0, [0, 0]),

            deal_damage(damage, has_piercing ? DamageType.Piercing : DamageType.Projectile, {
                destroy_on_hit: !has_piercing, // Piercing bullets don't get destroyed on hit
                shake_duration: 0.15,
                piercing: has_piercing, // Enable piercing logic
            }),

            lifespan(4),

            // Trail particles spawned as projectile moves
            spawn_timed(
                (_game, _spawner) => blueprint_bullet_trail(),
                0.05, // interval: spawn trail particles every 0.05 seconds
                0.0, // spread: no randomization - precise trail
                0.0, // speedMin: trails stay where spawned
                0.0, // speedMax: no movement
                Infinity,
            ),
        ];
    };
}

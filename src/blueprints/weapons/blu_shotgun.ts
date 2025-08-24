import {Tile} from "../../../sprites/spritesheet.js";
import {collide2d} from "../../components/com_collide2d.js";
import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {Game, Layer} from "../../game.js";
import {blueprint_projectile} from "../projectiles/blu_projectile.js";

export function blueprint_shotgun(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d(),
        render2d(Tile.Body), // Use a shotgun sprite
        collide2d(false, Layer.None, Layer.None, 0.35),
        label("shotgun"), // Name for identification
        weapon_ranged(
            1.0, // damage per pellet
            4, // range (shorter than pistol)
            2.5, // cooldown (slow)
            10, // projectile speed
            5, // projectile count (5 pellets)
            0.5, // spread (wide cone between multiple projectiles)
            0.15, // scatter (moderate inaccuracy)
            0.9, // initial timeout
        ),

        // Spawner for shotgun pellets
        spawn_count(
            blueprint_projectile(game, 1.0, 4, 10), // Will be configured per shot
            5, // count: 5 pellets per shot
            0, // interval: instant spawn (all at once)
            [1, 0], // direction: Forward direction (will be overridden by weapon system)
            0.5, // spread: Wide cone spread for pellets
            9.0, // speedMin
            11.0, // speedMax
        ),
    ];
}

import {blueprint_projectile} from "../projectiles/blu_projectile.js";
import {collide2d} from "../../components/com_collide2d.js";
import {label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {Game, Layer} from "../../game.js";

export function blueprint_sniper_rifle(game: Game) {
    return [
        spatial_node2d(),
        local_transform2d(),
        render2d("22"), // Use a sniper sprite
        collide2d(false, Layer.None, Layer.None, 0.5),
        label("sniper_rifle"), // Name for identification
        weapon_ranged(
            3.5, // damage (reduced from 5 for better balance)
            15, // range (very long)
            3.5, // cooldown (very slow)
            20, // projectile speed (very fast)
            1, // projectile count (single shot)
            0.01, // spread (pinpoint accuracy between multiple shots)
            0.08, // scatter (small aiming inaccuracy for balance)
            1.2, // initial timeout (longer delay before first shot)
        ),

        // Spawner for sniper bullets
        spawn_count(
            blueprint_projectile(game, 3.5, 15, 20), // High damage, long range, fast projectile
            1, // count: single bullet per shot
            0, // interval: instant spawn
            [1, 0], // direction: Forward direction (will be overridden by weapon system)
            0.01, // spread: Very tight spread for precision
            19.5, // speedMin
            20.5, // speedMax
        ),
    ];
}

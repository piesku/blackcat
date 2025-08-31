import {instantiate} from "../../lib/game.js";
import {Vec2} from "../../lib/math.js";
import {element, float, integer} from "../../lib/random.js";
import {vec2_length} from "../../lib/vec2.js";
import {blueprint_camera} from "../blueprints/blu_camera.js";
import {blueprint_fighter} from "../blueprints/blu_fighter.js";
import {blueprint_terrain_block} from "../blueprints/blu_terrain_block.js";
import {control_player} from "../components/com_control_player.js";
import {draw_arc} from "../components/com_draw.js";
import {label} from "../components/com_label.js";
import {local_transform2d, set_position} from "../components/com_local_transform2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {Game, WORLD_CAPACITY} from "../game.js";
import {
    ARENA_CENTER_X,
    ARENA_CENTER_Y,
    ARENA_HEIGHT,
    ARENA_RADIUS,
    ARENA_WIDTH,
} from "../maps/arena.js";
import {apply_upgrades} from "../upgrades/manager.js";
import {World} from "../world.js";

/**
 * Generate random destructible terrain clusters in the arena
 */
function generate_terrain(game: Game) {
    // Create 3-6 terrain clusters
    let cluster_count = integer(3, 6);

    for (let cluster = 0; cluster < cluster_count; cluster++) {
        // Random cluster center, avoiding the center area where fighters spawn
        let angle = float(0, Math.PI * 2);
        let distance = float(2, ARENA_RADIUS - 2); // Keep away from edges and center
        let cluster_x = ARENA_CENTER_X + Math.cos(angle) * distance;
        let cluster_y = ARENA_CENTER_Y + Math.sin(angle) * distance;

        // Each cluster has 2-5 blocks
        let block_count = integer(2, 5);

        for (let block = 0; block < block_count; block++) {
            // Random position within cluster (small radius for organic shapes)
            let block_angle = float(0, Math.PI * 2);
            let block_distance = float(0, 1.5);
            let block_x = cluster_x + Math.cos(block_angle) * block_distance;
            let block_y = cluster_y + Math.sin(block_angle) * block_distance;

            // Make sure block is within arena bounds
            let distance_from_center: Vec2 = [block_x - ARENA_CENTER_X, block_y - ARENA_CENTER_Y];
            if (vec2_length(distance_from_center) > ARENA_RADIUS - 1) {
                continue; // Skip blocks too close to arena edge
            }

            // Random scale (and health) for variety
            let scale = element([0.8, 1.0, 1.2, 1.4]);

            // Create terrain block
            instantiate(game, [...blueprint_terrain_block(scale), set_position(block_x, block_y)]);
        }
    }
}

export function scene_arena(game: Game) {
    game.ViewportResized = true;

    game.World = new World(WORLD_CAPACITY);
    game.World.BackgroundColor = "#1a1a33"; // Dark blue background
    game.World.Width = ARENA_WIDTH;
    game.World.Height = ARENA_HEIGHT;

    // Top-down camera at center of arena
    instantiate(game, [...blueprint_camera(game), set_position(ARENA_CENTER_X, ARENA_CENTER_Y)]);

    // Arena circle boundary
    instantiate(game, [
        spatial_node2d(),
        local_transform2d(),
        set_position(ARENA_CENTER_X, ARENA_CENTER_Y),
        draw_arc("#444455", ARENA_RADIUS),
    ]);

    // Player fighter (left side)
    let player = instantiate(game, [
        label("Player"),
        ...blueprint_fighter(game, true),
        set_position(ARENA_CENTER_X - 4, ARENA_CENTER_Y),
        control_player(),
    ]);

    // Opponent fighter (right side)
    let opponent = instantiate(game, [
        label("Opponent"),
        ...blueprint_fighter(game, false),
        set_position(ARENA_CENTER_X + 4, ARENA_CENTER_Y),
    ]);

    // Apply upgrades from game state
    apply_upgrades(game, player, game.State.playerUpgrades);
    apply_upgrades(game, opponent, game.State.opponentUpgrades);

    // Generate destructible terrain
    generate_terrain(game);
}

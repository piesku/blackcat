/**
 * # sys_camera_zoom
 *
 * Dynamic camera zoom system that automatically adjusts zoom level to keep
 * all active fighters visible on screen with proper padding. Uses UnitSize
 * for smooth exponential zoom transitions while maintaining camera position.
 */

import {Game, REAL_UNIT_SIZE} from "../game.js";
import {ARENA_CENTER_X, ARENA_CENTER_Y} from "../scenes/sce_arena.js";
import {Has} from "../world.js";

// Camera zoom configuration
const MIN_ZOOM = 0.5; // Farthest zoom (smaller UnitSize multiplier = zoomed out)
const MAX_ZOOM = 2.5; // Closest zoom (larger UnitSize multiplier = zoomed in)
const ZOOM_PADDING = 2.0; // Extra space around fighters for projectiles/movement
const ZOOM_LERP_SPEED = 3.0; // Speed of zoom transitions (higher = faster)
const DEFAULT_ZOOM = 1.0; // Fallback zoom when no fighters exist

const QUERY = Has.LocalTransform2D | Has.Health | Has.ControlAi;

export function sys_camera_zoom(game: Game, delta: number) {
    // Find camera entity
    if (game.Camera === undefined) {
        return; // No camera to control
    }

    // Find all active fighters (entities with Health that are alive)
    let all_alive: number[] = [];
    let alive_fighters: number[] = [];

    for (let ent = 0; ent < game.World.Signature.length; ent++) {
        if ((game.World.Signature[ent] & QUERY) === QUERY) {
            let health = game.World.Health[ent];
            if (health && health.IsAlive) {
                all_alive.push(ent);

                // Check if this is a main fighter (Player or Opponent)
                if (game.World.Signature[ent] & Has.Label) {
                    let label = game.World.Label[ent];
                    if (label.Name === "Player" || label.Name === "Opponent") {
                        alive_fighters.push(ent);
                    }
                }
            }
        }
    }

    // Use main fighters if there's a winner (one main fighter left), otherwise all active fighters
    let focus_targets = alive_fighters.length === 1 ? alive_fighters : all_alive;

    let target_zoom: number;
    let target_center_x = ARENA_CENTER_X;
    let target_center_y = ARENA_CENTER_Y;

    if (focus_targets.length === 0) {
        // No fighters - use default view
        target_zoom = DEFAULT_ZOOM;
    } else if (focus_targets.length === 1) {
        // Single fighter - use maximum zoom focused on fighter
        let fighter = focus_targets[0];
        let fighter_transform = game.World.LocalTransform2D[fighter];
        target_center_x = fighter_transform.Translation[0];
        target_center_y = fighter_transform.Translation[1];
        target_zoom = MAX_ZOOM;
    } else {
        // Multiple fighters - calculate bounding box and center point
        let min_x = Infinity;
        let max_x = -Infinity;
        let min_y = Infinity;
        let max_y = -Infinity;

        for (let fighter of focus_targets) {
            let fighter_transform = game.World.LocalTransform2D[fighter];
            let x = fighter_transform.Translation[0];
            let y = fighter_transform.Translation[1];

            min_x = Math.min(min_x, x);
            max_x = Math.max(max_x, x);
            min_y = Math.min(min_y, y);
            max_y = Math.max(max_y, y);
        }

        // Calculate center point between all fighters
        target_center_x = (min_x + max_x) / 2;
        target_center_y = (min_y + max_y) / 2;

        // Calculate required zoom to fit all fighters with padding
        let width = max_x - min_x;
        let height = max_y - min_y;
        let max_dimension = Math.max(width, height);

        // Convert dimension to zoom level
        // When fighters are close, we want to zoom in
        // When fighters are far, we want to zoom out
        let dimension_with_padding = max_dimension + ZOOM_PADDING * 2;
        let required_zoom = 8.0 / Math.max(0.5, dimension_with_padding); // Invert the relationship
        target_zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, required_zoom));
    }

    // Get current camera rig position and zoom
    // Camera is a child entity, we need to position its parent (the camera rig)
    let camera_rig = game.World.SpatialNode2D[game.Camera].Parent;
    if (camera_rig === undefined) {
        return; // No camera rig to control
    }

    let camera_rig_transform = game.World.LocalTransform2D[camera_rig];
    let x = camera_rig_transform.Translation[0];
    let y = camera_rig_transform.Translation[1];
    let current_zoom = game.UnitSize / REAL_UNIT_SIZE;

    // Exponential interpolation for smooth zoom transitions
    let lerp_factor = Math.min(1.0, ZOOM_LERP_SPEED * delta);

    // Exponential zoom interpolation (more natural feeling)
    let zoom_ratio = target_zoom / current_zoom;
    let new_zoom = current_zoom * Math.pow(zoom_ratio, lerp_factor);

    // Linear position interpolation (camera stays smooth)
    camera_rig_transform.Translation[0] = x + (target_center_x - x) * lerp_factor;
    camera_rig_transform.Translation[1] = y + (target_center_y - y) * lerp_factor;
    game.World.Signature[camera_rig] |= Has.Dirty;

    // Update zoom via UnitSize (much cleaner than matrix manipulation)
    game.UnitSize = REAL_UNIT_SIZE * new_zoom;
    game.ViewportResized = true; // Trigger viewport recalculation
}

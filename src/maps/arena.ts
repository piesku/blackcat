/**
 * Arena configuration constants
 *
 * These values define the arena dimensions and are used across multiple systems
 * to ensure consistency.
 */

export const ARENA_WIDTH = 20;
export const ARENA_HEIGHT = 20;
export const ARENA_RADIUS = 8;

// Derived constants
export const ARENA_CENTER_X = ARENA_WIDTH / 2; // 10
export const ARENA_CENTER_Y = ARENA_HEIGHT / 2; // 10

// Fighter bounds - keep fighters slightly inside the arena circle
export const FIGHTER_RADIUS = 0.5; // Half the collider size to keep the full fighter inside
export const ARENA_MAX_FIGHTER_DISTANCE = ARENA_RADIUS - FIGHTER_RADIUS;

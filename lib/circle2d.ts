import {mat2d_get_translation} from "./mat2d.js";
import {Mat2D, Vec2} from "./math.js";

export interface Circle2D {
    /** The radius of the circle in world units. */
    Radius: number;
    /** The world position of the circle center. */
    Center: Vec2;
}

/**
 * Update the circle's center position based on the world transform.
 */
export function compute_circle_position(world: Mat2D, circle: Circle2D) {
    mat2d_get_translation(circle.Center, world);
}

/**
 * Test if two circles intersect.
 */
export function intersect_circle(a: Circle2D, b: Circle2D): boolean {
    let dx = a.Center[0] - b.Center[0];
    let dy = a.Center[1] - b.Center[1];
    let distance_squared = dx * dx + dy * dy;
    let combined_radius = a.Radius + b.Radius;
    return distance_squared <= combined_radius * combined_radius;
}

/**
 * Calculate the penetration vector between two intersecting circles.
 * Returns the vector that circle A should move to separate from circle B.
 */
export function penetrate_circle(a: Circle2D, b: Circle2D): Vec2 {
    let dx = a.Center[0] - b.Center[0];
    let dy = a.Center[1] - b.Center[1];
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Handle the case where circles have the same center
    if (distance === 0) {
        return [a.Radius + b.Radius, 0]; // Push apart horizontally
    }

    let combined_radius = a.Radius + b.Radius;
    let penetration_depth = combined_radius - distance;

    // Normalize the direction vector and scale by penetration depth
    let normal_x = dx / distance;
    let normal_y = dy / distance;

    return [normal_x * penetration_depth, normal_y * penetration_depth];
}

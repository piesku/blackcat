import {instantiate} from "../../lib/game.js";
import {Vec2} from "../../lib/math.js";
import {element, float, integer} from "../../lib/random.js";
import {vec2_length} from "../../lib/vec2.js";
import {blueprint_camera} from "../blueprints/blu_camera.js";
import {blueprint_fighter} from "../blueprints/blu_fighter.js";
import {blueprint_terrain_block} from "../blueprints/blu_terrain_block.js";
import {CombatStance, STANCE_MODIFIERS} from "../components/com_control_ai.js";
import {query_down} from "../components/com_children.js";
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
import {World, Has} from "../world.js";

/**
 * Apply complete stance effects to a fighter entity (AI behavior + all stat modifiers)
 */
function apply_complete_stance(game: Game, entity: number, stance: CombatStance) {
    let ai = game.World.ControlAi[entity];
    let health = game.World.Health[entity];
    let move = game.World.Move2D[entity];

    if (!ai || !health || !move) {
        console.warn(`[STANCE] Cannot apply stance - missing components on entity ${entity}`);
        return;
    }

    // Only apply to player fighters
    if (!ai.IsPlayer) return;

    let stance_modifiers = STANCE_MODIFIERS[stance];

    // Apply AI personality changes
    ai.Stance = stance;
    ai.Aggressiveness = ai.BaseAggressiveness * stance_modifiers.AggressivenessMultiplier;
    ai.Patience = ai.BasePatience * stance_modifiers.PatienceMultiplier;

    // Apply health modifier (can be positive or negative)
    let health_change = stance_modifiers.HealthModifier;
    if (health_change !== 0) {
        health.Max += health_change;
        health.Current += health_change;
        // Ensure current health doesn't go below 1
        health.Current = Math.max(1, health.Current);

        console.log(
            `[STANCE] Entity ${entity} health modified by ${health_change} (now ${health.Current}/${health.Max})`,
        );
    }

    // Apply movement speed modifier
    let speed_multiplier = stance_modifiers.MoveSpeedMultiplier;
    if (speed_multiplier !== 1.0) {
        move.MoveSpeed *= speed_multiplier;

        console.log(
            `[STANCE] Entity ${entity} movement speed modified by ${speed_multiplier}x (now ${move.MoveSpeed.toFixed(2)})`,
        );
    }

    // Apply damage and attack cooldown modifiers to all weapons and damage dealers on this fighter
    let damage_multiplier = stance_modifiers.DamageMultiplier;
    let cooldown_multiplier = stance_modifiers.AttackCooldownMultiplier;

    if (cooldown_multiplier !== 1.0) {
        // Apply cooldown modifier to weapons
        for (let weapon_entity of query_down(game.World, entity, Has.Weapon)) {
            let weapon = game.World.Weapon[weapon_entity];
            if (weapon) {
                weapon.Cooldown *= cooldown_multiplier;

                console.log(
                    `[STANCE] Weapon ${weapon_entity} cooldown modified by ${cooldown_multiplier}x (now ${weapon.Cooldown.toFixed(2)}s)`,
                );
            }
        }
    }

    if (damage_multiplier !== 1.0) {
        // Apply damage modifier to all damage dealers on this fighter (including child entities)
        for (let damage_entity of query_down(game.World, entity, Has.DealDamage)) {
            let damage_dealer = game.World.DealDamage[damage_entity];
            if (damage_dealer) {
                damage_dealer.Damage = Math.round(damage_dealer.Damage * damage_multiplier);

                console.log(
                    `[STANCE] Damage dealer ${damage_entity} damage modified by ${damage_multiplier}x (now ${damage_dealer.Damage})`,
                );
            }
        }
    }

    console.log(`[STANCE] Applied complete stance ${stance} to player fighter ${entity}`);
}

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

    // Apply selected stance to player fighter (all stance effects in one place)
    apply_complete_stance(game, player, game.State.selectedStance);

    // Generate destructible terrain
    generate_terrain(game);
}

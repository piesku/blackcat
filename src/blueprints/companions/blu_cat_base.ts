import {Vec4} from "../../../lib/math.js";
import {Tile} from "../../../sprites/spritesheet.js";
import {aim} from "../../components/com_aim.js";
import {children} from "../../components/com_children.js";
import {collide2d} from "../../components/com_collide2d.js";
import {AiState} from "../../components/com_control_ai.js";
import {DamageType, deal_damage} from "../../components/com_deal_damage.js";
import {health} from "../../components/com_health.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {move2d} from "../../components/com_move2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {Game, Layer} from "../../game.js";
import {Has} from "../../world.js";
import {blueprint_healthbar} from "../blu_healthbar.js";

// Custom AI component for cats with specific personality traits
export function cat_control_ai(
    owner_is_player: boolean,
    base_move_speed: number,
    aggressiveness: number,
    patience: number,
) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.ControlAi;

        // Cats have minimal initial delays (they're eager)
        let initial_delay = 0.2;
        let attack_delay = 0.3;
        let circle_direction = Math.random() > 0.5 ? 1 : -1;

        game.World.ControlAi[entity] = {
            State: AiState.Circling,
            LastStateChange: game.Time,
            StateTimer: initial_delay,
            CircleDirection: circle_direction,
            AttackCooldown: attack_delay,
            IsPlayer: owner_is_player, // Inherit team from owner
            Energy: 1.0, // Cats always start with full energy
            BaseMoveSpeed: base_move_speed,

            // Custom personality traits
            Aggressiveness: aggressiveness,
            Patience: patience,

            // State vectors
            PrepareDirection: [0, 0],
            SeparationForce: [0, 0],
            HasRetreatedAtLowHealth: false,

            // Energy properties (cats use defaults, don't get upgrade modifications)
            EnergyPerTap: 0.0, // Cats don't tap
            EnergyDecayRate: 1.0,
            HealingRate: 0.0, // Cats don't heal
            HealingDrainStrength: 1.0,
            PowerDecayRate: 16.0,
        };
    };
}

// Cat colors for different companions
export const cat_colors = {
    black: [0.1, 0.1, 0.1, 1] as Vec4,
    orange: [1.0, 0.5, 0.1, 1] as Vec4,
    pink: [1.0, 0.7, 0.8, 1] as Vec4,
    white: [0.9, 0.9, 0.9, 1] as Vec4,
    brown: [0.6, 0.4, 0.2, 1] as Vec4,
    blue: [0.3, 0.3, 0.8, 1] as Vec4,
    gray: [0.5, 0.5, 0.5, 1] as Vec4,
    red: [0.8, 0.2, 0.2, 1] as Vec4,
};

// Cat eyes (bright green for all cats)
export function blueprint_cat_eyes(_game: Game) {
    return [
        spatial_node2d(),
        local_transform2d(undefined, 0, [1, 1]),
        render2d(Tile.Eyes, [0.2, 1.0, 0.2, 1]), // Bright green cat eyes
    ];
}

// Cat body with specific color
export function blueprint_cat_body(game: Game, color: Vec4, scale: number = 1.0) {
    return [
        spatial_node2d(),
        local_transform2d(undefined, 0, [scale, scale]),
        render2d(Tile.Body, color),
        children(blueprint_cat_eyes(game)),
    ];
}

// Base cat companion with customizable stats
export function blueprint_cat_base(
    game: Game,
    owner_is_player: boolean,
    color: Vec4,
    hp: number,
    move_speed: number,
    aggressiveness: number,
    patience: number,
) {
    return [
        spatial_node2d(),
        local_transform2d(),

        // Cats inherit team from owner with custom personality
        cat_control_ai(owner_is_player, move_speed, aggressiveness, patience),

        collide2d(true, Layer.Player, Layer.Terrain | Layer.Player, 0.4), // Smaller collision
        health(hp),
        move2d(move_speed, 0),
        aim(0.1), // Base aim speed for cats (can be overridden)

        children(
            blueprint_cat_body(game, color, 1.0),
            blueprint_healthbar(),
            // No reticle for cats - they're more instinctual
        ),

        // Cat melee attacks (claws/bites)
        deal_damage(1, DamageType.Hand2Hand, {
            cooldown: 1.5,
            shake_duration: 0.2,
            destroy_on_hit: false,
        }),
    ];
}

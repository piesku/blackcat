import {Tile} from "../../../sprites/spritesheet.js";
import {aim} from "../../components/com_aim.js";
import {animate_sprite, AnimationId} from "../../components/com_animate_sprite.js";
import {children} from "../../components/com_children.js";
import {collide2d} from "../../components/com_collide2d.js";
import {AiState} from "../../components/com_control_ai.js";
import {deal_damage} from "../../components/com_deal_damage.js";
import {health} from "../../components/com_health.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {move2d} from "../../components/com_move2d.js";
import {render2d} from "../../components/com_render2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {Game, Layer} from "../../game.js";
import {Has} from "../../world.js";
import {OPPONENT_TEAM_COLOR, PLAYER_TEAM_COLOR} from "../blu_fighter.js";

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

            // Combat-driven energy properties (cats use defaults, don't get upgrade modifications)
            EnergyFromDamageDealt: 0.0, // Cats don't get energy upgrades
            EnergyFromDamageTaken: 0.0, // Cats don't get energy upgrades
            EnergyDecayRate: 1.0,
            HealingRate: 0.0, // Cats don't heal

            // Shockwave burst properties (cats don't use shockwave burst)
            ShockwaveBurstEnabled: false, // No shockwave burst for companion cats

            ManaSiphon: 0.0, // No siphoning for cats
        };
    };
}

// Cat body with team color and specific eye color
export function blueprint_cat_body(owner_is_player: boolean) {
    let team_color = owner_is_player ? PLAYER_TEAM_COLOR : OPPONENT_TEAM_COLOR;
    return [
        spatial_node2d(),
        local_transform2d(),
        render2d(Tile.CatRun1, team_color),
        animate_sprite({
            [AnimationId.Run]: {
                [Tile.CatRun1]: 0.1,
                [Tile.CatRun2]: 0.1,
                [Tile.CatRun3]: 0.1,
                [Tile.CatRun4]: 0.1,
            },
            [AnimationId.Die]: {
                [Tile.CatDie1]: 0.1,
                [Tile.CatDie2]: 0.1,
                [Tile.CatDie3]: 0.1,
                [Tile.CatDie4]: Infinity,
            },
        }),
    ];
}

// Base cat companion with customizable stats
export function blueprint_cat_base(
    owner_is_player: boolean,
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

        collide2d(Layer.Player, Layer.Terrain | Layer.Player, 0.4), // Smaller collision
        health(hp),
        move2d(move_speed, 0),
        aim(0.1), // Base aim speed for cats (can be overridden)

        children(
            blueprint_cat_body(owner_is_player),
            // No reticle for cats - they're more instinctual
        ),

        // Cat melee attacks (claws/bites)
        deal_damage(1, 1),
    ];
}

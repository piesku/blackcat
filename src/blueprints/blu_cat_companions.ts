import {Vec4} from "../../lib/math.js";
import {element} from "../../lib/random.js";
import {Tile} from "../../sprites/spritesheet.js";
import {aim} from "../components/com_aim.js";
import {children} from "../components/com_children.js";
import {collide2d} from "../components/com_collide2d.js";
import {AiState} from "../components/com_control_ai.js";
import {DamageType, deal_damage} from "../components/com_deal_damage.js";
import {health} from "../components/com_health.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {move2d} from "../components/com_move2d.js";
import {render2d} from "../components/com_render2d.js";
import {spatial_node2d} from "../components/com_spatial_node2d.js";
import {spawn_timed} from "../components/com_spawn.js";
import {Game, Layer} from "../game.js";
import {Has} from "../world.js";
import {blueprint_healthbar} from "./blu_healthbar.js";
import {blueprint_shadow_particle} from "./particles/blu_shadow_particle.js";
import {blueprint_boomerang_weapon} from "./weapons/blu_boomerang_weapon.js";
import {blueprint_mortar} from "./weapons/blu_mortar.js";
import {blueprint_shotgun} from "./weapons/blu_shotgun.js";

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
        };
    };
}

// Cat colors for different companions
const cat_colors = {
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
export function blueprint_cat_body(game: Game, color: Vec4, scale: number = 0.7) {
    return [
        spatial_node2d(),
        local_transform2d(undefined, 0, [scale, scale]), // Smaller than humans
        render2d(Tile.Body, color),
        children(blueprint_cat_eyes(game)),
    ];
}

// Base cat companion with customizable stats
function blueprint_cat_base(
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

// Random cat spawner function for Mr. Black
function random_cat_blueprint(game: Game, owner_is_player: boolean) {
    const cat_blueprints = [
        blueprint_mr_orange,
        blueprint_mr_pink,
        blueprint_mr_white,
        blueprint_mr_brown,
        blueprint_mr_blue,
        blueprint_mr_gray,
        blueprint_mr_red,
    ];

    return element(cat_blueprints)(game, owner_is_player);
}

// Mr. Black - Cat Summoner: Spawns random companion cats periodically
export function blueprint_mr_black(game: Game, owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            game,
            owner_is_player,
            cat_colors.black, // color
            6, // hp
            2.8, // move_speed
            1.8, // aggressiveness
            1.5, // patience
        ),
        // Spawn random cats every 8 seconds
        spawn_timed(
            () => random_cat_blueprint(game, owner_is_player),
            8.0, // interval: 8 seconds between spawns
            Math.PI * 2, // spread: full circle
            0.5, // speedMin
            1.0, // speedMax
            Infinity, // initialDuration: start spawning immediately
        ),
    ];
}

// Mr. Orange - Whirlwind Barbarian: Ultra-fast retargeting and movement
export function blueprint_mr_orange(game: Game, owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            game,
            owner_is_player,
            cat_colors.orange, // color
            3, // hp
            4.2, // move_speed
            2.5, // aggressiveness
            0.1, // patience
        ),
        aim(0.02), // Lightning-fast retargeting - overwrites base aim
    ];
}

// Mr. Pink - Boomerang Marksman: Ranged combat with return damage
export function blueprint_mr_pink(game: Game, owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            game,
            owner_is_player,
            cat_colors.pink, // color
            3, // hp
            1.8, // move_speed (decreased from 2.0)
            0.8, // aggressiveness (decreased from 1.2)
            2.0, // patience (increased from 1.0)
        ),
        children(blueprint_boomerang_weapon()),
        aim(0.3), // Slow careful aiming - overwrites base aim
    ];
}

// Mr. White - Defensive Tank: High HP, slow speed, shotgun
export function blueprint_mr_white(game: Game, owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            game,
            owner_is_player,
            cat_colors.white, // color
            7, // hp (increased from 5)
            1.3, // move_speed (decreased from 1.5)
            0.5, // aggressiveness
            2.5, // patience (increased from 2.0)
        ),
        children(blueprint_shotgun()),
        aim(0.15), // Slightly slower targeting for defensive play - overwrites base aim
    ];
}

// Mr. Brown - Loyal Bodyguard: Ultra-low aggression, protects allies
export function blueprint_mr_brown(game: Game, owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            game,
            owner_is_player,
            cat_colors.brown, // color
            4, // hp (increased from 3)
            1.5, // move_speed (decreased from 1.8)
            0.1, // aggressiveness (decreased from 0.3)
            3.0, // patience (increased from 2.5)
        ),
        aim(0.8), // Slow targeting - protection focused - overwrites base aim
        // TODO: Add damage redirection/bodyguard component
    ];
}

// Mr. Blue - Mortar Artillery: Glass cannon with explosive area damage
export function blueprint_mr_blue(game: Game, owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            game,
            owner_is_player,
            cat_colors.blue, // color
            2, // hp (decreased from 4 - glass cannon)
            2.8, // move_speed (increased from 2.2)
            2.0, // aggressiveness (increased from 1.0)
            0.1, // patience (decreased from 1.0)
        ),
        children(blueprint_mortar()),
        aim(0.03), // Fastest targeting for rapid artillery fire - overwrites base aim
    ];
}

// Mr. Gray - Shadow Assassin: High speed + damaging shadow trail
export function blueprint_mr_gray(game: Game, owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            game,
            owner_is_player,
            cat_colors.gray, // color
            2, // hp (decreased from 3)
            3.2, // move_speed (increased from 2.5)
            1.8, // aggressiveness (increased from 1.5)
            0.2, // patience (decreased from 1.0)
        ),
        // Add shadow trail spawning when moving
        spawn_timed(
            () => blueprint_shadow_particle(),
            0.2, // interval: spawn shadow particles frequently
            0, // spread: no spread, trail behind
            0, // speedMin: stationary particles
            0, // speedMax: stationary particles
            10.0, // initialDuration: active for 10 seconds initially
        ),
        // TODO: Integrate shadow trail with movement system
    ];
}

// Mr. Red - Suicide Bomber: Dies in one hit, explodes on death
export function blueprint_mr_red(game: Game, owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            game,
            owner_is_player,
            cat_colors.red, // color
            1, // hp (dies in one hit to anything)
            2.5, // move_speed (increased from 2.0)
            1.8, // aggressiveness
            0.5, // patience
        ),
        // TODO: Add destroy_on_hit: true + explosion spawn on death
    ];
}

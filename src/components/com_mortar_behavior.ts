import {Vec2} from "../../lib/math.js";
import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export interface MortarBehavior {
    InitialVelocity: Vec2; // x, y velocity components
    Gravity: number; // downward acceleration
    TimeToTarget: number; // calculated time to reach target
    FlightTime: number; // current flight time
    TargetPosition: Vec2; // where grenade should explode
    Damage: number;
    Source: Entity;
}

export function mortar_behavior(
    initial_velocity: Vec2,
    time_to_target: number,
    target_position: Vec2,
    damage: number,
    source: Entity,
) {
    return (game: Game, entity: Entity) => {
        let mortar: MortarBehavior = {
            InitialVelocity: initial_velocity,
            Gravity: 9.8, // Standard gravity
            TimeToTarget: time_to_target,
            FlightTime: 0,
            TargetPosition: target_position,
            Damage: damage,
            Source: source,
        };

        game.World.MortarBehavior[entity] = mortar;
        game.World.Signature[entity] |= Has.MortarBehavior;
    };
}

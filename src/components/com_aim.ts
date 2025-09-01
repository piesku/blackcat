import {Vec2} from "../../lib/math.js";
import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export interface Aim {
    TargetEntity: Entity;
    DistanceToTarget: number;
    DirectionToTarget: Vec2;
    RotationToTarget: number; // Angle in degrees
    UpdateInterval: number; // How often to search for new targets (in seconds)
    SinceLastUpdate: number; // Time accumulated since last target search
}

export function aim(update_interval: number = 0.1) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.Aim;
        game.World.Aim[entity] = {
            TargetEntity: -1,
            DistanceToTarget: Infinity,
            DirectionToTarget: [0, 0],
            RotationToTarget: 0,
            UpdateInterval: update_interval,
            SinceLastUpdate: 0,
        };
    };
}

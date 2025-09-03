/**
 * @module components/com_control_player
 */

import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export interface ControlPlayer {
    PowerScale: number; // 1.0 to 5.0 - current power scaling factor for visual size and damage
    HoldStartEnergy: number; // Energy level when hold started (for calculating consumed energy)
}

export function control_player() {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.ControlPlayer;
        game.World.ControlPlayer[entity] = {
            PowerScale: 1.0,
            HoldStartEnergy: 1.0,
        };
    };
}

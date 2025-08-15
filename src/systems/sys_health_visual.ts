import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Health | Has.Render2D;

export function sys_health_visual(game: Game, _delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            let health = game.World.Health[entity];
            let render = game.World.Render2D[entity];
            
            if (!health.IsAlive) {
                // Dead fighters become gray
                render.Color[0] = 0.5;
                render.Color[1] = 0.5;
                render.Color[2] = 0.5;
                render.Color[3] = 0.7;
                continue;
            }
            
            // Flash red when recently damaged
            if (game.Running - health.LastDamageTime < 0.3) {
                let flash_intensity = 1.0 - (game.Running - health.LastDamageTime) / 0.3;
                render.Color[0] = 1.0;
                render.Color[1] = 1.0 - flash_intensity * 0.8;
                render.Color[2] = 1.0 - flash_intensity * 0.8;
                render.Color[3] = 1.0;
            } else {
                // Normal color based on health
                let health_ratio = health.Current / health.Max;
                render.Color[0] = 1.0;
                render.Color[1] = health_ratio;
                render.Color[2] = health_ratio;
                render.Color[3] = 1.0;
            }
        }
    }
}
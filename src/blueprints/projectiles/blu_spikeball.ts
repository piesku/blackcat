import {Tile} from "../../../sprites/spritesheet.js";
import {collide2d} from "../../components/com_collide2d.js";
import {deal_damage} from "../../components/com_deal_damage.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";
import {Layer} from "../../game.js";

export function blueprint_spikeball(damage: number) {
    return [
        label("spikeball"),
        local_transform2d(),
        render2d(Tile.Spikeball),
        collide2d(true, Layer.Projectile, Layer.Player | Layer.Terrain, 0.15),

        // High bounciness for persistent bouncing, no gravity for arena-level bouncing
        rigid_body2d(RigidKind.Dynamic, 0.8, 0.4, [0, 0]), // 80% bounce, minimal drag, no gravity

        deal_damage(damage, 0.3), // 0.3s cooldown, persistent bouncing damage

        // Long lifespan - persists until timeout as per upgrade description
        lifespan(8.0), // 8 seconds of bouncing chaos
    ];
}

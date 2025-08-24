import {Tile} from "../../../sprites/spritesheet.js";
import {collide2d} from "../../components/com_collide2d.js";
import {DamageType, deal_damage} from "../../components/com_deal_damage.js";
import {label} from "../../components/com_label.js";
import {lifespan} from "../../components/com_lifespan.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {render2d} from "../../components/com_render2d.js";
import {rigid_body2d, RigidKind} from "../../components/com_rigid_body2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {Layer} from "../../game.js";

export function blueprint_projectile(damage: number) {
    return [
        label("projectile"),
        spatial_node2d(),
        local_transform2d(undefined, 0, [0.2, 0.2]), // Small projectile
        render2d(Tile.Body), // Use a bullet/projectile sprite
        collide2d(true, Layer.Projectile, Layer.Player | Layer.Terrain, 0.05),
        rigid_body2d(RigidKind.Dynamic, 0, 0, [0, 0]),
        deal_damage(damage, DamageType.Projectile, {
            destroy_on_hit: true,
            shake_duration: 0.15,
        }),
        lifespan(4),
    ];
}

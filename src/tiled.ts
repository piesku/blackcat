import {Tile} from "../sprites/spritesheet.js";
import {local_transform2d} from "./components/com_local_transform2d.js";
import {render2d} from "./components/com_render2d.js";

interface TiledLayer {
    Data: Array<number>;
    Width: number;
    Height: number;
}

const enum TileFlip {
    // Raw flags defined by Tiled.
    Horizontal = 1 << 31,
    Vertical = 1 << 30,
    Diagonal = 1 << 29,
    Ignored = 1 << 28,

    // Useful combinations of flags.
    RotateLeft = TileFlip.Vertical | TileFlip.Diagonal,
    RotateRight = TileFlip.Horizontal | TileFlip.Diagonal,
    Rotate180 = TileFlip.Horizontal | TileFlip.Vertical,
    All = TileFlip.Horizontal | TileFlip.Vertical | TileFlip.Diagonal | TileFlip.Ignored,
}

export function* tiled_layer_blueprints(layer: TiledLayer) {
    for (let i = 0; i < layer.Data.length; i++) {
        let global_id = layer.Data[i]; // Global ID with flip flags.
        let tile_id = global_id & ~TileFlip.All; // Remove flip flags.
        if (tile_id == 0) {
            continue;
        } else {
            // Tiled uses 0 to mean "no tile"; all other tiles are incremented by 1.
            tile_id -= 1;
        }

        let x = i % layer.Width;
        let y = Math.floor(i / layer.Width);
        let local: ReturnType<typeof local_transform2d>;

        // Rotate and flip flags are stored in the global ID.
        if ((global_id & TileFlip.RotateLeft) == TileFlip.RotateLeft) {
            local = local_transform2d([x, y], 90);
        } else if ((global_id & TileFlip.RotateRight) == TileFlip.RotateRight) {
            local = local_transform2d([x, y], -90);
        } else if ((global_id & TileFlip.Rotate180) == TileFlip.Rotate180) {
            local = local_transform2d([x, y], 180);
        } else if (global_id & TileFlip.Horizontal) {
            local = local_transform2d([x, y], 0, [-1, 1]);
        } else if (global_id & TileFlip.Vertical) {
            local = local_transform2d([x, y], 0, [1, -1]);
        } else {
            local = local_transform2d([x, y]);
        }

        // For now, just use the first sprite for all tiles
        let blueprint = [local, render2d(Tile.Body)];

        // Note: Animation and collision data from atlas.ts is no longer available
        // This would need to be reimplemented based on tile_id if needed

        yield blueprint;
    }
}

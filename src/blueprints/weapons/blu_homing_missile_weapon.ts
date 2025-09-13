import {children} from "../../components/com_children.js";
import {get_root_spawner, label} from "../../components/com_label.js";
import {local_transform2d} from "../../components/com_local_transform2d.js";
import {spatial_node2d} from "../../components/com_spatial_node2d.js";
import {spawn_count} from "../../components/com_spawn.js";
import {weapon_ranged} from "../../components/com_weapon.js";
import {blueprint_muzzle_flash_spawner} from "../blu_muzzle_flash_spawner.js";
import {blueprint_homing_missile} from "../projectiles/blu_homing_missile.js";

export function blueprint_homing_missile_weapon() {
    return [
        DEBUG && label("homing_missile_launcher"), // Name for identification

        spatial_node2d(),
        local_transform2d(),
        weapon_ranged(
            8, // range: long range for missile launcher
            3.0, // cooldown: slower rate of fire for powerful homing missiles
            1, // totalAmount: 1 missile per shot
        ),

        spawn_count(
            (game, spawner_entity) => {
                // Determine team by finding the root fighter entity
                let fighter_entity = get_root_spawner(game.World, spawner_entity);

                // Check if the fighter is a player team
                let ai = game.World.ControlAi[fighter_entity];
                return blueprint_homing_missile(ai.IsPlayer);
            },
            0.3, // interval: instant spawn
            0.05, // spread: Very tight spread for precision
            3.0, // speedMin
            4.0, // speedMax
        ),

        // Muzzle flash effect
        children(blueprint_muzzle_flash_spawner(0.3)),
    ];
}

import {Game} from "../game.js";
import {Has} from "../world.js";

export type UpgradeType = 
    | "battle_axe"
    | "pistol" 
    | "throwing_knives"
    | "baseball_bat"
    | "shotgun"
    | "sniper_rifle"
    | "dual_pistols"
    | "chainsaw"
    | "crossbow"
    | "grenade_launcher";

export interface UpgradeInventory {
    Weapons: UpgradeType[];
    // Future: Armor, Abilities, Companions
}

export function upgrade_inventory(weapons: UpgradeType[] = []) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.UpgradeInventory;
        game.World.UpgradeInventory[entity] = {
            Weapons: [...weapons],
        };
    };
}
import {instantiate} from "../../lib/game.js";
import {attach_to_parent} from "../components/com_children.js";
import {Game} from "../game.js";
import {blueprint_battle_axe} from "../scenes/weapons/blu_battle_axe.js";
import {UpgradeCategory, UpgradeType} from "./types.js";

export function apply_upgrades(game: Game, entity: number, upgrades: UpgradeType[]) {
    // Apply upgrades in order: Armor -> Weapons -> Abilities -> Companions
    let categorized = categorize_upgrades(upgrades);

    // Weapons (adds child entities)
    for (let weapon of categorized.weapons) {
        apply_weapon_upgrade(game, entity, weapon);
    }

    // TODO: Add other categories as we implement them
    // for (let armor of categorized.armor) {
    //     apply_armor_upgrade(game, entity, armor);
    // }
}

function categorize_upgrades(upgrades: UpgradeType[]) {
    return {
        weapons: upgrades.filter((u) => u.category === UpgradeCategory.Weapon),
        armor: upgrades.filter((u) => u.category === UpgradeCategory.Armor),
        abilities: upgrades.filter((u) => u.category === UpgradeCategory.Ability),
        companions: upgrades.filter((u) => u.category === UpgradeCategory.Companion),
        special: upgrades.filter((u) => u.category === UpgradeCategory.Special),
    };
}

function apply_weapon_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    let weapon_entity: number;

    switch (upgrade.id) {
        case "battle_axe":
            weapon_entity = instantiate(game, blueprint_battle_axe(game));
            attach_to_parent(game, weapon_entity, entity);
            break;

        // TODO: Add other weapons as we implement them
        // case "pistol":
        //     weapon_entity = instantiate(game, blueprint_pistol(game));
        //     attach_to_parent(game, weapon_entity, entity);
        //     break;

        default:
            console.warn(`Unknown weapon upgrade: ${upgrade.id}`);
            break;
    }
}

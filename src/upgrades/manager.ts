import {instantiate} from "../../lib/game.js";
import {blueprint_shadow_particle} from "../blueprints/particles/blu_shadow_particle.js";
import {blueprint_boomerang_weapon} from "../blueprints/weapons/blu_boomerang_weapon.js";
import {blueprint_explosives} from "../blueprints/weapons/blu_explosives.js";
import {blueprint_flamethrower} from "../blueprints/weapons/blu_flamethrower.js";
import {blueprint_mortar} from "../blueprints/weapons/blu_mortar.js";
import {blueprint_minigun} from "../blueprints/weapons/blu_minigun.js";
import {blueprint_shotgun} from "../blueprints/weapons/blu_shotgun.js";
import {blueprint_sniper_rifle} from "../blueprints/weapons/blu_sniper_rifle.js";
import {blueprint_spikeballs} from "../blueprints/weapons/blu_spikeballs.js";
import {attach_to_parent} from "../components/com_children.js";
import {spawn_timed} from "../components/com_spawn.js";
import {Game} from "../game.js";
import {
    apply_bonus_hp,
    apply_damage_reduction,
    apply_scrap_armor,
    apply_spiked_vest,
} from "./armor.js";
import {UpgradeCategory, UpgradeType} from "./types.js";

export function apply_upgrades(game: Game, entity: number, upgrades: UpgradeType[]) {
    // Apply upgrades in order: Armor -> Weapons -> Abilities -> Companions
    let categorized = categorize_upgrades(upgrades);

    // Armor (modifies health component)
    for (let armor of categorized.armor) {
        apply_armor_upgrade(game, entity, armor);
    }

    // Weapons (adds child entities)
    for (let weapon of categorized.weapons) {
        apply_weapon_upgrade(game, entity, weapon);
    }

    // Abilities (modifies entity behavior)
    for (let ability of categorized.abilities) {
        apply_ability_upgrade(game, entity, ability);
    }

    // TODO: Add other categories as we implement them
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
        case "flamethrower":
            weapon_entity = instantiate(game, blueprint_flamethrower());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "shotgun":
            weapon_entity = instantiate(game, blueprint_shotgun());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "minigun":
            weapon_entity = instantiate(game, blueprint_minigun());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "sniper_rifle":
            weapon_entity = instantiate(game, blueprint_sniper_rifle());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "mortar":
            weapon_entity = instantiate(game, blueprint_mortar());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "boomerang":
            weapon_entity = instantiate(game, blueprint_boomerang_weapon());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "explosives":
            weapon_entity = instantiate(game, blueprint_explosives());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "spikeballs":
            weapon_entity = instantiate(game, blueprint_spikeballs());
            attach_to_parent(game, weapon_entity, entity);
            break;

        default:
            console.warn(`Unknown weapon upgrade: ${upgrade.id}`);
            break;
    }
}

function apply_armor_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    switch (upgrade.id) {
        case "scrap_armor":
            apply_scrap_armor(game, entity);
            break;

        case "spiked_vest":
            apply_spiked_vest(game, entity, 1);
            break;

        case "bonus_hp":
            apply_bonus_hp(game, entity, 2);
            break;

        case "damage_reduction":
            apply_damage_reduction(game, entity, 0.25);
            break;

        default:
            console.warn(`Unknown armor upgrade: ${upgrade.id}`);
            break;
    }
}

function apply_ability_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    switch (upgrade.id) {
        case "shadow_trail":
            spawn_timed(
                () => blueprint_shadow_particle(),
                1.0 / 8.0, // interval: spawn every 0.125 seconds (8 particles per second)
                [0, 0], // direction: Stationary shadows
                0, // spread: No spread for trails
                0.2, // speedMin: Very slow drift
                0.2, // speedMax
                Infinity, // initialDuration: Infinite duration - always active
            )(game, entity);
            console.log(`Applied shadow trail to entity ${entity}`);
            break;

        default:
            console.warn(`Unknown ability upgrade: ${upgrade.id}`);
            break;
    }
}

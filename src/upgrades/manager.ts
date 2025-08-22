import {instantiate} from "../../lib/game.js";
import {attach_to_parent} from "../components/com_children.js";
import {spawn} from "../components/com_spawn.js";
import {Game} from "../game.js";
import {blueprint_shadow_particle} from "../scenes/particles/blu_shadow_particle.js";
import {blueprint_baseball_bat} from "../scenes/weapons/blu_baseball_bat.js";
import {blueprint_battle_axe} from "../scenes/weapons/blu_battle_axe.js";
import {blueprint_boomerang_weapon} from "../scenes/weapons/blu_boomerang_weapon.js";
import {blueprint_chainsaw} from "../scenes/weapons/blu_chainsaw.js";
import {blueprint_crossbow} from "../scenes/weapons/blu_crossbow.js";
import {blueprint_flamethrower} from "../scenes/weapons/blu_flamethrower.js";
import {blueprint_grenade_launcher} from "../scenes/weapons/blu_grenade_launcher.js";
import {blueprint_pistol} from "../scenes/weapons/blu_pistol.js";
import {blueprint_shotgun} from "../scenes/weapons/blu_shotgun.js";
import {blueprint_sniper_rifle} from "../scenes/weapons/blu_sniper_rifle.js";
import {blueprint_throwing_knives} from "../scenes/weapons/blu_throwing_knives.js";
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
        case "battle_axe":
            weapon_entity = instantiate(game, blueprint_battle_axe(game));
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "baseball_bat":
            weapon_entity = instantiate(game, blueprint_baseball_bat(game));
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "pistol":
            weapon_entity = instantiate(game, blueprint_pistol(game));
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "shotgun":
            weapon_entity = instantiate(game, blueprint_shotgun(game));
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "sniper_rifle":
            weapon_entity = instantiate(game, blueprint_sniper_rifle(game));
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "throwing_knives":
            weapon_entity = instantiate(game, blueprint_throwing_knives(game));
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "chainsaw":
            weapon_entity = instantiate(game, blueprint_chainsaw(game));
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "flamethrower":
            weapon_entity = instantiate(game, blueprint_flamethrower(game));
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "crossbow":
            weapon_entity = instantiate(game, blueprint_crossbow(game));
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "boomerang":
            weapon_entity = instantiate(game, blueprint_boomerang_weapon(game));
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "grenade_launcher":
            weapon_entity = instantiate(game, blueprint_grenade_launcher(game));
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
            spawn(
                (_game, direction, speed) => blueprint_shadow_particle(direction, speed),
                8.0, // 8 particles per second
                {
                    direction: [0, 0], // Stationary shadows
                    spread: 0, // No spread for trails
                    speedMin: 0.2, // Very slow drift
                    speedMax: 0.2,
                    duration: Infinity, // Infinite duration - always active
                    burstCount: 1, // Single particle per emission
                },
            )(game, entity);
            console.log(`Applied shadow trail to entity ${entity}`);
            break;

        default:
            console.warn(`Unknown ability upgrade: ${upgrade.id}`);
            break;
    }
}

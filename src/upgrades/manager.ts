import {instantiate} from "../../lib/game.js";
import {blueprint_mr_black} from "../blueprints/companions/blu_mr_black.js";
import {blueprint_mr_blue} from "../blueprints/companions/blu_mr_blue.js";
import {blueprint_mr_brown} from "../blueprints/companions/blu_mr_brown.js";
import {blueprint_mr_gray} from "../blueprints/companions/blu_mr_gray.js";
import {blueprint_mr_orange} from "../blueprints/companions/blu_mr_orange.js";
import {blueprint_mr_pink} from "../blueprints/companions/blu_mr_pink.js";
import {blueprint_mr_red} from "../blueprints/companions/blu_mr_red.js";
import {blueprint_mr_white} from "../blueprints/companions/blu_mr_white.js";
import {blueprint_shadow_particle} from "../blueprints/particles/blu_shadow_particle.js";
import {blueprint_boomerang_weapon} from "../blueprints/weapons/blu_boomerang_weapon.js";
import {blueprint_chiquita_bomb} from "../blueprints/weapons/blu_chiquita_bomb.js";
import {blueprint_explosives} from "../blueprints/weapons/blu_explosives.js";
import {blueprint_flamethrower} from "../blueprints/weapons/blu_flamethrower.js";
import {blueprint_hoover_crack} from "../blueprints/weapons/blu_hoover_crack.js";
import {blueprint_larpa} from "../blueprints/weapons/blu_larpa.js";
import {blueprint_minigun} from "../blueprints/weapons/blu_minigun.js";
import {blueprint_mortar} from "../blueprints/weapons/blu_mortar.js";
import {blueprint_shotgun} from "../blueprints/weapons/blu_shotgun.js";
import {blueprint_sniper_rifle} from "../blueprints/weapons/blu_sniper_rifle.js";
import {blueprint_spikeballs} from "../blueprints/weapons/blu_spikeballs.js";
import {abilities, AbilityType} from "../components/com_abilities.js";
import {attach_to_parent} from "../components/com_children.js";
import {spawn_timed} from "../components/com_spawn.js";
import {Game} from "../game.js";
import {Has} from "../world.js";
import {
    apply_damage_reduction,
    apply_evasion,
    apply_last_stand,
    apply_mirror_armor,
    apply_proximity_barrier,
    apply_regenerative_mesh,
    apply_scrap_armor,
    apply_spiked_vest,
    apply_thick_hide,
    apply_tough_skin,
    apply_vitality_boost,
} from "./armor.js";
import {UpgradeCategory, UpgradeType} from "./types.js";

export function apply_upgrades(game: Game, entity: number, upgrades: UpgradeType[]) {
    // Apply upgrades in order: Energy -> Armor -> Weapons -> Abilities -> Companions
    let categorized = categorize_upgrades(upgrades);

    // Energy (modifies energy system parameters - must be first to enable tapping)
    for (let energy of categorized.energy) {
        apply_energy_upgrade(game, entity, energy);
    }

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

    // Companions (spawns cat allies)
    for (let companion of categorized.companions) {
        apply_companion_upgrade(game, entity, companion);
    }
}

function categorize_upgrades(upgrades: UpgradeType[]) {
    return {
        energy: upgrades.filter((u) => u.category === UpgradeCategory.Energy),
        weapons: upgrades.filter((u) => u.category === UpgradeCategory.Weapon),
        armor: upgrades.filter((u) => u.category === UpgradeCategory.Armor),
        abilities: upgrades.filter((u) => u.category === UpgradeCategory.Ability),
        companions: upgrades.filter((u) => u.category === UpgradeCategory.Companion),
        special: upgrades.filter((u) => u.category === UpgradeCategory.Special),
    };
}

function apply_energy_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    let ai = game.World.ControlAi[entity];
    DEBUG: if (!ai) throw new Error("missing ControlAi component for energy upgrade");

    // Apply energy parameters from upgrade data
    if (upgrade.data) {
        if ("energyPerTap" in upgrade.data) {
            // Stack energy per tap additively (base = 0)
            ai.EnergyPerTap += upgrade.data.energyPerTap as number;
            console.log(
                `[ENERGY_UPGRADE] Applied ${upgrade.name}: added +${upgrade.data.energyPerTap} energy/tap (total: ${ai.EnergyPerTap})`,
            );
        }
        if ("energyDecayRate" in upgrade.data) {
            ai.EnergyDecayRate = upgrade.data.energyDecayRate as number;
            console.log(
                `[ENERGY_UPGRADE] Applied ${upgrade.name}: energyDecayRate = ${ai.EnergyDecayRate}`,
            );
        }
        if ("healingRate" in upgrade.data) {
            // Stack healing rates additively for multiple healing upgrades
            ai.HealingRate += upgrade.data.healingRate as number;
            console.log(
                `[ENERGY_UPGRADE] Applied ${upgrade.name}: added +${upgrade.data.healingRate} healing (total: ${ai.HealingRate})`,
            );
        }
        if ("healingDrainStrength" in upgrade.data) {
            ai.HealingDrainStrength = upgrade.data.healingDrainStrength as number;
            console.log(
                `[ENERGY_UPGRADE] Applied ${upgrade.name}: healingDrainStrength = ${ai.HealingDrainStrength}`,
            );
        }
        if ("powerDecayRate" in upgrade.data) {
            ai.PowerDecayRate = upgrade.data.powerDecayRate as number;
            console.log(
                `[ENERGY_UPGRADE] Applied ${upgrade.name}: powerDecayRate = ${ai.PowerDecayRate}`,
            );
        }

        // Handle shockwave burst upgrade
        if (upgrade.id === "shockwave_burst") {
            ai.ShockwaveBurstEnabled = true;
            console.log(`[ENERGY_UPGRADE] Applied ${upgrade.name}: shockwave burst enabled`);
        }
    }
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

        case "larpa":
            weapon_entity = instantiate(game, blueprint_larpa());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "hoover_crack":
            weapon_entity = instantiate(game, blueprint_hoover_crack());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case "chiquita_bomb":
            weapon_entity = instantiate(game, blueprint_chiquita_bomb());
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

        case "vitality_boost":
            apply_vitality_boost(game, entity);
            break;

        case "damage_reduction":
            apply_damage_reduction(game, entity, 0.25);
            break;

        case "regenerative_mesh":
            apply_regenerative_mesh(game, entity, 0.3);
            break;

        case "mirror_armor":
            apply_mirror_armor(game, entity);
            break;

        case "proximity_barrier":
            apply_proximity_barrier(game, entity, 0.4);
            break;

        case "last_stand":
            apply_last_stand(game, entity);
            break;

        case "thick_hide":
            apply_thick_hide(game, entity);
            break;

        case "tough_skin":
            apply_tough_skin(game, entity);
            break;

        case "evasion":
            apply_evasion(game, entity, 0.25);
            break;

        default:
            console.warn(`Unknown armor upgrade: ${upgrade.id}`);
            break;
    }
}

function apply_ability_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    switch (upgrade.id) {
        case "vampiric":
            // Add vampiric ability directly
            abilities([AbilityType.Vampiric])(game, entity);
            console.log(
                `[UPGRADE] Applied Vampiric ability to entity ${entity} - heal 1 HP for every 2 damage dealt`,
            );
            break;

        case "shadow_trail":
            spawn_timed(
                (game, spawner) => blueprint_shadow_particle(),
                1.0 / 8.0, // interval
                0, // spread: No spread for trails
                0, // speedMin
                0, // speedMax
                Infinity, // initialDuration: always active
            )(game, entity);
            console.log(`Applied shadow trail to entity ${entity}`);
            break;

        case "piercing_shots":
            // Add piercing shots ability - this will be checked when spawning projectiles
            abilities([AbilityType.PiercingShots])(game, entity);
            console.log(
                `[UPGRADE] Applied Piercing Shots ability to entity ${entity} - projectiles now pierce first enemy`,
            );
            break;

        case "phase_walk":
            // Add phase walk ability - invincibility during dashing
            abilities([AbilityType.PhaseWalk])(game, entity);
            console.log(
                `[UPGRADE] Applied Phase Walk ability to entity ${entity} - brief invincibility when dashing`,
            );
            break;

        case "dash_master":
            // Add dash master ability - enhanced dash range
            abilities([AbilityType.DashMaster])(game, entity);
            console.log(
                `[UPGRADE] Applied Dash Master ability to entity ${entity} - +100% dash range`,
            );
            break;

        default:
            console.warn(`Unknown ability upgrade: ${upgrade.id}`);
            break;
    }
}

function apply_companion_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    // Get the owner's team (IsPlayer status)
    let owner_ai = game.World.ControlAi[entity];
    if (!owner_ai) {
        console.warn(`Entity ${entity} has no ControlAi component, cannot spawn companion`);
        return;
    }

    let owner_is_player = owner_ai.IsPlayer;
    let companion_entity: number;

    // Spawn new companion (multiple companions allowed for interesting synergies)
    // Each companion upgrade adds another cat ally to fight alongside the owner
    switch (upgrade.id) {
        case "mr_black":
            companion_entity = instantiate(game, blueprint_mr_black(game, owner_is_player));
            break;

        case "mr_orange":
            companion_entity = instantiate(game, blueprint_mr_orange(game, owner_is_player));
            break;

        case "mr_pink":
            companion_entity = instantiate(game, blueprint_mr_pink(game, owner_is_player));
            break;

        case "mr_white":
            companion_entity = instantiate(game, blueprint_mr_white(game, owner_is_player));
            break;

        case "mr_brown":
            companion_entity = instantiate(game, blueprint_mr_brown(game, owner_is_player));
            break;

        case "mr_blue":
            companion_entity = instantiate(game, blueprint_mr_blue(game, owner_is_player));
            break;

        case "mr_gray":
            companion_entity = instantiate(game, blueprint_mr_gray(game, owner_is_player));
            break;

        case "mr_red":
            companion_entity = instantiate(game, blueprint_mr_red(game, owner_is_player));
            break;

        default:
            console.warn(`Unknown companion upgrade: ${upgrade.id}`);
            return;
    }

    // Position companion near owner (slight offset to avoid collision)
    let owner_transform = game.World.LocalTransform2D[entity];
    let companion_transform = game.World.LocalTransform2D[companion_entity];

    if (owner_transform && companion_transform) {
        companion_transform.Translation[0] = owner_transform.Translation[0] + 1.0; // Slight offset
        companion_transform.Translation[1] = owner_transform.Translation[1] + 0.5;
        game.World.Signature[companion_entity] |= Has.Dirty;
    }

    console.log(
        `Spawned companion ${upgrade.id} (entity ${companion_entity}) for ${owner_is_player ? "player" : "opponent"} (entity ${entity})`,
    );
}

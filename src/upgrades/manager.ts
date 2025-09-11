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
import {attach_to_parent} from "../components/com_children.js";
import {spawn_timed} from "../components/com_spawn.js";
import {Game} from "../game.js";
import {Has} from "../world.js";
import {
    apply_damage_reduction,
    apply_evasion,
    apply_last_stand,
    apply_mirror_armor,
    apply_pain_tolerance,
    apply_proximity_barrier,
    apply_regenerative_mesh,
    apply_scrap_armor,
    apply_spiked_vest,
    apply_thick_hide,
} from "./armor.js";
import {UpgradeCategory, UpgradeId, UpgradeType} from "./types.js";

export function apply_upgrades(game: Game, entity: number, upgrades: UpgradeType[]) {
    // Apply all upgrades - order doesn't matter since categories are independent
    for (let upgrade of upgrades) {
        switch (upgrade.Category) {
            case UpgradeCategory.Weapon:
                apply_weapon_upgrade(game, entity, upgrade);
                break;
            case UpgradeCategory.Companion:
                apply_companion_upgrade(game, entity, upgrade);
                break;
            case UpgradeCategory.Enhancement:
                apply_enhancement_upgrade(game, entity, upgrade);
                break;
            case UpgradeCategory.Special:
                apply_special_upgrade(game, entity, upgrade);
                break;
            default:
                console.warn(`Unknown upgrade category: ${upgrade.Category}`);
                break;
        }
    }
}

function apply_enhancement_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    let ai = game.World.ControlAi[entity];
    let move = game.World.Move2D[entity];
    let health = game.World.Health[entity];

    DEBUG: {
        if (!ai) throw new Error("missing ControlAi component for enhancement upgrade");
        if (!move) throw new Error("missing Move2D component for movement upgrade");
        if (!health) throw new Error("missing Health component for health upgrade");
    }

    switch (upgrade.Id) {
        // === Energy Properties ===
        case UpgradeId.CombatVeteran:
            ai.EnergyFromDamageDealt += 0.3;
            break;
        case UpgradeId.BattleFury:
            ai.EnergyFromDamageDealt += 0.5;
            break;
        case UpgradeId.AdrenalineSurge:
            ai.EnergyFromDamageTaken += 0.2;
            break;
        case UpgradeId.SlowMetabolism:
            ai.EnergyDecayRate *= 0.5;
            break;
        case UpgradeId.CombatMedic:
            ai.HealingRate += 1.0;
            break;
        case UpgradeId.FieldSurgeon:
            ai.HealingRate += 2.0;
            break;
        case UpgradeId.Hypermetabolism:
            ai.EnergyDecayRate *= 2.0;
            ai.HealingRate += 3.0;
            break;
        case UpgradeId.WeaponMastery:
            ai.EnergyFromDamageDealt += 0.8;
            ai.WeaponMasteryEnabled = true;
            break;
        case UpgradeId.PainTolerance:
            ai.EnergyFromDamageTaken += 0.4;
            apply_pain_tolerance(game, entity);
            break;
        case UpgradeId.ShockwaveBurst:
            ai.ShockwaveBurstEnabled = true;
            break;

        // === Behavioral Properties ===
        case UpgradeId.LightningReflexes:
            move.MoveSpeed *= 1.5;
            ai.BaseMoveSpeed *= 1.5;
            ai.DashSpeedMultiplier = (ai.DashSpeedMultiplier || 1.0) * 1.5;
            break;
        case UpgradeId.QuickDraw:
            ai.AttackSpeedMultiplier = (ai.AttackSpeedMultiplier || 1.0) * 1.4;
            break;
        case UpgradeId.Brawler:
            ai.Aggressiveness += 0.3;
            ai.DashRangeMultiplier = (ai.DashRangeMultiplier || 1.0) * 0.8;
            ai.DamageBonus = (ai.DamageBonus || 0) + 1;
            break;
        case UpgradeId.Vitality:
            health.Max += 2;
            health.Current += 2;
            break;
        case UpgradeId.BerserkerMode:
            ai.BerserkerMode = {
                LowHealthThreshold: 0.25,
                SpeedBonus: 1.5,
                AttackBonus: 1.5,
            };
            break;
        case UpgradeId.Pacifist:
            ai.Aggressiveness *= 0.3;
            health.Max += 3;
            health.Current += 3;
            apply_damage_reduction(game, entity, 0.5);
            break;
        case UpgradeId.Cautious:
            ai.Aggressiveness *= 0.7;
            health.Max += 1;
            health.Current += 1;
            ai.RetreatHealthThreshold = 2;
            break;

        // === Combat Properties (Armor) ===
        case UpgradeId.ScrapArmor:
            apply_scrap_armor(game, entity);
            break;
        case UpgradeId.SpikedVest:
            apply_spiked_vest(game, entity, 1);
            break;
        case UpgradeId.DamageReduction:
            apply_damage_reduction(game, entity, 0.25);
            break;
        case UpgradeId.RegenerativeMesh:
            apply_regenerative_mesh(game, entity, 0.3);
            break;
        case UpgradeId.MirrorArmor:
            apply_mirror_armor(game, entity);
            break;
        case UpgradeId.ProximityBarrier:
            apply_proximity_barrier(game, entity, 0.4);
            break;
        case UpgradeId.LastStand:
            apply_last_stand(game, entity);
            break;
        case UpgradeId.ThickHide:
            apply_thick_hide(game, entity);
            break;
        case UpgradeId.Evasion:
            apply_evasion(game, entity, 0.25);
            break;

        // === Combat Properties (Abilities) ===
        case UpgradeId.Vampiric:
            ai.VampiricHealing = true;
            break;
        case UpgradeId.PhaseWalk:
            ai.PhaseWalkEnabled = true;
            break;
        case UpgradeId.DashMaster:
            ai.DashMasterEnabled = true;
            break;

        default:
            console.warn(`Unknown enhancement upgrade: ${upgrade.Id}`);
            break;
    }
}

function apply_special_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    switch (upgrade.Id) {
        case UpgradeId.ShadowTrail:
            // Spawn system attachment - unique mechanic
            // TODO Consider attaching a child spawner entity instead of direct component
            spawn_timed(
                () => blueprint_shadow_particle(),
                1.0 / 8.0, // interval
                0, // spread: No spread for trails
                0, // speedMin
                0, // speedMax
                Infinity, // initialDuration: always active
            )(game, entity);
            break;

        default:
            console.warn(`Unknown special upgrade: ${upgrade.Id}`);
            break;
    }
}

function apply_weapon_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    let weapon_entity: number;

    switch (upgrade.Id) {
        case UpgradeId.Flamethrower:
            weapon_entity = instantiate(game, blueprint_flamethrower());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case UpgradeId.Shotgun:
            weapon_entity = instantiate(game, blueprint_shotgun());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case UpgradeId.Minigun:
            weapon_entity = instantiate(game, blueprint_minigun());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case UpgradeId.SniperRifle:
            weapon_entity = instantiate(game, blueprint_sniper_rifle());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case UpgradeId.Mortar:
            weapon_entity = instantiate(game, blueprint_mortar());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case UpgradeId.Boomerang:
            weapon_entity = instantiate(game, blueprint_boomerang_weapon());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case UpgradeId.Explosives:
            weapon_entity = instantiate(game, blueprint_explosives());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case UpgradeId.Spikeballs:
            weapon_entity = instantiate(game, blueprint_spikeballs());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case UpgradeId.Larpa:
            weapon_entity = instantiate(game, blueprint_larpa());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case UpgradeId.HooverCrack:
            weapon_entity = instantiate(game, blueprint_hoover_crack());
            attach_to_parent(game, weapon_entity, entity);
            break;

        case UpgradeId.ChiquitaBomb:
            weapon_entity = instantiate(game, blueprint_chiquita_bomb());
            attach_to_parent(game, weapon_entity, entity);
            break;

        default:
            console.warn(`Unknown weapon upgrade: ${upgrade.Id}`);
            break;
    }
}

// Removed: apply_armor_upgrade and apply_ability_upgrade
// All enhancement logic now consolidated in apply_enhancement_upgrade()

function apply_companion_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    // Get the owner's team (IsPlayer status)
    let owner_ai = game.World.ControlAi[entity];
    DEBUG: if (!owner_ai) throw new Error("missing ControlAi component for companion upgrade");

    let owner_is_player = owner_ai.IsPlayer;
    let companion_entity: number;

    // Spawn new companion (multiple companions allowed for interesting synergies)
    // Each companion upgrade adds another cat ally to fight alongside the owner
    switch (upgrade.Id) {
        case UpgradeId.MrBlack:
            companion_entity = instantiate(game, blueprint_mr_black(game, owner_is_player));
            break;

        case UpgradeId.MrOrange:
            companion_entity = instantiate(game, blueprint_mr_orange(game, owner_is_player));
            break;

        case UpgradeId.MrPink:
            companion_entity = instantiate(game, blueprint_mr_pink(game, owner_is_player));
            break;

        case UpgradeId.MrWhite:
            companion_entity = instantiate(game, blueprint_mr_white(game, owner_is_player));
            break;

        case UpgradeId.MrBrown:
            companion_entity = instantiate(game, blueprint_mr_brown(game, owner_is_player));
            break;

        case UpgradeId.MrBlue:
            companion_entity = instantiate(game, blueprint_mr_blue(game, owner_is_player));
            break;

        case UpgradeId.MrGray:
            companion_entity = instantiate(game, blueprint_mr_gray(game, owner_is_player));
            break;

        case UpgradeId.MrRed:
            companion_entity = instantiate(game, blueprint_mr_red(game, owner_is_player));
            break;

        default:
            console.warn(`Unknown companion upgrade: ${upgrade.Id}`);
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
}

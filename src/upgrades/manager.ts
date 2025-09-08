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
    apply_pain_tolerance,
    apply_proximity_barrier,
    apply_regenerative_mesh,
    apply_scrap_armor,
    apply_spiked_vest,
    apply_thick_hide,
    apply_tough_skin,
    apply_vitality_boost,
} from "./armor.js";
import {UpgradeCategory, UpgradeId, UpgradeType} from "./types.js";

export function apply_upgrades(game: Game, entity: number, upgrades: UpgradeType[]) {
    // Apply all upgrades - order doesn't matter since categories are independent
    for (let upgrade of upgrades) {
        switch (upgrade.category) {
            case UpgradeCategory.Energy:
                apply_energy_upgrade(game, entity, upgrade);
                break;
            case UpgradeCategory.Trait:
                apply_trait_upgrade(game, entity, upgrade);
                break;
            case UpgradeCategory.Armor:
                apply_armor_upgrade(game, entity, upgrade);
                break;
            case UpgradeCategory.Weapon:
                apply_weapon_upgrade(game, entity, upgrade);
                break;
            case UpgradeCategory.Ability:
                apply_ability_upgrade(game, entity, upgrade);
                break;
            case UpgradeCategory.Companion:
                apply_companion_upgrade(game, entity, upgrade);
                break;
            default:
                console.warn(`Unknown upgrade category: ${upgrade.category}`);
                break;
        }
    }
}

function apply_energy_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    let ai = game.World.ControlAi[entity];
    DEBUG: if (!ai) throw new Error("missing ControlAi component for energy upgrade");

    switch (upgrade.id) {
        // Combat-driven energy generation upgrades
        case UpgradeId.CombatVeteran:
            ai.EnergyFromDamageDealt += 0.3;
            break;

        case UpgradeId.BattleFury:
            ai.EnergyFromDamageDealt += 0.5;
            break;

        case UpgradeId.AdrenalineSurge:
            ai.EnergyFromDamageTaken += 0.2;
            break;

        case UpgradeId.BerserkersFocus:
            // Add berserker's focus ability for health-based energy generation bonus
            abilities([AbilityType.BerserkersFocus])(game, entity);
            break;

        // Energy decay modifiers
        case UpgradeId.SlowMetabolism:
            ai.EnergyDecayRate *= 0.5; // Energy decays 50% slower
            break;

        // Auto-healing upgrades
        case UpgradeId.CombatMedic:
            ai.HealingRate += 1.0;
            break;

        case UpgradeId.FieldSurgeon:
            ai.HealingRate += 2.0;
            break;

        case UpgradeId.Hypermetabolism:
            ai.EnergyDecayRate *= 2.0; // Energy decays twice as fast
            ai.HealingRate += 3.0; // But powerful healing
            break;

        case UpgradeId.WeaponMastery:
            // Enhanced energy generation + conditional damage bonus
            ai.EnergyFromDamageDealt += 0.8;
            abilities([AbilityType.WeaponMastery])(game, entity);
            break;

        case UpgradeId.PainTolerance:
            // Enhanced energy generation from taking damage + damage reduction
            ai.EnergyFromDamageTaken += 0.4;
            apply_pain_tolerance(game, entity);
            abilities([AbilityType.PainTolerance])(game, entity);
            break;

        // Special abilities
        case UpgradeId.ShockwaveBurst:
            ai.ShockwaveBurstEnabled = true;
            break;

        default:
            console.warn(`Unknown energy upgrade: ${upgrade.id}`);
            break;
    }
}

function apply_trait_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    let ai = game.World.ControlAi[entity];
    let move = game.World.Move2D[entity];
    let health = game.World.Health[entity];

    DEBUG: {
        if (!ai) throw new Error("missing ControlAi component for trait upgrade");
        if (!move) throw new Error("missing Move2D component for trait upgrade");
        if (!health) throw new Error("missing Health component for trait upgrade");
    }

    switch (upgrade.id) {
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

        default:
            console.warn(`Unknown trait upgrade: ${upgrade.id}`);
            break;
    }
}

function apply_weapon_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    let weapon_entity: number;

    switch (upgrade.id) {
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
            console.warn(`Unknown weapon upgrade: ${upgrade.id}`);
            break;
    }
}

function apply_armor_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    switch (upgrade.id) {
        case UpgradeId.ScrapArmor:
            apply_scrap_armor(game, entity);
            break;

        case UpgradeId.SpikedVest:
            apply_spiked_vest(game, entity, 1);
            break;

        case UpgradeId.VitalityBoost:
            apply_vitality_boost(game, entity);
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

        case UpgradeId.ToughSkin:
            apply_tough_skin(game, entity);
            break;

        case UpgradeId.Evasion:
            apply_evasion(game, entity, 0.25);
            break;

        default:
            console.warn(`Unknown armor upgrade: ${upgrade.id}`);
            break;
    }
}

function apply_ability_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    switch (upgrade.id) {
        case UpgradeId.Vampiric:
            // Add vampiric ability directly
            abilities([AbilityType.Vampiric])(game, entity);
            break;

        case UpgradeId.ShadowTrail:
            spawn_timed(
                () => blueprint_shadow_particle(),
                1.0 / 8.0, // interval
                0, // spread: No spread for trails
                0, // speedMin
                0, // speedMax
                Infinity, // initialDuration: always active
            )(game, entity);
            break;

        case UpgradeId.PiercingShots:
            // Add piercing shots ability - this will be checked when spawning projectiles
            abilities([AbilityType.PiercingShots])(game, entity);
            break;

        case UpgradeId.PhaseWalk:
            // Add phase walk ability - invincibility during dashing
            abilities([AbilityType.PhaseWalk])(game, entity);
            break;

        case UpgradeId.DashMaster:
            // Add dash master ability - enhanced dash range
            abilities([AbilityType.DashMaster])(game, entity);
            break;

        default:
            console.warn(`Unknown ability upgrade: ${upgrade.id}`);
            break;
    }
}

function apply_companion_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    // Get the owner's team (IsPlayer status)
    let owner_ai = game.World.ControlAi[entity];
    DEBUG: if (!owner_ai) throw new Error("missing ControlAi component for companion upgrade");

    let owner_is_player = owner_ai.IsPlayer;
    let companion_entity: number;

    // Spawn new companion (multiple companions allowed for interesting synergies)
    // Each companion upgrade adds another cat ally to fight alongside the owner
    switch (upgrade.id) {
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
}

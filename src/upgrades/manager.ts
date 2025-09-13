import {instantiate} from "../../lib/game.js";
import {Vec2} from "../../lib/math.js";
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
import {blueprint_chiquita_weapon} from "../blueprints/weapons/blu_chiquita_weapon.js";
import {blueprint_explosives} from "../blueprints/weapons/blu_explosives.js";
import {blueprint_flamethrower} from "../blueprints/weapons/blu_flamethrower.js";
import {blueprint_hoover_crack} from "../blueprints/weapons/blu_hoover_crack.js";
import {blueprint_larpa} from "../blueprints/weapons/blu_larpa.js";
import {blueprint_minigun} from "../blueprints/weapons/blu_minigun.js";
import {blueprint_shotgun} from "../blueprints/weapons/blu_shotgun.js";
import {blueprint_sniper_rifle} from "../blueprints/weapons/blu_sniper_rifle.js";
import {blueprint_spikeballs} from "../blueprints/weapons/blu_spikeballs.js";
import {attach_to_parent} from "../components/com_children.js";
import {copy_position} from "../components/com_local_transform2d.js";
import {spawn_timed} from "../components/com_spawn.js";
import {Game} from "../game.js";
import {
    ALL_UPGRADES_MAP,
    UpgradeCategory,
    UpgradeId,
    UpgradeInstance,
    UpgradeType,
} from "./types.js";

export function apply_upgrades(game: Game, entity: number, upgradeInstances: UpgradeInstance[]) {
    // Apply all upgrades - order doesn't matter since categories are independent
    for (let instance of upgradeInstances) {
        let upgrade = ALL_UPGRADES_MAP[instance.id];
        if (!upgrade) {
            console.warn(`Unknown upgrade ID: ${instance.id}`);
            continue;
        }

        switch (upgrade.Category) {
            case UpgradeCategory.Weapon:
                apply_weapon_upgrade(game, entity, upgrade, instance.tier);
                break;
            case UpgradeCategory.Companion:
                apply_companion_upgrade(game, entity, upgrade, instance.tier);
                break;
            case UpgradeCategory.Enhancement:
                apply_enhancement_upgrade(game, entity, upgrade, instance.tier);
                break;
            case UpgradeCategory.Special:
                apply_special_upgrade(game, entity, upgrade, instance.tier);
                break;
            default:
                console.warn(`Unknown upgrade category: ${upgrade.Category}`);
                break;
        }
    }
}

function apply_enhancement_upgrade(game: Game, entity: number, upgrade: UpgradeType, tier: number) {
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
            ai.EnergyFromDamageDealt += 0.1 + 0.2 * tier;
            break;
        case UpgradeId.SlowMetabolism:
            ai.EnergyDecayRate *= 1 - 0.25 * tier;
            break;
        case UpgradeId.CombatMedic:
            ai.HealingRate += tier;
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
            ai.EnergyFromDamageTaken += 0.2 * tier;
            break;
        case UpgradeId.ShockwaveBurst:
            ai.ShockwaveBurstEnabled = true;
            break;
        case UpgradeId.KineticCharger:
            ai.KineticChargerEnabled = true;
            // TODO: Implement tier-based rate multiplier in energy system
            break;
        case UpgradeId.ManaSiphon:
            ai.ManaSiphon += 0.25 * tier;
            break;
        case UpgradeId.ResonanceShield:
            health.ResonanceShield += 0.25 * tier;
            break;

        // === Behavioral Properties ===
        case UpgradeId.LightningReflexes:
            let speedMultiplier = 1 + 0.25 * tier;
            move.MoveSpeed *= speedMultiplier;
            ai.BaseMoveSpeed *= speedMultiplier;
            ai.DashSpeedMultiplier = (ai.DashSpeedMultiplier || 1.0) * speedMultiplier;
            break;
        case UpgradeId.QuickDraw:
            // Tier 1: +20%, Tier 2: +40%, Tier 3: +60%
            let attackSpeedBonus = 1 + 0.2 * tier;
            ai.AttackSpeedMultiplier = (ai.AttackSpeedMultiplier || 1.0) * attackSpeedBonus;
            break;
        case UpgradeId.Brawler:
            ai.Aggressiveness += 0.1 * tier;
            ai.DashRangeMultiplier = (ai.DashRangeMultiplier || 1.0) * 0.8;
            ai.DamageBonus = (ai.DamageBonus || 0) + tier;
            break;
        case UpgradeId.Vitality:
            let vitalityBonus = 1 + tier;
            health.Max += vitalityBonus;
            health.Current += vitalityBonus;
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
            // Stack damage reduction multiplicatively to prevent going over 100%
            health.DamageReduction += (1 - health.DamageReduction) * 0.5;
            break;
        case UpgradeId.Cautious:
            ai.Aggressiveness *= 0.7;
            health.Max += tier;
            health.Current += tier;
            break;

        // === Combat Properties (Armor) ===
        case UpgradeId.SpikedVest:
            health.ReflectDamage += tier;
            break;
        case UpgradeId.DamageReduction:
            // Formula: 0.05 + 0.1 * tier (15%, 25%, 35%)
            let reductionAmount = 0.05 + 0.1 * tier;
            health.DamageReduction += (1 - health.DamageReduction) * reductionAmount;
            break;
        case UpgradeId.RegenerativeMesh:
            let regenRate = tier * 0.1;
            health.RegenerationRate += regenRate;
            break;
        case UpgradeId.MirrorArmor:
            health.ReflectDamage += tier;
            break;
        case UpgradeId.LastStand:
            health.LastStand = true;
            // TODO: Implement tier-based damage reduction (50%, 75%, 90% at <25% health)
            break;
        case UpgradeId.ThickHide:
            health.Max += tier;
            health.Current += tier;
            health.FlatDamageReduction += tier;
            break;
        case UpgradeId.Evasion:
            // Formula: 0.05 + 0.1 * tier (15%, 25%, 35%)
            let evasionAmount = 0.05 + 0.1 * tier;
            health.EvasionChance += (1 - health.EvasionChance) * evasionAmount;
            break;

        // === Combat Properties (Abilities) ===
        case UpgradeId.Vampiric:
            ai.VampiricHealing = true;
            // TODO: Implement tier-based lifesteal percentage (25%, 50%, 75%)
            break;
        case UpgradeId.PhaseWalk:
            ai.PhaseWalkEnabled = true;
            // TODO: Implement tier-based invincibility duration (50%, 75%, 100%)
            break;
        case UpgradeId.DashMaster:
            ai.DashMasterEnabled = true;
            // TODO: Implement tier-based dash range (+50%, +100%, +150%)
            break;

        default:
            console.warn(`Unknown enhancement upgrade: ${upgrade.Id}`);
            break;
    }
}

function apply_special_upgrade(game: Game, entity: number, upgrade: UpgradeType, tier: number) {
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

function apply_weapon_upgrade(game: Game, entity: number, upgrade: UpgradeType, tier: number) {
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
            weapon_entity = instantiate(game, blueprint_chiquita_weapon());
            attach_to_parent(game, weapon_entity, entity);
            break;

        default:
            console.warn(`Unknown weapon upgrade: ${upgrade.Id}`);
            break;
    }
}

// Removed: apply_armor_upgrade and apply_ability_upgrade
// All enhancement logic now consolidated in apply_enhancement_upgrade()

function apply_companion_upgrade(game: Game, entity: number, upgrade: UpgradeType, tier: number) {
    // Get the owner's team (IsPlayer status)
    let owner_ai = game.World.ControlAi[entity];
    let owner_transform = game.World.LocalTransform2D[entity];
    DEBUG: {
        if (!owner_ai) throw new Error("missing ControlAi component");
        if (!owner_transform) throw new Error("missing LocalTransform2D component");
    }

    let spawn_position: Vec2 = [
        owner_transform.Translation[0] + 2,
        owner_transform.Translation[1] + 2,
    ];

    // Spawn new companion (multiple companions allowed for interesting synergies)
    // Each companion upgrade adds another cat ally to fight alongside the owner
    switch (upgrade.Id) {
        case UpgradeId.MrBlack:
            instantiate(game, [
                ...blueprint_mr_black(owner_ai.IsPlayer),
                copy_position(spawn_position),
            ]);
            break;

        case UpgradeId.MrOrange:
            instantiate(game, [
                ...blueprint_mr_orange(owner_ai.IsPlayer),
                copy_position(spawn_position),
            ]);
            break;

        case UpgradeId.MrPink:
            instantiate(game, [
                ...blueprint_mr_pink(owner_ai.IsPlayer),
                copy_position(spawn_position),
            ]);
            break;

        case UpgradeId.MrWhite:
            instantiate(game, [
                ...blueprint_mr_white(owner_ai.IsPlayer),
                copy_position(spawn_position),
            ]);
            break;

        case UpgradeId.MrBrown:
            instantiate(game, [
                ...blueprint_mr_brown(owner_ai.IsPlayer),
                copy_position(spawn_position),
            ]);
            break;

        case UpgradeId.MrBlue:
            instantiate(game, [
                ...blueprint_mr_blue(owner_ai.IsPlayer),
                copy_position(spawn_position),
            ]);
            break;

        case UpgradeId.MrGray:
            instantiate(game, [
                ...blueprint_mr_gray(owner_ai.IsPlayer),
                copy_position(spawn_position),
            ]);
            break;

        case UpgradeId.MrRed:
            instantiate(game, [
                ...blueprint_mr_red(owner_ai.IsPlayer),
                copy_position(spawn_position),
            ]);
            break;

        default:
            console.warn(`Unknown companion upgrade: ${upgrade.Id}`);
            return;
    }
}

import {query_down} from "../components/com_children.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export interface FighterStats {
    PlayerHP: {current: number; max: number} | null;
    OpponentHP: {current: number; max: number} | null;
}

export interface WeaponCooldownInfo {
    Name: string;
    CooldownRemaining: number;
    TotalCooldown: number;
    IsReady: boolean;
}

export function getFighterStats(game: Game): FighterStats {
    let PlayerHP = null;
    let OpponentHP = null;

    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if (
            (game.World.Signature[entity] & (Has.ControlAi | Has.Label)) ===
            (Has.ControlAi | Has.Label)
        ) {
            let ai = game.World.ControlAi[entity];
            let label = game.World.Label[entity];
            if (!ai || !label.Name) continue;

            // Get health info
            let healthInfo = null;
            if (game.World.Signature[entity] & Has.Health) {
                let health = game.World.Health[entity];
                if (health) {
                    healthInfo = {current: Math.ceil(health.Current), max: health.Max};
                }
            }

            if (label.Name === "Player") {
                PlayerHP = healthInfo;
            } else if (label.Name === "Opponent") {
                OpponentHP = healthInfo;
            }
        }
    }

    return {
        PlayerHP,
        OpponentHP,
    };
}

export function getPlayerWeaponCooldowns(game: Game): WeaponCooldownInfo[] {
    let weaponCooldowns: WeaponCooldownInfo[] = [];

    // Find the player entity
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if (game.World.Signature[entity] & Has.ControlAi) {
            let ai = game.World.ControlAi[entity];
            if (!ai || !ai.IsPlayer) continue;

            // Find all weapons attached to this player
            for (let weapon_entity of query_down(game.World, entity, Has.Weapon)) {
                let weapon = game.World.Weapon[weapon_entity];
                if (!weapon) continue;

                // Get weapon name from Label component
                let weaponName = "Unknown Weapon";
                if (game.World.Signature[weapon_entity] & Has.Label) {
                    let label = game.World.Label[weapon_entity];
                    if (label && label.Name) {
                        weaponName = label.Name;
                    }
                }

                weaponCooldowns.push({
                    Name: weaponName,
                    CooldownRemaining: Math.max(0, weapon.TimeToNext),
                    TotalCooldown: weapon.Cooldown,
                    IsReady: weapon.TimeToNext <= 0,
                });
            }

            break; // Found player, no need to continue
        }
    }

    return weaponCooldowns;
}

export function getPlayerEnergy(game: Game): number {
    // Find the player entity and return their unified energy
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if (game.World.Signature[entity] & Has.ControlAi) {
            let ai = game.World.ControlAi[entity];
            if (!ai || !ai.IsPlayer) continue;

            return ai.Energy || 0;
        }
    }
    return 0;
}

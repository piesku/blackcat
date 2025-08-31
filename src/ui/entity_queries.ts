import {query_down} from "../components/com_children.js";
import {Game} from "../game.js";
import {Has} from "../world.js";
import {getAIStateName} from "./ai_state.js";

export interface FighterStats {
    playerHP: string;
    opponentHP: string;
    playerAIState: string;
    opponentAIState: string;
}

export interface WeaponCooldownInfo {
    name: string;
    cooldownRemaining: number;
    totalCooldown: number;
    isReady: boolean;
}

export function getFighterStats(game: Game): FighterStats {
    let playerHP = "?";
    let opponentHP = "?";
    let playerAIState = "Unknown";
    let opponentAIState = "Unknown";

    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if (game.World.Signature[entity] & Has.ControlAi) {
            let ai = game.World.ControlAi[entity];
            if (!ai) continue;

            // Get health info
            let healthInfo = "?/?";
            if (game.World.Signature[entity] & Has.Health) {
                let health = game.World.Health[entity];
                if (health) {
                    healthInfo = `${Math.ceil(health.Current)}/${health.Max}`;
                }
            }

            // Get AI state info
            let aiStateInfo = getAIStateName(ai.State);

            // Use ControlPlayer component to distinguish
            if (game.World.Signature[entity] & Has.ControlPlayer) {
                playerHP = healthInfo;
                playerAIState = aiStateInfo;
            } else {
                opponentHP = healthInfo;
                opponentAIState = aiStateInfo;
            }
        }
    }

    return {
        playerHP,
        opponentHP,
        playerAIState,
        opponentAIState,
    };
}

export function getPlayerWeaponCooldowns(game: Game): WeaponCooldownInfo[] {
    let weaponCooldowns: WeaponCooldownInfo[] = [];

    // Find the player entity
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if (game.World.Signature[entity] & Has.ControlPlayer) {
            let ai = game.World.ControlAi[entity];
            if (!ai) continue;

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
                    name: weaponName,
                    cooldownRemaining: Math.max(0, weapon.TimeToNext),
                    totalCooldown: weapon.Cooldown,
                    isReady: weapon.TimeToNext <= 0,
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
        if (game.World.Signature[entity] & Has.ControlPlayer) {
            let ai = game.World.ControlAi[entity];
            if (!ai) continue;

            return ai.Energy || 0;
        }
    }
    return 0;
}

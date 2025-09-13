import {Game} from "../game.js";
import {Has} from "../world.js";

export interface FighterStats {
    PlayerHP: {current: number; max: number} | null;
    OpponentHP: {current: number; max: number} | null;
    PlayerMana: {current: number; max: number} | null;
    OpponentMana: {current: number; max: number} | null;
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
    let PlayerMana = null;
    let OpponentMana = null;

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

            // Get mana info (using Energy from AI)
            let manaInfo = null;
            if (ai.Energy !== undefined) {
                // Using 2.0 as max energy for display purposes
                manaInfo = {current: ai.Energy, max: 5.0};
            }

            if (label.Name === "p") {
                PlayerHP = healthInfo;
                PlayerMana = manaInfo;
            } else if (label.Name === "o") {
                OpponentHP = healthInfo;
                OpponentMana = manaInfo;
            }
        }
    }

    return {
        PlayerHP,
        OpponentHP,
        PlayerMana,
        OpponentMana,
    };
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

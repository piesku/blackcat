import {Game} from "../game.js";
import {Has} from "../world.js";

export interface DamageInstance {
    Amount: number;
    Source: number; // Entity ID that caused the damage
    Type?: string; // Optional damage type for special effects
}

export interface HealingInstance {
    Amount: number;
    Source: number; // Entity ID that caused the healing
    Type?: string; // Optional healing type for special effects
}

export interface Health {
    Max: number;
    Current: number;
    LastDamageTime: number; // Game time in seconds when last damage occurred
    IsAlive: boolean;

    // Armor properties for upgrades
    IgnoreFirstDamage?: boolean; // Scrap Armor - ignores first damage instance
    ReflectDamage?: number; // Spiked Vest - reflects damage back to attacker
    DamageReduction?: number; // Percentage damage reduction (0.0 to 1.0)
    FirstDamageIgnored?: boolean; // Internal flag tracking if first damage was used

    // Pending damage and healing instances
    PendingDamage: DamageInstance[];
    PendingHealing: HealingInstance[];
}

export function health(max: number = 3) {
    return (game: Game, entity: number) => {
        game.World.Signature[entity] |= Has.Health;
        game.World.Health[entity] = {
            Max: max,
            Current: max,
            LastDamageTime: 0,
            IsAlive: true,
            PendingDamage: [],
            PendingHealing: [],
        };
    };
}

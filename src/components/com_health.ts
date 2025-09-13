import {Game} from "../game.js";
import {Has} from "../world.js";

export interface DamageInstance {
    Amount: number;
    Source: number; // Entity ID that caused the damage
}

export interface HealingInstance {
    Amount: number;
    Source: number; // Entity ID that caused the healing
}

export interface Health {
    Max: number;
    Current: number;
    LastDamageTime: number; // Game time in seconds when last damage occurred

    // Armor properties for upgrades
    ReflectDamage: number; // Spiked Vest - reflects damage back to attacker
    DamageReduction: number; // Percentage damage reduction (0.0 to 1.0)
    RegenerationRate: number; // Regenerative Mesh - HP per second during combat
    FlatDamageReduction: number; // Thick Hide/Tough Skin - flat damage reduction per attack
    EvasionChance: number; // Evasion - chance to completely avoid damage (0.0 to 1.0)

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
            PendingDamage: [],
            PendingHealing: [],

            ReflectDamage: 0,
            FlatDamageReduction: 0,
            DamageReduction: 0,
            EvasionChance: 0,
            RegenerationRate: 0,
        };
    };
}

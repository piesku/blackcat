import {Vec2} from "../../lib/math.js";
import {vec2_length, vec2_subtract} from "../../lib/vec2.js";
import {AIState} from "../components/com_ai_fighter.js";
import {query_down} from "../components/com_children.js";
import {damage_entity} from "../components/com_health.js";
import {Weapon, WeaponKind} from "../components/com_weapon.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Children; // Entities that might have weapon children

export function sys_weapons(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & QUERY) === QUERY) {
            // Look for weapon children
            for (let weapon_entity of query_down(game.World, entity, Has.Weapon)) {
                if (weapon_entity === entity) continue; // Skip the parent itself
                
                let weapon = game.World.Weapon[weapon_entity];
                if (!weapon) continue;
                
                // Update cooldowns
                if (weapon.LastAttackTime > 0) {
                    weapon.LastAttackTime = Math.max(0, weapon.LastAttackTime - delta);
                }
                
                // Check if parent is in attacking state and weapon is ready
                if (should_activate_weapon(game, entity, weapon)) {
                    activate_weapon(game, entity, weapon_entity, weapon);
                }
            }
        }
    }
}

function should_activate_weapon(game: Game, parent_entity: number, weapon: Weapon): boolean {
    // Check if parent has AI fighter component and is in attacking state
    if (!(game.World.Signature[parent_entity] & Has.AIFighter)) {
        return false;
    }
    
    let ai = game.World.AIFighter[parent_entity];
    if (!ai) return false;
    
    let should_activate = ai.State === AIState.Attacking && weapon.LastAttackTime <= 0;
    
    if (should_activate) {
        console.log(`[WEAPON] Entity ${parent_entity} activating weapon (AI State: ${getAIStateName(ai.State)}, Cooldown: ${weapon.LastAttackTime.toFixed(2)})`);
    }
    
    return should_activate;
}

function activate_weapon(game: Game, wielder_entity: number, _weapon_entity: number, weapon: Weapon) {
    // Set weapon on cooldown
    weapon.LastAttackTime = weapon.Cooldown;
    
    // Get wielder's position and target
    let wielder_transform = game.World.LocalTransform2D[wielder_entity];
    if (!wielder_transform) return;
    
    // Find target (opponent)
    let target_entity = find_weapon_target(game, wielder_entity, weapon);
    if (target_entity === -1) {
        console.log(`[WEAPON] Entity ${wielder_entity} failed to find target`);
        return;
    }
    
    let target_transform = game.World.LocalTransform2D[target_entity];
    if (!target_transform) return;
    
    // Calculate distance to target
    let to_target: Vec2 = [0, 0];
    vec2_subtract(to_target, target_transform.Translation, wielder_transform.Translation);
    let distance = vec2_length(to_target);
    
    // Check if target is in range
    if (distance > weapon.Range) {
        console.log(`[WEAPON] Entity ${wielder_entity} target ${target_entity} out of range (${distance.toFixed(2)} > ${weapon.Range})`);
        return;
    }
    
    console.log(`[WEAPON] Entity ${wielder_entity} attacking target ${target_entity} at range ${distance.toFixed(2)}`);
    
    // Apply weapon-specific effects
    switch (weapon.Kind) {
        case WeaponKind.Melee:
            execute_melee_attack(game, wielder_entity, target_entity, weapon, distance);
            break;
        case WeaponKind.Ranged:
            execute_ranged_attack(game, wielder_entity, target_entity, weapon);
            break;
    }
}

function find_weapon_target(game: Game, wielder_entity: number, weapon: Weapon): number {
    // For now, find the nearest enemy with health
    let wielder_transform = game.World.LocalTransform2D[wielder_entity];
    if (!wielder_transform) return -1;
    
    let nearest_entity = -1;
    let nearest_distance = weapon.Range + 1; // Start beyond weapon range
    let candidates = 0;
    
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if (entity === wielder_entity) continue;
        if (!(game.World.Signature[entity] & Has.Health)) continue;
        if (!(game.World.Signature[entity] & Has.LocalTransform2D)) continue;
        
        let health = game.World.Health[entity];
        if (!health.IsAlive) continue;
        
        candidates++;
        
        let transform = game.World.LocalTransform2D[entity];
        let distance_vec: Vec2 = [0, 0];
        vec2_subtract(distance_vec, transform.Translation, wielder_transform.Translation);
        let distance = vec2_length(distance_vec);
        
        if (distance < nearest_distance) {
            nearest_distance = distance;
            nearest_entity = entity;
        }
    }
    
    console.log(`[TARGET] Entity ${wielder_entity} found ${candidates} potential targets, selected: ${nearest_entity} (distance: ${nearest_distance.toFixed(2)})`);
    
    return nearest_entity;
}

function execute_melee_attack(game: Game, wielder_entity: number, target_entity: number, weapon: Weapon, _distance: number) {
    if (weapon.Kind !== WeaponKind.Melee) return;
    
    let target_health = game.World.Health[target_entity];
    let health_before = target_health.Current;
    
    // Deal damage to target
    damage_entity(game, target_entity, weapon.Damage);
    
    let health_after = target_health.Current;
    let is_alive = target_health.IsAlive;
    
    console.log(`[MELEE] Entity ${wielder_entity} -> ${target_entity}: ${weapon.Damage} damage, HP ${health_before.toFixed(1)} -> ${health_after.toFixed(1)} (${is_alive ? 'alive' : 'DEAD'})`);
    
    // Apply knockback if the weapon has it
    if (weapon.Knockback > 0) {
        apply_knockback(game, wielder_entity, target_entity, weapon.Knockback);
    }
    
    // Add screen shake for impact
    if (game.World.Signature[target_entity] & Has.Shake) {
        let shake = game.World.Shake[target_entity];
        shake.Radius = Math.max(shake.Radius, weapon.Damage * 0.5);
    }
}

function execute_ranged_attack(game: Game, wielder_entity: number, target_entity: number, weapon: Weapon) {
    if (weapon.Kind !== WeaponKind.Ranged) return;
    
    let target_health = game.World.Health[target_entity];
    let health_before = target_health.Current;
    
    // TODO: Implement projectile spawning for ranged weapons
    // For now, just do instant damage like melee
    damage_entity(game, target_entity, weapon.Damage);
    
    let health_after = target_health.Current;
    let is_alive = target_health.IsAlive;
    
    console.log(`[RANGED] Entity ${wielder_entity} -> ${target_entity}: ${weapon.Damage} damage, HP ${health_before.toFixed(1)} -> ${health_after.toFixed(1)} (${is_alive ? 'alive' : 'DEAD'})`);
}

function apply_knockback(game: Game, _source_entity: number, target_entity: number, knockback_force: number) {
    // TODO: Implement proper knockback physics
    // For now, just add extra screen shake
    if (game.World.Signature[target_entity] & Has.Shake) {
        let shake = game.World.Shake[target_entity];
        shake.Radius = Math.max(shake.Radius, knockback_force);
    }
}

function getAIStateName(state: AIState): string {
    switch (state) {
        case AIState.Circling: return "Circling";
        case AIState.Attacking: return "Attacking";
        case AIState.Retreating: return "Retreating";
        case AIState.Stunned: return "Stunned";
        default: return "Unknown";
    }
}
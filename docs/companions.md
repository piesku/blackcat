# Cat Companion System

This document provides complete documentation for the cat companion system in 33 Duels, including architecture, implementation, and special behaviors.

## Overview

Cat companions are AI allies that fight alongside their owner, inheriting team allegiance and providing strategic variety through unique personalities, weapons, and special abilities. The system leverages existing AI, weapon, and health systems with creative stat combinations.

## 🐱 Companion Cats (8 Total)

| Cat        | HP  | Speed | Aggressiveness | Patience | Role           | Weapon       | Special Ability |
| ---------- | --- | ----- | -------------- | -------- | -------------- | ------------ | --------------- |
| Mr. Black  | 4   | 2.5   | 1.8            | 1.5      | Elite Fighter  | None         | Upgrade Disable |
| Mr. Orange | 3   | 3.0   | 2.0            | 0.5      | Fast Melee     | None         | None            |
| Mr. Pink   | 3   | 2.0   | 1.2            | 1.0      | Sniper         | Sniper Rifle | None            |
| Mr. White  | 5   | 1.5   | 0.5            | 2.0      | Tank           | Shotgun      | None            |
| Mr. Brown  | 3   | 1.8   | 0.3            | 2.5      | Support Healer | None         | Healing         |
| Mr. Blue   | 4   | 2.2   | 1.0\*          | 1.0      | Berserker      | None         | Rage Mode      |
| Mr. Gray   | 3   | 2.5   | 1.5            | 1.0      | Stealth        | None         | Invisibility    |
| Mr. Red    | 2   | 2.0   | 1.8            | 0.5      | Sacrifice      | None         | Death Explosion |

### Cat Descriptions

- **Mr. Black** - Most powerful, disables 2 random enemy upgrades for the fight (special ability)
- **Mr. Orange** - Fast melee: Aggressiveness=2.0, MoveSpeed=3.0, Health=3, pure aggression
- **Mr. Pink** - Ranged sniper: Aggressiveness=1.2, MoveSpeed=2.0, Health=3, precision attacks
- **Mr. White** - Tank: Aggressiveness=0.5, MoveSpeed=1.5, Health=5, high weapon damage
- **Mr. Brown** - Support healer: Periodically retargets owner for healing "attacks"
- **Mr. Blue** - Berserker: Aggressiveness increases when Health < 50%
- **Mr. Gray** - Stealth: Brief invisibility phases (render alpha changes)
- **Mr. Red** - Sacrifice: Spawns explosion particles on death

## 🏗️ System Architecture

### ✅ Zero Modifications Needed

- `sys_control_ai` - Handles all movement and combat AI
- `sys_weapon_*` - Cat attacks use existing weapon systems
- `sys_health` - Cat death/damage processing
- `sys_move`, `sys_render2d` - Physics and rendering
- All collision and particle systems

### 🔧 Minimal Extensions Required

**1. Team Targeting** (3-line change to `sys_aim.ts`):

```typescript
// In find_nearest_enemy(): Skip entities with same IsPlayer value
let other_ai = game.World.ControlAi[other];
if (other_ai && other_ai.IsPlayer === my_ai.IsPlayer) continue; // Same team!
```

**2. Cat Blueprints** (creative stat combinations):

```typescript
// blueprint_mr_orange(): Fast melee fighter
cat_control_ai(owner.IsPlayer, 3.0, 2.0, 0.5), // Inherit team, high speed, aggressive
health(3), move2d(3.0),
// No weapon - relies on melee attacks

// blueprint_mr_white(): Tank with powerful ranged
cat_control_ai(owner.IsPlayer, 1.5, 0.5, 2.0), // Inherit team, slow, patient
health(5), move2d(1.5),
blueprint_shotgun(), // High-damage weapon
```

**3. Special Behaviors** (system hooks):

- **Mr. Brown Healing**: Periodically switch `aim.TargetEntity` to owner
- **Mr. Blue Berserker**: Modify `ai.Aggressiveness` when health drops
- **Mr. Red Explosion**: Spawn explosion particles in death handler
- **Mr. Gray Stealth**: Modify render alpha in phases

**4. Companion Management** (upgrade system):

- Spawn cat when companion upgrade applied
- Allow multiple companions for synergistic gameplay
- Remove companions when owner dies

### Cat Mechanics

- **Team Allegiance**: Cats inherit `IsPlayer` from owner (automatic enemy targeting)
- **Personality Traits**: Each cat has unique Aggressiveness/Patience values
- **Visual Distinction**: Different sprites, colors, sizes via render components
- **Death Synchronization**: Companions die when owner dies
- **Multiple Companions**: Players can have multiple cats for interesting synergies:
  - Mr. Pink (sniper) + Mr. White (tank) = ranged support + front-line protection
  - Mr. Orange (fast melee) + Mr. Brown (healer) = aggressive attacker + sustain support
  - Mr. Blue (berserker) + Mr. Red (sacrifice) = explosive damage combinations

### Implementation Benefits

- **80% System Reuse**: Movement, combat, health, rendering all work unchanged
- **Emergent Complexity**: Simple stat variations create diverse behaviors
- **Minimal Code**: ~50 lines for team logic + cat blueprints vs hundreds for new systems
- **Performance**: No new system overhead, just more entities with existing components
- **Hackability**: Easy to add new cat types or modify existing ones

---

# Special Behaviors Implementation Guide

This section outlines the remaining special behaviors needed for cat companions and how they can be implemented using existing systems.

## Current Status

**Implemented**: Basic combat AI, team targeting, weapon integration, multiple companion support  
**Missing**: 5 special behaviors that make each cat unique beyond stats

## 🔧 Implementation Strategy

All special behaviors should leverage existing systems wherever possible to maintain the 80% code reuse philosophy.

---

## 1. 🐱 Mr. Black - Upgrade Disabling

**Current Status**: `// TODO: Add upgrade-disabling special ability`

**Behavior**: Disables 2 random enemy upgrades during combat

**Implementation Options**:

### Option A: Component-Based (Recommended)
```typescript
// New component: com_upgrade_disabler.ts
interface UpgradeDisabler {
    DisabledUpgradeCount: number; // How many to disable
    HasActivated: boolean; // Once per fight
    Range: number; // Activation range
}

// In sys_upgrade_disabler.ts - new system
// When Mr. Black gets close to enemy, randomly disable their upgrades
// Could temporarily remove weapon children or modify health properties
```

### Option B: Combat Event Hook
```typescript
// Hook into sys_health.ts damage dealing
// When Mr. Black first deals damage, trigger disable effect
// Modify target's components directly (remove weapons, reduce armor)
```

**Existing Systems Used**: Health, Children (weapon removal), LocalTransform2D (range checking)

---

## 2. 💚 Mr. Brown - Healing Support

**Current Status**: `// TODO: Add healing behavior`  

**Behavior**: Heals owner for 1 HP every 4 seconds

**Implementation Options**:

### Option A: Targeting Override (Recommended)
```typescript
// New component: com_healer.ts
interface Healer {
    HealInterval: number; // 4.0 seconds
    LastHealTime: number;
    HealAmount: number; // 1 HP
    OwnerEntity: number; // Who to heal
}

// In sys_healer.ts - new system
// Periodically switch aim.TargetEntity to owner
// Use existing "healing projectiles" or collision-based healing
```

### Option B: Proximity Healing
```typescript
// In sys_companion_special.ts
// When Mr. Brown is near owner, apply healing over time
// Modify owner's Health component directly
```

**Existing Systems Used**: Aim (target switching), Health (healing), LocalTransform2D (proximity)

---

## 3. 🔥 Mr. Blue - Berserker Mode

**Current Status**: `// TODO: Add berserker behavior`

**Behavior**: Aggressiveness increases when Health < 50%

**Implementation**:

### Dynamic AI Modification
```typescript
// New component: com_berserker.ts  
interface Berserker {
    BaseAggressiveness: number;
    BerserkerMultiplier: number; // 1.5x when injured
    HealthThreshold: number; // 50%
    IsRaging: boolean;
}

// In sys_berserker.ts - new system
export function sys_berserker(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & (Has.Berserker | Has.Health | Has.ControlAi)) === (Has.Berserker | Has.Health | Has.ControlAi)) {
            let berserker = game.World.Berserker[entity];
            let health = game.World.Health[entity];
            let ai = game.World.ControlAi[entity];
            
            let health_percent = health.Current / health.Max;
            let should_rage = health_percent < berserker.HealthThreshold;
            
            if (should_rage && !berserker.IsRaging) {
                ai.Aggressiveness = berserker.BaseAggressiveness * berserker.BerserkerMultiplier;
                berserker.IsRaging = true;
                console.log(`Mr. Blue entering berserker rage! Aggressiveness: ${ai.Aggressiveness}`);
            } else if (!should_rage && berserker.IsRaging) {
                ai.Aggressiveness = berserker.BaseAggressiveness;
                berserker.IsRaging = false;
            }
        }
    }
}
```

**Existing Systems Used**: Health (threshold checking), ControlAi (aggressiveness modification)

---

## 4. 👻 Mr. Gray - Stealth

**Current Status**: `// TODO: Add stealth behavior`

**Behavior**: Brief invisibility phases before surprise attacks

**Implementation**:

### Render Alpha Manipulation
```typescript
// New component: com_stealth.ts
interface Stealth {
    StealthDuration: number; // 2.0 seconds
    CooldownDuration: number; // 8.0 seconds  
    LastStealthTime: number;
    IsStealthed: boolean;
    OriginalAlpha: number;
}

// In sys_stealth.ts - new system
export function sys_stealth(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & (Has.Stealth | Has.Children)) === (Has.Stealth | Has.Children)) {
            let stealth = game.World.Stealth[entity];
            
            // Check if should activate stealth (before attacking)
            let ai = game.World.ControlAi[entity];
            let should_stealth = ai.State === AiState.Preparing && !stealth.IsStealthed && 
                                (game.Time - stealth.LastStealthTime) > stealth.CooldownDuration;
            
            if (should_stealth) {
                // Set body sprite alpha to 0.2 (semi-transparent)
                set_body_alpha(game, entity, 0.2);
                stealth.IsStealthed = true;
                stealth.LastStealthTime = game.Time;
            } else if (stealth.IsStealthed && (game.Time - stealth.LastStealthTime) > stealth.StealthDuration) {
                // Restore visibility
                set_body_alpha(game, entity, stealth.OriginalAlpha);
                stealth.IsStealthed = false;
            }
        }
    }
}

function set_body_alpha(game: Game, entity: number, alpha: number) {
    // Find body sprite child and modify render alpha
    for (let child of query_down(game.World, entity, Has.Render2D)) {
        let render = game.World.Render2D[child];
        render.Color[3] = alpha; // Modify alpha channel
        game.World.Signature[child] |= Has.Dirty;
    }
}
```

**Existing Systems Used**: Render2D (alpha manipulation), ControlAi (state checking), Children (body sprite access)

---

## 5. 💥 Mr. Red - Sacrifice Explosion

**Current Status**: `// TODO: Add explosion on death`

**Behavior**: Explodes for 4 damage when killed, hurting nearby enemies

**Implementation**:

### Death Event Hook
```typescript
// New component: com_sacrifice.ts
interface Sacrifice {
    ExplosionDamage: number; // 4
    ExplosionRadius: number; // 2.0  
    HasExploded: boolean; // Prevent multiple explosions
}

// In sys_sacrifice.ts - new system  
export function sys_sacrifice(game: Game, delta: number) {
    for (let entity = 0; entity < game.World.Signature.length; entity++) {
        if ((game.World.Signature[entity] & (Has.Sacrifice | Has.Health)) === (Has.Sacrifice | Has.Health)) {
            let sacrifice = game.World.Sacrifice[entity];
            let health = game.World.Health[entity];
            
            // Trigger explosion on death
            if (!health.IsAlive && !sacrifice.HasExploded) {
                explode_sacrifice_cat(game, entity, sacrifice);
                sacrifice.HasExploded = true;
            }
        }
    }
}

function explode_sacrifice_cat(game: Game, entity: number, sacrifice: Sacrifice) {
    let transform = game.World.LocalTransform2D[entity];
    let my_ai = game.World.ControlAi[entity];
    
    // Spawn explosion particles (reuse existing explosion blueprint)
    let explosion = instantiate(game, blueprint_explosion());
    game.World.LocalTransform2D[explosion].Translation = [...transform.Translation];
    
    // Damage nearby enemies
    for (let other = 0; other < game.World.Signature.length; other++) {
        if (other === entity) continue;
        
        let other_health = game.World.Health[other];
        let other_ai = game.World.ControlAi[other];
        let other_transform = game.World.LocalTransform2D[other];
        
        // Only damage enemies (different team)
        if (!other_health?.IsAlive || !other_ai || other_ai.IsPlayer === my_ai.IsPlayer) continue;
        
        // Check distance
        let distance = vec2_distance(transform.Translation, other_transform.Translation);
        if (distance <= sacrifice.ExplosionRadius) {
            other_health.PendingDamage.push({
                Amount: sacrifice.ExplosionDamage,
                Source: entity,  
                Type: "explosion"
            });
            console.log(`Mr. Red explosion damaged entity ${other} for ${sacrifice.ExplosionDamage} damage`);
        }
    }
}
```

**Existing Systems Used**: Health (death detection + damage dealing), LocalTransform2D (position + range), existing explosion particles

---

## 📋 Implementation Priority

### Phase 1: Low-Hanging Fruit (Easy Wins)
1. **Mr. Blue Berserker** - Simple AI modification based on health percentage  
2. **Mr. Red Sacrifice** - Death event hook with explosion particles
3. **Mr. Gray Stealth** - Render alpha manipulation with timing

### Phase 2: Medium Complexity
4. **Mr. Brown Healer** - Target switching or proximity healing  

### Phase 3: Complex Features  
5. **Mr. Black Upgrade Disabling** - Component manipulation system

## 🔗 Integration Points

**New Systems Needed**:
- `sys_berserker.ts` - Dynamic AI personality modification
- `sys_stealth.ts` - Render alpha manipulation with timing  
- `sys_sacrifice.ts` - Death event handling with area damage
- `sys_healer.ts` - Target switching or proximity healing
- `sys_upgrade_disabler.ts` - Component manipulation for Mr. Black

**New Components Needed**:
- `com_berserker.ts`
- `com_stealth.ts`  
- `com_sacrifice.ts`
- `com_healer.ts`
- `com_upgrade_disabler.ts`

**System Integration**:
- Add new systems to `src/game.ts` system execution order
- Hook into existing health, AI, and render systems where needed
- Leverage existing explosion and particle systems for visual effects

## 💡 Design Philosophy

**Keep it Simple**: Each special behavior should be implementable in ~50-100 lines
**Reuse Systems**: Leverage existing health, AI, render, and particle systems  
**Visual Feedback**: All behaviors should have clear visual/audio indicators
**Performance**: No heavy computation - simple checks and state changes only

This approach maintains the 80% system reuse principle while adding unique personality to each cat companion!
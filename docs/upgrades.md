# Upgrade System Design

This document outlines the implementation architecture for the upgrade system in 33 Duels, as specified in design.md.

## Overview

Upgrades are the core mechanic that drives strategic depth and build variety. Players accumulate 33 upgrades over the course of their run, with opponents receiving the same number of randomly assigned upgrades for balanced but unpredictable encounters.

## Implementation Categories

### 1. Weapons - Child Entity Approach ✅

**Strategy**: Implement weapons as child entities attached to fighters.

**Benefits**:

- Clean separation of weapon logic
- Easy to add/remove dynamically
- Natural parent-child relationship for positioning
- Weapon-specific components (damage, range, cooldown)

**Examples**:

```typescript
// Weapon blueprints as child entities
weapon_battle_axe(parent_entity); // Melee weapon, short range, high damage
weapon_pistol(parent_entity); // Projectile weapon, spawns bullets
weapon_baseball_bat(parent_entity); // Melee with knockback effect
weapon_throwing_knives(parent_entity); // Multiple projectiles with spread
```

**Implementation**:

- Weapons trigger during AI `AIState.Attacking`
- Child entity inherits parent's transform
- Weapon components: `WeaponMelee`, `WeaponRanged`, `WeaponStats`
- Combat system checks for weapon children during attacks

### 2. Armor/Defense - Component Enhancement ✅

**Strategy**: Enhanced Health component with armor properties + centralized damage processing.

**Benefits**:

- Minimal ECS overhead
- Direct integration with existing combat system
- Easy to stack multiple armor effects
- Centralized damage processing via `sys_health`

**Implemented Armor Types**:

```typescript
// Application functions in src/upgrades/armor.ts
apply_scrap_armor(game, entity); // Ignores first damage instance
apply_spiked_vest(game, entity, 1); // Reflects 1 damage back
apply_bonus_hp(game, entity, 2); // +2 HP upgrade
apply_damage_reduction(game, entity, 0.25); // 25% damage reduction
```

**Implementation**:

- ✅ Enhanced `Health` component with armor properties
- ✅ New `sys_health` system for centralized damage processing
- ✅ Damage accumulation pattern (systems write to `PendingDamage[]`)
- ✅ Four armor types implemented and tested

### 3. Abilities - System Integration & Event Hooks

**Strategy**: New components for ability tracking + system modifications for ability effects.

**Benefits**:

- Flexible system for complex interactions
- Can modify any game system behavior
- Event-driven architecture for triggered abilities

**Categories**:

#### Passive Abilities

- Always active, modify system behavior
- Examples: "Ricochet" (bullets bounce), "Shadow Trail" (movement leaves damage)

#### Triggered Abilities

- Activate on specific events (damage taken, HP threshold, etc.)
- Examples: "Last Stand" (deal damage when dying), "Berserker" (speed up at low HP)

**Examples**:

```typescript
interface AbilityInventory {
    Passive: AbilityType[];
    Triggered: AbilityType[];
}

// Ability implementations
ability_last_stand(); // Modifies combat system on death
ability_ricochet(); // Modifies projectile physics system
ability_shadow_trail(); // Adds trail rendering + damage zones
ability_berserker(); // Modifies movement speed based on health
```

**Implementation**:

- New component: `com_abilities.ts` to track active abilities
- System hooks: Check abilities in relevant systems (combat, movement, etc.)
- Event system: Use existing action dispatch for ability triggers
- New system: `sys_abilities.ts` for ability-specific logic

### 4. Companions - Independent AI Entities

**Strategy**: Spawn separate AI-controlled entities that fight alongside the owner.

**Benefits**:

- Reuse existing AI fighter system
- Natural team-based combat
- Can have their own weapons/abilities

**Examples**:

```typescript
// Companion blueprints
companion_feral_dog(owner_entity); // Fast, low HP, aggressive AI
companion_attack_rat(owner_entity); // Very fast, very low HP, swarm tactics
companion_moose(owner_entity); // Slow, high HP, high damage
```

**Implementation**:

- Extend AI system with "team" concept
- Companions target enemies of their owner
- Companions die when owner dies (or have limited lifespan)
- Visual indicators showing ownership relationship

### 5. Trait Modifiers - Personality Enhancement ⚡

**Strategy**: Modify AI personality traits to change combat behavior and playstyle.

**Benefits**:
- Leverages existing personality system (Aggressiveness, Patience)
- Subtle but impactful gameplay changes
- Stacks with other upgrades naturally
- Provides tactical depth through behavioral modification

**Current Personality System**:
```typescript
interface AIFighter {
    Aggressiveness: number; // 0.0-2.0, affects attack frequency and distance
    Patience: number; // 0.5-2.0, affects how long they circle before attacking
}
```

**Trait Modifier Examples**:

```typescript
// Aggressiveness Modifiers
trait_berserker_fury(game, entity); // +0.8 Aggressiveness, faster attacks, longer dash range
trait_battle_rage(game, entity); // +0.5 Aggressiveness, +25% dash speed
trait_predator_instinct(game, entity); // +0.3 Aggressiveness, triggers pursuit more easily

// Patience Modifiers  
trait_tactical_mind(game, entity); // +0.7 Patience, longer circling, more strategic
trait_zen_focus(game, entity); // +0.5 Patience, longer attack cooldowns but higher damage
trait_calculated_strikes(game, entity); // +0.3 Patience, more precise timing

// Defensive Traits
trait_cautious_fighter(game, entity); // -0.3 Aggressiveness, +0.4 Patience, safer playstyle
trait_defensive_stance(game, entity); // -0.5 Aggressiveness, earlier retreat trigger

// Hybrid Traits
trait_adaptive_fighter(game, entity); // +0.2 Aggressiveness, +0.2 Patience, balanced boost
trait_momentum_fighter(game, entity); // Aggressiveness increases when winning, decreases when losing
```

**Advanced Trait Concepts**:

```typescript
// Dynamic traits that change during combat
trait_escalating_fury(game, entity); // Aggressiveness increases over time (0.0 → 2.0)
trait_wounded_animal(game, entity); // Aggressiveness increases as health decreases
trait_cold_calculation(game, entity); // Patience increases as health decreases

// Conditional traits
trait_counter_fighter(game, entity); // Higher patience vs aggressive opponents
trait_bully(game, entity); // Higher aggressiveness vs defensive opponents
```

**Implementation Strategy**:

```typescript
// Add trait category to upgrade types (src/upgrades/types.ts)
export const enum UpgradeCategory {
    Weapon = "weapon",
    Armor = "armor", 
    Ability = "ability",
    Companion = "companion",
    Trait = "trait", // NEW CATEGORY
    Special = "special",
}

// Example trait upgrade definitions
export const TRAIT_UPGRADES: UpgradeType[] = [
    {
        id: "berserker_fury",
        name: "Berserker Fury",
        category: UpgradeCategory.Trait,
        description: "Become more aggressive in combat (+0.8 Aggressiveness)",
        aggressivenessBonus: 0.8,
    },
    {
        id: "tactical_mind", 
        name: "Tactical Mind",
        category: UpgradeCategory.Trait,
        description: "Fight with calculated precision (+0.7 Patience)",
        patienceBonus: 0.7,
    },
    {
        id: "cautious_fighter",
        name: "Cautious Fighter", 
        category: UpgradeCategory.Trait,
        description: "Adopt a defensive fighting style",
        aggressivenessBonus: -0.3,
        patienceBonus: 0.4,
    },
];

// Application functions (src/upgrades/traits.ts)
export function apply_trait_modifier(game: Game, entity: number, upgrade: UpgradeType) {
    if (!(game.World.Signature[entity] & Has.AIFighter)) return;
    
    let ai = game.World.AIFighter[entity];
    
    // Apply personality modifiers with bounds checking
    if (upgrade.aggressivenessBonus) {
        ai.Aggressiveness = Math.max(0.0, Math.min(3.0, 
            ai.Aggressiveness + upgrade.aggressivenessBonus));
    }
    
    if (upgrade.patienceBonus) {
        ai.Patience = Math.max(0.3, Math.min(3.0,
            ai.Patience + upgrade.patienceBonus));
    }
    
    console.log(`[TRAIT] Applied ${upgrade.name}: Aggressiveness=${ai.Aggressiveness.toFixed(1)}, Patience=${ai.Patience.toFixed(1)}`);
}

// Integration with upgrade manager (src/upgrades/manager.ts)
function apply_trait_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    apply_trait_modifier(game, entity, upgrade);
}
```

**Benefits of This Approach**:
- Leverages existing personality system (no new components needed)
- Simple numeric modifiers with clear gameplay impact
- Stacks naturally with multiple trait upgrades
- Player defaults (1.0/1.0) can be enhanced through strategic choices
- Immediate visual feedback through AI behavior changes

### 6. Special/Thematic - Custom Systems

**Strategy**: Unique implementations for signature upgrades.

**Black Cat Example**:

```typescript
ability_black_cat() {
    // Spawns cat entity that runs across arena
    // On collision with opponent, disables 50% of their upgrades
    // Temporary effect lasting the current duel only
}
```

## Proposed Core Architecture

### New Components

```typescript
// Weapon union type with discriminated union
export const enum WeaponKind {
    Melee,
    Ranged,
}

export interface WeaponMelee {
    Kind: WeaponKind.Melee;
    Damage: number;
    Range: number;
    Cooldown: number;
    LastAttackTime: number;
    Knockback: number;
    Arc: number; // Attack arc in radians
}

export interface WeaponRanged {
    Kind: WeaponKind.Ranged;
    Damage: number;
    Range: number;
    Cooldown: number;
    LastAttackTime: number;
    ProjectileSpeed: number;
    ProjectileCount: number;
    Spread: number; // Spread angle in radians
}

export type Weapon = WeaponMelee | WeaponRanged;

// Game state
export interface GameState {
    currentLevel: number; // 1-33 duels
    playerUpgrades: UpgradeType[]; // Player's accumulated upgrades
    population: number; // Narrative countdown (8 billion -> 1)
    isNewRun: boolean; // Fresh start vs resumed
}

// Enhanced health for armor (IMPLEMENTED)
interface Health {
    Max: number;
    Current: number;
    LastDamageTime: number;
    IsAlive: boolean;

    // Armor properties
    IgnoreFirstDamage?: boolean; // Scrap Armor - ignores first damage instance
    ReflectDamage?: number; // Spiked Vest - reflects damage back to attacker
    DamageReduction?: number; // Reinforced Plating - percentage damage reduction
    FirstDamageIgnored?: boolean; // Internal flag for Scrap Armor

    // Damage accumulation system
    PendingDamage: DamageInstance[];
}

interface DamageInstance {
    Amount: number;
    Source: number; // Entity ID that caused the damage
    Type?: string; // Optional damage type for special effects
}
```

### New Systems

```typescript
// IMPLEMENTED
apply_upgrades(game, entity, upgrades); // Applies upgrades to an entity (src/upgrades/manager.ts)
sys_weapons(game, delta); // Handles weapon activation and cooldowns ✅
sys_health(game, delta); // Centralized damage processing with armor calculations ✅

// TODO
sys_abilities(game, delta); // Processes ability effects and triggers
sys_companions(game, delta); // Manages companion AI and lifecycle
```

## Implementation Status

### ✅ Phase 1: Foundation (COMPLETED)

1. ✅ **Upgrade Management System** - `src/upgrades/manager.ts` with centralized upgrade application
2. ✅ **Weapon System** - 6 weapons implemented (Battle Axe, Baseball Bat, Pistol, Shotgun, Sniper Rifle, Throwing Knives)
3. ✅ **Armor System** - 4 armor types (Scrap Armor, Spiked Vest, +2 HP, 25% Damage Reduction)

### ✅ Phase 2: Combat Expansion (COMPLETED)

1. ✅ **Ranged Weapons** - Pistol, Shotgun, Sniper Rifle, Throwing Knives with projectile system
2. ✅ **Advanced Armor** - Scrap Armor, Spiked Vest with special effects implemented
3. ✅ **Centralized Damage Processing** - `sys_health` with damage accumulation and armor calculations

### ✅ Phase 2.5: Game State Persistence (COMPLETED)

1. ✅ **Automatic State Persistence** - Game state automatically saves after duel victories using localStorage
2. ✅ **Seamless Resume Experience** - Players can refresh/close browser and resume from upgrade selection
3. ✅ **Consistent Opponent Generation** - Seeded opponent upgrades using `lib/random` for predictable gameplay
4. ✅ **Smart State Management** - State clears on defeat/victory, saves before upgrade selection

**Technical Implementation**:
- `src/store.ts` - Simple localStorage wrapper for game state persistence
- `src/utils.ts` - Shared utilities for opponent generation and population calculation  
- Enhanced `src/actions.ts` - Persistence triggers in DuelVictory, state clearing in DuelDefeat/RestartRun
- `lib/random.ts` - Added `shuffle()` function for consistent opponent generation
- Updated `src/index.ts` - Synchronous game initialization with state loading

**Usage**:
```javascript
// Game automatically saves after each duel victory
// Players can close/refresh browser and resume from upgrade selection
// Same arena level always produces same opponent loadout
// Manual save clearing via: dispatch(game, Action.ClearSave);
```

### 🚧 Phase 3: Trait Modifiers (TODO - HIGH PRIORITY)

1. **Basic Trait Modifiers** - Simple personality adjustments (+/- Aggressiveness/Patience)
   - Berserker Fury (+0.8 Aggressiveness)
   - Tactical Mind (+0.7 Patience)
   - Cautious Fighter (-0.3 Aggressiveness, +0.4 Patience)

2. **Dynamic Traits** - Context-sensitive personality changes
   - Wounded Animal (Aggressiveness increases as health decreases)
   - Escalating Fury (Aggressiveness increases over time)
   - Cold Calculation (Patience increases as health decreases)

3. **Advanced Traits** - Opponent-reactive and conditional modifiers
   - Counter Fighter (adapts to opponent's aggressiveness)
   - Momentum Fighter (changes based on combat success)

### 🚧 Phase 4: Advanced Features (TODO)

1. **Triggered Abilities** - Last Stand, Berserker mode
2. **Companions** - AI allies with team-based combat
3. **Complex Abilities** - Ricochet, Shadow Trail with physics modifications

### 🚧 Phase 5: Special Content (TODO)

1. **Black Cat** - Signature thematic upgrade
2. **Upgrade Interactions** - Combos and synergies between upgrades
3. **Visual Polish** - Particles, screen shake, impact effects

## Integration with Existing Systems

### Combat System Modifications ✅

- ✅ Check for weapon children during attacks (`sys_weapons`)
- ✅ Apply armor effects before damage calculation (`sys_health`)
- ✅ Damage accumulation pattern (write to `PendingDamage[]`, processed by `sys_health`)
- ✅ Weapon activation during `AIState.Attacking`
- TODO: Trigger abilities on combat events
- TODO: Handle companion targeting and damage

### AI System Extensions ✅

- ✅ Weapon usage during attack state (implemented in `sys_weapons`)
- ✅ Personality system with Aggressiveness and Patience traits
- TODO: Trait modifier application and bounds checking
- TODO: Dynamic trait updates during combat
- TODO: Ability-aware decision making
- TODO: Companion coordination
- TODO: Team-based targeting

### Rendering Enhancements

- ✅ Weapon attachment and animation (weapons are child entities with transforms)
- TODO: Ability visual effects (trails, auras, etc.)
- TODO: Companion visual distinction
- TODO: Upgrade UI indicators

## Questions for Implementation

1. ✅ **Weapon Activation**: Weapons activate during `AIState.Attacking` (implemented)
2. **Ability Stacking**: How do multiple instances of the same ability interact?
3. **Upgrade Removal**: Do we need temporary upgrade disabling (for Black Cat effect)?
4. **Performance**: How many total entities can we support with companions + weapons?
5. **Balancing**: Should upgrades have rarity tiers or power scaling?
6. ✅ **Armor Stacking**: Multiple armor effects stack multiplicatively (implemented)

## Next Steps

✅ **Phase 1 & 2 Complete**: Weapons and armor systems are fully implemented and tested.

Next priority is **Phase 3: Trait Modifiers** (leverages existing personality system):

1. **Basic Trait Modifiers** - Simple personality adjustments
    - Implementation: extend `src/upgrades/manager.ts` with trait application functions
    - Add trait category to upgrade types
    - Modify AIFighter personality values with bounds checking

2. **Static Trait Examples**:
    - Berserker Fury: +0.8 Aggressiveness (more frequent, longer-range attacks)
    - Tactical Mind: +0.7 Patience (longer circling, more strategic timing)
    - Cautious Fighter: -0.3 Aggressiveness, +0.4 Patience (defensive playstyle)

3. **Dynamic Trait Foundation** - For future phases
    - Component: `com_trait_modifiers.ts` for dynamic trait tracking
    - System hooks in `sys_ai_fighter.ts` for context-sensitive updates
    - Health-based, time-based, and opponent-reactive modifiers

**Why Trait Modifiers First**:
- Builds on existing, tested personality system
- Simple to implement (modify existing values)
- Immediate gameplay impact with minimal complexity
- Foundation for more advanced behavioral modifications

After trait modifiers, proceed with triggered abilities and companions.

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

### 2. Armor/Defense - Component Enhancement

**Strategy**: Modify existing Health and related components with additional properties.

**Benefits**:

- Minimal ECS overhead
- Direct integration with existing combat system
- Easy to stack multiple armor effects

**Examples**:

```typescript
interface HealthEnhancement {
    IgnoreFirstDamage?: boolean; // Scrap Armor
    ReflectDamage?: number; // Spiked Vest
    BonusHP?: number; // +2 HP upgrade
    DamageReduction?: number; // Percentage damage reduction
}

// Applied during upgrade selection
apply_scrap_armor(entity); // Sets IgnoreFirstDamage flag
apply_spiked_vest(entity); // Adds ReflectDamage value
apply_bonus_hp(entity); // Increases Max and Current HP
```

**Implementation**:

- Extend `Health` component with armor properties
- Modify `sys_combat` to check armor effects before applying damage
- Visual indicators for active armor effects

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

### 5. Special/Thematic - Custom Systems

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
// Upgrade inventory tracking
interface UpgradeInventory {
    Weapons: WeaponType[];
    Armor: ArmorType[];
    Abilities: AbilityType[];
    Companions: number[]; // Entity IDs of companion entities
}

// Weapon components
interface WeaponStats {
    Damage: number;
    Range: number;
    Cooldown: number;
    Type: WeaponType;
}

interface WeaponMelee extends WeaponStats {
    Knockback: number;
    Arc: number; // Attack arc in radians
}

interface WeaponRanged extends WeaponStats {
    ProjectileSpeed: number;
    ProjectileCount: number;
    Spread: number;
}

// Enhanced health for armor
interface Health {
    Current: number;
    Max: number;
    IsAlive: boolean;
    LastDamageTime: number;
    // Armor enhancements
    IgnoreFirstDamage?: boolean;
    ReflectDamage?: number;
    DamageReduction?: number;
}
```

### New Systems

```typescript
sys_upgrade_manager(game, delta); // Manages upgrade application and removal
sys_weapons(game, delta); // Handles weapon activation and cooldowns
sys_abilities(game, delta); // Processes ability effects and triggers
sys_companions(game, delta); // Manages companion AI and lifecycle
```

## Implementation Priority

### Phase 1: Foundation

1. **Upgrade Inventory Component** - Basic tracking system
2. **Weapon System** - Melee weapons (Battle Axe, Baseball Bat)
3. **Simple Armor** - HP bonus, basic damage reduction

### Phase 2: Combat Expansion

1. **Ranged Weapons** - Pistol, Throwing Knives with projectile system
2. **Advanced Armor** - Scrap Armor, Spiked Vest with special effects
3. **Basic Abilities** - Passive effects like movement speed

### Phase 3: Advanced Features

1. **Triggered Abilities** - Last Stand, Berserker mode
2. **Companions** - AI allies with team-based combat
3. **Complex Abilities** - Ricochet, Shadow Trail with physics modifications

### Phase 4: Special Content

1. **Black Cat** - Signature thematic upgrade
2. **Upgrade Interactions** - Combos and synergies between upgrades
3. **Visual Polish** - Particles, screen shake, impact effects

## Integration with Existing Systems

### Combat System Modifications

- Check for weapon children during attacks
- Apply armor effects before damage calculation
- Trigger abilities on combat events
- Handle companion targeting and damage

### AI System Extensions

- Weapon usage during attack state
- Ability-aware decision making
- Companion coordination
- Team-based targeting

### Rendering Enhancements

- Weapon attachment and animation
- Ability visual effects (trails, auras, etc.)
- Companion visual distinction
- Upgrade UI indicators

## Questions for Implementation

1. **Weapon Activation**: Should weapons be always active or only during `AIState.Attacking`?
2. **Ability Stacking**: How do multiple instances of the same ability interact?
3. **Upgrade Removal**: Do we need temporary upgrade disabling (for Black Cat effect)?
4. **Performance**: How many total entities can we support with companions + weapons?
5. **Balancing**: Should upgrades have rarity tiers or power scaling?

## Next Steps

The recommended starting point is **Phase 1: Weapons** since they:

- Have the clearest implementation path
- Provide immediate visual feedback
- Don't require extensive system modifications
- Form the foundation for more complex upgrades

Begin with implementing `weapon_battle_axe` as a proof-of-concept for the child entity approach.

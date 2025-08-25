# Upgrade System Design

This document outlines the implementation architecture for the upgrade system in 33 Duels, as specified in design.md.

## Overview

Upgrades are the core mechanic that drives strategic depth and build variety. Players accumulate 33 upgrades over the course of their run, with opponents receiving the same number of randomly assigned upgrades for balanced but unpredictable encounters.

## Complete Upgrade Categories (48 Total)

### 1. Weapons (14 upgrades) - Ranged Focus with Particle Effects ✅

**Strategy**: Ranged weapons using particle spawn system for spectacular visual effects. Inspired by Liero classics.

**Ranged Weapons** (14):

- **Flamethrower** ✅ - Fire cone with persistent flame particles
- **Minigun** ✅ - High rate of fire bullet spray with shell casing particles
- **Shotgun** ✅ - Multi-pellet spread with spark particles
- **Explosives** ✅ - Thrown bombs that explode on timeout with debris
- **Spikeballs** ✅ - Bouncing projectiles which persist until timeout
- **Rifle** - Enhanced pistol with muzzle flash
- **Mine** - Contact mines that stick to arena and explode
- **Homing Missile** - Missiles that track the nearest enemy
- **Mortar** ✅ - High-arc shells that explode on contact/timeout
- **Larpa** ✅ - Rockets leaving falling particle damage trails
- **Chiquita Bomb** ✅ - Timeout bomb spawning multiple banana sub-bombs
- **Hoover Crack** ✅ - Spinning particle emitter dealing continuous damage
- **Mini Rockets** - Rapid-fire rocket barrage with small explosions
- **Zimm** - Bouncing ball weapon ricocheting off arena walls
- **Boomerang** ✅ - Returning projectile that deals damage on the way out and back

**Removed Melee Weapons**:

- Battle Axe, Baseball Bat, Chainsaw (moved to traits/abilities as combat modifiers)

**Implementation**:

- Weapons as child entities using `spatial_node2d()` attachment
- Particle effects via `spawn()` component with `blueprint_*_particle()`
- Weapon stats via `weapon_ranged()` component
- Complex behaviors: timeout explosions, bouncing, area effects, trails
- Visual impact: Every weapon creates spectacular particle displays

### 2. Armor/Defense (10 upgrades) - Component Enhancement ✅

**Strategy**: Enhanced Health component with armor properties + centralized damage processing.

**Current Implemented** (4):

- Scrap Armor - Ignores first damage instance
- Spiked Vest - Reflects 1 damage back to attacker
- Ablative Plating - Absorbs first 2 damage, then provides 25% reduction
- 25% Damage Reduction - Reduces all incoming damage

**New Additions** (6):

- **Shield Generator** - Absorbs next 3 damage, then breaks (renewable on kill)
- **Reactive Plating** - Damage reduction increases with consecutive hits (25% → 50% → 75%)
- **Berserker Armor** - Take 50% more damage but deal 100% more damage
- **Regenerative Mesh** - Slowly heal 1 HP every 3 seconds during combat
- **Mirror Armor** - 100% reflect damage but you take 50% of reflected amount
- **Proximity Barrier** - Reduce damage from enemies within melee range by 40%

**Implementation**:

- Enhanced `Health` component with armor properties
- New `sys_health` system for centralized damage processing
- Damage accumulation pattern (systems write to `PendingDamage[]`)
- Armor effects stack multiplicatively

### 3. Abilities (10 upgrades) - System Integration & Event Hooks

**Strategy**: New components for ability tracking + system modifications for ability effects.

**Passive Abilities** (9):

- **Ricochet** - Bullets bounce once off arena walls
- **Shadow Trail** - Movement leaves damaging trail behind you
- **Piercing Shots** - Projectiles go through first enemy and continue
- **Double Shot** - Fire an additional projectile with each attack
- **Vampiric** - Heal 1 HP for every 2 damage you deal
- **Phase Walk** - Brief invincibility when dashing (0.3s)
- **Battle Axe Mastery** - Melee attacks deal +2 damage and have wider arc
- **Baseball Bat Swing** - Melee attacks knock back enemies 2x distance
- **Chainsaw Fury** - Melee attacks hit 3 times rapidly with DOT effect

**Triggered Abilities** (2):

- **Second Wind** - When reaching 1 HP, instantly heal to 50% max HP (once per fight)
- **Shock Wave** - Hitting an enemy while dashing releases a damaging shock wave

**Implementation**:

- New component: `com_abilities.ts` to track active abilities
- System hooks: Check abilities in relevant systems (combat, movement, etc.)
- Event system: Use existing action dispatch for ability triggers
- New system: `sys_abilities.ts` for ability-specific logic

### 4. Traits (10 upgrades) - Combat Enhancement ⚡

**Strategy**: Direct combat stat modifications and behavioral changes with clear benefits.

**Speed Traits** (4):

- **Lightning Reflexes** - +50% movement speed and dash speed
- **Quick Draw** - +40% attack speed (faster weapon cooldowns)
- **Adrenaline Rush** - +30% speed when below 50% health
- **Momentum** - Speed increases with consecutive hits (+10% per hit, max 50%)

**Health Traits** (3):

- **Vitality Boost** - +3 maximum health
- **Regeneration** - Heal 1 HP every 5 seconds during combat
- **Last Stand** - Take 50% less damage when at 1 HP

**Behavior Traits** (6):

- **Berserker** - +100% aggressiveness, +50% damage, -1 max health
- **Assassin** - Lower aggressiveness but first attack each fight deals double damage
- **Brawler** - Higher aggressiveness, shorter dash range but +1 damage to melee attacks
- **Combo Fighter** - Every 3rd consecutive hit deals double damage
- **Berserker Mode** - +50% attack speed and movement when below 25% HP
- **Revenge Strike** - Next attack deals double damage after taking damage

**Implementation**:

- Direct modifications to movement speed, attack rates, health, and damage
- Clear positive effects that players can immediately feel
- Behavioral traits modify aggressiveness with tangible benefits

### 5. Companions (8 upgrades) - Cat Allies 🐱

**Strategy**: All companions are cats with different colors and abilities that fight alongside the owner.

**Companion Cats** (8):

- **Mr. Black** - Most powerful, disables 2 random enemy upgrades for the fight
- **Mr. Orange** - Fast attacker, 3 HP, quick melee strikes
- **Mr. Pink** - Ranged fighter, fires small projectiles every 2 seconds
- **Mr. White** - Tank cat, 5 HP but slow, high damage attacks
- **Mr. Brown** - Support cat, heals owner for 1 HP every 4 seconds
- **Mr. Blue** - Berserker cat, gets +50% damage when below 50% HP
- **Mr. Gray** - Stealth cat, briefly goes invisible before surprise attacks
- **Mr. Red** - Sacrifice cat, explodes for 4 damage when killed

**Cat Mechanics**:

- Each cat has unique personality traits (Aggressiveness/Patience)
- Cats inherit team allegiance from their owner
- Visual distinction through color and size variations
- Cats die when owner dies or after taking their HP in damage
- Only one companion cat can be active at a time (later cats replace earlier ones)

**Implementation**:

- Extend AI system with "team" concept and cat-specific blueprints
- Companions target enemies of their owner automatically
- Special visual indicators showing ownership relationship
- Cat-specific abilities integrated into existing systems

## Upgrade Distribution Summary

**Total Upgrades: 53** (Player will see 33 out of 53 in a single run)

- **Weapons**: 14 upgrades (3 implemented + 11 new ranged weapons)
- **Armor/Defense**: 10 upgrades (4 implemented + 6 new)
- **Abilities**: 11 upgrades (9 passive + 2 triggered)
- **Traits**: 10 upgrades (4 speed + 3 health + 6 behavior)
- **Companions**: 8 upgrades (Mr. Black, Mr. Orange, Mr. Pink, etc.)

**Implementation Strategy**:

```typescript
// Updated upgrade categories (src/upgrades/types.ts)
export const enum UpgradeCategory {
    Weapon = "weapon",
    Armor = "armor",
    Ability = "ability",
    Trait = "trait",
    Companion = "companion", // Replaces "special"
}
```

**Key Design Principles**:

1. **Balanced Categories**: Each category offers different strategic approaches
2. **Meaningful Choices**: Every upgrade should feel impactful and change gameplay
3. **Synergies**: Upgrades from different categories should combine interestingly
4. **Visual Feedback**: All upgrades should have clear visual/audio indicators
5. **Cat Theme**: Companions are all cats fitting the game jam theme

## Implementation Priority

**Next Steps for Implementation:**

1. **Phase 3: Expand Trait System** (High Priority)
    - Add remaining trait upgrades to personality system
    - Implement dynamic traits (health-based, combat-based)

2. **Phase 4: Abilities System** (Medium Priority)
    - Create `com_abilities.ts` component
    - Implement passive abilities (Ricochet, Shadow Trail, etc.)
    - Add triggered abilities (Last Stand, Second Wind, etc.)

3. **Phase 5: Companion System** (Medium Priority)
    - Extend AI system with team concept
    - Create cat companion blueprints with unique abilities
    - Black Cat as most powerful companion with upgrade-disabling

4. **Phase 6: New Weapons & Armor** (Low Priority)
    - Add 4 new weapons (Chainsaw, Flamethrower, Crossbow, Boomerang)
    - Add 6 new armor types (Shield Generator, Reactive Plating, etc.)

**Current Status**: ✅ Weapons (3/14), Armor (4/10) systems implemented. Particle system ready for weapon effects.

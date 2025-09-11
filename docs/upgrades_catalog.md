# Upgrade Catalog

This document outlines the implementation architecture for the upgrade system in 33 Duels, as specified in design.md.

## Overview

Upgrades are the core mechanic that drives strategic depth and build variety. Players accumulate 33 upgrades over the course of their run, with opponents receiving the same number of randomly assigned upgrades for balanced but unpredictable encounters.

## Upgrade Categories

### 1. Weapons - Child Entities with Blueprints 🔫

**Strategy**: Ranged weapons using particle spawn system for spectacular visual effects. Inspired by Liero classics.

- **Flamethrower** ✅ _(Uncommon)_ - Emits a cone of flame particles that damage enemies
- **Minigun** ✅ _(Rare)_ - High rate of fire bullet spray with ejecting shell casings
- **Shotgun** ✅ _(Common)_ - Spread shot ranged weapon with multiple projectiles
- **Explosives** ✅ _(Common)_ - Thrown bombs that explode on timeout with debris particles
- **Spikeballs** ✅ _(Common)_ - Bouncing projectiles that persist and ricochet around the arena
- **Rifle** ✅ _(Common)_ - High-damage, long-range precision weapon with muzzle flash
- **Mortar** ✅ _(Uncommon)_ - High-arc explosive shells with area damage
- **Larpa** ✅ _(Rare)_ - Rockets leaving falling particle damage trails
- **Chiquita Bomb** ✅ _(Rare)_ - Bomb spawning multiple banana sub-bombs
- **Hoover Crack** ✅ _(Rare)_ - Spinning particle emitter dealing continuous damage
- **Boomerang** ✅ _(Uncommon)_ - Returning projectile that deals damage on the way out and back

**Implementation**:

- Weapons as child entities using `spatial_node2d()` attachment
- Particle effects via `spawn()` component with `blueprint_*_particle()`
- Weapon stats via `weapon_ranged()` component
- Complex behaviors: timeout explosions, bouncing, area effects, trails
- Visual impact: Every weapon creates spectacular particle displays

### 2. Companions - Root Entities with Blueprints 🐱

**Strategy**: Cat companions that fight alongside the owner using pure component combinations - each cat's unique behavior emerges from creative stat and component combinations without special-case logic.

- **Mr. Black** ✅ _(Rare)_ - Cat summoner - Spawns random companion cats every 8 seconds using spawn system
- **Mr. Orange** ✅ _(Common)_ - Whirlwind barbarian - Ultra-high speed with lightning-fast retargeting creates frenzied combat
- **Mr. Pink** ✅ _(Common)_ - Boomerang marksman - Equipped boomerang weapon with slow methodical movement and high patience
- **Mr. White** ✅ _(Uncommon)_ - Defensive tank - Highest HP, slowest speed, equipped shotgun, waits for enemies to approach
- **Mr. Brown** ✅ _(Uncommon)_ - Loyal bodyguard - Ultra-low aggression, targets friendlies to stay close and protect allies
- **Mr. Blue** ✅ _(Common)_ - Mortar artillery - Glass cannon with mortar weapon, fastest targeting for rapid bombardment
- **Mr. Gray** ✅ _(Rare)_ - Shadow assassin - High speed, shadow trail ability for hit-and-run attacks
- **Mr. Red** ✅ _(Uncommon)_ - Suicide bomber - Dies in one hit, fast approach, explodes on death

**Implementation**:

- **Pure Component Design** - Zero new systems needed, all behaviors from existing components
- **Team-based targeting** via `IsPlayer` inheritance (3-line change to existing systems)
- **Personality traits** - Unique Aggressiveness/Patience values create distinct behaviors
- **80% system reuse** - Uses existing AI, weapon, health, and rendering systems unchanged
- **Emergent complexity** - Simple stat variations create diverse, complex behaviors
- **Multiple companions** allowed for strategic synergies and cat army builds

### 3. Enhancement - Component Property Modifications ⚡

**Strategy**: Direct component property modifications that enhance survivability, combat performance, and AI behavior through ControlAi and Health component changes.

#### Armor Properties (Health component modifications)
- **Scrap Armor** ✅ _(Common)_ - Ignores the first damage instance you take in combat
- **Spiked Vest** ✅ _(Common)_ - Reflects +1 damage back to attackers (stacks with other reflection)
- **Damage Reduction** ✅ _(Uncommon)_ - Reduces all damage taken by 25%
- **Regenerative Mesh** ✅ _(Uncommon)_ - Slowly heal during combat (0.3hp/s)
- **Mirror Armor** ✅ _(Rare)_ - 100% reflect damage but you take 50% of reflected amount
- **Last Stand** ✅ _(Rare)_ - Take 75% less damage when at 1 HP
- **Thick Hide** ✅ _(Uncommon)_ - Gain +1 HP and reduce damage from attacks by 1 (minimum 1)
- **Evasion** ✅ _(Uncommon)_ - 25% chance to dodge incoming attacks

#### Combat Abilities (ControlAi flags)
- **Vampiric** ✅ _(Uncommon)_ - Heal 1 HP for every 2 damage you deal to enemies
- **Phase Walk** ✅ _(Rare)_ - Invincibility for the entire duration of dash attacks
- **Dash Master** ✅ _(Common)_ - +100% dash range

#### Energy Properties (ControlAi energy system)
- **Combat Veteran** ✅ _(Common)_ - Gain +0.3 energy per damage dealt to enemies
- **Battle Fury** ✅ _(Uncommon)_ - Enhanced combat energy generation (+0.5 energy per damage dealt, stacks)
- **Adrenaline Surge** ✅ _(Common)_ - Gain +0.2 energy per damage taken (pain fuels power)
- **Slow Metabolism** ✅ _(Common)_ - Energy decays 50% slower
- **Combat Medic** ✅ _(Common)_ - Auto-heal +1 HP per second when energy > 50% (stacks with other healing)
- **Field Surgeon** ✅ _(Uncommon)_ - Auto-heal +2 HP per second when energy > 50% (stacks with other healing)
- **Hypermetabolism** ✅ _(Rare)_ - Energy decays twice as fast but enables powerful +3 HP/s auto-healing
- **Weapon Mastery** ✅ _(Rare)_ - Gain +0.8 energy per damage dealt and +25% weapon damage when energy > 75%
- **Pain Tolerance** ✅ _(Uncommon)_ - Gain +0.4 energy per damage taken and reduce damage by 1 (minimum 1)
- **Shockwave Burst** ✅ _(Rare)_ - Automatically spawn damaging particles in all directions when energy reaches maximum

#### Behavioral Properties (ControlAi traits)
- **Lightning Reflexes** ✅ _(Uncommon)_ - +50% movement speed and dash speed
- **Quick Draw** ✅ _(Common)_ - +40% attack speed (faster weapon cooldowns)
- **Brawler** ✅ _(Common)_ - Higher aggressiveness, shorter dash range but +1 damage to all attacks
- **Vitality** ✅ _(Common)_ - +2 maximum health
- **Berserker** ✅ _(Uncommon)_ - +50% attack speed and movement when below 25% HP
- **Pacifist** ✅ _(Rare)_ - Much lower aggressiveness but +3 max health and +50% damage reduction
- **Cautious** ✅ _(Common)_ - Lower aggressiveness but +1 max health and better retreat timing

**Implementation**:

- Enhanced `Health` component with armor properties for defensive upgrades
- Direct ControlAi property modifications for combat abilities, energy system, and behavioral traits
- Damage accumulation pattern (systems write to `PendingDamage[]`)
- Consolidated upgrade state in single ControlAi component (no separate Abilities component)
- Visual Energy System: Fighter size scales dynamically with energy level
- All enhancement effects stack multiplicatively for interesting synergies

### 4. Special - Unique Mechanics 🌟

**Strategy**: Unique upgrade mechanics that don't fit standard patterns and require custom system integration.

- **Shadow Trail** ✅ _(Uncommon)_ - Movement leaves damaging shadow particles behind you using spawn system attachment

**Implementation**:

- Spawn system attachment for unique mechanics
- Custom particle systems and visual effects
- Special-case logic that doesn't follow standard component patterns

## Upgrade Distribution Summary

**Current Implemented Upgrades: 46** / **Complete System ✅**

- **Weapons**: 11 upgrades ✅ (child entities with blueprints)
- **Companions**: 8 upgrades ✅ (root entities with blueprints)
- **Enhancement**: 28 upgrades ✅ (component property modifications)
  - Armor Properties: 8 upgrades ✅
  - Combat Abilities: 3 upgrades ✅
  - Energy Properties: 10 upgrades ✅
  - Behavioral Properties: 7 upgrades ✅
- **Special**: 1 upgrade ✅ (unique mechanics)

**Rarity Distribution** (All 46 Complete):

- **Common**: 19 upgrades (41%)
- **Uncommon**: 21 upgrades (46%) 
- **Rare**: 6 upgrades (13%)

**Current Implementation Strategy**:

```typescript
// Simplified upgrade categories (src/upgrades/types.ts)
export enum UpgradeCategory {
    Weapon = "Weapon",        // Child entities with blueprints (11 upgrades ✅)
    Companion = "Companion",  // Root entities with blueprints (8 upgrades ✅)
    Enhancement = "Enhancement", // ControlAi property modifications (28 upgrades ✅)
    Special = "Special",      // Unique mechanics that don't fit patterns (1 upgrade ✅)
}
```

**Key Design Principles**:

1. **Balanced Categories**: Each category offers different strategic approaches
2. **Meaningful Choices**: Every upgrade should feel impactful and change gameplay
3. **Synergies**: Upgrades from different categories should combine interestingly
4. **Visual Feedback**: All upgrades should have clear visual/audio indicators
5. **Cat Theme**: Companions are all cats fitting the game jam theme

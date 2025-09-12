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

- **Scrap Armor** ✅ _(Tiered)_ - Ignore damage instances (Tier 1: ignore first 1 instance, Tier 2: ignore first 2 instances, Tier 3: ignore first 3 instances)
- **Spiked Vest** ✅ _(Tiered)_ - Reflect damage to attackers (Tier 1: +1 damage, Tier 2: +2 damage, Tier 3: +3 damage)
- **Damage Reduction** ✅ _(Tiered)_ - Damage reduction (Tier 1: 15%, Tier 2: 25%, Tier 3: 35%)
- **Regenerative Mesh** ✅ _(Tiered)_ - Combat healing (Tier 1: 0.2 HP/s, Tier 2: 0.3 HP/s, Tier 3: 0.5 HP/s)
- **Mirror Armor** ✅ _(Tiered)_ - Damage reflection while taking damage (Tier 1: +1 reflect, Tier 2: +2 reflect, Tier 3: +3 reflect)
- **Last Stand** ✅ _(Tiered)_ - Low health damage reduction (Tier 1: 50% reduction at <25% HP, Tier 2: 75% reduction at <25% HP, Tier 3: 90% reduction at <25% HP )
- **Thick Hide** ✅ _(Tiered)_ - Health and damage reduction (Tier 1: +1 HP, -1 damage taken, Tier 2: +2 HP, -2 damage, Tier 3: +3 HP, -3 damage)
- **Evasion** ✅ _(Tiered)_ - Dodge chance (Tier 1: 15%, Tier 2: 25%, Tier 3: 35% )

#### Combat Abilities (ControlAi flags)

- **Vampiric** ✅ _(Tiered)_ - Lifesteal (Tier 1: 25% lifesteal, Tier 2: 50% lifesteal, Tier 3: 75% lifesteal)
- **Phase Walk** ✅ _(Tiered)_ - Dash invincibility duration (Tier 1: 50% of dash, Tier 2: 75% of dash, Tier 3: 100% of dash)
- **Dash Master** ✅ _(Tiered)_ - Dash range bonus (Tier 1: +50% range, Tier 2: +100% range, Tier 3: +150% range)

#### Energy Properties (ControlAi energy system)

- **Combat Veteran** ✅ _(Tiered)_ - Energy per damage dealt (Tier 1: +0.3, Tier 2: +0.5, Tier 3: +0.8)
- **Adrenaline Surge** ✅ _(Tiered)_ - Energy per damage taken (Tier 1: +0.2, Tier 2: +0.3, Tier 3: +0.4)
- **Slow Metabolism** ✅ _(Tiered)_ - Energy decay rate (Tier 1: 25% slower decay, Tier 2: 50% slower decay, Tier 3: 75% slower decay)
- **Combat Medic** ✅ _(Tiered)_ - Auto-heal when energy > 50% (Tier 1: +1 HP/s, Tier 2: +2 HP/s, Tier 3: +3 HP/s)
- **Hypermetabolism** ✅ _(Rare)_ - Energy decays twice as fast but enables powerful +3 HP/s auto-healing
- **Weapon Mastery** ✅ _(Rare)_ - Gain +0.8 energy per damage dealt and +25% weapon damage when energy > 75%
- **Pain Tolerance** ✅ _(Tiered)_ - Energy per damage taken (Tier 1: +0.2, Tier 2: +0.4, Tier 3: +0.6)
- **Shockwave Burst** ✅ _(Rare)_ - Automatically spawn damaging particles in all directions when energy reaches maximum
- **Kinetic Charger** ✅ _(Tiered)_ - Energy generation while moving (Tier 1: base rate, Tier 2: 2x rate, Tier 3: 3x rate)
- **Mana Siphon** ✅ _(Tiered)_ - Energy drain per damage dealt (Tier 1: 25% of damage, Tier 2: 50% of damage, Tier 3: 75% of damage)
- **Resonance Shield** ✅ _(Tiered)_ - Damage reduction at full energy (Tier 1: 25% reduction, Tier 2: 50% reduction, Tier 3: 75% reduction)

#### Behavioral Properties (ControlAi traits)

- **Lightning Reflexes** ✅ _(Tiered)_ - Movement speed (Tier 1: +25%, Tier 2: +50%, Tier 3: +75%)
- **Quick Draw** ✅ _(Tiered)_ - Attack speed (Tier 1: +25%, Tier 2: +40%, Tier 3: +60%)
- **Brawler** ✅ _(Tiered)_ - Aggressiveness and damage bonus (Tier 1: +0.1 aggr, +1 damage, Tier 2: +0.2 aggr, +2 damage, Tier 3: +0.3 aggr, +3 damage)
- **Vitality** ✅ _(Tiered)_ - Maximum health (Tier 1: +2 HP, Tier 2: +3 HP, Tier 3: +4 HP)
- **Berserker** ✅ _(Uncommon)_ - +50% attack speed and movement when below 25% HP
- **Pacifist** ✅ _(Rare)_ - Much lower aggressiveness but +3 max health and +50% damage reduction
- **Cautious** ✅ _(Tiered)_ - Maximum health with defensive AI (Tier 1: +1 HP, Tier 2: +2 HP, Tier 3: +3 HP)

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

**Current Implemented Upgrades: 49** / **Complete System ✅** (Field Surgeon consolidated into Combat Medic tiers)

- **Weapons**: 11 upgrades ✅ (child entities with blueprints)
- **Companions**: 8 upgrades ✅ (root entities with blueprints)
- **Enhancement**: 29 upgrades ✅ (component property modifications, including 24 tiered upgrades)
    - Armor Properties: 8 upgrades ✅ (8 tiered)
    - Combat Abilities: 3 upgrades ✅ (3 tiered)
    - Energy Properties: 13 upgrades ✅ (8 tiered)
    - Behavioral Properties: 7 upgrades ✅ (5 tiered)
- **Special**: 1 upgrade ✅ (unique mechanics)

**Tiered Upgrades with 3 Tiers Each:**

**Armor Properties:**

- Scrap Armor (3 tiers): Damage instance blocking
- Spiked Vest (3 tiers): Damage reflection
- Damage Reduction (3 tiers): Percentage damage reduction
- Regenerative Mesh (3 tiers): Passive combat healing
- Mirror Armor (3 tiers): Reflection while taking damage
- Last Stand (3 tiers): Low health damage reduction
- Thick Hide (3 tiers): Health bonus + damage reduction
- Evasion (3 tiers): Dodge chance

**Combat Abilities:**

- Vampiric (3 tiers): Lifesteal percentage
- Phase Walk (3 tiers): Dash invincibility duration
- Dash Master (3 tiers): Dash range bonus

**Energy Properties:**

- Combat Medic (3 tiers): Healing rate when energy >50%
- Combat Veteran (3 tiers): Energy generation from damage dealt
- Adrenaline Surge (3 tiers): Energy generation from damage taken
- Slow Metabolism (3 tiers): Energy decay rate reduction
- Pain Tolerance (3 tiers): Energy generation from damage taken
- Mana Siphon (3 tiers): Energy drain from damage dealt
- Kinetic Charger (3 tiers): Energy generation while moving
- Resonance Shield (3 tiers): Energy-based damage reduction

**Behavioral Properties:**

- Lightning Reflexes (3 tiers): Movement speed
- Quick Draw (3 tiers): Attack speed
- Brawler (3 tiers): Damage bonus
- Vitality (3 tiers): Maximum health
- Cautious (3 tiers): Defensive health + AI behavior

**Rarity Distribution** (49 Total - Tiered upgrades span multiple rarities):

- **Common**: 5 base upgrades + 20 Tier 1 tiered = 25 total common options
- **Uncommon**: 10 base upgrades + 22 Tier 2 tiered = 32 total uncommon options
- **Rare**: 34 base upgrades + 22 Tier 3 tiered = 56 total rare options

**Note**: Tiered upgrades appear at multiple rarity levels, with some high-tier upgrades like Mirror Armor and Last Stand starting at Uncommon/Rare for their Tier 1 versions. This creates 113 total upgrade options across all tiers.

**Current Implementation Strategy**:

```typescript
// Simplified upgrade categories (src/upgrades/types.ts)
export enum UpgradeCategory {
    Weapon = "Weapon", // Child entities with blueprints (11 upgrades ✅)
    Companion = "Companion", // Root entities with blueprints (8 upgrades ✅)
    Enhancement = "Enhancement", // ControlAi property modifications (31 upgrades ✅)
    Special = "Special", // Unique mechanics that don't fit patterns (1 upgrade ✅)
}
```

**Key Design Principles**:

1. **Balanced Categories**: Each category offers different strategic approaches
2. **Meaningful Choices**: Every upgrade should feel impactful and change gameplay
3. **Synergies**: Upgrades from different categories should combine interestingly
4. **Visual Feedback**: All upgrades should have clear visual/audio indicators
5. **Cat Theme**: Companions are all cats fitting the game jam theme

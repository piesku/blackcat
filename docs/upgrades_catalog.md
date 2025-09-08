# Upgrade Catalog

This document outlines the implementation architecture for the upgrade system in 33 Duels, as specified in design.md.

## Overview

Upgrades are the core mechanic that drives strategic depth and build variety. Players accumulate 33 upgrades over the course of their run, with opponents receiving the same number of randomly assigned upgrades for balanced but unpredictable encounters.

## Upgrade Categories

### 1. Weapons - Ranged Focus with Particle Effects 🔫

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

### 2. Armor - Defensive Enhancement 🛡️

**Strategy**: Defensive upgrades that enhance survivability through Health component modifications and damage mitigation.

- **Scrap Armor** ✅ _(Common)_ - Ignores the first damage instance you take in combat
- **Spiked Vest** ✅ _(Common)_ - Reflects +1 damage back to attackers (stacks with other reflection)
- **Vitality Boost** ✅ _(Uncommon)_ - Increases maximum health by +50% of current max (stacks additively)
- **Reinforced Plating** ✅ _(Uncommon)_ - Reduces all damage taken by 25%
- **Regenerative Mesh** ✅ _(Uncommon)_ - Slowly heal during combat (0.3hp/s)
- **Mirror Armor** ✅ _(Rare)_ - 100% reflect damage but you take 50% of reflected amount
- **Proximity Barrier** ✅ _(Uncommon)_ - Reduce damage from enemies within melee range by 40%
- **Last Stand** ✅ _(Rare)_ - Take 75% less damage when at 1 HP
- **Thick Hide** ✅ _(Uncommon)_ - Gain +1 HP and reduce damage from attacks by 1 (minimum 1)
- **Tough Skin** ✅ _(Common)_ - Reduce all damage by 1 (minimum 1 damage)

**Implementation**:

- Enhanced `Health` component with armor properties for defensive upgrades
- Damage accumulation pattern (systems write to `PendingDamage[]`)
- Armor effects stack multiplicatively with ability bonuses

### 3. Ability - Combat & Movement Enhancement ⚡

**Strategy**: Active and passive abilities that modify combat behavior and provide tactical advantages.

- **Vampiric** ✅ _(Uncommon)_ - Heal 1 HP for every 2 damage you deal to enemies
- **Shadow Trail** ✅ _(Uncommon)_ - Movement leaves damaging shadow particles behind you
- **Piercing Shots** ✅ _(Uncommon)_ - Projectiles go through first enemy and continue
- **Phase Walk** ✅ _(Rare)_ - Invincibility for the entire duration of dash attacks
- **Dash Master** ✅ _(Common)_ - +100% dash range

**Implementation**:

- Ability component system for active/passive ability tracking
- System hooks for ability effects in combat and movement systems
- Event-driven ability triggers through action dispatch
- Visual effects via particle spawn system

### 4. Companions - Cat Allies 🐱

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

### 5. Energy - Combat Enhancement ⚡

**Strategy**: Combat-driven energy system that generates power from dealing and taking damage, with fighter size visually representing energy level. Energy replaces manual input with automatic combat rewards and creates dynamic risk/reward scaling through visual size changes.

- **Combat Veteran** ✅ _(Common)_ - Gain +0.3 energy per damage dealt to enemies
- **Battle Fury** ✅ _(Uncommon)_ - Enhanced combat energy generation (+0.5 energy per damage dealt, stacks)
- **Adrenaline Surge** ✅ _(Common)_ - Gain +0.2 energy per damage taken (pain fuels power)
- **Berserker's Focus** ✅ _(Uncommon)_ - Double energy generation when below 50% health
- **Slow Metabolism** ✅ _(Common)_ - Energy decays 50% slower
- **Combat Medic** ✅ _(Common)_ - Auto-heal +1 HP per second when energy > 50% (stacks with other healing)
- **Field Surgeon** ✅ _(Uncommon)_ - Auto-heal +2 HP per second when energy > 50% (stacks with other healing)
- **Hypermetabolism** ✅ _(Rare)_ - Energy decays twice as fast but enables powerful +3 HP/s auto-healing
- **Weapon Mastery** ✅ _(Rare)_ - Gain +0.8 energy per damage dealt and +25% weapon damage when energy > 75%
- **Pain Tolerance** ✅ _(Uncommon)_ - Gain +0.4 energy per damage taken and reduce damage by 1 (minimum 1)
- **Shockwave Burst** ✅ _(Rare)_ - Automatically spawn damaging particles in all directions when energy reaches maximum

**Implementation**:

- `sys_energy` system handles combat-driven energy generation from damage events
- **Visual Energy System**: Fighter size scales dynamically with energy level (1.0x → Nx at N = max energy)
- Energy affects combat performance, auto-healing, power scaling, and visual presence
- Damage-dealt energy generation triggers on successful weapon hits
- Damage-taken energy generation triggers when receiving damage
- Additive stacking for energy generation rates and healing bonuses
- Energy thresholds enable conditional effects (healing, damage bonuses)
- **Risk/Reward Scaling**: Higher energy = larger hitbox but greater combat power
- Real-time visual feedback allows instant assessment of fighter threat levels
- Trade-off upgrades provide strategic energy management choices

### 6. Traits - Combat & Behavioral Enhancement 🔥

**Strategy**: Direct combat stat modifications and behavioral changes that dramatically alter playstyle and AI behavior.

- **Lightning Reflexes** ✅ _(Uncommon)_ - +50% movement speed and dash speed
- **Quick Draw** ✅ _(Common)_ - +40% attack speed (faster weapon cooldowns)
- **Brawler** ✅ _(Common)_ - Higher aggressiveness, shorter dash range but +1 damage to all attacks
- **Vitality** ✅ _(Common)_ - +2 maximum health
- **Berserker Mode** ✅ _(Uncommon)_ - +50% attack speed and movement when below 25% HP
- **Pacifist** ✅ _(Rare)_ - Much lower aggressiveness but +3 max health and +50% damage reduction
- **Cautious** ✅ _(Common)_ - Lower aggressiveness but +1 max health and better retreat timing

**Implementation**:

- Direct modifications to movement speed, attack rates, health, and damage in entity blueprints
- Personality traits modify AI aggressiveness and behavior patterns in `com_control_ai`
- Health traits integrate with existing `Health` component
- Combat traits modify weapon damage and cooldowns

## Upgrade Distribution Summary

**Current Implemented Upgrades: 51** / **Complete System ✅**

- **Weapons**: 11 upgrades ✅ (complete ranged arsenal)
- **Armor**: 11 upgrades ✅ (complete defensive enhancement)
- **Ability**: 5 upgrades ✅ (combat & movement enhancement)
- **Companions**: 8 upgrades ✅ (complete cat roster)
- **Energy**: 11 upgrades ✅ (complete combat-driven system)
- **Traits**: 7 upgrades ✅ (combat & behavioral enhancement)

**Rarity Distribution** (All 51 Complete):

- **Common**: 21 upgrades (42%)
- **Uncommon**: 24 upgrades (48%)
- **Rare**: 5 upgrades (10%)

**Current Implementation Strategy**:

```typescript
// Current upgrade categories (src/upgrades/types.ts)
export const enum UpgradeCategory {
    Weapon = "weapon", // 11 upgrades ✅
    Armor = "armor", // 11 upgrades ✅
    Ability = "ability", // 5 upgrades ✅
    Companion = "companion", // 8 upgrades ✅
    Energy = "energy", // 8 upgrades ✅ / 12 planned
    Trait = "trait", // 7 upgrades ✅
    Special = "special", // 0 upgrades (reserved)
}
```

**Key Design Principles**:

1. **Balanced Categories**: Each category offers different strategic approaches
2. **Meaningful Choices**: Every upgrade should feel impactful and change gameplay
3. **Synergies**: Upgrades from different categories should combine interestingly
4. **Visual Feedback**: All upgrades should have clear visual/audio indicators
5. **Cat Theme**: Companions are all cats fitting the game jam theme

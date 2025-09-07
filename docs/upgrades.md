# Upgrade System Design

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

### 3. Support - Combat & Movement Enhancement ⚡

**Strategy**: Active and passive abilities that modify combat behavior and provide tactical advantages.

- **Vampiric** ✅ _(Uncommon)_ - Heal 1 HP for every 2 damage you deal to enemies
- **Shadow Trail** ✅ _(Uncommon)_ - Movement leaves damaging shadow particles behind you
- **Piercing Shots** ✅ _(Uncommon)_ - Projectiles go through first enemy and continue
- **Phase Walk** ✅ _(Rare)_ - Brief invincibility when dashing (0.3s)
- **Dash Master** ✅ _(Common)_ - +100% dash range and reduced dash cooldown
- **Evasion** _(Uncommon)_ - +25% chance to completely avoid damage

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

### 5. Energy - Interactive Enhancement ⚡

**Strategy**: Player interaction system that allows clicking/holding for combat bonuses and healing.

- **Energy Efficiency** ✅ _(Common)_ - Click rapidly to boost combat performance (+0.3 energy per tap)
- **Adrenaline Rush** ✅ _(Uncommon)_ - Enhanced clicking efficiency (+0.5 energy per tap, stacks)
- **Slow Metabolism** ✅ _(Common)_ - Energy decays 50% slower
- **Basic Healing** ✅ _(Common)_ - Hold to restore +1 HP per second (stacks with other healing)
- **Rapid Healing** ✅ _(Uncommon)_ - Hold to restore +2 HP per second (stacks with other healing)
- **Energy Conservation** ✅ _(Uncommon)_ - Healing drains energy 50% slower
- **Power Stability** ✅ _(Common)_ - Power decays 75% slower
- **Hypermetabolism** ✅ _(Rare)_ - Energy decays twice as fast but enables powerful +3 HP/s healing
- **Combat Stimulant** ✅ _(Rare)_ - Supercharged tapping (+0.8 energy per tap) and instant power recovery
- **Shockwave Burst** _(Rare)_ - Release a powerful shockwave when energy is full, damaging nearby enemies
- **Pop!** _(Rare)_ - Spawn particles in all direction when releasing a hold heal

**Implementation**:

- `sys_energy` system handles click/hold input detection
- Energy affects combat performance and healing capabilities
- Additive stacking for most bonuses (healing rates, tapping efficiency)
- Trade-off upgrades provide risk/reward mechanics

### 6. Traits - Combat & Behavioral Enhancement 🔥

**Strategy**: Direct combat stat modifications and behavioral changes that dramatically alter playstyle and AI behavior.

- **Lightning Reflexes** _(Uncommon)_ - +50% movement speed and dash speed
- **Quick Draw** _(Common)_ - +40% attack speed (faster weapon cooldowns)
- **Brawler** _(Common)_ - Higher aggressiveness, shorter dash range but +1 damage to all H2H attacks
- **Vitality** _(Common)_ - +2 maximum health
- **Berserker Mode** _(Uncommon)_ - +50% attack speed and movement when below 25% HP
- **Pacifist** _(Rare)_ - Much lower aggressiveness but +3 max health and +50% damage reduction
- **Cautious** _(Common)_ - Lower aggressiveness but +1 max health and better retreat timing

**Implementation**:

- Direct modifications to movement speed, attack rates, health, and damage in entity blueprints
- Personality traits modify AI aggressiveness and behavior patterns in `com_control_ai`
- Health traits integrate with existing `Health` component
- Combat traits modify weapon damage and cooldowns

## Upgrade Distribution Summary

**Current Implemented Upgrades: 40** / **Potential Total: 53**

- **Weapons**: 11 upgrades ✅ (complete ranged arsenal)
- **Armor**: 10 upgrades ✅ (complete defensive enhancement)
- **Support**: 2 upgrades ✅ + 4 ideas (combat & movement enhancement)
- **Companions**: 8 upgrades ✅ (complete cat roster)
- **Energy**: 9 upgrades ✅ + 2 ideas (interactive system)
- **Traits**: 0 upgrades + 7 ideas (combat & behavioral enhancement)

**Rarity Distribution** (Current 40):

- **Common**: 16 upgrades (40%)
- **Uncommon**: 16 upgrades (40%)
- **Rare**: 8 upgrades (20%)

**Current Implementation Strategy**:

```typescript
// Current upgrade categories (src/upgrades/types.ts)
export const enum UpgradeCategory {
    Weapon = "weapon", // 11 upgrades ✅
    Armor = "armor", // 10 upgrades ✅
    Ability = "ability", // 2 upgrades ✅ (will become Support)
    Companion = "companion", // 8 upgrades ✅
    Energy = "energy", // 9 upgrades ✅
    Special = "special", // 0 upgrades (future)
}

// Future expansion categories:
// Support = "support",   // Ability category rename (combat & movement enhancement)
// Trait = "trait",       // Combat & behavioral mods (future)
```

**Key Design Principles**:

1. **Balanced Categories**: Each category offers different strategic approaches
2. **Meaningful Choices**: Every upgrade should feel impactful and change gameplay
3. **Synergies**: Upgrades from different categories should combine interestingly
4. **Visual Feedback**: All upgrades should have clear visual/audio indicators
5. **Cat Theme**: Companions are all cats fitting the game jam theme

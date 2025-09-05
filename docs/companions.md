# Cat Companion System

This document provides complete documentation for the cat companion system in 33 Duels, including architecture and pure component-based implementation.

## Overview

Cat companions are AI allies that fight alongside their owner, inheriting team allegiance and providing strategic variety through **pure component combinations**. Each cat's unique behavior emerges from creative combinations of existing components rather than special-case logic.

## 🐱 Companion Cats - Pure Component Design

| Cat        | HP  | Speed | Aggr | Patience | Melee Dmg | Target Rate | Scale | Special Components |
| ---------- | --- | ----- | ---- | -------- | --------- | ----------- | ----- | ------------------ |
| Mr. Black  | 6   | 2.8   | 1.8  | 1.5      | 2         | 0.1         | 0.8   | Cat Summoner       |
| Mr. Orange | 2   | 4.2   | 2.5  | 0.1      | 2         | 0.02        | 0.7   | Whirlwind barbarian|
| Mr. Pink   | 3   | 1.8   | 0.8  | 2.0      | 1         | 0.3         | 0.7   | Boomerang ranged   |
| Mr. White  | 7   | 1.3   | 0.5  | 2.5      | 1         | 0.15        | 0.8   | Shotgun            |
| Mr. Brown  | 4   | 1.5   | 0.1  | 3.0      | 1         | 0.8         | 0.7   | Bodyguard protector|
| Mr. Blue   | 2   | 2.8   | 2.0  | 0.1      | 3         | 0.03        | 0.7   | Mortar artillery   |
| Mr. Gray   | 2   | 3.2   | 1.8  | 0.2      | 3         | 0.1         | 0.4   | Shadow trail       |
| Mr. Red    | 1   | 2.5   | 1.8  | 0.5      | 1         | 0.1         | 0.6   | Explode on death   |

### Pure Component Behaviors

Each cat's personality emerges from **component combinations only** - no special logic needed:

**Mr. Black - Cat Summoner**
- Spawns random companion cats every 8 seconds using `spawn_timed` component
- Superior base stats provide leadership while building cat army
- Each summoned cat inherits owner's team allegiance

**Mr. Orange - Whirlwind Barbarian**  
- Extreme mobility: very low HP (2), ultra-high speed (4.2), high damage (2)
- Lightning-fast retargeting (0.02s) + ultra-low patience (0.1) = constant target switching
- Whirls between enemies in frenzied barbarian rage

**Mr. Pink - Boomerang Marksman**
- Equipped boomerang weapon for ranged attacks with return damage
- Slow methodical movement (1.8 speed) keeps distance from enemies
- Patient personality (2.0) = stays back and throws from safety

**Mr. White - Defensive Tank**
- Highest HP (7), slowest speed (1.3), equipped shotgun
- High patience (2.5) = waits for enemies to come to him
- Close-range power with defensive positioning

**Mr. Brown - Loyal Bodyguard**
- Ultra-low aggression (0.1) = focuses on protection over combat
- Slower targeting (0.8s) but targets friendlies to stay close and protect them
- Takes damage in place of nearby allies using damage redirection system

**Mr. Blue - Mortar Artillery**
- Glass cannon stats (HP=2) with mortar weapon for explosive ranged attacks
- Fastest targeting (0.03s) + lowest patience (0.1) = rapid artillery bombardment
- High-arc explosive shells create area damage

**Mr. Gray - Shadow Assassin**  
- Tiny scale (0.4) = naturally hard to see and hit
- High speed (3.2) + shadow trail ability = leaves damaging trail behind
- Hit-and-run ambush attacks with persistent shadow damage

**Mr. Red - Suicide Bomber**
- Lowest HP (1) = dies in one hit to anything
- Fast approach (2.5 speed) to reach targets
- `destroy_on_hit: true` + explosion spawn on death

## 🏗️ Pure Component Architecture

### ✅ Zero System Modifications Needed

**ALL cats use existing systems without any changes:**
- `sys_control_ai` - Handles all movement and combat AI with personality parameters
- `sys_weapon_*` - Cat attacks use existing weapon systems (sniper, shotgun, melee)
- `sys_health` - Cat death/damage processing with existing damage dealing
- `sys_move`, `sys_render2d` - Physics and rendering with scale variations
- `sys_spawn` - Existing spawn system for healing particles and explosions
- All collision and particle systems work unchanged

### 🔧 Minimal Extensions (Only for Enhancement)

**1. Team Targeting** ✅ *Already Implemented* (3-line change to `sys_aim.ts`):

```typescript
// In find_nearest_enemy(): Skip entities with same IsPlayer value
let other_ai = game.World.ControlAi[other];
if (other_ai && other_ai.IsPlayer === my_ai.IsPlayer) continue; // Same team!
```

**2. Optional: Layer Mask Targeting** (Future Enhancement):
```typescript
// Extend Aim component for specific target types
interface Aim {
    // ... existing properties
    TargetLayers?: number; // Optional layer mask for valid targets
}
// Mr. Brown could target allies: TargetLayers = Layer.Player
// Others target enemies: TargetLayers = Layer.Enemy
```

**3. Cat Blueprint Examples**:

```typescript
// Mr. Orange: Glass cannon berserker (pure stats)
cat_control_ai(owner.IsPlayer, 3.5, 2.0, 0.3), // Fast, aggressive, impatient
health(2), move2d(3.5), // Low HP, high speed
aim(0.05), // Ultra-fast targeting
deal_damage(2), // High melee damage
scale(0.7), // Smaller size

// Mr. Brown: Support healer (uses existing spawn system)
cat_control_ai(owner.IsPlayer, 1.5, 0.2, 3.0), // Slow, passive, patient
health(4), move2d(1.5),
aim(0.5), // Slow targeting (not combat focused)
spawn_timed(blueprint_heal_spawner, 2.0), // Heals every 2 seconds
```

**4. Component Combinations for Special Effects**:
- **Mr. Black Cat Summoning**: `spawn_timed` with random cat blueprints
- **Mr. Red Explosion**: `destroy_on_hit: true` + spawn explosion on death
- **Mr. Gray Shadow Trail**: Tiny scale (0.4) + `shadow_trail()` ability
- **Mr. Brown Bodyguard**: Friendly targeting + damage redirection system

### Cat Mechanics

- **Team Allegiance**: Cats inherit `IsPlayer` from owner (automatic enemy targeting)
- **Personality Traits**: Each cat has unique Aggressiveness/Patience values
- **Visual Distinction**: Different sprites, colors, sizes via render components
- **Death Synchronization**: Companions die when owner dies
- **Multiple Companions**: Players can have multiple cats for interesting synergies:
  - Mr. Pink (boomerang) + Mr. White (tank) = ranged support + front-line protection
  - Mr. Orange (whirlwind) + Mr. Brown (bodyguard) = aggressive attacker + protection support
  - Mr. Blue (mortar) + Mr. Red (sacrifice) = artillery bombardment + explosive combinations
  - Mr. Black (summoner) + Mr. Gray (shadow) = cat army + stealth assassination

### Implementation Benefits

- **80% System Reuse**: Movement, combat, health, rendering all work unchanged
- **Emergent Complexity**: Simple stat variations create diverse behaviors
- **Minimal Code**: ~50 lines for team logic + cat blueprints vs hundreds for new systems
- **Performance**: No new system overhead, just more entities with existing components
- **Hackability**: Easy to add new cat types or modify existing ones

---

# Pure Component Toolbox

This section documents the available component combinations that create all cat behaviors without any new systems.

## 🧰 Available Component Combinations

### Core AI & Movement
- **Aggressiveness/Patience** - Personality traits (existing ControlAi)
- **Move Speed** - Movement speed (existing Move2D)  
- **Target Rate** - How often they search for targets (existing Aim.UpdateInterval)
- **Scale** - Physical size affecting visibility and hitbox (existing LocalTransform2D)

### Combat & Damage
- **Health** - HP amount (existing Health)
- **Melee Damage** - Claw/bite damage (existing DealDamage)
- **Weapons** - Attach sniper, shotgun, etc. as children (existing weapon system)
- **Collision Damage** - Damage on contact (existing collision system)
- **Death Effects** - Explosions, spawns on death (existing spawn system)

### Special Effects (All Existing)
- **Particle Spawning** - spawn_timed for healing, trails, etc.
- **Death Explosions** - destroy_on_hit + explosion spawn
- **Visual Effects** - Color, scale, alpha modifications
- **Timed Lifespan** - Auto-death after X seconds

## 🎯 Pure Component Cat Designs

### Mr. Black - Cat Summoner ✅ **Uses Existing Spawn System**
```typescript
// Superior stats + periodic cat spawning
health(6), move2d(2.8), deal_damage(2), aim(0.1),
spawn_timed(blueprint_random_cat, 8.0), // Spawns random cats every 8 seconds
// Aggressiveness=1.8, Patience=1.5
```

### Mr. Orange - Whirlwind Barbarian ✅ **No Special Logic**  
```typescript
// Extreme mobility creates whirlwind behavior naturally
health(2), move2d(4.2), deal_damage(2), aim(0.02) // Lightning-fast retargeting
// Aggressiveness=2.5, Patience=0.1 - Constant target switching
```

### Mr. Pink - Boomerang Marksman ✅ **No Special Logic**
```typescript  
// Ranged weapon + slow methodical behavior
health(3), move2d(1.8), blueprint_boomerang(), aim(0.3) // Slow careful aiming
// Aggressiveness=0.8, Patience=2.0 - Stays back and throws
```

### Mr. White - Tank ✅ **No Special Logic**
```typescript
// High HP + defensive positioning + close-range weapon
health(7), move2d(1.3), blueprint_shotgun(), aim(0.15)
// Aggressiveness=0.5, Patience=2.5 - Waits for enemies
```

### Mr. Brown - Bodyguard ✅ **Uses Friendly Targeting + Damage Redirection**
```typescript
// Protects allies by targeting friendlies and intercepting damage
health(4), move2d(1.5), aim(0.8, {TargetFriendlies: true}), // Targets allies to protect
bodyguard(), // Redirects damage from nearby allies to self
// Aggressiveness=0.1, Patience=3.0 - Protection focused
```

### Mr. Blue - Mortar Artillery ✅ **No Special Logic**
```typescript  
// Glass cannon stats + mortar weapon for rapid bombardment
health(2), move2d(2.8), blueprint_mortar(), aim(0.03) // Fastest targeting
// Aggressiveness=2.0, Patience=0.1 - Rapid artillery fire
```

### Mr. Gray - Shadow Assassin ✅ **Uses Shadow Trail Ability**
```typescript
// Tiny scale + high speed + shadow trail = stealth with persistent damage
health(2), move2d(3.2), deal_damage(3), scale(0.4), // Tiny = hard to see
shadow_trail(), // Leaves damaging trail behind when moving
// Aggressiveness=1.8, Patience=0.2 - Hit-and-run with trail damage
```

### Mr. Red - Sacrifice ✅ **Uses Existing Death System**
```typescript
// Dies in one hit + explosion on death
health(1), move2d(2.5), 
deal_damage(1, DamageType.Hand2Hand, {
    destroy_on_hit: true, // Dies on any damage
    spawn_on_death: blueprint_explosion, // Explodes when killed
})
```

## 🎮 Emergent Behaviors

**All complex behaviors emerge from simple component combinations:**

- **Cat Summoner** = Superior Stats + Periodic Cat Spawning + Team Leadership
- **Whirlwind Barbarian** = Ultra-High Speed + Lightning Retargeting + Constant Aggression
- **Boomerang Marksman** = Ranged Weapon + Slow Movement + High Patience + Distance Keeping
- **Bodyguard** = Low Aggression + Friendly Targeting + Damage Redirection + Protection Focus
- **Mortar Artillery** = Glass Cannon Stats + Mortar Weapon + Rapid Targeting + Area Damage
- **Shadow Assassin** = Tiny Scale + High Speed + Shadow Trail + Hit-and-run Damage
- **Tank** = High HP + Slow Speed + High Patience + Defensive weapon
- **Suicide Bomber** = 1 HP + Fast Speed + Explosion on Death

## ✅ Implementation Status

**Current Status**: All cat behaviors implementable with **zero new systems**

**Required Work**:
1. ✅ Team targeting (already implemented - 3 lines in sys_aim.ts)  
2. 🔧 Update cat blueprints with pure component combinations
3. 🔧 Create random cat spawner blueprint for Mr. Black
4. 🔧 Create boomerang weapon blueprint for Mr. Pink
5. 🔧 Implement friendly targeting system for Mr. Brown
6. 🔧 Add damage redirection/bodyguard component for Mr. Brown
7. 🔧 Add explosion-on-death to Mr. Red's deal_damage component

**Benefits**:
- **Zero New Systems** - All behaviors use existing components
- **Maximum Hackability** - Easy to create new cats by mixing components  
- **Pure ECS** - Showcases emergent complexity from simple rules
- **Performance** - No additional system overhead
- **Maintainability** - No special-case logic to debug

This approach demonstrates the true power of ECS: **complex behaviors emerging from simple component combinations!**
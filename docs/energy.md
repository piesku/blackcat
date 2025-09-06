# Energy System Design

The Energy System in 33 Duels provides a unified resource management mechanic that creates a strategic risk/reward dynamic around movement speed, weapon performance, healing abilities, and visual power scaling. This document outlines the complete design philosophy and mechanics of the energy system.

## Overview

The Energy System is a **unified resource** that:

- Increases with quick taps/clicks (diminishing returns)
- Drains during healing (exponential decay to minimum)
- Affects movement speed using square root scaling for balanced gameplay
- Modifies weapon cooldowns as an inverse multiplier
- Scales healing effectiveness based on current energy level
- Provides visual power scaling that grows with energy consumption
- Automatically decays back to baseline (1.0) when idle
- Creates strategic depth through risk/reward healing mechanics

**Key Design Principle**: Energy serves as both an enhancement resource (tap to boost performance) and a healing cost (hold to heal at the cost of combat effectiveness). The system encourages active engagement while providing meaningful trade-offs between offense, defense, and recovery.

## Energy Mechanics

### Core Energy Properties

```typescript
// From com_control_ai.ts
interface ControlAi {
    Energy: number; // Unified energy affecting movement speed, weapon cooldowns, rate of fire
    IsPlayer: boolean; // Energy system only active for player entities
}
```

**Energy Ranges:**

- **Minimum**: 0.0 (asymptotic limit during healing, never actually reached)
- **Base**: 1.0 (normal combat effectiveness when idle)
- **Maximum**: No hard limit (diminishing returns prevent excessive accumulation)
- **Player Starting Value**: 1.0 (base effectiveness)
- **Opponent Starting Value**: Random 0.7-1.1 (minor variation for diversity)

### Energy States

**1. Normal State (Energy = 1.0)**

- Base movement speed and weapon cooldowns
- Default state when not interacting
- Energy naturally decays toward this value

**2. Enhanced State (Energy > 1.0)**

- Faster movement and weapon firing
- Achieved through quick taps/clicks
- Higher energy provides proportionally better performance

**3. Drained State (Energy < 1.0)**

- Slower movement and weapon firing
- Occurs during active healing
- Balances healing power with combat vulnerability

## Player Controls

### Input Detection System

**Quick Tap/Click**: Brief inputs provide energy enhancement without cost, encouraging active engagement and tactical timing during combat.

**Intentional Hold**: Extended inputs activate healing mode, creating a clear distinction between offensive enhancement (tapping) and defensive recovery (holding). This binary input system ensures players can reliably access both mechanics without accidental activation.

### Energy Gain (Tapping)

**Diminishing Returns Formula**:

```typescript
const BASE_ENERGY_PER_TAP = 0.3; // Base energy gain per tap
const DIMINISH_FACTOR = 0.2; // Diminishing returns strength

let energy_multiplier = 1.0 / (1.0 + current_energy * DIMINISH_FACTOR);
let energy_gain = BASE_ENERGY_PER_TAP * energy_multiplier;
```

**Energy Gain Examples**:

- At Energy 1.0: +0.25 per tap (83% effectiveness)
- At Energy 2.0: +0.21 per tap (71% effectiveness)
- At Energy 5.0: +0.15 per tap (50% effectiveness)
- At Energy 10.0: +0.10 per tap (33% effectiveness)

This prevents infinite energy accumulation while rewarding tactical tapping.

### Energy Decay (Idle)

**Automatic Restoration**:

```typescript
const ENERGY_DECAY_RATE = 1.0; // Energy per second toward baseline
const BASE_ENERGY = 1.0; // Target baseline value

if (ai.Energy > BASE_ENERGY) {
    // Decay high energy back to baseline
    ai.Energy -= ENERGY_DECAY_RATE * delta;
} else if (ai.Energy < BASE_ENERGY) {
    // Restore low energy back to baseline
    ai.Energy += ENERGY_DECAY_RATE * delta;
}
```

Energy always moves toward 1.0 at 1.0 energy per second when not actively interacting.

## Healing System Integration

### Healing Activation

**Requirements for Healing**:

1. Hold input for ≥ 0.2 seconds
2. Fighter must be alive (`health.IsAlive`)
3. Health must be below maximum (`health.Current < health.Max`)

### Energy Drain During Healing

**Exponential Decay Formula**:

```typescript
const MIN_HEALING_ENERGY = 0.0; // Asymptotic minimum (never reached)
const HEALING_DRAIN_STRENGTH = 1.0; // Drain aggressiveness

let energy_above_minimum = ai.Energy - MIN_HEALING_ENERGY;
let drain_rate = HEALING_DRAIN_STRENGTH * energy_above_minimum;
ai.Energy -= drain_rate * delta;
```

**Healing Drain Behavior**:

- **Initial Drain**: Very fast when energy is high
- **Gradual Slowdown**: Drain rate decreases as energy approaches minimum
- **Asymptotic Approach**: Never quite reaches 0.0, always some energy remains
- **Mathematical Safety**: Hard floor at MIN_HEALING_ENERGY prevents negative values

**Example Drain Rates**:

- At Energy 2.0: -2.0 energy/second
- At Energy 1.0: -1.0 energy/second
- At Energy 0.5: -0.5 energy/second
- At Energy 0.1: -0.1 energy/second

### Health Restoration

**Energy-Scaled Healing Rate**:

```typescript
const HEALING_RATE = 1; // Base HP per second when holding

let heal_amount = HEALING_RATE * ai.Energy * delta;
health.Current += heal_amount;
if (health.Current > health.Max) {
    health.Current = health.Max;
}
```

**Healing Mechanics**:

- **Rate**: Base 1 HP per second, scaled by current energy level
- **Energy Scaling**: Higher energy = faster healing (up to full energy maximum)
- **Cost**: Exponential energy drain (dependent on current energy)
- **Duration**: Limited by available energy above minimum
- **Strategy**: Start healing with high energy for maximum effectiveness, accepting longer recovery time
- **Efficiency Trade-off**: Higher energy provides faster healing but drains faster, creating optimal timing decisions

**Healing Visual Effects**:

When healing occurs, the system activates heal particle spawners attached to the player entity, providing visual feedback for the healing process.

## Combat Performance Effects

### Movement Speed Scaling

**Square Root Energy Scaling**:

```typescript
// From sys_control_ai.ts
move.MoveSpeed = ai.BaseMoveSpeed * Math.sqrt(ai.Energy);
```

**Movement Examples** (using square root scaling for balanced progression):

- Energy 0.25: 50% movement speed (very slow during heavy healing drain)
- Energy 1.0: 100% movement speed (normal baseline)
- Energy 4.0: 200% movement speed (enhanced from sustained tapping)
- Energy 9.0: 300% movement speed (maximum practical enhancement)

**Design Rationale**: Square root scaling prevents excessive speed advantages while maintaining meaningful enhancement. Linear scaling would create overpowered high-energy states, while square root scaling provides diminishing returns that keep gameplay balanced.

### Visual Power Scaling

**Energy Consumption Scaling**:

```typescript
// Visual scaling based on energy consumed during hold sessions
let energy_consumed = control.HoldStartEnergy - ai.Energy;
control.PowerScale = 1.0 + Math.max(0, energy_consumed);

// Applied to visual transform
transform.Scale[0] = control.PowerScale;
transform.Scale[1] = control.PowerScale;
```

**Power Scale Mechanics**:

- **Activation**: Only during intentional holds (≥ 0.2 seconds)
- **Calculation**: PowerScale = 1.0 + energy consumed since hold began
- **Visual Feedback**: Fighter grows larger as they consume more energy for healing
- **Decay**: Rapidly returns to 1.0 when not holding (16.0 units per second)
- **Strategic Display**: Shows players the "power cost" of their healing decisions

**Power Scale Examples**:

- Start healing at Energy 3.0, drain to 2.0: 2.0x visual scale (100% larger)
- Start healing at Energy 5.0, drain to 1.0: 5.0x visual scale (400% larger)
- Visual scaling provides immediate feedback on healing cost and remaining combat effectiveness

### Weapon Cooldown Scaling

**Inverse Energy Scaling**:

```typescript
// From sys_control_weapon.ts
let cooldown_threshold = weapon.Cooldown - weapon.Cooldown / ai.Energy;
```

**Weapon Cooldown Examples** (for 2.0 second base cooldown):

- Energy 0.5: 6.0 seconds (very slow firing when healing)
- Energy 1.0: 2.0 seconds (normal firing rate)
- Energy 2.0: 1.5 seconds (25% faster firing)
- Energy 5.0: 1.6 seconds (20% faster firing - diminishing benefit)

**Formula Behavior**:

- **Low Energy** (< 1.0): Dramatically increases cooldown times
- **High Energy** (> 1.0): Provides moderate cooldown reduction with diminishing returns
- **Energy 1.0**: No modification to base cooldown

## Strategic Depth

### Risk/Reward Mechanics

**Tapping Strategy**:

- **Benefit**: Enhanced combat performance (square root speed scaling + firing rate improvement)
- **Cost**: No direct cost, but requires active input timing and diminishes over time
- **Diminishing Returns**: Prevents excessive energy accumulation through multiplicative reduction
- **Tactical Timing**: Best used before engagements or during combat lulls

**Healing Strategy**:

- **Benefit**: Energy-scaled health restoration (faster healing with higher energy)
- **Cost**: Exponential energy drain reduces combat effectiveness during and after healing
- **Risk**: Vulnerable while healing due to dramatically slower movement and longer weapon cooldowns
- **Efficiency Paradox**: Higher energy heals faster but drains faster, creating optimal timing decisions
- **Visual Feedback**: Power scaling provides immediate feedback on healing cost

### Advanced Energy Management

**1. Front-Loading Strategy**:

- Build high energy before healing for maximum restoration rate
- Accept longer recovery time for faster initial healing
- Use visual scaling as a gauge for energy investment

**2. Conservation Strategy**:

- Heal at moderate energy levels for balanced cost/effectiveness
- Maintain energy reserves for post-healing mobility
- Plan escape routes before initiating healing

**3. Desperation Strategy**:

- Emergency healing at low energy provides slow but steady recovery
- Extended healing duration due to low drain rate
- Vulnerable for longer periods but guaranteed some healing

**4. Combat Integration**:

- Use tapping between opponent attacks for micro-enhancements
- Time healing during opponent cooldowns or after stunning them
- Balance enhancement (offensive advantage) vs preparation (healing readiness)

## UI Integration

### Energy Display

**Visual Representation**:

```typescript
// From ArenaView.ts
let playerEnergy = getPlayerEnergy(game);
let maxEnergy = 10; // UI display maximum
let energyPercent = Math.round((playerEnergy / maxEnergy) * 100);
```

**Energy Bar Colors**:

- **Green** (> 80% of max): High energy, enhanced performance
- **Yellow** (60-80% of max): Moderate energy
- **Red** (< 60% of max): Low energy, reduced performance

**Real-Time Updates**:

- Energy value displayed as "ENERGY: X.X s"
- Energy bar visual representation with color coding
- Healing status indicator when active

**Player Feedback**:

- Healing particles when restoration occurs
- Energy bar animation and color changes
- Movement speed visually obvious due to energy scaling

## Technical Implementation

### System Integration

**Energy Processing Order** (from game.ts):

1. **sys_control_player**: Process input and update energy
2. **sys_control_ai**: Apply energy multiplier to movement
3. **sys_control_weapon**: Apply energy multiplier to weapon cooldowns
4. **sys_health**: Process healing effects
5. **sys_ui**: Display energy status

### Component Architecture

**Energy Storage**:

```typescript
// Energy stored in ControlAi component for all entities
// Only player entities actively use the energy system
// Opponents have static energy values for minor variation
```

**Data Flow**:

1. Player input → `sys_control_player` → Energy modification
2. Energy value → `sys_control_ai` → Movement scaling
3. Energy value → `sys_control_weapon` → Weapon cooldown scaling
4. Energy value → UI systems → Visual feedback

### Performance Considerations

**Optimization Features**:

- Energy calculations only for entities with ControlAi component
- UI queries cached and updated per frame
- Exponential formulas use efficient mathematical operations
- Console logging can be disabled for production builds

## Implementation Files

### Core Systems

- `src/systems/sys_control_player.ts` - Input processing and energy management
- `src/systems/sys_control_ai.ts` - Movement speed scaling (line 158-159)
- `src/systems/sys_control_weapon.ts` - Weapon cooldown scaling (line 50)
- `src/components/com_control_ai.ts` - Energy property definition (line 23)

### UI Integration

- `src/ui/entity_queries.ts` - Energy state queries (line 100-131)
- `src/ui/ArenaView.ts` - Energy display and visualization (line 15-78)

### Visual Effects

- Healing particles triggered through child entity spawner system
- Energy bar color coding and real-time updates
- Movement speed changes provide immediate visual feedback

## Balance Design

**Energy System Tuning Parameters**:

```typescript
const BASE_ENERGY_PER_TAP = 0.3; // Base tap energy gain
const DIMINISH_FACTOR = 0.2; // Diminishing returns strength
const ENERGY_DECAY_RATE = 1.0; // Idle energy decay rate (toward baseline)
const BASE_ENERGY = 1.0; // Baseline energy level (not zero)
const HEALING_RATE = 1; // Base HP per second (energy-scaled)
const HEALING_DRAIN_STRENGTH = 1.0; // Energy drain aggressiveness
const HOLD_THRESHOLD = 0.2; // Tap vs hold detection time
const POWER_DECAY_RATE = 16.0; // Visual power scaling decay rate
const MIN_HEALING_ENERGY = 0.0; // Asymptotic minimum (never reached)
```

**Design Philosophy**:
These values create a balanced system where:

- **Meaningful Enhancement**: Tapping provides noticeable but not overpowered benefits
- **Strategic Healing**: High energy provides faster healing but dramatic vulnerability afterward
- **Skill Expression**: Players must time energy usage, healing, and combat positioning
- **Balanced Scaling**: Square root movement scaling prevents excessive advantages
- **Visual Feedback**: Power scaling provides immediate understanding of energy costs
- **Risk/Reward**: Every energy decision has meaningful trade-offs

**Design Goals Achieved**:

- Energy management feels impactful without dominating combat
- Healing creates genuine strategic decisions rather than trivial resource spending
- Players can express skill through energy timing and resource management
- Visual and mechanical feedback systems reinforce energy state understanding
- The system scales well with different fighter speeds and upgrade combinations

The Energy System successfully integrates resource management, player skill, strategic decision-making, and visual feedback into the fast-paced combat of 33 Duels while maintaining the game's accessibility and tactical depth.

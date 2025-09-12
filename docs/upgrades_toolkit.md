# Upgrade Design Toolkit

This document outlines the implementation approaches available for creating new upgrades in 33 Duels, based on analysis of the existing upgrade system architecture.

## Overview

The upgrade system provides two fundamental approaches for implementing new upgrades, each with distinct trade-offs and use cases. Understanding these approaches is essential for designing upgrades that integrate cleanly with the existing ECS architecture.

## Group A: System Integration

**Philosophy**: Work within existing systems by either setting properties they read or adding logic they execute.

This approach modifies how existing entities behave within systems. It's intrusive but powerful, enabling any mechanic by leveraging the existing system infrastructure.

### A1. Property Modification (Easiest)

**Complexity**: Very Low  
**Examples**: Most armor, traits, energy upgrades

#### Tiered Upgrade System

Many upgrades benefit from having multiple tiers that can stack when selected repeatedly:

**Design Constraint**: Each tiered upgrade can only modify a single tunable parameter OR apply the same mathematical transformation to multiple parameters. This is because the actual values are computed from tier level using formulas like `base_value * tier` or `base_value + (tier - 1) * increment`.

**Combat Medic** (3 tiers - example of tiered upgrade):
- Tier 1 (Common): +1 life/s when energy >50%
- Tier 2 (Uncommon): +2 life/s when energy >50% 
- Tier 3 (Rare): +3 life/s when energy >50%

*All other tiered upgrades follow the same pattern - see the full catalog in `docs/upgrades_catalog.md` for complete tier specifications.*

**What it does**: Modify existing component properties that systems already read and process.

**Implementation**:

```typescript
// Armor upgrades modify Health component
health.DamageReduction = 0.25; // Reinforced Plating - sys_health reads this
health.FlatDamageReduction = 1; // Thick Hide - processed in armor calculations
health.RegenerationRate = 0.3; // Regenerative Mesh - sys_health processes over time
health.EvasionChance = 0.25; // Evasion - sys_health processes dodge chance

// Trait upgrades modify ControlAi component
ai.AttackSpeedMultiplier = 1.4; // Quick Draw - sys_control_weapon applies this
ai.DamageBonus = 1; // Brawler - sys_deal_damage adds to damage
ai.Aggressiveness = 0.3; // Pacifist - sys_control_ai uses for behavior
ai.MaxHealthBonus = 2; // Vitality - increases max health
ai.MaxHealthBonus = 1; // Cautious - smaller health bonus with defensive behavior

// Energy upgrades modify energy generation rates (stackable tiers)
ai.EnergyFromDamageDealt = 0.3; // Combat Veteran Tier 1 - sys_deal_damage generates energy
ai.EnergyFromDamageDealt = 0.5; // Combat Veteran Tier 2 - enhanced energy generation
ai.EnergyFromDamageDealt = 0.8; // Combat Veteran Tier 3 - maximum energy generation
ai.HealingRate = 1.0; // Combat Medic Tier 1 - sys_energy processes healing
ai.HealingRate = 2.0; // Combat Medic Tier 2 - enhanced healing rate
ai.HealingRate = 3.0; // Combat Medic Tier 3 - maximum healing rate
```

**Systems that process these properties**:

- `sys_health` - All armor properties, regeneration, damage processing
- `sys_control_ai` - Personality traits, movement modifiers, state behavior
- `sys_energy` - Energy generation rates, threshold-based healing
- `sys_deal_damage` - Damage bonuses, energy scaling, vampiric effects
- `sys_control_weapon` - Attack speed modifiers, cooldown calculations

**Design Pattern**:

1. Add property to existing component interface
2. Set property value when applying upgrade
3. Existing system logic automatically processes the property

**Advantages**:

- Zero new code required
- Instant integration with existing systems
- Easy to stack and combine multiple upgrades
- No performance impact
- Follows existing component data patterns

**Limitations**:

- Can only use mechanics that systems already support
- No custom logic or special behaviors
- Limited to properties systems are designed to read

### A2. Custom Logic Integration (Harder)

**Complexity**: Medium-High  
**Examples**: Some abilities with special mechanics

**What it does**: Add conditional logic to existing systems that checks for specific upgrades and executes custom behavior.

**Implementation**:

```typescript
// Example - Vampiric Healing (in sys_deal_damage)
if (has_ability(game, attacker_entity, AbilityType.Vampiric)) {
    let heal_amount = final_damage / 2; // Custom calculation
    attacker_health.PendingHealing.push({
        Amount: heal_amount,
        Source: attacker_entity,
        Type: "vampiric",
    });
}

// Example - Phase Walk Invincibility (in sys_health)
if (has_ability(game, entity, AbilityType.PhaseWalk)) {
    if (ai.State === AiState.Dashing) {
        health.PendingDamage.length = 0; // Custom invincibility behavior
    }
}

// Example - Shockwave Burst (in sys_energy)
if (ai.ShockwaveBurstEnabled && ai.Energy >= MAX_ENERGY) {
    instantiate(game, blueprint_shockwave_burst()); // Custom particle spawn
    ai.Energy = BASE_ENERGY; // Custom energy reset
}
```

**Ability system integration**:

- `com_abilities` - Stores passive/triggered ability flags per entity
- `has_ability(game, entity, AbilityType)` - Helper function to check abilities
- Systems check for abilities and execute custom logic paths

**Design Pattern**:

1. Add ability flag to component or create ability component
2. Add conditional logic to relevant system(s)
3. Logic executes when conditions are met

**Advantages**:

- Unlimited customization potential
- Can create complex interactions between systems
- Integrates cleanly with existing system execution order
- Can override or extend default system behavior

**Limitations**:

- Requires modifying system code directly
- More complex to implement, test, and debug
- Can become tangled if overused
- Risk of system coupling if not designed carefully

## Group B: Entity Creation

**Philosophy**: Create new entities that leverage existing systems through component composition.

This approach creates new entities with component combinations that existing systems process automatically. It's non-intrusive but limited to mechanics systems already understand.

### B1. Child Entity Addition (Low-Medium Complexity)

**Complexity**: Low-Medium  
**Examples**: All weapons

**What it does**: Attach weapon/ability entities as children using the spatial hierarchy system.

**Implementation**:

```typescript
// Weapon child entities (from blueprints/weapons/)
let weapon = instantiate(game, blueprint_flamethrower());
attach_child(game, fighter_entity, weapon);

// Each weapon blueprint defines complete behavior:
export function blueprint_flamethrower() {
    return [
        spatial_node2d(), // Child attachment capability
        render2d(Tile.Flamethrower), // Visual representation
        weapon_ranged(6, 3.0, 0.5, 1.0), // Range, cooldown, damage stats
        spawn_timed(blueprint_flame_particle, 1.0 / 12, Math.PI / 4, 3.0, 5.0), // Particle effects
        label("flamethrower"), // System identification
    ];
}
```

**Available weapon blueprints**:

- `blueprint_flamethrower()` - Timed particle spawner with cone spread
- `blueprint_shotgun()` - Multi-projectile burst spawner
- `blueprint_mortar()` - High-arc projectiles with area damage
- `blueprint_boomerang_weapon()` - Returning projectile with custom logic
- `blueprint_minigun()` - High rate-of-fire bullet spray
- `blueprint_explosives()` - Thrown bombs with timeout explosions

**Systems that support this approach**:

- `sys_control_weapon` - Activates weapons based on AI state and range
- `sys_spawn` - Handles particle and projectile generation
- `sys_transform2d` - Maintains parent-child spatial relationships
- `sys_render2d` - Renders weapon sprites and effects

**Design Pattern**:

1. Create blueprint function returning component array
2. Instantiate and attach as child entity during upgrade application
3. Existing systems automatically process the new entity

**Advantages**:

- Rich visual effects via integrated particle systems
- Complex behaviors encapsulated in self-contained blueprints
- Reusable across different fighters and game modes
- Automatic cleanup when parent entity dies
- Zero impact on existing system logic

**Limitations**:

- Weapons activate via fixed logic patterns in `sys_control_weapon`
- Limited to existing weapon activation conditions (AI states, range checks)
- Cannot easily modify activation logic without system changes
- More complex than simple property modification

### B2. Root Entity Addition (Medium Complexity)

**Complexity**: Medium  
**Examples**: All companions

**What it does**: Spawn independent allied entities that fight alongside the owner using existing AI and combat systems.

**Implementation**:

```typescript
// Companion spawning (from blueprints/companions/)
let companion = instantiate(game, blueprint_mr_orange(game, owner_is_player));

// Companions use base template with personality variations:
export function blueprint_mr_orange(game: Game, owner_is_player: boolean) {
    return [
        ...blueprint_cat_base(
            game,
            owner_is_player, // Team inheritance via IsPlayer flag
            [1.0, 0.5, 0.1, 1], // Orange color
            3, // HP variation
            4.2, // High movement speed
            2.5, // High aggressiveness (fast attacks)
            0.1, // Low patience (quick to attack)
        ),
        aim(0.02), // Lightning-fast retargeting
    ];
}
```

**Companion personality system**:
Each companion has unique stat combinations that create distinct emergent behaviors:

- **Mr. Orange**: Speed demon (4.2 speed, 2.5 aggression, 0.1 patience)
- **Mr. White**: Defensive tank (high HP, shotgun, low aggression)
- **Mr. Blue**: Glass cannon artillery (mortar weapon, fast targeting)
- **Mr. Gray**: Hit-and-run assassin (shadow trail ability)
- **Mr. Red**: Suicide bomber (1 HP, fast approach, explodes on death)

**Systems that support this approach**:

- `sys_control_ai` - Team-based targeting via `IsPlayer` inheritance
- `sys_aim` - Targets enemies, ignores allies automatically
- `sys_health` - Damage processing, death handling
- `sys_control_weapon` - Weapon activation and combat
- All rendering and physics systems work unchanged

**Design Pattern**:

1. Create companion blueprint with unique stat combination
2. Inherit team affiliation from owner via `IsPlayer` flag
3. Spawn as independent root entity during upgrade application
4. Existing systems process companion identically to main fighters

**Advantages**:

- 80% system reuse - no new systems needed
- Emergent complexity from simple stat variations
- Multiple companions allowed for strategic synergies
- Pure component-based design follows ECS principles
- Rich personality system creates distinctive behaviors

**Limitations**:

- Spawning limited to upgrade application time
- Cannot easily spawn companions during combat without custom logic
- Team targeting system is basic (IsPlayer flag inheritance only)
- Limited to existing AI behavior patterns

## Design Philosophy & Best Practices

### Core Principles

1. **Maximum Reuse**: Prefer modifying existing component properties over adding new logic
2. **Component Composition**: Use existing components in creative combinations
3. **Emergent Complexity**: Simple stat variations create complex behaviors (see companion system)
4. **Encapsulated Effects**: Weapons and abilities as self-contained blueprints
5. **Minimal New Systems**: Avoid creating new systems unless absolutely necessary

### Choosing the Right Approach

**Use A1 (Property Modification) when**:

- The desired effect can be achieved by modifying existing component properties
- Systems already have logic to process the type of effect you want
- You need upgrades that stack and combine cleanly
- Implementation speed and simplicity are priorities

**Use A2 (Custom Logic) when**:

- You need behavior that doesn't fit existing system patterns
- The effect requires complex conditional logic or state checking
- You need to override or extend default system behavior
- You're willing to modify system code for unique mechanics

**Use B1 (Child Entities) when**:

- Creating weapons or tools that attach to fighters
- You need rich visual effects and particle systems
- The effect should be a distinct, identifiable game object
- You want self-contained, reusable blueprints

**Use B2 (Root Entities) when**:

- Creating allies, companions, or independent agents
- You want to leverage the full AI and combat system
- The effect should be a separate character with its own behavior
- You need entities that can act independently

### Anti-Patterns to Avoid

- **Over-componentization**: Splitting related data across multiple components (prefer data aggregation)
- **New systems for simple effects**: Creating systems when property modification would work
- **Hard-coded entity relationships**: Prefer component-based relationships over entity ID tracking
- **Complex custom logic**: Keep A2 implementations simple and focused

## Extending the System

### Adding New System Integration (A1/A2 Extension)

When extending Group A approaches, you're always adding both properties and the logic to process them:

1. **Identify the target system** where the logic should execute
2. **Add property to relevant component interface** to store the upgrade state
3. **Initialize property in component factory function** with appropriate defaults
4. **Add processing logic to the target system** that reads and acts on the property
5. **Document the integration** - which systems read the property and when
6. **Test stacking behavior** with existing upgrades and edge cases
7. **Add comprehensive logging** for debugging upgrade interactions

**Example - Adding a new armor property**:
```typescript
// Step 1-2: Add property to Health component
export interface Health {
    // ... existing properties
    SpellResistance?: number; // New: reduces magical damage by percentage
}

// Step 3: Initialize in component factory
export function health(max: number = 3) {
    return (game: Game, entity: number) => {
        game.World.Health[entity] = {
            // ... existing initialization
            SpellResistance: 0, // Default: no spell resistance
        };
    };
}

// Step 4: Add processing logic in sys_health
function calculate_armor_reduction(/* ... */) {
    // ... existing armor calculations
    
    // New spell resistance logic
    if (health.SpellResistance && damage_instance.Type === "magical") {
        let reduction = final_damage * health.SpellResistance;
        final_damage -= reduction;
        console.log(`[ARMOR] Spell resistance: ${(health.SpellResistance * 100)}% - reducing magical damage by ${reduction}`);
    }
    
    return final_damage;
}
```

### Creating New Entity Types (B1/B2 Extension)

1. Create blueprint function following existing patterns
2. Use appropriate component combinations for desired behavior
3. Test integration with existing systems (AI, combat, rendering)
4. Ensure proper cleanup and lifecycle management

This toolkit provides a comprehensive framework for designing upgrades that integrate cleanly with the existing ECS architecture while maintaining system stability and performance.

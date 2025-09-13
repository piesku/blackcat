# Tiered Upgrades Implementation Plan

This document outlines the comprehensive implementation plan for converting the current single-tier upgrade system to support 3-tier stackable upgrades, as designed in the upgrade catalog documentation.

## 1. Current Architecture Analysis

### Current Upgrade Definition (catalog.ts)

- Static `UpgradeType` objects with fixed rarity/description
- Each upgrade has a unique `UpgradeId` enum value
- Applied via switch statements in manager.ts

### Current Persistence (GameState)

- Stores `UpgradeId[]` arrays for player/opponent upgrades
- No tier information stored

### Current Application (manager.ts)

- Switch on `upgrade.Id`, apply fixed effects
- No concept of scaling with tiers

## 2. Data Structure Changes

### Upgrade Types (types.ts)

**Enhanced UpgradeType Interface:**

```typescript
interface UpgradeType {
    Id: UpgradeId;
    Category: UpgradeCategory;
    Name: string;
    Rarity: UpgradeRarity;
    Tiers: string[]; // NEW: ["Tier 1 desc", "Tier 2 desc", "Tier 3 desc"]
}

// NEW: Upgrade instance with tier
// id and tier must be lowercase to serialize without minification in localStorage
interface UpgradeInstance {
    id: UpgradeId;
    tier: number; // 1-3
}
```

### Game State Persistence (state.ts)

**Updated GameState Interface:**

```typescript
interface GameState {
    currentLevel: number;
    playerUpgrades: UpgradeInstance[]; // CHANGED: from UpgradeId[] to UpgradeInstance[]
    opponentUpgrades: UpgradeInstance[]; // CHANGED: from UpgradeId[] to UpgradeInstance[]
    availableUpgradeChoices: UpgradeInstance[]; // CHANGED: for UI display
    population: number;
    isNewRun: boolean;
    runSeed: number;
}
```

## 3. Catalog Definition Changes (catalog.ts)

### Tiered Upgrade Definitions

**Example Tiered Upgrade:**

```typescript
[UpgradeId.CombatMedic]: {
    Id: UpgradeId.CombatMedic,
    Category: UpgradeCategory.Enhancement,
    Name: "Combat Medic",
    Rarity: UpgradeRarity.Common, // Base rarity for Tier 1
    Tiers: [
        "+1 HP/s when energy >50%",    // Tier 1
        "+2 HP/s when energy >50%",    // Tier 2
        "+3 HP/s when energy >50%"     // Tier 3
    ]
},
```

### Rarity Scaling Function

**Automatic Tier Rarity Calculation:**

```typescript
function getTierRarity(baseRarity: UpgradeRarity, tier: number): UpgradeRarity {
    // Tier 1 = base rarity, Tier 2 = +1, Tier 3 = +2 (capped at Rare)
    return Math.min(UpgradeRarity.Rare, baseRarity + (tier - 1));
}
```

## 4. Upgrade Application Changes (manager.ts)

### Tier-Aware Application Logic

**Enhanced apply_enhancement_upgrade Function:**

```typescript
function apply_enhancement_upgrade(game: Game, entity: number, upgrade: UpgradeInstance) {
    let tier = upgrade.Tier;
    let ai = game.World.ControlAi[entity];
    let health = game.World.Health[entity];

    switch (upgrade.Id) {
        // Linear scaling examples
        case UpgradeId.CombatMedic:
            ai.HealingRate += 1.0 * tier; // 1/2/3
            break;

        case UpgradeId.Brawler:
            ai.DamageBonus = (ai.DamageBonus || 0) + tier; // +1/+2/+3 damage
            ai.Aggressiveness += 0.1 * tier; // +0.1/+0.2/+0.3 aggression
            break;


        case UpgradeId.Vitality:
            let healthBonus = tier + 1; // 2/3/4 HP
            health.Max += healthBonus;
            health.Current += healthBonus;
            break;

        // Non-linear scaling examples
        case UpgradeId.CombatVeteran:
            let energyValues = [0.3, 0.5, 0.8];
            ai.EnergyFromDamageDealt += energyValues[tier - 1];
            break;

        case UpgradeId.QuickDraw:
            let speedMultipliers = [1.25, 1.4, 1.6];
            ai.AttackSpeedMultiplier =
                (ai.AttackSpeedMultiplier || 1.0) * speedMultipliers[tier - 1];
            break;

        case UpgradeId.DamageReduction:
            let reductionValues = [0.15, 0.25, 0.35];
            health.DamageReduction += (1 - health.DamageReduction) * reductionValues[tier - 1];
            break;

        // ... all other tiered upgrades
    }
}
```

### Single-Tier Compatibility

**Backward Compatibility:**

```typescript
// Single-tier upgrades work unchanged
case UpgradeId.Hypermetabolism:
    ai.EnergyDecayRate *= 2.0;
    ai.HealingRate += 3.0;
    break;
```

## 5. Opponent Upgrade Selection Logic

### Upgrade Budget System

**Budget-Based Selection:**

```typescript
function generateOpponentUpgrades(arenaLevel: number, runSeed: number): UpgradeInstance[] {
    set_seed(runSeed + arenaLevel * 12345);

    let upgradeBudget = arenaLevel; // Same total "power" as before
    let selectedUpgrades: UpgradeInstance[] = [];
    let availableUpgrades = [...ALL_UPGRADES_LIST];

    while (upgradeBudget > 0 && availableUpgrades.length > 0) {
        let upgrade = selectUpgradeByRarity(availableUpgrades);
        let maxAffordableTier = Math.min(upgrade.MaxTier || 1, upgradeBudget);

        // Random tier selection (weighted toward lower tiers)
        let tier = selectRandomTier(maxAffordableTier);

        selectedUpgrades.push({Id: upgrade.Id, Tier: tier});
        upgradeBudget -= tier; // Tier 3 upgrade costs 3 budget points

        // Remove from available to prevent duplicates
        availableUpgrades = availableUpgrades.filter((u) => u.Id !== upgrade.Id);
    }

    return selectedUpgrades;
}
```

### Tier Selection Logic

**Weighted Tier Distribution:**

```typescript
function selectRandomTier(maxTier: number): number {
    // Weighted toward lower tiers: 60% Tier 1, 30% Tier 2, 10% Tier 3
    let weights = [0.6, 0.3, 0.1];
    let rand = float();

    for (let tier = 1; tier <= maxTier; tier++) {
        rand -= weights[tier - 1];
        if (rand <= 0) return tier;
    }

    return maxTier; // Fallback
}
```

## 6. Player Upgrade Selection Logic

### Upgrade Choices Generation

**Stackable Upgrade Selection:**

```typescript
function generatePlayerUpgradeChoices(
    arenaLevel: number,
    playerUpgrades: UpgradeInstance[],
    runSeed: number,
): UpgradeInstance[] {
    set_seed(runSeed + arenaLevel * 54321 + 98765);

    // Check what upgrades player already owns
    let ownedUpgradeIds = new Set(playerUpgrades.map((u) => u.Id));

    let choices: UpgradeInstance[] = [];

    for (let i = 0; i < 3; i++) {
        let availableUpgrades = ALL_UPGRADES_LIST.filter((u) => {
            if (!ownedUpgradeIds.has(u.Id)) {
                return true; // New upgrade available
            }

            // Check if we can upgrade existing upgrade to higher tier
            let existing = playerUpgrades.find((p) => p.Id === u.Id);
            return existing && existing.Tier < (u.MaxTier || 1);
        });

        if (availableUpgrades.length === 0) break;

        let selectedUpgrade = selectUpgradeByRarity(availableUpgrades);
        let existingUpgrade = playerUpgrades.find((p) => p.Id === selectedUpgrade.Id);
        let tier = existingUpgrade ? existingUpgrade.Tier + 1 : 1;

        choices.push({Id: selectedUpgrade.Id, Tier: tier});

        // Remove from pool to prevent duplicate choices
        availableUpgrades = availableUpgrades.filter((u) => u.Id !== selectedUpgrade.Id);
    }

    return choices;
}
```

### Player Upgrade Application

**Stacking Logic:**

```typescript
function applyPlayerUpgradeChoice(
    playerUpgrades: UpgradeInstance[],
    selectedUpgrade: UpgradeInstance,
): UpgradeInstance[] {
    let existingIndex = playerUpgrades.findIndex((u) => u.Id === selectedUpgrade.Id);

    if (existingIndex >= 0) {
        // Upgrade existing to higher tier
        playerUpgrades[existingIndex].Tier = selectedUpgrade.Tier;
    } else {
        // Add new upgrade
        playerUpgrades.push(selectedUpgrade);
    }

    return playerUpgrades;
}
```

## 7. UI Display Changes

### Upgrade Card Display

**Tier-Aware Upgrade Cards:**

```typescript
function renderUpgradeCard(upgrade: UpgradeInstance): string {
    let upgradeType = ALL_UPGRADES_MAP[upgrade.Id];
    let tierInfo = "";
    let description = "";

    if (upgradeType.MaxTier && upgradeType.MaxTier > 1) {
        // Tiered upgrade display
        tierInfo = `<div class="tier-badge tier-${upgrade.Tier}">Tier ${upgrade.Tier}</div>`;
        description = upgradeType.TierDescriptions[upgrade.Tier - 1];

        // Show tier progression for existing upgrades
        if (upgrade.Tier < upgradeType.MaxTier) {
            let nextTierDesc = upgradeType.TierDescriptions[upgrade.Tier];
            description += `<div class="next-tier">Next: ${nextTierDesc}</div>`;
        }
    } else {
        // Single-tier upgrade display
        description = upgradeType.Description || "";
    }

    let rarity = getTierRarity(upgradeType.Rarity, upgrade.Tier);
    let rarityClass = UpgradeRarity[rarity].toLowerCase();

    return `
        <div class="upgrade-card ${rarityClass}">
            ${tierInfo}
            <h3>${upgradeType.Name}</h3>
            <p class="description">${description}</p>
            <div class="category">${upgradeType.Category}</div>
        </div>
    `;
}
```

### Player Loadout Display

**Grouped Tier Display:**

```typescript
function renderPlayerLoadout(upgrades: UpgradeInstance[]): string {
    return upgrades
        .map((upgrade) => {
            let upgradeType = ALL_UPGRADES_MAP[upgrade.Id];
            let tierDisplay = "";

            if (upgradeType.MaxTier && upgradeType.MaxTier > 1) {
                tierDisplay = ` <span class="tier-indicator">T${upgrade.Tier}</span>`;
            }

            return `
            <div class="loadout-item">
                <span class="upgrade-name">${upgradeType.Name}</span>
                ${tierDisplay}
            </div>
        `;
        })
        .join("");
}
```

### CSS Styling

**Tier-Specific Styling:**

```css
.tier-badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.8em;
    font-weight: bold;
}

.tier-1 {
    background: #4a9;
    color: white;
} /* Common */
.tier-2 {
    background: #49a;
    color: white;
} /* Uncommon */
.tier-3 {
    background: #94a;
    color: white;
} /* Rare */

.next-tier {
    margin-top: 8px;
    font-size: 0.9em;
    opacity: 0.7;
    font-style: italic;
}

.tier-indicator {
    font-size: 0.8em;
    opacity: 0.8;
}
```

## 8. Implementation Order

### Phase 1: Data Structure Foundation

1. **Update `types.ts`** with `UpgradeInstance` interface and enhanced `UpgradeType`
2. **Update `GameState`** interface to use `UpgradeInstance[]` instead of `UpgradeId[]`
3. **Add tier utility functions** for rarity calculation and tier selection

### Phase 2: Catalog Updates

1. **Update `catalog.ts`** with `MaxTier` and `TierDescriptions` for all 24 tiered upgrades
2. **Add rarity scaling functions** and tier-aware upgrade lookup
3. **Remove deprecated upgrades** (FieldSurgeon, BattleFury) from catalog

### Phase 3: Core Logic Updates

1. **Update `manager.ts`** with tier-aware upgrade application logic
2. **Update `state.ts`** with new opponent selection algorithm using upgrade budget
3. **Update player upgrade choice generation** to support stacking

### Phase 4: UI Updates

1. **Update upgrade card rendering** to display tiers and progression
2. **Update player/opponent loadout displays** with tier indicators
3. **Add CSS styling** for tier badges and visual distinction

### Phase 5: Storage & Persistence

1. **Update `store.ts`** to handle new `UpgradeInstance[]` format
2. **Add migration logic** for existing save files (if needed)
3. **Update save/load validation** for new data structure

### Phase 6: Testing & Validation

1. **Test upgrade budget system** ensures balanced opponent generation
2. **Test UI displays** tiers correctly and shows progression
3. **Test persistence** works with new format across browser sessions
4. **Validate upgrade stacking** works correctly in combat

## Key Design Decisions

### 1. Upgrade Budget System

- **Tier 3 upgrades cost 3 "upgrade points"**, maintaining power balance
- **Early opponents** get mostly Tier 1 upgrades due to budget constraints
- **Late opponents** can afford high-tier upgrades, creating natural progression

### 2. Rarity Scaling

- **Higher tiers automatically get higher rarity**: Common → Uncommon → Rare
- **Visual distinction** helps players understand upgrade power level
- **Maintains existing rarity distribution** for game balance

### 3. Stacking System

- **Players can upgrade existing upgrades** to higher tiers when offered again
- **No duplicate upgrades** - always upgrade to next tier instead
- **Clear progression path** from Tier 1 → Tier 2 → Tier 3

### 4. Backward Compatibility

- **Single-tier upgrades** work unchanged with `MaxTier: 1`
- **Existing save files** can be migrated or gracefully degraded
- **UI gracefully handles** both single-tier and multi-tier upgrades

### 5. Mathematical Scaling

- **Linear scaling** for simple effects (CombatMedic: 1/2/3 HP/s)
- **Non-linear scaling** for complex effects (CombatVeteran: 0.3/0.5/0.8)
- **Follows single-tunable constraint** from design documentation

## Risk Mitigation

### 1. Save File Compatibility

- **Migration function** to convert old `UpgradeId[]` to `UpgradeInstance[]`
- **Fallback logic** if migration fails (start new run)
- **Version tracking** in save files for future changes

### 2. Balance Issues

- **Upgrade budget system** prevents overpowered opponents
- **Tier weights** (60/30/10) prevent too many high-tier upgrades
- **Playtesting hooks** for easy balance adjustments

### 3. UI Complexity

- **Progressive disclosure** - show tier info only when relevant
- **Clear visual hierarchy** with tier badges and progression hints
- **Fallback rendering** for edge cases

This implementation plan provides a comprehensive roadmap for converting the upgrade system to support 3-tier stackable upgrades while maintaining system balance and user experience quality.

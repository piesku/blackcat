# Game State & Upgrade Storage Architecture

This document outlines how upgrade storage, persistence, and instantiation work in 33 Duels.

## Overview

The game requires two distinct upgrade management systems:
- **Player Upgrades**: Persistent across duels, stored in localStorage, accumulate over 33 levels  
- **Opponent Upgrades**: Procedurally generated based on arena level using seeded randomization, never persisted

## Game State Structure

### Core Game State
```typescript
// src/state.ts - Game state utilities and types
interface GameState {
    currentLevel: number;           // 1-33 duels
    playerUpgrades: UpgradeType[];  // Player's accumulated upgrades
    opponentUpgrades: UpgradeType[]; // Current opponent's upgrades (for seeded generation)
    population: number;             // Narrative countdown (8 billion -> 1)
    isNewRun: boolean;              // Fresh start vs resumed
}

interface UpgradeType {
    id: string;          // "battle_axe", "scrap_armor", "last_stand", etc.
    category: UpgradeCategory;
    tier?: number;       // For power scaling (optional)
    data?: any;          // Upgrade-specific parameters (optional)
}

enum UpgradeCategory {
    Weapon = "weapon",
    Armor = "armor", 
    Ability = "ability",
    Companion = "companion",
    Special = "special"
}
```

### Population Calculation
```typescript
// Reverse history progression: 8 billion -> 1 human
function calculatePopulation(level: number): number {
    // Exponential decay: each victory halves the population
    return Math.max(1, Math.floor(8_000_000_000 / Math.pow(2, level - 1)));
}

// Level 1: 4 billion (1973)
// Level 2: 2 billion (1927)  
// Level 10: ~7.8 million (early civilization)
// Level 33: 1 human (dawn of time)
```

## Storage & Persistence

### ✅ Implemented: localStorage-Based Persistence

**Storage Location**: 
- Game state stored in browser localStorage under key "blackcat_gamestate"
- Simple JSON serialization for cross-browser compatibility
- Persists player upgrades, current level, population count, and opponent upgrades

**Persistence Triggers**:
- After duel victory (before upgrade selection screen)
- State clears automatically on defeat or manual restart
- Final victory (level 33+) automatically clears save data

**Resume Experience**:
- Players can refresh/close browser and resume exactly where they left off
- Game correctly starts in upgrade selection screen when resuming
- Players can try different upgrades against the same opponent if they reload

### Opponent Upgrades - Seeded Generation

**Generation Strategy**:
- Uses `lib/random` with `set_seed()` for consistent opponent loadouts
- Seed based on arena level: `arenaLevel * 12345 + 67890`
- Same arena level always produces the same opponent upgrades
- Ensures fair and predictable gameplay across resume sessions

**Implementation**:
```typescript
// src/state.ts
export function generateOpponentUpgrades(arenaLevel: number): UpgradeType[] {
    // Use seeded random for consistent upgrades per arena level
    set_seed(arenaLevel * 12345 + 67890);
    
    let availableUpgrades = ALL_UPGRADES.filter((upgrade) => {
        if (upgrade.category === "armor") return true;
        return ["battle_axe", "baseball_bat", "pistol", "shotgun", "sniper_rifle", "throwing_knives"].includes(upgrade.id);
    });
    
    // Shuffle array using Fisher-Yates with lib/random
    let shufflableUpgrades = shuffle(availableUpgrades);
    
    let selectedUpgrades: UpgradeType[] = [];
    let upgradeCount = arenaLevel;
    
    // Select first N upgrades from shuffled array (no duplicates)
    for (let i = 0; i < upgradeCount && i < shufflableUpgrades.length; i++) {
        selectedUpgrades.push(shufflableUpgrades[i]);
    }
    
    return selectedUpgrades;
}
```

### localStorage Integration

**Storage API**:
```typescript
// src/store.ts - Simple localStorage wrapper
export function save_game_state(state: GameState): void {
    try {
        localStorage.setItem("blackcat_gamestate", JSON.stringify(state));
        console.log("Game state saved successfully");
    } catch (error) {
        console.error("Failed to save game state:", error);
    }
}

export function load_game_state(): GameState | null {
    try {
        const stored = localStorage.getItem("blackcat_gamestate");
        if (stored) {
            const state = JSON.parse(stored);
            console.log("Game state loaded successfully", state);
            return state;
        }
    } catch (error) {
        console.error("Failed to load game state:", error);
    }
    return null;
}

export function has_game_state(): boolean {
    return localStorage.getItem("blackcat_gamestate") !== null;
}

export function clear_game_state(): void {
    localStorage.removeItem("blackcat_gamestate");
    console.log("Game state cleared");
}
```

## Instantiation Flow

### Arena Scene Setup
```typescript
// src/scenes/sce_arena.ts - Modified arena scene
export function scene_arena(game: Game, gameState?: GameState) {
    // Clear world for new duel
    game.World = new World(WORLD_CAPACITY);
    
    // Create arena environment
    // ... existing arena setup (camera, boundaries, etc.) ...
    
    // Create player with their persistent upgrades
    let player = instantiate(game, blueprint_fighter(game, true));
    apply_upgrades(game, player, gameState?.playerUpgrades || []);
    
    // Create opponent with level-appropriate random upgrades  
    let opponent = instantiate(game, blueprint_fighter(game, false));
    let opponentUpgrades = generate_random_upgrades(gameState?.currentLevel || 1);
    apply_upgrades(game, opponent, opponentUpgrades);
    
    // Position fighters for duel start
    position_fighters(game, player, opponent);
}
```

### Upgrade Application System
```typescript
// src/systems/sys_upgrade_manager.ts - New system
export function apply_upgrades(game: Game, entity: number, upgrades: UpgradeType[]) {
    // Apply upgrades in order: Armor -> Weapons -> Abilities -> Companions
    let categorized = categorize_upgrades(upgrades);
    
    // Armor first (modifies base stats)
    for (let armor of categorized.armor) {
        apply_armor_upgrade(game, entity, armor);
    }
    
    // Weapons second (adds child entities)
    for (let weapon of categorized.weapons) {
        apply_weapon_upgrade(game, entity, weapon);
    }
    
    // Abilities third (modifies system behavior)
    for (let ability of categorized.abilities) {
        apply_ability_upgrade(game, entity, ability);
    }
    
    // Companions last (spawns allied entities)
    for (let companion of categorized.companions) {
        apply_companion_upgrade(game, entity, companion);
    }
}

function apply_weapon_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    switch (upgrade.id) {
        case "battle_axe":
            let weapon = instantiate(game, blueprint_battle_axe(game));
            attach_child(game, entity, weapon);
            break;
        case "pistol":
            let gun = instantiate(game, blueprint_pistol(game));
            attach_child(game, entity, gun);
            break;
        // ... other weapons
    }
}

function apply_armor_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    let health = game.World.Health[entity];
    
    switch (upgrade.id) {
        case "scrap_armor":
            health.IgnoreFirstDamage = true;
            break;
        case "spiked_vest":
            health.ReflectDamage = (health.ReflectDamage || 0) + 1;
            break;
        case "bonus_hp":
            health.Max += 2;
            health.Current += 2;
            break;
        // ... other armor
    }
}

function apply_ability_upgrade(game: Game, entity: number, upgrade: UpgradeType) {
    // Add ability component to entity
    let abilities = game.World.Abilities[entity] || { Passive: [], Triggered: [] };
    
    switch (upgrade.id) {
        case "last_stand":
            abilities.Triggered.push(AbilityType.LastStand);
            break;
        case "shadow_trail":
            abilities.Passive.push(AbilityType.ShadowTrail);
            break;
        // ... other abilities
    }
    
    game.World.Abilities[entity] = abilities;
    game.World.Signature[entity] |= Has.Abilities;
}
```

## Randomization System

### Opponent Upgrade Generation
```typescript
// src/upgrades/generator.ts - New file  
const ALL_UPGRADES: UpgradeType[] = [
    // Weapons
    { id: "battle_axe", category: UpgradeCategory.Weapon },
    { id: "pistol", category: UpgradeCategory.Weapon },
    { id: "baseball_bat", category: UpgradeCategory.Weapon },
    { id: "throwing_knives", category: UpgradeCategory.Weapon },
    
    // Armor
    { id: "scrap_armor", category: UpgradeCategory.Armor },
    { id: "spiked_vest", category: UpgradeCategory.Armor },
    { id: "bonus_hp", category: UpgradeCategory.Armor },
    
    // Abilities
    { id: "last_stand", category: UpgradeCategory.Ability },
    { id: "ricochet", category: UpgradeCategory.Ability },
    { id: "shadow_trail", category: UpgradeCategory.Ability },
    { id: "berserker", category: UpgradeCategory.Ability },
    
    // Companions
    { id: "feral_dog", category: UpgradeCategory.Companion },
    { id: "attack_rat", category: UpgradeCategory.Companion },
    { id: "moose", category: UpgradeCategory.Companion },
    
    // Special
    { id: "black_cat", category: UpgradeCategory.Special },
];

export function generate_random_upgrades(level: number): UpgradeType[] {
    let count = Math.min(level, 33); // Level 1 = 1 upgrade, Level 33 = 33 upgrades
    let available = [...ALL_UPGRADES];
    let selected: UpgradeType[] = [];
    
    // Ensure no duplicate upgrades
    for (let i = 0; i < count && available.length > 0; i++) {
        let index = Math.floor(Math.random() * available.length);
        selected.push(available.splice(index, 1)[0]);
    }
    
    return selected;
}

export function generate_upgrade_choices(playerUpgrades: UpgradeType[], count: number = 3): UpgradeType[] {
    // Generate upgrade options for player selection
    // Exclude upgrades player already has
    let playerUpgradeIds = new Set(playerUpgrades.map(u => u.id));
    let available = ALL_UPGRADES.filter(u => !playerUpgradeIds.has(u.id));
    
    let choices: UpgradeType[] = [];
    for (let i = 0; i < count && available.length > 0; i++) {
        let index = Math.floor(Math.random() * available.length);
        choices.push(available.splice(index, 1)[0]);
    }
    
    return choices;
}
```

## IndexedDB Integration

### Database Schema
```typescript
// src/store.ts - IndexedDB wrapper
export class GameStore {
    private db: IDBDatabase | null = null;
    private readonly DB_NAME = "BlackCat";
    private readonly DB_VERSION = 1;
    
    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            
            request.onupgradeneeded = () => {
                let db = request.result;
                
                // Game state store
                if (!db.objectStoreNames.contains("gamestate")) {
                    db.createObjectStore("gamestate", { keyPath: "id" });
                }
                
                // Could add other stores later (settings, statistics, etc.)
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async saveGameState(state: GameState): Promise<void> {
        if (!this.db) throw new Error("Database not connected");
        
        let transaction = this.db.transaction(["gamestate"], "readwrite");
        let store = transaction.objectStore("gamestate");
        
        return new Promise((resolve, reject) => {
            let request = store.put({ 
                id: "current", 
                timestamp: Date.now(),
                ...state 
            });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    async loadGameState(): Promise<GameState | null> {
        if (!this.db) throw new Error("Database not connected");
        
        let transaction = this.db.transaction(["gamestate"], "readonly");
        let store = transaction.objectStore("gamestate");
        
        return new Promise((resolve, reject) => {
            let request = store.get("current");
            request.onsuccess = () => {
                let result = request.result;
                if (result) {
                    resolve({ 
                        currentLevel: result.currentLevel || 1,
                        playerUpgrades: result.playerUpgrades || [],
                        population: result.population || 8_000_000_000,
                        isNewRun: result.isNewRun || false
                    });
                } else {
                    resolve(null); // No saved state
                }
            };
            request.onerror = () => reject(request.error);
        });
    }
    
    async clearGameState(): Promise<void> {
        if (!this.db) throw new Error("Database not connected");
        
        let transaction = this.db.transaction(["gamestate"], "readwrite");
        let store = transaction.objectStore("gamestate");
        
        return new Promise((resolve, reject) => {
            let request = store.delete("current");
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}
```

## Integration with Game Flow

### Game Initialization
```typescript
// src/index.ts - Modified entry point
import { GameStore } from "./store.js";
import { scene_arena } from "./scenes/sce_arena.js";

async function initGame() {
    // Initialize storage
    let store = new GameStore();
    await store.connect();
    
    // Load or create game state
    let gameState = await store.loadGameState();
    if (!gameState) {
        gameState = createNewRun();
        await store.saveGameState(gameState);
    }
    
    // Initialize game with state
    let game = new Game();
    game.Store = store;  // Attach store to game instance
    scene_arena(game, gameState);
    game.Start();
}

function createNewRun(): GameState {
    return {
        currentLevel: 1,
        playerUpgrades: [],
        population: 8_000_000_000,
        isNewRun: true
    };
}

initGame().catch(console.error);
```

### Victory Flow
```typescript
// src/actions.ts - Enhanced action system
export const enum Action {
    NoOp,
    DuelVictory,
    UpgradeSelected,
    NewRun,
    ResumeRun
}

export async function dispatch(game: Game, action: Action, payload?: any) {
    switch (action) {
        case Action.DuelVictory:
            await handleDuelVictory(game, payload);
            break;
            
        case Action.UpgradeSelected:
            await handleUpgradeSelection(game, payload);
            break;
            
        case Action.NewRun:
            await handleNewRun(game);
            break;
    }
}

async function handleDuelVictory(game: Game, gameState: GameState) {
    // Update progression
    gameState.currentLevel++;
    gameState.population = calculatePopulation(gameState.currentLevel);
    
    // Save progress
    await game.Store.saveGameState(gameState);
    
    // Show upgrade selection UI (if not final duel)
    if (gameState.currentLevel <= 33) {
        showUpgradeSelection(game, gameState);
    } else {
        showVictoryScreen(game); // Won all 33 duels!
    }
}

async function handleUpgradeSelection(game: Game, payload: { gameState: GameState, selectedUpgrade: UpgradeType }) {
    // Add upgrade to player collection
    payload.gameState.playerUpgrades.push(payload.selectedUpgrade);
    
    // Save updated state
    await game.Store.saveGameState(payload.gameState);
    
    // Start next duel
    scene_arena(game, payload.gameState);
}
```

### Auto-Save System
```typescript
// src/systems/sys_autosave.ts - New system (optional)
export function sys_autosave(game: Game, delta: number) {
    // Auto-save every 30 seconds during combat
    game.AutoSaveTimer = (game.AutoSaveTimer || 0) + delta;
    
    if (game.AutoSaveTimer > 30.0) {
        if (game.CurrentGameState) {
            game.Store.saveGameState(game.CurrentGameState);
        }
        game.AutoSaveTimer = 0;
    }
}
```

## Error Handling & Fallbacks

### Storage Failures
```typescript
// Graceful degradation when IndexedDB fails
export class SessionGameStore {
    // Fallback to sessionStorage if IndexedDB unavailable
    private state: GameState | null = null;
    
    async saveGameState(state: GameState): Promise<void> {
        this.state = state;
        try {
            sessionStorage.setItem("blackcat_state", JSON.stringify(state));
        } catch (e) {
            console.warn("Session storage failed, using memory only");
        }
    }
    
    async loadGameState(): Promise<GameState | null> {
        if (this.state) return this.state;
        
        try {
            let stored = sessionStorage.getItem("blackcat_state");
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.warn("Failed to load from session storage");
            return null;
        }
    }
}
```

## Implementation Priority

### Phase 1: Foundation
1. **Create `store.ts`** - IndexedDB wrapper and GameState types
2. **Create `generator.ts`** - Upgrade randomization system
3. **Modify `index.ts`** - State loading and initialization
4. **Create upgrade registry** - Complete catalog of all upgrades

### Phase 2: Integration  
1. **Modify `sce_arena.ts`** - State-aware arena setup
2. **Create `sys_upgrade_manager.ts`** - Upgrade application system
3. **Enhance `actions.ts`** - Victory and upgrade selection flow
4. **Add basic UI** - Upgrade selection interface

### Phase 3: Enhancement
1. **Add auto-save system** - Periodic state persistence
2. **Add error handling** - Graceful storage failure recovery
3. **Add upgrade validation** - Prevent corrupted save states
4. **Add state migration** - Handle save file version changes

## Notes

- **Performance**: IndexedDB operations are async but should not block the game loop
- **Security**: No sensitive data is stored, just game progression
- **Compatibility**: IndexedDB supported in all modern browsers
- **Size**: Game state is small (~1-10KB), no storage concerns
- **Validation**: Always validate loaded state for corruption/tampering

This architecture provides a robust foundation for persistent player progression while maintaining the chaotic randomness that makes each duel unpredictable.

## ✅ Implemented Features (Completed)

### Game State Persistence System

The persistence system has been fully implemented with the following components:

**Technical Implementation**:
- `src/store.ts` - Simple localStorage wrapper for game state persistence
- `src/state.ts` - Shared utilities for opponent generation and population calculation  
- Enhanced `src/actions.ts` - Persistence triggers in DuelVictory, state clearing in DuelDefeat/RestartRun
- `lib/random.ts` - Added `shuffle()` function for consistent opponent generation
- Updated `src/index.ts` - Synchronous game initialization with state loading

**Key Features**:
1. ✅ **Automatic State Persistence** - Game state automatically saves after duel victories using localStorage
2. ✅ **Seamless Resume Experience** - Players can refresh/close browser and resume from upgrade selection
3. ✅ **Consistent Opponent Generation** - Seeded opponent upgrades using `lib/random` for predictable gameplay
4. ✅ **Smart State Management** - State clears on defeat/victory, saves before upgrade selection

**Usage**:
```javascript
// Game automatically saves after each duel victory
// Players can close/refresh browser and resume from upgrade selection
// Same arena level always produces same opponent loadout
// Manual save clearing via: dispatch(game, Action.ClearSave);
```

The implementation uses the existing `lib/random` seeded generation for consistency and provides console logging for debugging. All existing game mechanics remain unchanged while adding robust persistence capabilities.
# Game Flow & Progression System

This document outlines the implementation architecture for the progression system in 33 Duels.

## Architecture Overview

The progression system uses a **view-based architecture** that wraps around the existing ECS scene system:

- **Scenes** (`src/scenes/`) - Functions that populate the World with entities (existing: `sce_arena.ts`)
- **Views** - UI states that can also trigger scene creation (new: upgrade selection, victory screen, etc.)
- **Flow**: Views handle menus/overlays → Views trigger scenes → Scenes populate World with entities

## Core Game Loop

The player experiences this repeating cycle for 33 duels:

```
Upgrade Selection View (UI) 
    ↓ [player selects upgrade]
Arena Scene (World entities) 
    ↓ [combat ends]
Victory View (UI overlay) 
    ↓ [timer/button]
Upgrade Selection View (UI)
```

### Detailed Flow

1. **Upgrade Selection View**
   - Shows 3 random upgrade choices (excluding already owned)
   - Displays opponent's loadout preview
   - Player selects one upgrade
   - Triggers `scene_arena()` with updated game state

2. **Arena Scene** 
   - Existing `sce_arena.ts` functionality
   - Populates World with player and opponent entities
   - Applies upgrades to both fighters
   - Combat systems run until resolution

3. **Victory/Defeat Detection**
   - Combat resolution system detects winner
   - Triggers view transition to Victory or Defeat view
   - Updates game state (level, population, etc.)

4. **Victory View**
   - Shows victory overlay with arena background visible
   - Displays updated population count and progression info
   - Auto-advances after 5 seconds or manual button press
   - Transitions back to Upgrade Selection View

5. **Defeat View** (future)
   - Shows defeat screen
   - Offers restart option

## Implementation Plan

### Phase 1: Core Infrastructure

1. **View Management System**
   - Create view enum (UpgradeSelection, Arena, Victory, Defeat)
   - Add view state tracking to Game class (`game.CurrentView`)
   - Implement view transition functions

2. **Enhanced Action System** 
   - Add actions for victory, defeat, upgrade selection
   - Implement action handlers for view transitions
   - Add victory/defeat detection systems

3. **UI Framework Extension**
   - Extend `src/ui/App.ts` for view-specific rendering
   - Add view-based conditional UI rendering
   - Create reusable UI components for menus

### Phase 2: New Views

1. **Upgrade Selection View** 
   - Show 3 random upgrade choices (excluding owned)
   - Display opponent loadout preview
   - Handle upgrade selection and trigger `scene_arena()`

2. **Victory Screen View** 
   - Show victory overlay with arena background visible
   - Display population countdown and progression
   - Auto-advance after 5 seconds or manual button
   - Trigger next upgrade selection view

3. **Defeat Screen View**
   - Handle defeat and offer restart option

### Phase 3: Game Flow Integration

1. **Victory/Defeat Detection**
   - Add combat resolution system in `sys_health.ts`
   - Trigger view transitions from Arena to Victory/Defeat
   - Update game state on victory

2. **View-Scene Coordination**
   - Views call existing `scene_arena()` function
   - Arena scene triggers view transitions on combat end
   - Maintain game state across view/scene boundaries

### Phase 4: Polish & Testing

1. **Timer System** for auto-advance in victory view
2. **Visual Polish** for view transitions
3. **Playwright Testing** of full progression flow

## Technical Details

### View State Management

```typescript
enum GameView {
    UpgradeSelection,
    Arena,
    Victory,
    Defeat
}

interface Game {
    CurrentView: GameView;
    ViewData?: any; // View-specific data
    // ... existing properties
}
```

### Action System Extensions

```typescript
enum Action {
    // Existing
    NoOp,
    
    // New progression actions
    DuelVictory,
    DuelDefeat,
    UpgradeSelected,
    ViewTransition,
    RestartRun
}
```

### UI View Rendering

```typescript
// src/ui/App.ts
export function App(game: Game): string {
    switch (game.CurrentView) {
        case GameView.UpgradeSelection:
            return UpgradeSelectionView(game);
        case GameView.Arena:
            return ArenaHUD(game); // Existing combat UI
        case GameView.Victory:
            return VictoryView(game);
        case GameView.Defeat:
            return DefeatView(game);
    }
}
```

### Integration with Existing Systems

- **Game State**: Leverages existing `GameState` interface in `src/game.ts`
- **Upgrade System**: Uses existing upgrade application from `src/upgrades/manager.ts`
- **Combat**: Builds on existing health and combat systems
- **Arena Scene**: Keeps existing `sce_arena.ts` unchanged

## Benefits of View-Based Architecture

1. **Separation of Concerns**: UI logic separate from world/entity logic
2. **Maintains ECS Purity**: Scenes still only handle entity creation
3. **Easy Testing**: Views can be tested independently of game world
4. **Flexible**: Views can trigger any scene or combination of scenes
5. **Performance**: UI updates don't require world rebuilding

This architecture allows us to implement the complete progression system while keeping the existing combat and upgrade systems intact.
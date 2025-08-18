# GitHub Copilot Instructions for 33 Duels

## Project Overview

**33 Duels** is a fast-paced micro-roguelike auto-battler built on the Goodluck game engine. Players must win 33 consecutive duels against randomly generated opponents, choosing upgrades between battles to create strategic builds for 10-second physics-based combat encounters.

The project uses:
- **Entity-Component-System (ECS)** architecture for game logic
- **TypeScript** for type safety and developer experience
- **WebGL2** for 2D sprite rendering with instanced drawing
- **Goodluck engine** as the foundational framework

## Architecture & Key Concepts

### Entity-Component-System (ECS)
- **Entities**: Numeric IDs (indices into component arrays)
- **Components**: Data-only interfaces in `src/components/` (no methods)
- **Systems**: Logic functions in `src/systems/` that process entities
- **World**: Manages component arrays and entity signatures

### Core Principles
- **Minimal abstractions**: Favor simple, direct code over generalization
- **Performance-focused**: Uses bitwise operations, data locality, for-loops
- **Data locality**: Component data stored in arrays indexed by entity ID
- **Free functions**: Most logic as standalone functions for tree-shaking

## File Structure

```
src/
├── components/     # ECS component definitions (data structures)
├── systems/       # ECS system implementations (game logic)
├── scenes/        # Scene definitions and entity blueprints
├── ui/           # User interface components
├── sprites/      # Sprite atlas and texture management
├── upgrades/     # Upgrade system implementation
├── game.ts       # Main game class and system execution order
├── world.ts      # Project-specific world implementation
├── actions.ts    # Centralized action dispatch system
└── index.ts      # Application entry point

lib/              # Core Goodluck framework
materials/        # WebGL shaders and material definitions
docs/            # Design and technical documentation
```

## Development Patterns

### Components
- Define as TypeScript interfaces with only data properties
- Store in arrays indexed by entity ID for performance
- Use mixin functions to add components to entities
- Group related data in single components when always used together

```typescript
// Example component
export interface Transform2D {
    Translation: Vec2;
    Rotation: number;
    Scale: Vec2;
}
```

### Systems
- Implement as simple for-loops over entity queries
- Use component signatures to filter relevant entities
- Process data directly from component arrays
- Maintain execution order in `src/game.ts`

```typescript
// Example system pattern
export function sys_example(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY_MASK) === QUERY_MASK) {
            // Process entity i
        }
    }
}
```

### Scenes
- Use blueprint functions to create entity hierarchies
- Compose entities from mixins in `src/scenes/`
- Instantiate through scene functions like `scene_arena()`

## Code Style Guidelines

### TypeScript
- Use interfaces for components (data structures)
- Prefer `const` and `let` over `var`
- Use discriminated unions for type-safe polymorphism
- Add JSDoc comments for complex functions and components

### Naming Conventions
- Components: `com_transform2d.ts`, interface `Transform2D`
- Systems: `sys_render2d.ts`, function `sys_render2d()`
- Files: snake_case for filenames, PascalCase for types
- Variables: camelCase for local variables

### Performance Patterns
- Use `out` parameters in math functions to avoid allocations
- Prefer bitwise operations for component masks
- Store related data together for cache efficiency
- Use for-loops instead of functional array methods in hot paths

## Common Development Tasks

### Adding a New Component
1. Create interface in `src/components/com_new_feature.ts`
2. Add to component enum and world signature
3. Create mixin function for adding to entities
4. Update relevant systems to process the component

### Creating a System
1. Add system function in `src/systems/sys_new_system.ts`
2. Define component query mask for entity filtering
3. Add system call to execution order in `src/game.ts`
4. Use simple for-loop pattern to iterate entities

### Building Scenes
1. Create blueprint function in `src/scenes/`
2. Use component mixins to compose entities
3. Set up entity hierarchies with transforms
4. Call scene function from appropriate game state

## Development Commands

```bash
npm install       # Install dependencies
npm start         # Start dev server at http://localhost:1234
npm test          # Run lint and type check
npm run pretty    # Format code with Prettier
npm run ts:check  # Type check without emitting files
```

## Game-Specific Context

### Combat System
- AI fighters use state machine with personalities (Aggressiveness, Patience)
- Damage processed through `PendingDamage[]` arrays in `sys_health`
- Weapons activate during `AIState.Attacking` phase
- Physics-based collision and movement systems

### Upgrade System
- Categories: Weapons, Armor/Defense, Abilities, Companions, Special
- Applied through `apply_upgrades()` function in `src/upgrades/manager.ts`
- Modifies entity components during scene instantiation
- Player vs opponent upgrade randomization

### Rendering Pipeline
- 2D sprite rendering via `sys_render2d` (WebGL2 instanced drawing)
- Canvas 2D for simple shapes via `sys_draw2d`
- Sprite atlas system in `src/sprites/atlas.ts`
- Transform hierarchy via `sys_transform2d`

## Testing & Quality

- Always run `npm test` before committing changes
- Use git hooks for automatic formatting: `git config core.hooksPath scripts/hooks`
- Test both development and production builds
- Follow existing patterns and code organization
- Maintain system execution order dependencies

When working on this codebase, focus on the ECS architecture patterns, maintain performance considerations, and follow the established TypeScript and organizational conventions.
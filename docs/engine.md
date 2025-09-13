# Goodluck — Context Document

This document provides a comprehensive overview of the Goodluck game engine, including its technology stack, architecture, key principles, and guidelines for contributors. Goodluck is a template for creating small and fast browser games.

## Tech Stack

The project is built primarily with **TypeScript**, leveraging its typing system for better code quality and editor support while minimizing runtime overhead. Key technologies and libraries include:

- **TypeScript**: The primary language, using features like interfaces and const enums that compile down to efficient JavaScript.
- **WebGL2**: For rendering graphics, accessed directly without a high-level library.
- **Build Tools**:
    - esbuild: For bundling the TypeScript source code.
    - Terser: For minifying the bundled JavaScript.
    - Roadroller: For further optimizing the JavaScript code size.
    - PostHTML and htmlnano: For processing and minifying the final HTML output.
- **No external runtime libraries**: The engine is self-contained and does not rely on external game frameworks.

---

## Framework Architecture (Goodluck)

Goodluck is a repository template, not a typical library. The user generates a new repository from the template, removes unnecessary code, and modifies it as needed. This is particularly useful for optimizing code for size and when quick, specific changes are required.

### Entity-Component-System (ECS)

Goodluck implements the Entity-Component-System (ECS) architecture.

- **Components:** Game object data is stored in arrays of components, each responsible for a different concern (e.g., `Transform`, `Render`, `Collide`). Components can be dynamically added and removed during an entity's lifetime. Component data is stored in large arrays indexed by entities, which improves data locality (Structure of Arrays vs. Array of Structures). Components are defined as TypeScript interfaces to emphasize that they should only contain data, not logic (methods).
- **Entities:** These are simply indices (type `number`) into the component arrays. They also index a special `Signature` array, which for each entity stores a bitmask of currently enabled components. The maximum number of components in Goodluck is 32 due to 32-bit bitwise operations in JavaScript.
- **Systems:** These are functions called one by one, which iterate over all entities in the scene and execute logic on those entities whose signatures match the system's query mask. Game data flows in one direction, stored in component arrays and processed by systems in a deterministic order. Systems are typically simple `for` loops iterating over all entities in the scene.

The ECS architecture promotes composition over inheritance, making it easier to experiment with new gameplay ideas and maintain well-isolated behaviors as the project grows.

### Key Principles of Goodluck

- **Minimal Abstractions:** Goodluck intentionally avoids excessive abstractions, generalizations, and parameterization to keep the code simple, predictable, and fast in execution. The goal is to ship a game rather than build a generic engine.
- **Bitwise Operations:** Goodluck uses bitflags and bitmasks to store the component composition of entities. Bitwise operations are fast and simple to work with, even though the JS engine casts to 32-bit integers for these operations.
- **`for` Loops:** For iterating over entities in systems, Goodluck uses standard `for` loops, which are generally very efficient, even with tens of thousands of signatures.
- **Data Locality:** Component data is stored in large arrays (one array per component), which improves data locality and performance, similar to column-oriented databases (Structure of Arrays).
- **Math Functions with `out` Parameter:** The math library (based on glMatrix) uses a pattern where vector functions take a reference to an output vector (`out`) as the first parameter. This helps avoid short-lived memory allocations and associated GC pauses.
- **Component Mixins:** Components are added using mixin functions, which return thunks called during new entity creation. This allows modification of `Game` and `World` instances when adding a component.
- **Free Functions:** Much of Goodluck's logic is implemented as free (non-member) functions that take the object to process as the first parameter. This allows for more effective tree-shaking by build tools.
- **Repository Template:** Goodluck is designed for extreme "hackability." After generating a project from the template, the user gets all the code for any modification, without needing to worry about updates to newer versions of Goodluck.

---

## Project-Specific Architecture

The project builds upon the structure provided by Goodluck and extends it with specific elements for the chess analysis application. According to the provided files, the project is in its initial phase and primarily uses the 2D elements of the Goodluck framework.

### Directory and File Structure

- **`lib/`**: Contains core Goodluck framework modules, such as vector math (e.g., `vec2.ts`, `mat2d.ts`), rendering (e.g., `texture.ts`, `material.ts`), game logic (e.g., `game.ts`, `world.ts`), and other utilities (e.g., `aabb2d.ts`, `random.ts`).
- **`materials/`**: Definitions of materials and layouts for WebGL rendering, including 2D specifics (`layout2d.ts`, `mat_render2d.ts`).
- **`src/`**: Main application code.
    - **`actions.ts`**: Defines possible actions in the game (currently only `NoOp`).
    - **`game.ts`**: Defines the main game class, initializes the world, materials, shaders, and the main game loop with systems.
    - **`index.ts`**: Application entry point, initializes the game and scene.
    - **`world.ts`**: Defines the project-specific `World` implementation, storing component arrays and entity signatures.
    - **`tiled.ts`**: Logic for processing map data from the Tiled editor.
    - **`components/`**: ECS component definitions, e.g., `com_camera2d.ts`, `com_collide2d.ts`, `com_local_transform2d.ts`, `com_render2d.ts`, `com_rigid_body2d.ts`, etc.
    - **`maps/`**: Contains map definitions, e.g., `map_platforms.ts`.
    - **`scenes/`**: Scene definitions, e.g., `sce_platforms.ts`, `sce_stage.ts`, and "blueprints" for specific entities (`blu_camera.ts`, `blu_player.ts`, `blu_square.ts`).
    - **`sprites/`**: Graphical assets, including `atlas.ts` defining the sprite atlas.
    - **`systems/`**: ECS system implementations, e.g., `sys_camera2d.ts`, `sys_collide2d.ts`, `sys_render2d.ts`, `sys_transform2d.ts`, etc.
    - **`ui/`**: User interface components, e.g., `App.ts`.
- **`play/`**: Configured for building an optimized version of the game.

### Main Game Loop and State Management

- The **main game loop** is defined in `src/game.ts` (the `Game` class). It's responsible for initializing WebGL, resources (e.g., sprite atlas, materials), and then, in the `FrameUpdate` method, sequentially calls all systems in a predefined order.
- The **World** is defined in `src/world.ts` and inherits from `WorldImpl` in `lib/world.ts`. It stores all component data in arrays and entity signatures (bitmasks indicating which components are active for a given entity). Entities are created and destroyed using the `create_entity` and `destroy_entity` functions.
- **Scenes** (`src/scenes/`) define the initial state of the game world, creating entities and assigning components to them using "blueprints." The `instantiate` function (`lib/game.ts`) is used to create entities based on blueprints.
- **Components** (`src/components/`) define the data and state of entities. They are simple data structures (interfaces in TypeScript), and their creation logic is encapsulated in factory functions (e.g., `camera2d`, `collide2d`).
- **Systems** (`src/systems/`) contain the game logic. They iterate over entities possessing specific combinations of components (defined by `QUERY` in each system) and modify their state. The order of system calls is crucial for correct game operation and is defined in `Game.FrameUpdate()`.

### Rendering

- The project uses WebGL for 2D rendering.
- The `sys_render2d` system is responsible for drawing sprites. It uses instancing to draw all sprites in a single `drawArraysInstanced` call.
- Instance data (position, rotation, scale, color, sprite information) is stored in `World.InstanceData` and updated by `sys_transform2d`.
- The `sys_render2d_animate` system handles sprite frame animations.
- The `sys_draw2d` system allows drawing simple 2D primitives (rectangles, arcs) using the Canvas 2D API on top of the WebGL scene.
- Materials and shaders are defined in `materials/` (e.g., `mat_render2d.ts` contains shaders for 2D rendering).

### Data-Driven Design & Tiled Workflow

- The engine encourages a data-driven approach, especially for level design.
- A common workflow is to use the **Tiled Map Editor** to design levels and export them as JSON files (`.tmj`). A provided script, like `maps/tmj2map.cjs`, can then be used to convert this JSON data into a TypeScript module.
- A helper function, such as the one in `src/tiled.ts`, can then parse this module at runtime to instantiate entities and build the scene, effectively separating level design from game code.


### User Interface

- The UI is rendered using HTML elements overlaid on the game canvas.
- A `sys_ui` system is responsible for updating the UI. It typically generates an HTML string by calling various UI component functions (often located in `src/ui/`).
- To simplify the creation of HTML strings, a template literal tag `htm` is provided in `lib/html.ts`.
- The system compares the newly generated HTML string with the content from the previous frame and, if they differ, updates the DOM using `innerHTML`. This approach is simple and effective for displaying information.

### Action System

- The `actions.ts` file provides a centralized way to handle game events and state changes. This decouples the event trigger from the implementation of the resulting logic.
- It consists of two main parts:
    - An `Action` enum that defines all possible actions in the game (e.g., `NewGame`).
    - A `dispatch(game, action, payload)` function that acts as a single entry point for all actions.
- Inside `dispatch`, a `switch` statement executes the appropriate logic for the given action. This logic can modify the game state, instantiate new entities, or interact with any part of the game.
- Other systems can trigger complex game logic without needing to know the implementation details, simply by calling the `dispatch` function with the correct action and payload.

### Audio

- The framework includes a basic audio synthesis engine in `lib/audio.ts` capable of playing procedural notes with customizable instruments.
- Music and sound effects can be managed through a system like `sys_audio_source.ts`, which can play back predefined note sequences.
- The project can include a workflow for converting music data from formats like JSON into TypeScript modules that can be directly imported and used by the audio system.

### State Persistence

- The engine template includes helpers for saving and loading the game state.
- `src/store.ts` provides a simple wrapper around **IndexedDB**, offering functions to connect to the database and get or put the `World` object.
- A system like `sys_save.ts` can be implemented to periodically call the store functions, automatically saving the player's progress in the background.

---

## Identified Good Practices

- **Separation of Concerns:** The ECS architecture naturally promotes the separation of data (components) from logic (systems).
- **Use of TypeScript:** Provides type safety and improves code readability. All main game logic files are `.ts` files.
- **Discriminated Unions:** TypeScript's discriminated union pattern is used extensively for type-safe polymorphic data structures (see TypeScript Patterns section below).
- **Modularity:** The code is divided into logical modules (e.g., `lib`, `src/components`, `src/systems`, `src/scenes`), which facilitates project management and development.
- **In-code Documentation:** Many component and system files contain JSDoc comments explaining their purpose and usage (e.g., `com_camera2d.ts`, `sys_transform2d.ts`). HTML files describing the Goodluck framework are also available.
- **Emphasis on Performance:**
    - Avoiding unnecessary memory allocations (e.g., the `out` parameter pattern in math functions).
    - Using bitwise operations for component masks.
    - Instanced rendering for 2D sprites in `sys_render2d`.
    - A fast path in `sys_transform2d` for entities without `SpatialNode2D`.
- **Configurability and "Hackability":** Because Goodluck is a repository template, all code is available for modification.
- **Build Process:** The project uses `esbuild` for building and serving the development application and a `Makefile` for creating an optimized production version, which includes inlining resources into a single HTML file. Tools like `terser` and `roadroller` are used for code minification and optimization.
- **Use of Free Functions:** As mentioned in the Goodluck documentation, using free functions instead of class methods facilitates tree-shaking and reduces the final bundle size.
- **Clearly Defined Project Structure:** The division into directories like `lib`, `src`, `materials`, `designs`, etc., facilitates navigation.
- **Dependency Management:** Use of `package.json` for managing project dependencies (e.g., `esbuild`, `typescript`).

---

## TypeScript Patterns

### Discriminated Unions for Type Safety

The project makes extensive use of TypeScript's discriminated union pattern for creating type-safe polymorphic data structures. This pattern eliminates the need for defensive programming and provides compile-time guarantees about property access.

#### Pattern Structure

```typescript
// Define the discriminator
export const enum WeaponKind {
    Melee,
    Ranged,
}

// Define specific interfaces with discriminator property
export interface WeaponMelee {
    Kind: WeaponKind.Melee;  // Discriminator
    Damage: number;
    Range: number;
    Cooldown: number;
    LastAttackTime: number;
    Knockback: number;        // Melee-specific property
    Arc: number;              // Melee-specific property
}

export interface WeaponRanged {
    Kind: WeaponKind.Ranged;  // Discriminator
    Damage: number;
    Range: number;
    Cooldown: number;
    LastAttackTime: number;
    ProjectileSpeed: number;  // Ranged-specific property
    ProjectileCount: number;  // Ranged-specific property
    Spread: number;           // Ranged-specific property
}

// Create the union type
export type Weapon = WeaponMelee | WeaponRanged;
```

#### Automatic Type Narrowing in Switch Statements

TypeScript automatically narrows the union type within each case block, eliminating the need for type guards:

```typescript
// ❌ OLD: Defensive programming with type guards
function execute_melee_attack(weapon: Weapon) {
    if (weapon.Kind !== WeaponKind.Melee) return; // Unnecessary guard
    
    // Now we can access melee properties...
    if (weapon.Knockback > 0) { /* ... */ }
}

// ✅ NEW: Use discriminated union pattern
switch (weapon.Kind) {
    case WeaponKind.Melee:
        // TypeScript knows weapon is WeaponMelee here
        execute_melee_attack(weapon); // No type guard needed!
        break;
    case WeaponKind.Ranged:
        // TypeScript knows weapon is WeaponRanged here
        execute_ranged_attack(weapon); // No type guard needed!
        break;
}

function execute_melee_attack(weapon: WeaponMelee) {
    // Direct access to melee properties - TypeScript enforces correctness
    if (weapon.Knockback > 0) { /* ... */ }
    // weapon.ProjectileCount; // ❌ Compile error - property doesn't exist
}

function execute_ranged_attack(weapon: WeaponRanged) {
    // Direct access to ranged properties - TypeScript enforces correctness
    for (let i = 0; i < weapon.ProjectileCount; i++) { /* ... */ }
    // weapon.Knockback; // ❌ Compile error - property doesn't exist
}
```

#### Benefits

1. **Compile-time Safety**: TypeScript catches property access errors at build time
2. **No Runtime Overhead**: No defensive type checking needed at runtime
3. **IntelliSense Support**: IDEs provide accurate autocomplete for each specific type
4. **Maintainability**: Adding new properties to specific weapon types is safe and explicit
5. **Refactoring Safety**: Changes to discriminated union members are caught by the compiler

#### Usage in Game Development

This pattern is particularly useful for:
- **Component variants** (different types of AI, weapons, abilities)
- **Event systems** (different event types with different payloads)
- **State machines** (different states with state-specific data)
- **Serialization** (different data formats with type-specific handling)

The discriminated union pattern exemplifies TypeScript's strength in providing zero-cost abstractions that improve code safety without runtime performance penalties.

---

## ECS Design Patterns

### Component Data Locality and Aggregation

When designing components, prefer **aggregating related data** within a single component rather than splitting it across multiple components. This improves data locality, reduces ECS complexity, and leads to cleaner code.

#### ❌ Anti-Pattern: Over-Componentization

```typescript
// DON'T: Split related data across multiple components
interface Health {
    Max: number;
    Current: number;
    IsAlive: boolean;
}

interface PendingDamage {  // ❌ Separate component for related data
    Instances: DamageInstance[];
}

// This requires:
// - Extra component in World arrays
// - Additional Has.PendingDamage signature 
// - Helper functions like add_damage()
// - More complex system queries (Has.Health | Has.PendingDamage)
```

#### ✅ Best Practice: Aggregate Related Data

```typescript
// DO: Keep related data together in a single component
interface Health {
    Max: number;
    Current: number;
    IsAlive: boolean;
    
    // Armor properties (upgrade system)
    ReflectDamage?: number;
    DamageReduction?: number;
    
    // Pending damage instances (processing system)
    PendingDamage: DamageInstance[];  // ✅ Part of health data
}

// Systems can write directly to the component:
health.PendingDamage.push({
    Amount: damage,
    Source: attacker_entity,
    Type: "projectile"
});
```

#### When to Use Multiple Components vs. Single Component

**Use separate components when:**
- Data has **different lifecycles** (e.g., `Transform` vs `Lifespan`)
- Components are **truly independent** (e.g., `Render2D` vs `Collide2D`)
- You need **optional/conditional** behavior (e.g., `Weapon` only on some entities)

**Keep data in one component when:**
- Data is **logically related** (health + damage processing)
- Data is **always used together** (position + rotation + scale in `Transform`)
- Separating would require **artificial coordination** between components

#### Benefits of Data Aggregation

1. **Better Data Locality**: Related data is stored contiguously in memory
2. **Simpler ECS Structure**: Fewer component arrays to manage
3. **Direct Access**: No need for helper functions or indirection
4. **Cleaner Queries**: Systems need fewer component signatures
5. **Fewer Files**: Less code to maintain and fewer imports

This pattern reflects Goodluck's principle of **minimal abstractions** – avoid creating complexity where simple, direct solutions work better.

---

## Summary for New Collaborators and AI Agents

This project is built on the Goodluck framework, which uses an Entity-Component-System architecture. Key concepts include:

- **ECS**: Entities are identifiers, components store data, and systems implement logic. Familiarize yourself with the files in src/components/ and src/systems/.
- **Good Practices**: Adhere to Goodluck's emphasis on minimal abstractions, direct data manipulation in component arrays, and the use of simple for loops within systems to maintain performance and code simplicity.
- **Data Flow**: Systems are called in a specific order in src/game.ts, processing data from components.
- **2D Rendering:** Primarily through `sys_render2d` using WebGL and a sprite atlas (`src/sprites/atlas.ts`).
- **TypeScript**: All code is written in TypeScript, ensuring type safety.
- **Project Structure**: Review the directory structure outlined above to understand where different parts of the code are located.

Pay attention to comments in the code, especially in component and system files, which often explain their functionality. The project is under development but already demonstrates many good programming practices.

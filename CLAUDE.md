# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "33 Duels", a fast-paced micro-roguelike auto-battler built on the Goodluck game engine. The project uses an Entity-Component-System (ECS) architecture and is designed for extreme hackability and performance.

Find out more about the game design and the implementation details in `docs/`.

## Development Commands

### Local Development

Assume that the local dev server is already running. If it isn't, you can start it with the following commands:

```bash
npm install       # Install dependencies
npm start         # Start dev server at http://localhost:1234
```

### Code Quality

```bash
npm test          # Run lint and type check
npm run lint      # Check code formatting with Prettier
npm run pretty    # Format code with Prettier
npm run ts:check  # Type check without emitting files
npm run ts:watch  # Watch mode for type checking
```

Always run `npm test` before committing changes to ensure code quality.

## Architecture

### Entity-Component-System (ECS)

- **Entities**: Simple numeric IDs (indices into component arrays)
- **Components**: Data-only interfaces stored in arrays (`src/components/`)
- **Systems**: Logic functions that iterate over entities (`src/systems/`)
- **World**: Manages component arrays and entity signatures (`src/world.ts`)

### Key Directories

- `lib/`: Core Goodluck framework (math, rendering, input, etc.)
- `src/components/`: ECS component definitions (data structures)
- `src/systems/`: ECS system implementations (game logic)
- `src/scenes/`: Scene definitions and entity blueprints
- `materials/`: WebGL shaders and material definitions
- `play/`: Production build configuration

### Core Files

- `src/game.ts`: Main game class, system execution order
- `src/world.ts`: Project-specific world implementation
- `src/index.ts`: Application entry point
- `src/actions.ts`: Centralized action dispatch system

## Goodluck Principles

- **Minimal abstractions**: Favor simple, direct code over generalization
- **Performance-focused**: Uses bitwise operations, data locality, for-loops
- **Component mixins**: Components added via mixin functions
- **Free functions**: Most logic as standalone functions for tree-shaking
- **Math with `out` parameters**: Avoid memory allocations in math operations

## 2D Rendering Pipeline

The project is 2D-focused and uses:

- WebGL2 for sprite rendering via `sys_render2d` (instanced drawing)
- Canvas 2D API for simple shapes via `sys_draw2d`
- Sprite atlas system in `src/sprites/atlas.ts`
- Transform hierarchy via `sys_transform2d`

## Data-Driven Workflow

- Use Tiled Map Editor for level design (export as .tmj)
- Convert maps with `util/tiled_tmj2map.cjs`
- Scene instantiation via blueprints in `src/scenes/`

## Development Guidelines

- Follow existing code patterns and naming conventions
- Components should be data-only (no methods)
- Systems should be simple for-loops over entity queries
- Use TypeScript interfaces for components
- Maintain system execution order in `src/game.ts`
- Test with both `npm test` and production builds before committing

## AI Agent Testing with Playwright

AI agents should use Playwright to verify changes by testing the running game in a browser.

### Setup Playwright MCP

```bash
# Install Playwright (if not already installed)
npm install playwright
npx playwright install

# Enable Playwright MCP in Claude Code
claude mcp add playwright npx '@playwright/mcp@latest'
```

### Testing Workflow

1. Start the dev server: `npm start` (if not already running)
2. Navigate to `http://localhost:1234/src/` (game runs in src/ directory)
3. Use Playwright MCP tools to:
    - Take screenshots to verify visual changes
    - Click elements to test interactions
    - Check game state and UI elements
    - Verify performance stats display correctly
    - Ensure no console errors appear

This visual verification complements code testing and catches rendering/interaction issues that unit tests might miss.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "33 Duels", a fast-paced micro-roguelike auto-battler built on the Goodluck game engine. The project uses an Entity-Component-System (ECS) architecture and is designed for extreme hackability and performance.

## Design and Architecture

Find out more about the game design and the code architecture in the `docs/` directory:

- Game design document: @docs/design.md
- Overview of the Goodluck engine: @docs/engine.md
- Upgrade system design: @docs/upgrades.md
- Fighter AI state machine: @docs/ai.md
- Game flow and progression: @docs/flow.md
- Game state management: @docs/state.md
- Bundle build system and size optimization: @docs/bundle.md

## Development Commands

### Local Development

Assume that the local dev server is already running at http://localhost:1234.

### Code Quality

```bash
npm test          # Run lint and type check
npm run lint      # Check code formatting with Prettier
npm run pretty    # Format code with Prettier
npm run ts:check  # Type check without emitting files
```

Always run `npm test` before committing changes to ensure code quality.

## Development Guidelines

- Follow existing code patterns and naming conventions
- Components should be data-only (no methods)
- Use TypeScript interfaces for components
- Systems should be simple for-loops over entity queries
- Maintain system execution order in `src/game.ts`
- Test with `npm test` before committing

## Testing with Playwright

AI agents should use Playwright to verify changes by testing the running game in a browser.

1. Navigate to `http://localhost:1234/src/` (game runs in src/ directory)
2. Use Playwright MCP tools to:
    - Take screenshots to verify visual changes
    - Click elements to test interactions
    - Check game state and UI elements
    - Verify performance stats display correctly
    - Ensure no console errors appear

This visual verification complements code testing and catches rendering/interaction issues that unit tests might miss.

## Memories

- Wait for my explicit approval before committing your changes.

- Always use proper TypeScript types instead of 'any' to ensure type safety.

- Never run the dev server. it alwasy runs in background

- Always use the proper vector math functions from lib/vec2, lib/vec3, and lib/vec4 instead of writing your own.
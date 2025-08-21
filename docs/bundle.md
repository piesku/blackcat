# Bundle Build System & Size Optimization

This document outlines the build pipeline for 33 Duels and the techniques used to achieve minimal bundle sizes for web distribution.

## Build Pipeline Overview

```bash
make -C play index.zip
```

**Production Pipeline:**

1. **esbuild** - Bundle TypeScript to JavaScript
2. **Terser** - JavaScript minification and dead code elimination
3. **Roadroller** - Advanced compression and code golf optimizations
4. **PostHTML + htmlnano** - HTML minification and asset inlining

## Bundle Size Optimization Techniques

### 1. DEBUG Label Stripping

```typescript
// Development: Full assertions with error messages
DEBUG: if (!component) throw new Error("missing component");

// Production: Completely removed by esbuild
// (empty - no runtime overhead)
```

**Benefits:**

- Eliminates all debug assertions from production builds
- Reduces bundle size by removing error handling code
- Zero runtime performance impact in production
- Maintains full debugging capabilities in development

### 2. Tree Shaking

**Free Functions Pattern:**

```typescript
// ✅ Good - easily tree-shaken
export function vec2_add(out: Vec2, a: Vec2, b: Vec2) { ... }

// ❌ Avoid - harder to tree-shake
export class Vector2 {
  add(other: Vector2) { ... }
}
```

### 4. Component Architecture for Size

**Data-Only Components (Zero Runtime Cost):**

```typescript
interface Health {
    Max: number;
    Current: number;
    IsAlive: boolean;
    PendingDamage: DamageInstance[]; // Aggregate related data
}
```

**Benefits:**

- No class constructors or methods in bundle
- Direct property access (no getter/setter overhead)
- Easier for minifiers to optimize
- Better data locality for performance

### 5. ECS Bitwise Operations

**Efficient Component Queries:**

```typescript
const QUERY = Has.Transform | Has.Render | Has.Health;

// Compiles to efficient bitwise operations
if ((entity_signature & QUERY) === QUERY) {
    // Process entity
}
```

**Size Benefits:**

- Component masks are compile-time constants
- Bitwise operations are extremely compact
- No runtime reflection or string-based lookups

### 6. Const Enums for Configuration

```typescript
// Compiles to inline constants, not runtime objects
export const enum WeaponKind {
  Melee,    // → 0
  Ranged,   // → 1
}

// Usage compiles to direct number comparisons
if (weapon.Kind === WeaponKind.Melee) { ... }
// → if (weapon.Kind === 0) { ... }
```

### 7. Build Tool Configuration

**Multi-Stage Build Pipeline (`play/Makefile`):**

```makefile
# Stage 1: esbuild bundling
npx esbuild ../src/index.ts \
    --define:DEBUG=false \     # Strip DEBUG labels at compile time
    --drop:console \           # Remove console statements
    --drop-labels=DEBUG \      # Remove DEBUG: labeled statements
    --target=es2022 \          # Modern JS target
    --bundle                   # Single file output

# Stage 2: Remove indents + custom transformations
sed -f sed.txt game.esbuild.js > game.sed.js

# Stage 3: Terser aggressive minification
npx terser game.sed.js \
    --ecma 2022 \              # Modern ECMAScript target
    --mangle toplevel \        # Mangle top-level names
    --mangle-props keep_quoted,regex=/^[A-Z]/ \  # Mangle properties (preserve quoted/capitalized)
    --compress $(shell paste -sd, terser_compress.txt)

# Stage 4: Roadroller extreme compression
npx roadroller -O2 game.terser.js -o game.roadroller.js

# Stage 5: HTML inlining and final compression
node posthtml.cjs game.html > index.html
```

**Terser Compression Settings (`play/terser_compress.txt`):**

```
passes=3          # Multiple optimization passes
ecma=2022         # Use modern ECMAScript features
drop_console      # Remove all console.* calls
pure_getters      # Assume getters are side-effect free
toplevel          # Mangle top-level scope
unsafe            # Enable unsafe optimizations
unsafe_math       # Unsafe math optimizations
hoist_funs        # Hoist function declarations
```

**Roadroller Advanced Compression:**

- **-O1**: Fast compression (development builds)
- **-O2**: Maximum compression (release builds)
- Advanced string compression using LZ algorithms
- JavaScript code golf transformations
- Bytecode-style optimizations for repetitive patterns

**Final ZIP Packaging:**

```bash
7zz a -mx=9 -mfb=256 -mpass=15 index.zip index.html  # Maximum 7zip compression
advzip --recompress --shrink-insane index.zip        # Additional ZIP optimization
```

---

This build system achieves the optimal balance between development experience and production performance, enabling rapid iteration while maintaining tiny bundle sizes suitable for web distribution and game jams.

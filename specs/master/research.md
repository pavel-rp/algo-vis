# Research: Algorithm Visualizer Framework

**Feature**: 001-visualizer-framework
**Date**: 2025-10-05

## Purpose

Resolve technical unknowns and establish best practices for the algorithm visualization framework built with Svelte 5, TypeScript, and plugin architecture.

---

## Research Areas

### 1. Svelte 5 Runes for Visualization State Management

**Decision**: Use Svelte 5 runes (`$state`, `$derived`, `$effect`) for playback controller and frame navigation

**Rationale**:
- **`$state`** for mutable reactive state (current frame index, play/pause status, speed)
- **`$derived`** for computed values (current frame object, progress percentage, step metrics)
- **`$effect`** for playback interval management and frame transitions
- Explicit reactivity model prevents accidental re-renders during animation loops
- Fine-grained reactivity updates only changed DOM nodes (critical for 60fps requirement)

**Alternatives Considered**:
- **Svelte stores (writable, derived)**: Legacy approach, less explicit, harder to track dependencies
- **External state library (Zustand, Jotai)**: Unnecessary complexity, Svelte 5 runes sufficient
- **React-style useState hooks**: Not available in Svelte, runes are the native solution

**Implementation Notes**:
- `PlaybackController` class will use `$state.raw()` for frame arrays to prevent deep reactivity on large traces
- Smart sampling logic (>5k frames) will run once during trace generation, not reactively

---

### 2. Canvas vs DOM for Grid Visualization

**Decision**: **Hybrid approach** - DOM for controls/UI, HTML5 Canvas for grid cells (20×20+)

**Rationale**:
- **DOM (Svelte components)** for grids ≤10×10: Easier debugging, CSS animations, hover states
- **HTML5 Canvas** for grids >10×10: Meets 60fps requirement, handles 400 cells smoothly
- Canvas renders entire grid as single bitmap, avoiding 400 DOM nodes
- Svelte can still manage Canvas imperatively via `$effect` watching frame changes

**Alternatives Considered**:
- **Pure DOM with Svelte transitions**: Works for small grids, but 20×20 = 400 divs causes jank
- **Pure Canvas for everything**: Loses accessibility, harder to implement controls
- **WebGL**: Overkill for 2D grids, adds complexity without visual benefit

**Implementation Notes**:
- GridRenderer component will detect grid size and switch rendering strategy
- Canvas mode uses `requestAnimationFrame` for smooth transitions
- DOM mode uses Svelte's built-in `transition:fade` and `animate:flip`

---

### 3. Monaco Editor Integration with Svelte 5

**Decision**: Use `@monaco-editor/loader` with Svelte `bind:this` + `$effect` for lifecycle management

**Rationale**:
- Monaco requires imperative setup (not declarative Svelte component)
- `$effect` runs after DOM mount, perfect for initializing Monaco
- Code highlighting sync requires Monaco's `deltaDecorations` API called from `$effect` watching `currentFrame`
- Pseudocode generation (FR-019a) writes to Monaco model programmatically

**Alternatives Considered**:
- **svelte-monaco package**: Outdated, not compatible with Svelte 5 runes
- **Embed Monaco in iframe**: Loses theming control, communication overhead
- **CodeMirror instead of Monaco**: Less feature-rich, weaker TypeScript support

**Implementation Notes**:
- Monaco editor instance stored in `$state` for reactive highlighting updates
- Pseudocode generator runs once per trace, cached in plugin metadata
- Syntax highlighting uses Monaco's built-in pseudocode/plaintext mode

---

### 4. Plugin Registration Architecture

**Decision**: **File-based convention** - plugins in `src/plugins/{algorithmId}/index.ts` with TypeScript interface

**Rationale**:
- Each plugin exports `AlgorithmPlugin` interface (trace fn, validator, presets, optional code)
- Framework auto-discovers plugins via Vite's `import.meta.glob` at build time
- Type-safe contract enforced by TypeScript, runtime validation for user-added plugins
- SvelteKit's file-based routing NOT used (plugins are logic, not pages)

**Alternatives Considered**:
- **Runtime plugin loading (dynamic import)**: Requires build system complexity, harder to type-check
- **Central registry file**: Single point of failure, merge conflicts for multi-developer teams
- **NPM packages per plugin**: Over-engineering for initial release, deferred to v2

**Implementation Notes**:
- `AlgorithmPlugin` interface in `src/lib/types/plugin.ts`
- Core framework validates plugin schema at registration (Zod for runtime safety)
- Trapping Rain Water II ships as `src/plugins/trapping-rain-water-ii/index.ts`

---

### 5. Smart Sampling Strategy for Large Traces

**Decision**: **Adaptive stride sampling** - linearly interpolate from 1x (≤5k frames) to 10x (50k frames)

**Rationale**:
- Maintains first, last, and milestone frames (e.g., array fully sorted, heap empty)
- Stride increases gradually: `stride = Math.ceil(totalFrames / 5000)`
- Preserves visual continuity better than random sampling or fixed percentile selection
- Description text updated to indicate skipped intermediate steps (e.g., "Steps 145-152: continuing expansion...")

**Alternatives Considered**:
- **Hard cap at 5k frames**: Truncates execution, user misses algorithm completion
- **Uniform random sampling**: Loses temporal coherence, confusing for learners
- **Keyframe-only (milestone detection)**: Requires algorithm-specific logic, breaks plugin simplicity

**Implementation Notes**:
- Sampling runs in `TraceProcessor.sample(frames, maxFrames)` utility
- Original full trace discarded after sampling to save memory
- Status panel shows "Sampled: showing 1 of every N steps" indicator

---

### 6. Tailwind CSS v4 Best Practices for Component Theming

**Decision**: Use CSS custom properties (`--color-primary`, `--spacing-grid`) with Tailwind utilities

**Rationale**:
- Tailwind v4 supports arbitrary values: `bg-[var(--color-primary)]`
- Dark mode toggled via `<html class="dark">` with CSS variable overrides
- Component-scoped styles in `<style>` tags for visualization-specific CSS (Canvas, Monaco)
- Avoid @apply in components (Tailwind v4 recommendation), use utility classes directly

**Alternatives Considered**:
- **Tailwind v3 with JIT**: Missing v4's native CSS variable support
- **Pure CSS modules**: Loses Tailwind's design system, more verbose
- **Styled-components equivalent (svelte-styled-components)**: Not idiomatic for Svelte 5

**Implementation Notes**:
- Theme variables defined in `src/app.css` (`:root` and `.dark`)
- Grid cell colors use semantic CSS vars: `--cell-focus`, `--cell-neighbor`, `--cell-visited`
- Responsive grid layout uses Tailwind's container queries (new in v4)

---

### 7. Testing Strategy: Vitest + Playwright Integration

**Decision**: **Vitest for unit/integration, Playwright for E2E visual regression**

**Rationale**:
- **Vitest**: Fast, Vite-native, tests pure functions (trace generation, sampling, validation)
- **Playwright**: E2E tests for playback controls, screenshot comparison for visual regression
- Contract tests verify plugin interface compliance (trace schema validation)
- Visual regression compares Canvas snapshots at key frames (golden images in repo)

**Alternatives Considered**:
- **Jest**: Slower, requires extra config for ES modules and Svelte
- **Cypress**: Less robust for Canvas testing, Playwright has better screenshot diffing
- **Storybook for visual testing**: Used for component docs, not automated regression

**Implementation Notes**:
- Vitest config: `src/lib/**/*.test.ts` for unit tests
- Playwright config: `tests/e2e/**/*.spec.ts` for acceptance scenarios
- Visual baseline snapshots stored in `tests/visual-baselines/`
- CI runs Playwright with `--update-snapshots` flag on main branch merges

---

## Technology Stack Summary

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Frontend Framework** | Svelte 5 (SvelteKit) | 5.x | Component model, routing, SSR capability |
| **Language** | TypeScript | 5.x | Type safety for plugin contract, frame schemas |
| **Build Tool** | Vite (via SvelteKit) | 5.x | Fast HMR, ES module bundling |
| **State Management** | Svelte 5 Runes | Native | Explicit reactivity for playback controller |
| **Animation** | Svelte transitions + Canvas | Native | Declarative for DOM, imperative for Canvas |
| **Rendering** | HTML5 Canvas API | Native | Grid visualization >10×10 cells |
| **Code Editor** | Monaco Editor | Latest | Syntax highlighting, pseudocode display |
| **Styling** | Tailwind CSS v4 | 4.x | Utility-first CSS, CSS variable theming |
| **Unit Testing** | Vitest | Latest | Fast, Vite-native test runner |
| **E2E Testing** | Playwright | Latest | Visual regression, acceptance tests |
| **Package Manager** | pnpm | 9.x | Fast, disk-efficient installs |
| **Component Docs** | Storybook (Svelte CSF) | 8.x | Interactive component examples |

---

## Open Questions Resolved

1. **How to handle frame transitions in Canvas mode?**
   → Use `requestAnimationFrame` loop interpolating between frames with easing functions

2. **Should plugins be hot-reloadable during development?**
   → Yes, Vite HMR works for `src/plugins/**/*.ts` changes automatically

3. **How to validate plugin schemas at runtime?**
   → Use Zod schemas matching TypeScript interfaces for runtime safety

4. **Can Monaco Editor support custom pseudocode syntax?**
   → Yes, register custom language with basic keyword highlighting

5. **How to persist user theme preferences?**
   → Use `localStorage` with SvelteKit's `browser` check for SSR safety

---

## Next Steps

Proceed to **Phase 1: Design & Contracts** with research conclusions applied to:
- Data model definitions (Frame, Trace, Plugin interfaces)
- API contracts (plugin registration, trace validation)
- Component architecture (PlaybackController, GridRenderer, CodePanel)
- Quickstart guide (creating first custom algorithm plugin)

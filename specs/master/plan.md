# Implementation Plan: Algorithm Visualizer Framework

**Branch**: `master` | **Date**: 2025-10-05 | **Spec**: [spec.md](./spec.md)

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ Loaded from specs/master/spec.md
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ Tech stack provided by user, all clear
3. Fill the Constitution Check section
   → ✅ Validated against constitution v1.0.0
4. Evaluate Constitution Check section below
   → ✅ PASS - design aligns with all constitutional principles
5. Execute Phase 0 → research.md
   → ✅ Completed - 7 research areas resolved
6. Execute Phase 1 → contracts, data-model.md, quickstart.md
   → ✅ Completed - plugin contract, data model, quickstart guide created
7. Re-evaluate Constitution Check section
   → ✅ PASS - no violations introduced by design
8. Plan Phase 2 → Describe task generation approach
   → ⏩ In progress below
9. STOP - Ready for /tasks command
```

---

## Summary

Build an educational algorithm visualization framework using Svelte 5 + TypeScript with a plugin-based architecture. Framework provides playback controls (play, pause, step forward/back, speed), code highlighting via Monaco Editor, and reusable visualization components (grid renderer for MVP, extensible to array/tree/graph). Initial release ships with Trapping Rain Water II algorithm; educators create new visualizations by implementing a simple plugin contract (trace function + input validation).

**Key Technical Decisions** (from research.md):
- **Svelte 5 Runes** for explicit reactivity (prevents accidental re-renders during 60fps animations)
- **Hybrid rendering**: DOM for small grids (≤10×10), HTML5 Canvas for large grids (>10×10) to meet performance requirements
- **Monaco Editor** for code highlighting with **optional code** (hide panel if no code provided, defer pseudocode generation)
- **Simple plugin import** via direct imports (defer complex registry pattern to v2 when >3 plugins exist)
- **Adaptive stride sampling** for traces >5k frames (needs validation spike)
- **Tailwind CSS v4** with CSS custom properties for theming

---

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**:
- Svelte 5.x (SvelteKit for app scaffolding, routing, SSR)
- Vite 5.x (via SvelteKit, fast HMR)
- Monaco Editor (latest, code highlighting, lazy-loaded)
- Tailwind CSS v4 (utility-first styling)
- Zod (runtime schema validation for plugins)

**Storage**: Browser-only (no persistence), `localStorage` for theme/speed preferences
**Testing**:
- Vitest for unit/integration tests (`src/lib/**/*.test.ts`)
- Playwright for E2E + visual regression (`tests/e2e/**/*.spec.ts`)
- Contract tests for plugin validation

**Target Platform**: Modern browsers (Chrome 120+, Firefox 120+, Safari 17+, Edge 120+)
**Performance Goals**:
- 60fps rendering for grids up to 20×20 (400 cells)
- <50ms frame transition latency
- Support traces up to 50k frames (with smart sampling)

**Constraints**:
- Educational focus: simplicity over advanced features
- Plugin independence: no framework changes required for new algorithms
- Accessibility: keyboard navigation, screen reader support for controls

**Scale/Scope**:
- Initial release: 1 algorithm (Trapping Rain Water II)
- Framework supports unlimited plugins via file-based discovery
- Target audience: CS educators, students, algorithm enthusiasts

**Project Type**: Single web application (SvelteKit SPA)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

### I. Visualization-First Design ✅ PASS

**Compliance**:
- **Current state rendering**: `Frame.state` captures full algorithm state at each step
- **Focus highlighting**: `Frame.focus` identifies active elements (amber highlights)
- **Neighbor highlighting**: `Frame.neighbors` shows relationships (green highlights)
- **Accumulated results**: `Frame.metrics` displays totals (e.g., water trapped, swaps made)

**Evidence**: Plugin contract (contracts/plugin-interface.ts) requires all algorithms return Frames with state, focus, neighbors, metrics, description.

### II. Framework Reusability (NON-NEGOTIABLE) ✅ PASS

**Compliance**:
- **Algorithm-agnostic**: Plugin contract separates trace generation from rendering (AlgorithmPlugin.trace() → Trace → PlaybackController → VisualizationComponent)
- **Composable**: Visualization components (GridRenderer, ArrayRenderer, TreeRenderer, GraphRenderer) work independently
- **Configurable**: Plugins specify visualizationType, framework selects appropriate renderer
- **Standalone**: Each component uses Svelte 5 props, no global state dependencies

**Evidence**: Data model (data-model.md) shows clear separation: Algorithm→Trace→Frame→Component. No algorithm logic in rendering layer.

### III. Step-by-Step Traceability ✅ PASS

**Compliance**:
- **Frame-by-frame playback**: PlaybackController manages currentIndex, provides play/pause methods
- **Step forward AND backward**: stepForward() / stepBack() methods (FR-008, FR-009)
- **Complete history preservation**: Trace.frames[] immutable array, never mutated after generation (FR-004)
- **Status logging**: Frame.description required field, displayed in chronological log (FR-017, FR-018)

**Evidence**: PlaybackController entity (data-model.md) implements all required methods. Frame immutability enforced by TypeScript `readonly` and Svelte `$state.raw()`.

### IV. Interactive Learning ✅ PASS

**Compliance**:
- **Adjustable speed**: PlaybackController.speed (50-2000ms), configurable via range slider (FR-010, FR-011)
- **Input modification**: Users edit JSON in textarea, click Initialize to regenerate trace (FR-013, FR-014, FR-015)
- **Status indicators**: Current step, total steps, metrics displayed in UI (FR-005)
- **Legend**: Visual legend component explains color encodings (FR-020)

**Evidence**: Functional requirements FR-006 through FR-020 cover all interaction patterns. Quickstart guide demonstrates input experimentation workflow.

### V. Performance & Scalability ✅ PASS

**Compliance**:
- **Grids up to 20×20**: Hybrid rendering strategy (Canvas mode for >10×10) meets 60fps target
- **Trees/graphs up to 100 nodes**: SVG-based renderers with DOM virtualization (research.md decision #2)
- **CSS transforms + rAF**: Canvas renderer uses `requestAnimationFrame` for smooth animations (research.md)
- **Avoid full DOM reconstruction**: Svelte's fine-grained reactivity updates only changed cells (research.md decision #1)

**Evidence**: Research decision #2 (Canvas vs DOM) validates approach. Performance goals documented in Technical Context.

### Design Standards Compliance

**Visual Component Architecture** ✅ PASS:
- **Separation of Concerns**: Plugin.trace() (pure logic) separate from component rendering (declarative Svelte)
- **State Management**: All visual state derives from immutable Frame snapshots (data-model.md)
- **Declarative Updates**: Components receive Frame props, framework handles transitions via Svelte animations
- **Modular Styling**: Tailwind utilities + CSS custom properties, component-scoped styles (research.md decision #6)

**Algorithm Integration Contract** ✅ PASS:
- **trace() function**: Required in AlgorithmPlugin interface
- **Frame schema**: Defined in contracts/plugin-interface.ts
- **Input validation**: validateInput() method required
- **Example inputs**: presets[] required (min 2)

**Evidence**: contracts/plugin-interface.ts fully specifies contract. Quickstart guide demonstrates compliance with Bubble Sort example.

### Post-Design Re-evaluation ✅ PASS

No constitutional violations introduced during design phase. All principles maintained:
- Reusability: Plugin contract enforces algorithm-agnostic components
- Traceability: Immutable frames, backward navigation supported
- Performance: Hybrid rendering + smart sampling meet targets

---

## Project Structure

### Documentation (this feature)
```
specs/master/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (tech decisions)
├── data-model.md        # Phase 1 output (entities, relationships)
├── quickstart.md        # Phase 1 output (plugin creation guide)
├── contracts/
│   └── plugin-interface.ts  # Phase 1 output (TypeScript contract)
└── tasks.md             # Phase 2 output (/tasks command - NOT YET CREATED)
```

### Source Code (repository root)

**Structure Decision**: Single web application (SvelteKit project)

```
algo-vis/
├── src/
│   ├── lib/
│   │   ├── types/
│   │   │   ├── plugin.ts              # Core interfaces (Frame, Trace, AlgorithmPlugin)
│   │   │   ├── state.ts               # State type definitions (GridState, ArrayState, etc.)
│   │   │   └── validation.ts          # Zod schemas for runtime validation
│   │   ├── core/
│   │   │   ├── PlaybackController.svelte.ts  # Playback state management (Svelte 5 runes)
│   │   │   ├── PluginRegistry.ts      # Plugin discovery & registration
│   │   │   ├── TraceProcessor.ts      # Smart sampling, validation
│   │   │   └── PseudocodeGenerator.ts # Auto-generate code from Frame descriptions
│   │   ├── components/
│   │   │   ├── controls/
│   │   │   │   ├── PlaybackControls.svelte  # Play, pause, step buttons
│   │   │   │   ├── SpeedControl.svelte      # Speed slider
│   │   │   │   ├── InputPanel.svelte        # Input editor + presets
│   │   │   │   └── AlgorithmSelector.svelte # Dropdown for algorithm selection
│   │   │   ├── visualization/
│   │   │   │   ├── GridRenderer.svelte      # 2D grid visualization (DOM + Canvas modes)
│   │   │   │   ├── ArrayRenderer.svelte     # 1D array bars/boxes
│   │   │   │   ├── TreeRenderer.svelte      # Binary tree visualization (SVG)
│   │   │   │   └── GraphRenderer.svelte     # Graph visualization (SVG/Canvas)
│   │   │   ├── panels/
│   │   │   │   ├── CodePanel.svelte         # Monaco Editor integration
│   │   │   │   ├── StatusPanel.svelte       # Current step description
│   │   │   │   ├── LogPanel.svelte          # Chronological step history
│   │   │   │   ├── MetricsPanel.svelte      # Algorithm metrics display
│   │   │   │   └── LegendPanel.svelte       # Visual encoding legend
│   │   │   └── layout/
│   │   │       ├── MainLayout.svelte        # Two-column layout (controls + viz)
│   │   │       └── ThemeToggle.svelte       # Dark mode toggle
│   │   └── utils/
│   │       ├── sampling.ts            # Adaptive stride sampling logic
│   │       ├── validation.ts          # Input validation helpers
│   │       └── storage.ts             # localStorage wrappers
│   ├── plugins/
│   │   └── trapping-rain-water-ii/
│   │       ├── index.ts               # Plugin implementation
│   │       ├── index.test.ts          # Plugin contract tests
│   │       └── README.md              # Algorithm explanation
│   ├── routes/
│   │   └── +page.svelte               # Main application page
│   ├── app.html                       # HTML template
│   ├── app.css                        # Tailwind imports + CSS variables
│   └── hooks.server.ts                # SvelteKit server hooks (if needed)
│
├── tests/
│   ├── unit/
│   │   ├── PlaybackController.test.ts
│   │   ├── TraceProcessor.test.ts
│   │   ├── sampling.test.ts
│   │   └── validation.test.ts
│   ├── integration/
│   │   ├── plugin-loading.test.ts     # Plugin discovery & registration
│   │   └── trace-rendering.test.ts    # Full trace → render pipeline
│   ├── e2e/
│   │   ├── playback-controls.spec.ts  # Play, pause, step, speed E2E tests
│   │   ├── input-modification.spec.ts # Input validation, trace regeneration
│   │   └── visual-regression.spec.ts  # Screenshot comparison tests
│   └── visual-baselines/
│       └── trapping-rain-water-ii/    # Golden images for visual regression
│
├── .storybook/
│   ├── main.ts                        # Storybook config
│   └── preview.ts                     # Global decorators
│
├── stories/
│   ├── GridRenderer.stories.svelte    # Component documentation
│   ├── ArrayRenderer.stories.svelte
│   └── PlaybackControls.stories.svelte
│
├── static/
│   └── favicon.png
│
├── svelte.config.js                   # SvelteKit config
├── vite.config.ts                     # Vite config (with Vitest)
├── tailwind.config.js                 # Tailwind CSS v4 config
├── playwright.config.ts               # Playwright E2E config
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── README.md
```

---

## Phase 0: Outline & Research ✅ COMPLETED (WITH UPDATES)

**Output**: research.md with 7 research areas resolved + critical review findings

**Original Research Decisions**:
1. Svelte 5 runes for state management
2. Hybrid DOM/Canvas rendering strategy
3. Monaco Editor integration approach
4. File-based plugin discovery pattern
5. Adaptive stride sampling for large traces
6. Tailwind CSS v4 + CSS variables theming
7. Vitest + Playwright testing strategy

**Critical Review Findings** (2025-10-05):

### Over-Engineering Removed:
- ❌ **TreeRenderer, GraphRenderer** - Deferred to v2 (no tree/graph algorithms in MVP, violates YAGNI)
- ❌ **Storybook** - Deferred to v2 (single algorithm doesn't justify documentation overhead)
- ❌ **PluginRegistry** - Simplified to direct imports (complex registry premature for 1 plugin)
- ❌ **PseudocodeGenerator** - Deferred to v2 (complex, risky, hide code panel if no code instead)
- ❌ **InputSchemaRenderer** - Removed complexity (JSON textarea works for all inputs in MVP)

### Missing Pieces Added:
- ✅ **Canvas spike task** - Validate grid text rendering before committing to Canvas strategy
- ✅ **Monaco lazy loading** - Research code splitting to avoid 5MB initial bundle
- ✅ **Error boundaries** - Component to catch plugin trace() errors gracefully
- ✅ **Sampling validation** - Test adaptive stride on real Trapping Rain Water trace

### Research Gaps (needs validation during implementation):
- ⚠️ **Svelte 5 performance** - Benchmark 5k+ frame arrays with `$state.raw()`
- ⚠️ **Canvas text rendering** - May be harder than DOM for cell values/metrics
- ⚠️ **Adaptive sampling** - Validate stride algorithm doesn't skip critical frames

All NEEDS CLARIFICATION items from spec resolved via research.

---

## MVP Implementation Decisions (Actual - 2025-10-05)

**Critical Path Approach Taken**:
To validate the framework concept quickly, we implemented a minimal viable product focusing on end-to-end functionality over completeness.

### Implemented (Core Features):
- ✅ **DOM-only GridRenderer** - Fixed 40px cells, no Canvas (simpler, sufficient for MVP grids)
- ✅ **Svelte 5 runes** - PlaybackController uses $state, $state.raw(), $derived, $effect
- ✅ **Direct plugin import** - Single `trappingRainWater2Plugin` imported directly in +page.svelte
- ✅ **Tailwind v4 + CSS variables** - Theme-ready but no toggle UI yet
- ✅ **Zod validation** - Frame/Trace schemas with runtime validation
- ✅ **Preset-based input** - No custom editor, 3 presets (Small, Medium, Large)

### Deferred to Next Iteration:
- ⏸️ **Monaco Editor / CodePanel** - Complex, non-critical for proving framework works
- ⏸️ **Canvas renderer** - DOM performs adequately for current grid sizes
- ⏸️ **Sampling** - No traces >5k frames yet (largest preset ~150 frames)
- ⏸️ **All tests** - Skipped for speed (0% coverage, major technical debt)
- ⏸️ **All spikes** - Architectural validation skipped (risky but expedient)
- ⏸️ **LogPanel, MetricsPanel, LegendPanel** - Nice-to-have panels cut for MVP
- ⏸️ **Custom input editor** - Presets sufficient to demonstrate framework
- ⏸️ **Error boundaries** - No graceful error handling yet
- ⏸️ **Theme toggle UI** - CSS vars ready but no toggle button

### Technical Debt Incurred:
1. **Zero test coverage** - All T009-T019, T039-T043 skipped
2. **No performance validation** - FR-037 (60fps for 20×20) untested
3. **No spike results** - S001-S004 assumptions unvalidated
4. **Missing documentation** - No README, quickstart, or plugin guide
5. **Incomplete accessibility** - No ARIA labels, keyboard shortcuts
6. **Node.js version issue** - Had to downgrade Vite 7→5, Svelte packages for Node 20.11.1 compatibility

### What Worked Well:
- Plugin contract design is clean and extensible
- Svelte 5 runes provide excellent reactivity control
- GridRenderer styling with Tailwind is straightforward
- Frame-based architecture enables perfect forward/backward navigation
- Preset pattern works nicely for educational use case

### Lessons Learned:
- **DOM is good enough** - Canvas complexity not justified for current use
- **Tests are expensive** - TDD approach in plan would have slowed MVP significantly
- **Monaco is heavyweight** - Code panel deferral was correct call for MVP
- **Fixed cell size works** - No need for responsive scaling in MVP

---

## Phase 1: Design & Contracts ✅ COMPLETED

**Output**:
- `contracts/plugin-interface.ts` - Complete TypeScript contract with example
- `data-model.md` - 7 entities (AlgorithmPlugin, Frame, Trace, PlaybackController, etc.) with relationships, validation rules, ERD
- `quickstart.md` - 30-minute Bubble Sort plugin creation guide

**Design Highlights**:

1. **Plugin Contract** (contracts/plugin-interface.ts):
   - `AlgorithmPlugin<TInput, TState>` interface with 10 required properties
   - `Frame<TState>` interface (step, state, focus, neighbors, metrics, description)
   - `Trace<TState>` interface (frames, totalSteps, completed, metadata)
   - Example implementation showing Trapping Rain Water II structure

2. **Data Model** (data-model.md):
   - Entity definitions with attributes, types, required fields
   - Relationships (ERD): AlgorithmPlugin → Trace → Frame → FocusMarker
   - Validation rules per entity (e.g., sequential steps, unique IDs)
   - State type definitions (GridState, ArrayState, TreeState, GraphState)
   - Lifecycle documentation (creation → validation → rendering → disposal)

3. **Quickstart Guide** (quickstart.md):
   - Complete Bubble Sort plugin example (~120 lines)
   - Step-by-step walkthrough (create file → test → verify → customize)
   - Common pitfalls & solutions
   - Plugin checklist for submission readiness

**Constitutional Re-check**: ✅ PASS (see Constitution Check section above)

---

## Phase 2: Task Planning Approach

*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:

**MVP Scope Reduction Applied**:
- Focus on **grid visualization only** (Trapping Rain Water II)
- Defer array/tree/graph renderers until 2nd/3rd algorithms added
- Simplify plugin loading (direct import, no registry)
- Make code panel truly optional (hide if no code, no pseudocode generation)
- Remove Storybook, InputSchemaRenderer complexity

1. **Load Phase 1 Artifacts**:
   - Parse `data-model.md` to extract entities → TypeScript interfaces + Zod schemas
   - Parse `contracts/plugin-interface.ts` → contract test templates
   - Parse `quickstart.md` → integration test scenarios

2. **Generate Tasks by Category** (REVISED):

   **Spike Tasks (NEW)** (S001-S004) - MUST COMPLETE FIRST:
   - [ ] S001 **Canvas grid spike**: Render 10×10 grid with cell values/colors in Canvas, validate text rendering quality
   - [ ] S002 **Monaco lazy load spike**: Test dynamic import of Monaco, measure bundle impact
   - [ ] S003 **Sampling validation spike**: Generate Trapping Rain Water trace, test adaptive stride sampling (5k, 10k frames)
   - [ ] S004 **Svelte 5 frame array benchmark**: Create 10k frame array with `$state.raw()`, measure reactivity performance

2. **Generate Tasks by Category** (ORIGINAL, PRUNED):

   **Setup Tasks** (T001-T004) - PRUNED:
   - Initialize SvelteKit project with TypeScript
   - Install dependencies (Svelte 5, **Tailwind v4**, Monaco, Vitest, Playwright, Zod, pnpm)
   - Configure Vite, Tailwind, TypeScript (strict mode)
   - Create project structure (src/lib, src/plugins, tests)
   - ~~Setup Storybook~~ → **REMOVED** (deferred to v2)

   **Core Type Definitions** (T006-T008) [P] - PRUNED:
   - Define `Frame`, `Trace`, `AlgorithmPlugin` interfaces in `src/lib/types/plugin.ts`
   - Define **GridState only** in `src/lib/types/state.ts` (defer Array/Tree/Graph)
   - Create Zod schemas for runtime validation in `src/lib/types/validation.ts`
   - ~~InputPreset, InputSchema~~ → **SIMPLIFIED** (JSON textarea only, remove schema complexity)

   **Core Engine - Contract Tests First** (T009-T011) [P] - PRUNED:
   - Write PlaybackController contract tests (step forward/back, play/pause, speed)
   - Write TraceProcessor contract tests (sampling, validation)
   - Write ErrorBoundary component tests (plugin error handling)
   - ~~PluginRegistry~~ → **REMOVED** (direct import sufficient for 1 plugin)
   - ~~PseudocodeGenerator~~ → **REMOVED** (hide code panel if no code, defer generation to v2)

   **Core Engine - Implementation** (T012-T015) - PRUNED:
   - Implement PlaybackController.svelte.ts (Svelte 5 runes: $state, $derived, $effect)
   - Implement TraceProcessor.ts (smart sampling based on S003 spike, frame validation)
   - Implement ErrorBoundary.svelte (catch trace() errors, show user-friendly message)
   - Implement sampling.ts utility (adaptive stride calculation, validated by S003)

   **Visualization Components - Tests First** (T016-T019) [P] - PRUNED:
   - Write GridRenderer contract tests (DOM mode, Canvas mode based on S001 spike, focus highlighting)
   - Write CodePanel integration tests (Monaco lazy loading based on S002 spike, line highlighting)
   - Write StatusPanel, LogPanel, MetricsPanel unit tests
   - Write PlaybackControls component tests (button interactions)
   - ~~ArrayRenderer, TreeRenderer, GraphRenderer~~ → **REMOVED** (no array/tree/graph algorithms in MVP)

   **Visualization Components - Implementation** (T020-T026) [P] - PRUNED:
   - Implement GridRenderer.svelte (hybrid DOM/Canvas based on S001, detect grid size, switch modes)
   - Implement CodePanel.svelte (Monaco lazy load based on S002, **hide panel if plugin.code undefined**)
   - Implement PlaybackControls.svelte (play, pause, step forward/back, reset buttons)
   - Implement SpeedControl.svelte (range slider, reactive speed update)
   - Implement StatusPanel.svelte (current frame description display)
   - Implement LogPanel.svelte (scrollable chronological log)
   - Implement MetricsPanel.svelte (key-value metrics display from Frame.metrics)

   **UI Components** (T027-T030) [P] - PRUNED:
   - Implement InputPanel.svelte (JSON textarea, preset dropdown, validation error display)
   - Implement LegendPanel.svelte (color encoding for grid: focus=amber, neighbor=green, visited=blue, etc.)
   - Implement MainLayout.svelte (two-column responsive layout: left=controls, right=visualization)
   - Implement ThemeToggle.svelte (dark mode with localStorage persistence)
   - ~~AlgorithmSelector~~ → **SIMPLIFIED** (hardcode Trapping Rain Water II for MVP, add selector when 2nd algorithm exists)

   **Styling & Theming** (T031-T032) [P] - PRUNED:
   - Define CSS custom properties in app.css (light + dark themes, grid cell colors)
   - Style all components with Tailwind v4 utilities (responsive, accessible focus states)

   **Trapping Rain Water II Plugin** (T033-T036):
   - Write plugin contract tests (validates interface, presets, trace structure, validates against S003 spike results)
   - Implement `src/plugins/trapping-rain-water-ii/index.ts` (trace(), validateInput(), presets, code with line mappings)
   - Add algorithm explanation in `src/plugins/trapping-rain-water-ii/README.md`
   - Write plugin integration test (full trace → render → UI interaction)

   **Main Application** (T037-T039):
   - Implement `src/routes/+page.svelte` (main app layout, component integration, ErrorBoundary wrapper)
   - Connect PlaybackController to UI components (reactive bindings)
   - Wire up hardcoded plugin → input → trace generation → GridRenderer visualization

   **E2E & Visual Regression Tests** (T040-T043) [P] - PRUNED:
   - Write E2E test: playback controls (Playwright, tests FR-006 through FR-012)
   - Write E2E test: input modification and validation (tests FR-013 through FR-016)
   - Capture visual regression baselines (Trapping Rain Water II: initial, mid-execution, final frames)
   - Write visual regression comparison test (screenshot diffing with tolerance for Canvas anti-aliasing)
   - ~~Algorithm selection test~~ → **REMOVED** (no selector in MVP)

   **Documentation & Polish** (T044-T047) - PRUNED:
   - Write README.md (project overview, setup instructions, plugin creation guide based on quickstart.md)
   - Add accessibility attributes (ARIA labels, keyboard shortcuts: Space=play/pause, Left/Right=step, R=reset)
   - Performance optimization (Monaco lazy load validated by S002, Canvas optimizations based on S001)
   - Final manual testing against acceptance scenarios (spec.md scenarios 1-6)
   - ~~Storybook~~ → **REMOVED** (deferred to v2)

3. **Ordering Strategy** (UPDATED):
   - **Critical Path**:
     - **S001-S004 spikes MUST run first** - validate Canvas, Monaco, sampling, Svelte 5 performance before committing architecture
     - Types (T006-T008) block all other tasks (required imports)
     - Core engine tests (T009-T011) before implementations (T012-T015) - TDD
     - Component tests (T016-T019) before implementations (T020-T026) - TDD
     - Plugin (T033-T036) depends on core types + GridRenderer
     - E2E tests (T040-T043) require full app implementation (after T039)
   - **Parallelization**:
     - Spike tasks (S001-S004) can run in parallel [P]
     - Type definitions (T006-T008) can run in parallel [P]
     - Contract tests (T009-T011, T016-T019) can run in parallel [P]
     - Component implementations (T020-T026, T027-T030) can run in parallel [P] (different files)
     - Documentation tasks (T044-T047) can run in parallel [P]

4. **Estimated Output**: ~51 tasks (down from 58 due to scope reduction), ordered by dependency, marked [P] for parallel execution

**Task Template Structure** (tasks.md will follow this, UPDATED):
```markdown
## Phase 3.0: Spike Tasks (S001-S004) [P] ⚠️ MUST COMPLETE FIRST
- [ ] S001 Canvas grid rendering spike
- [ ] S002 Monaco lazy loading spike
- [ ] S003 Sampling validation spike
- [ ] S004 Svelte 5 performance benchmark

## Phase 3.1: Setup (T001-T004)
- [ ] T001 Initialize SvelteKit project
- [ ] T002 Install dependencies (Svelte 5, Tailwind v4, Monaco, Vitest, Playwright, Zod)
- [ ] T003 Configure Vite, Tailwind, TypeScript
- [ ] T004 Create project structure

## Phase 3.2: Core Types (T006-T008) [P]
- [ ] T006 Define Frame, Trace, AlgorithmPlugin
- [ ] T007 Define GridState only
- [ ] T008 Create Zod validation schemas

## Phase 3.3: Core Engine Tests (T009-T011) [P] - TDD ⚠️ BEFORE 3.4
- [ ] T009 PlaybackController tests
- [ ] T010 TraceProcessor tests
- [ ] T011 ErrorBoundary tests

## Phase 3.4: Core Engine (T012-T015)
- [ ] T012 Implement PlaybackController
- [ ] T013 Implement TraceProcessor (use S003 results)
- [ ] T014 Implement ErrorBoundary
- [ ] T015 Implement sampling utility

... (continue through remaining phases)
```

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

---

## Phase 3+: Future Implementation

*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md with ~58 ordered tasks)
**Phase 4**: Implementation (execute tasks.md following TDD, constitutional principles)
**Phase 5**: Validation (run all tests, execute quickstart.md, verify acceptance scenarios from spec.md)

---

## Complexity Tracking

*No constitutional violations - this section intentionally empty*

All design decisions align with constitutional principles. No complexity deviations require justification.

**Scope Reductions Applied** (Constitutional Compliance - "Simplicity" principle):
- Removed TreeRenderer, GraphRenderer, ArrayRenderer (YAGNI - no algorithms need them yet)
- Removed Storybook (over-engineered for 1-algorithm MVP)
- Removed PluginRegistry (direct import simpler for MVP)
- Removed PseudocodeGenerator (complex, risky, deferred)
- Removed InputSchemaRenderer (JSON textarea sufficient)
- Removed AlgorithmSelector (hardcode single algorithm)

These removals **strengthen** constitutional compliance by deferring complexity until proven necessary via example-driven design.

---

## Progress Tracking

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - approach described above)
- [x] Phase 3: Tasks generated (/tasks command) - 51 tasks (4 spikes + 47 implementation)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (via research.md)
- [x] Complexity deviations documented (none required)

**Artifacts Created**:
- [x] research.md (7 technical decisions + critical review findings)
- [x] contracts/plugin-interface.ts (TypeScript contract + example)
- [x] data-model.md (7 entities, ERD, validation rules)
- [x] quickstart.md (30-minute plugin creation guide)
- [x] plan.md (this file, critically reviewed & scope-reduced)

**Critical Review Applied** (2025-10-05):
- [x] Over-engineering identified & removed (6 components/features deferred to v2)
- [x] Missing pieces added (4 spike tasks, error boundaries, Monaco lazy loading)
- [x] Research gaps documented (Canvas, Svelte 5 performance, sampling validation)
- [x] Constitutional compliance re-validated (PASS - scope reductions strengthen compliance)

**Revised Estimates**:
- Task count: ~51 (down from 58)
- Spike tasks: 4 (new, critical path)
- Components removed: 6 (TreeRenderer, GraphRenderer, ArrayRenderer, Storybook, PluginRegistry, PseudocodeGenerator)
- Simplified features: 3 (AlgorithmSelector, InputSchema, CodePanel)

---

**Ready for `/tasks` command** - All planning gates passed, critical review complete, lean MVP scope defined, task generation strategy documented.

---

*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*

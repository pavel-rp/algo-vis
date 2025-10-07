# Implementation Plan: Swim in Water Algorithm Visualization

**Branch**: `004-we-ll-implement` | **Date**: 2025-10-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-we-ll-implement/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path ✓
   → Loaded from B:\Projects\algo-vis\specs\004-we-ll-implement\spec.md
2. Fill Technical Context ✓
   → Project Type: single (SvelteKit web application)
   → Structure Decision: SvelteKit single-project structure
3. Fill Constitution Check ✓
   → Evaluated against Algorithm Visualization Framework Constitution v1.0.0
4. Evaluate Constitution Check section ✓
   → No violations detected
   → Update Progress Tracking: Initial Constitution Check ✓
5. Execute Phase 0 → research.md ✓
   → Created research.md with 5 technical decisions documented
6. Execute Phase 1 → contracts, data-model.md, quickstart.md ✓
   → Created data-model.md (core entities, validation rules)
   → Created contracts/ (3 schema files: AlgorithmPlugin, SharedComponents, NavigationTree)
   → Created quickstart.md (step-by-step verification guide)
   → Updated CLAUDE.md (agent context with Feature 004)
7. Re-evaluate Constitution Check section ✓
   → Post-Design Check: PASS (no new violations)
8. Plan Phase 2 → Describe task generation approach ✓
   → 28 tasks planned in TDD order
9. STOP - Ready for /tasks command ✓
```

**IMPORTANT**: The /plan command STOPS at step 9. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Add support for "Swim in Water" algorithm visualization to the algo-vis framework. This feature implements a graph pathfinding algorithm that uses a priority queue (similar to Dijkstra's algorithm) to find the minimum time required to swim from the top-left to bottom-right corner of an N×N grid, where each cell has an elevation value. The implementation requires creating shared visualization components (grid display, status display, priority queue display) that can be reused across multiple algorithms, and updating the existing Trapping Rain Water II algorithm to use these shared components.

**Key Technical Approach**:
- Create reusable Svelte 5 components for grid, status, and priority queue visualization
- Implement swim-in-water algorithm plugin following the AlgorithmPlugin interface
- Add "Graphs" → "Priority Queue" category to navigation tree
- Refactor existing Trapping Rain Water II to use shared components
- Generate step-by-step execution traces with priority queue snapshots

## Technical Context
**Language/Version**: TypeScript 5.0, Svelte 5 (runes mode)
**Primary Dependencies**: SvelteKit 2.0, Tailwind CSS 4.0, Zod 3.22, Vitest 3.2.4
**Storage**: N/A (client-side visualization)
**Testing**: Vitest 3.2.4 with @testing-library/svelte 5.2.8, happy-dom 19.0.2
**Target Platform**: Modern web browsers (ES2020+)
**Project Type**: single (SvelteKit application with plugin architecture)
**Performance Goals**:
  - Trace generation <100ms (per Constitution V)
  - Render updates <16ms for 60fps (per Constitution V)
  - Support grids up to 50×50 (2,500 cells, per FR-011)
**Constraints**:
  - Grid size: minimum 1×1, maximum 50×50 (FR-011)
  - Component reusability (FR-014, Constitution II)
  - Backward/forward navigation (FR-008, Constitution III)
  - Shared components across algorithms (FR-014, FR-015)
**Scale/Scope**:
  - 3 new shared components (GridDisplay, StatusDisplay, PriorityQueueDisplay)
  - 1 new algorithm plugin (swimInWater)
  - 1 refactored algorithm (trappingRainWater2)
  - 3 preset examples (3×3, 5×5, edge case per FR-006)
  - Navigation tree update (add Graphs → Priority Queue category)

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Visualization-First Design ✓
- **Requirement**: Every algorithm MUST produce visual output showing current state, active elements, relationships, accumulated results
- **Compliance**:
  - FR-001: Grid display with elevation values ✓
  - FR-002: Visual distinction (unvisited/processing/visited cells) ✓
  - FR-003: Active path highlighting ✓
  - FR-004: Current maximum elevation display ✓
  - FR-013: Priority queue state visualization ✓
- **Status**: PASS

### II. Framework Reusability (NON-NEGOTIABLE) ✓
- **Requirement**: Components MUST be algorithm-agnostic, composable, configurable, standalone
- **Compliance**:
  - FR-014: Shared visualization components explicitly required ✓
  - FR-015: Existing algorithm updated to use shared components ✓
  - Design ensures grid/status/PQ components work independently ✓
  - Components configurable for different data types (elevations, priorities) ✓
- **Status**: PASS

### III. Step-by-Step Traceability ✓
- **Requirement**: Frame-by-frame playback, forward/backward navigation, complete history, human-readable descriptions
- **Compliance**:
  - FR-008: Forward/backward navigation ✓
  - FR-009: Playback controls integration ✓
  - FR-005: Step-by-step execution trace with descriptions ✓
  - ExecutionStep entity includes description field ✓
- **Status**: PASS

### IV. Interactive Learning ✓
- **Requirement**: Adjustable speed, input modification, clear status, legend/documentation
- **Compliance**:
  - FR-009: Speed adjustment via playback controls ✓
  - FR-006: Preset examples for experimentation ✓
  - FR-004, FR-013: Status indicators (max elevation, PQ state) ✓
  - FR-012: Algorithm metadata (complexity, description) ✓
- **Status**: PASS

### V. Performance & Scalability ✓
- **Requirement**: Grids up to 20×20 without lag, CSS transforms/RAF for animations, avoid full DOM reconstruction
- **Compliance**:
  - Grid size capped at 50×50 (exceeds 20×20 requirement) ✓
  - Performance goal: <100ms trace generation, <16ms render ✓
  - Svelte 5 fine-grained reactivity avoids full DOM reconstruction ✓
  - Tailwind CSS (CSS-based animations via transforms) ✓
- **Status**: PASS

**Overall Constitution Check**: ✅ PASS - No violations detected

## Project Structure

### Documentation (this feature)
```
specs/004-we-ll-implement/
├── spec.md              # Feature specification
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── AlgorithmPlugin.schema.ts
│   ├── SharedComponents.schema.ts
│   └── NavigationTree.schema.ts
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── lib/
│   ├── components/
│   │   ├── visualization/        # NEW: Shared visualization components
│   │   │   ├── GridDisplay.svelte
│   │   │   ├── StatusDisplay.svelte
│   │   │   └── PriorityQueueDisplay.svelte
│   │   ├── navigation/
│   │   │   ├── Sidebar.svelte
│   │   │   ├── TreeNode.svelte
│   │   │   └── NavigationTree.svelte
│   │   └── PlaybackControls.svelte
│   ├── core/
│   │   ├── PlaybackController.svelte.ts
│   │   ├── NavigationState.svelte.ts
│   │   └── validation.ts
│   ├── types/
│   │   ├── algorithm.ts          # MODIFIED: Add category/subcategory
│   │   ├── trace.ts
│   │   ├── navigation.ts
│   │   └── visualization.ts      # NEW: Shared component types
│   ├── plugins/
│   │   ├── swimInWater.ts        # NEW: Swim in Water algorithm
│   │   ├── trappingRainWater2.ts # MODIFIED: Use shared components
│   │   └── uniquePathsWithObstacles.ts
│   ├── data/
│   │   └── navigation-tree.ts    # MODIFIED: Add Graphs → Priority Queue
│   └── utils/
│       └── navigation-queries.ts
├── routes/
│   ├── +layout.svelte
│   ├── +page.svelte
│   └── [category]/[algorithm]/+page.svelte
└── app.css

tests/
├── unit/
│   ├── core/
│   │   ├── PlaybackController.test.svelte.ts
│   │   └── validation.test.ts
│   ├── components/
│   │   └── visualization/        # NEW: Shared component tests
│   │       ├── GridDisplay.test.ts
│   │       ├── StatusDisplay.test.ts
│   │       └── PriorityQueueDisplay.test.ts
│   └── plugins/
│       ├── swimInWater.test.ts   # NEW: Swim in Water tests
│       ├── trappingRainWater2.test.ts
│       └── uniquePathsWithObstacles.test.ts
└── integration/
    ├── swimInWater-visualization.test.ts  # NEW: E2E tests
    └── shared-components.test.ts          # NEW: Component reuse tests
```

**Structure Decision**: This is a single-project SvelteKit application using the plugin architecture pattern. The structure follows the existing pattern established in the codebase with:
- `src/lib/plugins/` for algorithm implementations (AlgorithmPlugin interface)
- `src/lib/components/` for reusable Svelte components
- `src/lib/core/` for framework logic (PlaybackController, state management)
- `src/lib/types/` for TypeScript interfaces and Zod schemas
- `tests/unit/` for isolated logic tests
- `tests/integration/` for E2E visualization tests

## Phase 0: Outline & Research

### Research Tasks

1. **Priority Queue Implementation Patterns** (NEEDS CLARIFICATION resolved by research)
   - **Question**: What priority queue library/implementation should be used?
   - **Context**: The user-provided code uses `MinPriorityQueue` (likely from a library)
   - **Research needed**:
     - Identify the library (likely `@datastructures-js/priority-queue` based on API)
     - Evaluate alternatives (built-in, custom implementation)
     - Best practices for priority queue visualization (peek vs full queue)

2. **Shared Component Architecture Patterns**
   - **Question**: How to design truly reusable visualization components in Svelte 5?
   - **Research needed**:
     - Svelte 5 component composition patterns (props, slots, snippets)
     - Generic component design for algorithm-agnostic visualization
     - Performance considerations for rendering 2,500 cells (50×50 grid)

3. **Grid Visualization Performance**
   - **Question**: How to efficiently render and update large grids (up to 50×50)?
   - **Research needed**:
     - Virtual scrolling/windowing for large grids
     - CSS Grid vs Flexbox for grid layout
     - Svelte 5 fine-grained reactivity optimization patterns
     - DOM update batching strategies

4. **Priority Queue Snapshot Strategy**
   - **Question**: How to capture top 3-5 items efficiently at each step?
   - **Research needed**:
     - Priority queue peek/top-k operations
     - Trade-offs: shallow copy vs full queue serialization
     - Memory impact of storing queue snapshots in execution trace

5. **Navigation Tree Category Addition**
   - **Question**: How to add "Graphs" → "Priority Queue" to existing tree?
   - **Research needed**:
     - Current navigation tree structure in `navigation-tree.ts`
     - NavigationNode schema requirements
     - Category expansion state persistence

**Output**: research.md consolidating findings with decisions, rationales, and alternatives

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

### 1. Data Model Extraction (`data-model.md`)

From spec Key Entities, extract:

**Core Entities**:
- **SwimInWaterInput**
  - `grid: number[][]` (N×N matrix, 1 ≤ N ≤ 50)
  - Validation: square grid, non-negative integers, size constraints

- **SwimInWaterState**
  - `heightMap: number[][]` (current grid)
  - `visited: boolean[][]` (cell visit status)
  - `currentCell: {row: number, col: number}` (active cell)
  - `currentMaxElevation: number` (accumulated answer)
  - `priorityQueue: PriorityQueueSnapshot` (queue state)

- **PriorityQueueSnapshot**
  - `topItems: Array<{elevation: number, row: number, col: number}>` (3-5 items)
  - `remainingCount: number` (total queue size - displayed items)

- **ExecutionStep<SwimInWaterState>**
  - `index: number`
  - `state: SwimInWaterState`
  - `description: string` (human-readable step)
  - `highlightedCells: Array<{row: number, col: number}>` (neighbors being explored)

**Shared Component Props**:
- **GridDisplayProps**
  - `grid: number[][]`
  - `cellStates: CellState[][]` (unvisited/processing/visited)
  - `highlightedCells?: Coordinate[]`
  - `onCellClick?: (row, col) => void`

- **StatusDisplayProps**
  - `metrics: Record<string, string | number>`
  - `currentStep: number`
  - `totalSteps: number`

- **PriorityQueueDisplayProps**
  - `items: Array<{priority: number, label: string, data?: unknown}>`
  - `remainingCount: number`
  - `maxDisplay?: number` (default 5)

### 2. API Contracts (`contracts/`)

**AlgorithmPlugin.schema.ts** (Zod schema):
```typescript
import { z } from 'zod';

export const AlgorithmPluginSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),           // NEW: For navigation tree
  subcategory: z.string().optional(), // NEW: For navigation tree
  description: z.string(),
  generateTrace: z.function()
    .args(z.unknown())
    .returns(z.object({
      steps: z.array(z.object({
        index: z.number(),
        state: z.unknown(),
        description: z.string(),
        highlightedCells: z.array(z.object({
          row: z.number(),
          col: z.number()
        })).optional()
      })),
      metadata: z.object({
        complexity: z.string().optional()
      })
    })),
  presets: z.array(z.object({
    name: z.string(),
    input: z.unknown()
  })),
  visualize: z.function()
    .args(z.object({
      index: z.number(),
      state: z.unknown(),
      description: z.string()
    }))
    .returns(z.unknown())
});
```

**SharedComponents.schema.ts**:
```typescript
export const GridDisplayPropsSchema = z.object({
  grid: z.array(z.array(z.number())),
  cellStates: z.array(z.array(z.enum(['unvisited', 'processing', 'visited']))),
  highlightedCells: z.array(z.object({row: z.number(), col: z.number()})).optional(),
  onCellClick: z.function().optional()
});

export const PriorityQueueDisplayPropsSchema = z.object({
  items: z.array(z.object({
    priority: z.number(),
    label: z.string(),
    data: z.unknown().optional()
  })),
  remainingCount: z.number(),
  maxDisplay: z.number().optional()
});
```

**NavigationTree.schema.ts**:
```typescript
export const NavigationNodeSchema = z.object({
  type: z.enum(['category', 'algorithm']),
  id: z.string(),
  label: z.string(),
  children: z.lazy(() => z.array(NavigationNodeSchema)).optional(),
  pluginId: z.string().optional(), // For algorithm nodes
  path: z.string().optional()      // For algorithm nodes
});
```

### 3. Contract Tests

Generate failing tests for:
- `tests/unit/plugins/swimInWater.test.ts`: Validate plugin interface
- `tests/unit/components/visualization/GridDisplay.test.ts`: Validate props schema
- `tests/unit/components/visualization/PriorityQueueDisplay.test.ts`: Validate props schema
- `tests/integration/shared-components.test.ts`: Test component reuse across algorithms

### 4. Test Scenarios from User Stories

From acceptance scenarios:
- **Scenario 1**: Initial state rendering (cell 0,0 visited)
- **Scenario 2**: Step forward (dequeue cell, update visualization)
- **Scenario 3**: Final answer display
- **Scenario 4**: Preset loading
- **Scenario 5**: Step backward (restore previous state)
- **Scenario 6**: Priority queue display with >5 items
- **Scenario 7**: Navigation tree expansion
- **Scenario 8**: Grid size validation (reject 51×51)
- **Scenario 9**: Large grid performance (50×50 <100ms)

### 5. Agent Context Update

Run: `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`

Updates to CLAUDE.md:
- Add Swim in Water algorithm to "Key Patterns" section
- Update "Common Development Tasks" with shared component pattern
- Add "Shared Visualization Components" section with usage examples
- Update "Recent Changes" with Feature 004 status

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
1. Load `.specify/templates/tasks-template.md` as base
2. Generate tasks from Phase 1 design docs in TDD order:

**Phase A: Research & Setup** (from Phase 0)
- Task 1: Research priority queue library and patterns
- Task 2: Research shared component architecture
- Task 3: Research grid visualization performance

**Phase B: Shared Components** (from contracts)
- Task 4: [P] Create GridDisplay.svelte component (contract test first)
- Task 5: [P] Create StatusDisplay.svelte component (contract test first)
- Task 6: [P] Create PriorityQueueDisplay.svelte component (contract test first)
- Task 7: Write integration test for shared component reusability

**Phase C: Navigation Tree Update**
- Task 8: Update navigation-tree.ts (add Graphs → Priority Queue)
- Task 9: Update NavigationState to handle new category
- Task 10: Test navigation tree expansion for new category

**Phase D: Swim in Water Plugin**
- Task 11: Create swimInWater.ts plugin file (contract test first)
- Task 12: Implement generateTrace function with PQ snapshots
- Task 13: Implement visualize function using shared components
- Task 14: Add 3 preset examples (3×3, 5×5, edge case)
- Task 15: Add grid size validation (1×1 to 50×50)
- Task 16: Write unit tests for trace generation
- Task 17: Write unit tests for validation

**Phase E: Refactor Trapping Rain Water II**
- Task 18: Refactor trappingRainWater2.ts to use shared components
- Task 19: Update trappingRainWater2 tests
- Task 20: Verify backward compatibility

**Phase F: Integration & Performance**
- Task 21: Write E2E test for swim-in-water visualization
- Task 22: Test 50×50 grid performance (<100ms trace generation)
- Task 23: Test priority queue display with >5 items
- Task 24: Test backward/forward navigation
- Task 25: Test preset loading

**Phase G: Documentation**
- Task 26: Update CLAUDE.md with shared component patterns
- Task 27: Create quickstart.md walkthrough
- Task 28: Add inline code documentation

**Ordering Strategy**:
- TDD: Tests before implementation
- Dependencies: Shared components → Navigation → Plugin → Refactor → Integration
- Mark [P] for parallel execution (Tasks 4-6 can run simultaneously)

**Estimated Output**: 28 numbered, dependency-ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

No violations detected - this section is empty.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) ✅
  - Created research.md (5 technical decisions)
  - Priority queue: Use custom MinHeap (zero dependencies)
  - Components: Snippet-based composition (Svelte 5 best practice)
  - Performance: CSS Grid + conditional virtual scrolling
  - Snapshots: Top-K shallow copy (500× memory reduction)
  - Navigation: Add Graphs → Priority Queue category
- [x] Phase 1: Design complete (/plan command) ✅
  - Created data-model.md (entities, validation, state transitions)
  - Created contracts/ (AlgorithmPlugin, SharedComponents, NavigationTree schemas)
  - Created quickstart.md (8 verification steps, 9 acceptance scenarios)
  - Updated CLAUDE.md (agent context)
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅
  - 28 tasks planned across 7 phases (A-G)
  - TDD order: Tests → Implementation
  - Dependencies: Shared components → Navigation → Plugin → Refactor → Integration
- [ ] Phase 3: Tasks generated (/tasks command) - NEXT STEP
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
  - All 5 constitutional principles upheld
  - Shared components enforce Framework Reusability (II)
  - Performance targets met (<100ms trace, <16ms render)
- [x] All NEEDS CLARIFICATION resolved ✅
  - Research phase resolved all technical unknowns
  - Decisions documented with rationales
- [x] Complexity deviations documented (none) ✅

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*

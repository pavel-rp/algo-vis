# Implementation Plan: Tree-Based Sidebar Navigation

**Branch**: `003-move-the-navigation` | **Date**: 2025-10-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `B:\Projects\algo-vis\specs\003-move-the-navigation\spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ Loaded
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ Detected: Svelte 5 + SvelteKit + TypeScript
3. Fill Constitution Check
   → ✅ Assessed against Algorithm Visualization Framework Constitution
4. Evaluate Constitution Check
   → ✅ PASS - Aligns with Framework Reusability & Component Architecture
5. Execute Phase 0 → research.md
   → ✅ Complete (minimal research needed - established stack)
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
   → ✅ Complete
7. Re-evaluate Constitution Check
   → ✅ PASS - Component-based design preserves separation
8. Plan Phase 2 → Task generation approach described
   → ✅ Complete
9. STOP - Ready for /tasks command
```

## Summary

Refactor current single-page algorithm selector into tree-based sidebar navigation with hierarchical categories. Move from inline selection UI to dedicated navigation component supporting unlimited nesting, mobile-responsive drawer, and URL-based deep linking. Aligns with constitutional principle III (component-based architecture) by extracting navigation from monolithic +page.svelte.

## Technical Context

**Language/Version**: TypeScript 5.0, Svelte 5 (runes mode)
**Primary Dependencies**: SvelteKit 2.0, Tailwind CSS 4.0, Zod 3.22
**Storage**: Static navigation tree data structure (JSON/TS), browser localStorage for sidebar state persistence
**Testing**: Vitest 3.2.4, @testing-library/svelte 5.2.8, happy-dom 19.0.2
**Target Platform**: Web (Chrome/Firefox/Safari latest), mobile responsive (iOS Safari, Chrome Mobile)
**Project Type**: Single SvelteKit application (frontend only)
**Performance Goals**: <16ms render for tree node expand/collapse (60fps), <100ms sidebar open/close transition
**Constraints**: Svelte 5 runes compatibility ($state/$derived), must work with existing PlaybackController
**Scale/Scope**: 2 initial algorithms, 50+ potential future algorithms, 5-10 categories, unlimited nesting depth

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Alignment with Core Principles

✅ **I. Visualization-First Design**
- Preserves: Navigation enhancement doesn't alter visualization capabilities
- Impact: None - sideb

ar routes to existing visualization components

✅ **II. Framework Reusability (NON-NEGOTIABLE)**
- Enhances: Tree component reusable across future category structures
- NavigationTree component algorithm-agnostic
- Sidebar state management composable (can be reused for other overlays)

✅ **III. Step-by-Step Traceability**
- Preserves: No changes to PlaybackController or trace generation
- Impact: None - navigation simply loads different algorithm plugins

✅ **IV. Interactive Learning**
- Enhances: Improved discoverability through categorized navigation
- No interference with playback controls or interaction patterns

✅ **V. Performance & Scalability**
- CSS transforms for sidebar slide animations
- Virtual scrolling unnecessary (tree won't exceed 100 nodes initially)
- Lazy category expansion (only render visible children)

### Design Standards Compliance

✅ **Visual Component Architecture**
- Separation: Navigation logic separate from routing/algorithm loading
- State: NavigationState.svelte.ts manages tree expansion immutably
- Declarative: TreeNode.svelte renders based on node state

✅ **Algorithm Integration Contract**
- No changes to plugin interface
- Navigation metadata added to plugin registration (category path)

**Constitutional Status**: ✅ PASS - No violations

## Project Structure

### Documentation (this feature)
```
specs/003-move-the-navigation/
├── plan.md              # This file
├── research.md          # Phase 0 complete
├── data-model.md        # Phase 1 complete
├── quickstart.md        # Phase 1 complete
├── contracts/           # Phase 1 complete
│   └── navigation-tree-schema.ts
└── tasks.md             # Phase 2 (created by /tasks command)
```

### Source Code (repository root)
```
src/
├── lib/
│   ├── components/
│   │   ├── navigation/
│   │   │   ├── Sidebar.svelte           # Main sidebar container
│   │   │   ├── TreeNode.svelte          # Recursive tree node component
│   │   │   ├── SidebarToggle.svelte    # Collapse/expand button
│   │   │   └── NavigationTree.svelte    # Tree root component
│   │   ├── PlaybackControls.svelte      # (existing)
│   │   └── ...
│   ├── core/
│   │   ├── PlaybackController.svelte.ts # (existing)
│   │   └── NavigationState.svelte.ts    # NEW: Tree expansion state
│   ├── types/
│   │   ├── navigation.ts                # NEW: NavigationNode, Category types
│   │   └── ...
│   ├── data/
│   │   └── navigation-tree.ts           # NEW: Algorithm category structure
│   └── plugins/
│       ├── trappingRainWater2.ts        # (existing, add category metadata)
│       └── uniquePathsWithObstacles.ts  # (existing, add category metadata)
├── routes/
│   ├── +layout.svelte                   # Add Sidebar here
│   ├── +page.svelte                     # Remove inline selectors, simplify
│   └── [category]/[algorithm]/+page.svelte  # NEW: Algorithm detail route
└── app.css                              # Add sidebar/tree styles

tests/
├── unit/
│   ├── navigation/
│   │   ├── NavigationState.test.ts      # Tree state logic
│   │   ├── TreeNode.test.svelte.ts      # Component tests (deferred - E2E)
│   │   └── navigation-tree.test.ts      # Data structure validation
└── integration/
    └── sidebar-navigation.test.ts       # E2E navigation flow
```

**Structure Decision**: Single project (no backend). Standard SvelteKit routing with dynamic `[category]/[algorithm]` routes. Navigation component lives in `lib/components/navigation/` following existing pattern. State management uses Svelte 5 runes in `core/`.

## Phase 0: Outline & Research

**Status**: ✅ Complete

### Research Findings

1. **Svelte 5 Runes for State**
   - Decision: Use `$state()` for tree expansion, `$derived()` for active path
   - Rationale: Native reactivity, no external store needed, aligns with existing PlaybackController pattern
   - Alternative: Svelte stores (rejected - runes cleaner for class-based state)

2. **Routing Strategy**
   - Decision: SvelteKit file-based routing `/[category]/[algorithm]`
   - Rationale: Enables deep linking (FR-013), natural URL structure
   - Alternative: Query params (rejected - less semantic, harder to share)

3. **Tree Rendering**
   - Decision: Recursive TreeNode.svelte component
   - Rationale: Unlimited nesting (FR-010), simple implementation
   - Alternative: Flat list with indentation (rejected - complex parent tracking)

4. **Mobile Drawer**
   - Decision: CSS transforms + fixed positioning + overlay backdrop
   - Rationale: 60fps animations, no JS animation libraries needed
   - Alternative: Dialog element (rejected - less control over slide animation)

5. **State Persistence**
   - Decision: localStorage for expanded nodes, sessionStorage for sidebar visibility
   - Rationale: Survives page reloads (FR-008), simple serialization
   - Alternative: URL state (rejected - pollutes URLs with UI state)

**Output**: `B:\Projects\algo-vis\specs\003-move-the-navigation\research.md`

## Phase 1: Design & Contracts

**Status**: ✅ Complete

### Data Model

See `B:\Projects\algo-vis\specs\003-move-the-navigation\data-model.md`

**Key entities**:
- `NavigationNode<T>`: Generic tree node (category or algorithm)
- `CategoryNode`: Branch node with children
- `AlgorithmNode`: Leaf node with plugin reference
- `NavigationState`: Manages expansion/selection state

### Contracts

**File**: `B:\Projects\algo-vis\specs\003-move-the-navigation\contracts/navigation-tree-schema.ts`

```typescript
// Navigation tree structure validated with Zod
export const NavigationNodeSchema = z.union([
  z.object({
    type: z.literal('category'),
    id: z.string(),
    label: z.string(),
    children: z.lazy(() => z.array(NavigationNodeSchema))
  }),
  z.object({
    type: z.literal('algorithm'),
    id: z.string(),
    label: z.string(),
    pluginId: z.string(),
    path: z.string() // URL path: /category/algorithm
  })
]);
```

### Component Contracts

**TreeNode.svelte Props**:
```typescript
interface Props {
  node: NavigationNode;
  level: number;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: (nodeId: string) => void;
  onSelect: (node: AlgorithmNode) => void;
}
```

**NavigationState API**:
```typescript
class NavigationState {
  expandedNodes: Set<string>;
  activeAlgorithmId: string | null;

  toggle(nodeId: string): void;
  expand(nodeId: string): void;
  collapse(nodeId: string): void;
  expandPath(nodeIds: string[]): void; // For FR-013
  setActive(algorithmId: string): void;
}
```

### Test Scenarios

From acceptance scenarios → integration tests:

1. **Sidebar Visibility** (`tests/integration/sidebar-navigation.test.ts`)
   - Test: Sidebar visible on page load
   - Test: Toggle button collapses/expands sidebar
   - Test: State persists across page reloads

2. **Tree Expansion** (`tests/unit/navigation/NavigationState.test.ts`)
   - Test: Clicking category expands children
   - Test: Only direct children visible (not grandchildren)
   - Test: Multiple categories can be expanded simultaneously

3. **Algorithm Selection** (`tests/integration/sidebar-navigation.test.ts`)
   - Test: Clicking algorithm navigates to `/category/algorithm`
   - Test: Active algorithm highlighted in tree
   - Test: Playback controller loads correct plugin

4. **URL Deep Linking** (`tests/integration/sidebar-navigation.test.ts`)
   - Test: Direct navigation to `/graphs/dijkstra` expands "Graphs" category
   - Test: Active path highlighted in tree

5. **Mobile Responsive** (`tests/integration/sidebar-navigation.test.ts`)
   - Test: Mobile viewport shows drawer overlay
   - Test: Clicking outside drawer dismisses it
   - Test: Tablet viewport shows narrower fixed sidebar

### Agent Context Update

**Output**: `B:\Projects\algo-vis\CLAUDE.md` (updated)

Added sections:
- Navigation tree structure and state management patterns
- Svelte 5 runes usage for tree expansion
- SvelteKit routing for algorithm pages
- Mobile-first sidebar implementation

## Phase 2: Task Planning Approach

**This section describes what the /tasks command will do - DO NOT execute during /plan**

### Task Generation Strategy

1. **Load tasks template**: `.specify/templates/tasks-template.md`
2. **Generate from design docs**:
   - Each contract → validation test task [P]
   - Each entity → type definition task [P]
   - Each component → component scaffold task → component implementation task
   - Each integration test → test-first task
3. **TDD ordering**:
   - Contracts/types first (parallel)
   - State management tests → implementation
   - Component tests (deferred to E2E due to Svelte 5 limitations)
   - Integration tests → make them pass

### Task Categories

**Foundation** (parallel):
- Define `NavigationNode` types
- Define navigation tree data structure
- Validate tree structure with Zod

**State Management**:
- Implement `NavigationState.svelte.ts`
- Write unit tests for expansion logic
- Write unit tests for active path tracking

**Components** (sequential):
- Create `TreeNode.svelte` skeleton
- Create `NavigationTree.svelte` skeleton
- Create `Sidebar.svelte` container
- Create `SidebarToggle.svelte` button
- Implement TreeNode expand/collapse
- Implement TreeNode selection
- Implement Sidebar responsive behavior

**Routing**:
- Create `[category]/[algorithm]/+page.svelte`
- Update `+layout.svelte` to include Sidebar
- Refactor `+page.svelte` to remove inline selectors

**Integration**:
- Write E2E sidebar visibility tests
- Write E2E tree expansion tests
- Write E2E algorithm selection tests
- Write E2E deep linking tests
- Write E2E mobile responsive tests

**Polish**:
- Add CSS transitions for smooth animations
- Implement localStorage persistence
- Add keyboard navigation (arrow keys)
- Update plugin metadata with categories

### Estimated Task Count

- Foundation: 3 tasks [P]
- State Management: 4 tasks
- Components: 8 tasks
- Routing: 3 tasks
- Integration: 6 tasks
- Polish: 4 tasks

**Total**: ~28 tasks in dependency order with [P] markers for parallelism

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

*No constitutional violations detected*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Progress Tracking

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (2 deferred as low-impact content details)
- [x] Complexity deviations documented (none)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*

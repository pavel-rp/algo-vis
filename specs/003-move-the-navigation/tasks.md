# Tasks: Tree-Based Sidebar Navigation

**Feature**: 003-move-the-navigation
**Input**: Design documents from `B:\Projects\algo-vis\specs\003-move-the-navigation\`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/navigation-tree-schema.ts, quickstart.md

## Execution Summary

This task list implements tree-based sidebar navigation with hierarchical categories, mobile-responsive drawer, and URL-based deep linking. Implementation follows TDD principles with contract/schema validation tests first, then unit tests for state logic, followed by component implementation, and finally integration tests.

**Tech Stack**: TypeScript 5.0, Svelte 5 (runes), SvelteKit 2.0, Tailwind CSS 4.0, Zod 3.22
**Testing**: Vitest 3.2.4, @testing-library/svelte 5.2.8, happy-dom 19.0.2
**Performance Goals**: <16ms render (60fps), <100ms sidebar transitions

## Task Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- File paths are absolute from repository root

---

## Phase 3.1: Setup & Foundation

**Status**: ✅ Complete

- [x] **T001** Create navigation component directory structure
  - **Files**: Create `src/lib/components/navigation/` directory
  - **Files**: Create `src/lib/types/navigation.ts` file
  - **Files**: Create `src/lib/data/` directory
  - **Files**: Create `tests/unit/navigation/` directory
  - **Action**: Use mkdir to create all directories
  - **Validation**: Directories exist and are empty

- [x] **T002** [P] Copy navigation schema contract to source
  - **Files**: Copy `specs/003-move-the-navigation/contracts/navigation-tree-schema.ts` to `src/lib/types/navigation-schema.ts`
  - **Action**: Copy file with all imports, schemas, type guards, and validation functions
  - **Validation**: File compiles without errors, Zod schemas export correctly

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**Status**: ✅ Complete (7/7 complete)

### Schema & Data Validation Tests

- [x] **T003** [P] Schema validation test for navigation tree structure
  - **File**: `tests/unit/navigation/navigation-tree-schema.test.ts`
  - **Test Cases**:
    - Valid navigation tree passes validation
    - Invalid node IDs (not kebab-case) fail validation
    - Duplicate node IDs fail validation
    - Duplicate algorithm paths fail validation
    - Empty root nodes array fails validation
    - Valid CategoryNode with empty children array passes
    - Valid AlgorithmNode with required fields passes
  - **Import**: `validateNavigationTree`, `NavigationNodeSchema` from `$lib/types/navigation-schema`
  - **Expected**: All tests FAIL (implementation doesn't exist yet)

- [x] **T004** [P] Type guard tests for NavigationNode discrimination
  - **File**: `tests/unit/navigation/type-guards.test.ts`
  - **Test Cases**:
    - `isCategoryNode()` returns true for CategoryNode
    - `isCategoryNode()` returns false for AlgorithmNode
    - `isAlgorithmNode()` returns true for AlgorithmNode
    - `isAlgorithmNode()` returns false for CategoryNode
  - **Import**: `isCategoryNode`, `isAlgorithmNode` from `$lib/types/navigation-schema`
  - **Expected**: All tests FAIL (type guards not in source yet)

- [x] **T005** [P] Storage serialization helper tests
  - **File**: `tests/unit/navigation/storage-serialization.test.ts`
  - **Test Cases**:
    - `serializeExpandedNodes()` converts Set to JSON array
    - `deserializeExpandedNodes()` converts JSON to Set
    - `deserializeExpandedNodes()` returns empty Set on invalid JSON
    - `serializeSidebarVisibility()` converts boolean to JSON
    - `deserializeSidebarVisibility()` parses JSON boolean
    - `deserializeSidebarVisibility()` defaults to true on invalid JSON
  - **Import**: Serialization helpers from `$lib/types/navigation-schema`
  - **Expected**: All tests FAIL (helpers not in source yet)

### State Management Tests

- [x] **T006** [P] NavigationState core logic test
  - **File**: `tests/unit/navigation/NavigationState.test.ts`
  - **Test Cases**:
    - `toggle()` adds node to expandedNodes when collapsed
    - `toggle()` removes node from expandedNodes when expanded
    - `expand()` adds node to expandedNodes (idempotent)
    - `collapse()` removes node from expandedNodes (idempotent)
    - `expandPath()` expands all nodes in array
    - `setActive()` sets activeAlgorithmId
    - `clearActive()` sets activeAlgorithmId to null
    - `isExpanded()` returns correct boolean
    - `isActive()` returns correct boolean
  - **Import**: `NavigationState` from `$lib/core/NavigationState.svelte`
  - **Expected**: All tests FAIL (NavigationState class doesn't exist)
  - **Note**: Mock localStorage for tests

- [x] **T007** [P] NavigationState localStorage persistence test
  - **File**: `tests/unit/navigation/NavigationState-persistence.test.ts`
  - **Test Cases**:
    - `toggle()` writes to localStorage['algovis_expanded_nodes']
    - Constructor loads expandedNodes from localStorage
    - Invalid localStorage data defaults to empty Set
    - `expandPath()` persists all expanded nodes
  - **Import**: `NavigationState` from `$lib/core/NavigationState.svelte`
  - **Expected**: All tests FAIL (persistence not implemented)
  - **Setup**: Mock localStorage with `beforeEach(() => localStorage.clear())`

### Tree Data Structure Tests

- [x] **T008** [P] Navigation tree data structure validation test
  - **File**: `tests/unit/navigation/navigation-tree-data.test.ts`
  - **Test Cases**:
    - Navigation tree structure passes schema validation
    - All node IDs are unique
    - All algorithm paths are unique
    - All algorithm pluginIds reference valid plugins
    - Tree contains 2 initial algorithms (trapping-rain-water-2, unique-paths-obstacles)
    - Category hierarchy matches expected structure (DP → 2D Array, Graphs → Path Finding)
    - Category structures align with problem domain semantics (DP categories contain DP algorithms, Graph categories contain Graph algorithms)
  - **Import**: `navigationTree` from `$lib/data/navigation-tree`
  - **Import**: `validateNavigationTree` from `$lib/types/navigation-schema`
  - **Expected**: Tests FAIL (navigation-tree.ts doesn't exist)
  - **Note**: Validates FR-011 (domain-appropriate organization)

### Tree Traversal Helper Tests

- [x] **T009** [P] Tree query operations test
  - **File**: `tests/unit/navigation/tree-queries.test.ts`
  - **Test Cases**:
    - `findNodeById()` returns correct node when found
    - `findNodeById()` returns null when not found
    - `getAncestorIds()` returns correct path for nested algorithm
    - `getAncestorIds()` returns empty array for root-level node
    - `getAllAlgorithms()` returns all leaf algorithm nodes
    - `getAllAlgorithms()` excludes category nodes
  - **Import**: Query functions from `$lib/utils/navigation-queries` (to be created)
  - **Expected**: Tests FAIL (utility functions don't exist)

---

## Phase 3.3: Core Implementation (ONLY after tests are failing)

**Status**: ✅ Complete (4/4 complete)

### Type Definitions & Schema

- [x] **T010** Define TypeScript types for navigation nodes
  - **File**: `src/lib/types/navigation.ts`
  - **Content**:
    - Re-export types from `navigation-schema.ts` (NavigationNode, CategoryNode, AlgorithmNode, NavigationTree)
    - Add helper type aliases if needed
  - **Validation**: File compiles, types available for import
  - **Dependencies**: T002 (schema copied to source)

### Data Structures

- [x] **T011** Create initial navigation tree data structure
  - **File**: `src/lib/data/navigation-tree.ts`
  - **Content**:
    - Export `navigationTree` object following NavigationTree schema
    - Root nodes: "Dynamic Programming", "Graphs"
    - DP → 2D Array → Trapping Rain Water II (pluginId: 'trapping-rain-water-2', path: '/dynamic-programming/trapping-rain-water-2')
    - Graphs → Path Finding → Unique Paths with Obstacles (pluginId: 'unique-paths-with-obstacles', path: '/graphs/unique-paths-obstacles')
  - **Import**: `NavigationTree` type from `$lib/types/navigation`
  - **Validation**: T008 tests pass (tree structure valid)
  - **Dependencies**: T010 (types defined)

- [x] **T012** [P] Implement tree traversal utility functions
  - **File**: `src/lib/utils/navigation-queries.ts`
  - **Functions**:
    - `findNodeById(tree: NavigationTree, nodeId: string): NavigationNode | null`
    - `getAncestorIds(tree: NavigationTree, targetId: string): string[]`
    - `getAllAlgorithms(tree: NavigationTree): AlgorithmNode[]`
  - **Validation**: T009 tests pass (all query operations work)
  - **Dependencies**: T010 (types), T011 (navigation tree exists)

### State Management

- [x] **T013** Implement NavigationState class with Svelte 5 runes
  - **File**: `src/lib/core/NavigationState.svelte.ts`
  - **Content**:
    - Class with `$state()` fields: expandedNodes (Set<string>), activeAlgorithmId (string | null), sidebarOpen (boolean)
    - Methods: toggle, expand, collapse, expandPath, setActive, clearActive, toggleSidebar, isExpanded, isActive
    - Private persist() method writes to localStorage
    - Constructor with $effect() to load from localStorage
  - **Import**: Serialization helpers from `$lib/types/navigation-schema`
  - **Validation**: T006 tests pass (core logic), T007 tests pass (persistence)
  - **Dependencies**: T010 (types)
  - **Note**: Use `$state()`, `$effect()` runes per Svelte 5 pattern

---

## Phase 3.4: Component Implementation

**Status**: ✅ Complete (5/5 complete)

### Navigation Components

- [x] **T014** Create TreeNode recursive component
  - **File**: `src/lib/components/navigation/TreeNode.svelte`
  - **Content**:
    - Props: node (NavigationNode), level (number), isExpanded (boolean), isActive (boolean), onToggle (function), onSelect (function)
    - Conditional rendering: CategoryNode → button with expand icon + recursive children, AlgorithmNode → link
    - Indentation based on level (padding-left: level * 16px)
    - Active state styling (highlight background)
    - Recursive `<svelte:self>` for children
  - **Styling**: Tailwind classes (bg-gray-100 hover:bg-gray-200, text-blue-600 active)
  - **Validation**: Component renders without errors
  - **Dependencies**: T010 (types), T013 (NavigationState)
  - **Note**: Component tests deferred to E2E (T028) per Svelte 5 limitations

- [x] **T015** Create NavigationTree root component
  - **File**: `src/lib/components/navigation/NavigationTree.svelte`
  - **Content**:
    - Props: tree (NavigationTree), state (NavigationState)
    - Container with role="tree" (ARIA)
    - Map root nodes to TreeNode components
    - Pass isExpanded/isActive state from NavigationState
    - Handle toggle and select events
  - **ARIA**: role="tree", aria-label="Algorithm categories"
  - **Validation**: Component renders tree structure
  - **Dependencies**: T011 (tree data), T013 (state), T014 (TreeNode)

- [x] **T016** Create SidebarToggle button component
  - **File**: `src/lib/components/navigation/SidebarToggle.svelte`
  - **Content**:
    - Props: isOpen (boolean), onToggle (function)
    - Button with hamburger/close icon (SVG or Tailwind icon)
    - Desktop: Collapse/expand icon (chevron left/right)
    - Mobile: Hamburger menu icon
  - **Styling**: Fixed position on mobile, integrated into sidebar on desktop
  - **Validation**: Button renders and triggers onToggle
  - **Dependencies**: None (standalone component)

- [x] **T017** Create Sidebar container component
  - **File**: `src/lib/components/navigation/Sidebar.svelte`
  - **Content**:
    - Props: state (NavigationState), tree (NavigationTree)
    - Container with sidebar layout (fixed position, full height)
    - Include SidebarToggle and NavigationTree
    - CSS classes for mobile drawer behavior (translateX transform)
    - Backdrop overlay for mobile (only visible when open)
  - **Styling**:
    - Desktop: width 280px, fixed left
    - Tablet: width 220px
    - Mobile: translateX(-100%) when closed, translateX(0) when open, z-index 50
    - Backdrop: rgba(0,0,0,0.5), z-index 40, click handler to close
  - **Validation**: Sidebar renders with tree, toggle works
  - **Dependencies**: T013 (state), T015 (NavigationTree), T016 (SidebarToggle)

### Styling

- [x] **T018** Add sidebar and tree CSS styles
  - **File**: `src/app.css`
  - **Content**:
    - `.sidebar` class: fixed positioning, height 100vh, transform transitions
    - `.sidebar-backdrop` class: full-screen overlay, opacity transition
    - Media queries: Mobile (<768px), Tablet (768-1023px), Desktop (≥1024px)
    - Tree node styles: indentation, hover states, active states
    - Animation: `transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1)`
  - **Validation**: Visual inspection (sidebar slides smoothly, hover/active states visible)
  - **Dependencies**: None (append to existing app.css)
  - **Performance**: Use CSS transforms (GPU-accelerated) not left/right properties

---

## Phase 3.5: Routing & Integration

**Status**: ✅ Complete (6/6 complete)

### SvelteKit Routes

- [x] **T019** Update root layout to include Sidebar
  - **File**: `src/routes/+layout.svelte`
  - **Changes**:
    - Import Sidebar component
    - Import NavigationState and navigationTree
    - Create NavigationState instance
    - Sync activeAlgorithmId from $page.url.pathname
    - Render Sidebar in layout (persistent across routes)
    - Adjust main content area margin-left (desktop) or full-width (mobile)
  - **Validation**: Sidebar appears on all pages, state persists across navigation
  - **Dependencies**: T013 (NavigationState), T017 (Sidebar)

- [x] **T020** Create dynamic algorithm route
  - **File**: `src/routes/[category]/[algorithm]/+page.svelte`
  - **Content**:
    - Load algorithm plugin based on route params
    - Display algorithm name and visualization area
    - Integrate with existing PlaybackController (from existing code)
    - Handle 404 if algorithm not found
  - **Validation**: Navigating to `/dynamic-programming/trapping-rain-water-2` loads correct algorithm
  - **Dependencies**: T011 (navigation tree with paths)

- [x] **T021** Create load function for algorithm route
  - **File**: `src/routes/[category]/[algorithm]/+page.ts`
  - **Content**:
    - Export `load` function: extract category and algorithm from params
    - Use `findNodeById()` to get algorithm node
    - Throw error(404) if algorithm not found
    - Return plugin reference and algorithmId
    - Trigger NavigationState.expandPath() for deep linking (FR-013)
  - **Import**: `findNodeById`, `getAncestorIds` from `$lib/utils/navigation-queries`
  - **Validation**: Deep linking expands tree to show active algorithm
  - **Dependencies**: T012 (query functions), T020 (route page)

- [x] **T022** Refactor home page to remove inline selectors
  - **File**: `src/routes/+page.svelte`
  - **Changes**:
    - Remove algorithm selection buttons (lines 64-74 per existing code)
    - Remove preset selection buttons (lines 94-103)
    - Simplify to just visualization area + playback controls
    - Default to first algorithm or show welcome message
  - **Validation**: Home page simplified, navigation happens via sidebar
  - **Dependencies**: T019 (sidebar in layout)
  - **Note**: This modifies existing file - ensure no parallel tasks on +page.svelte

### Plugin Metadata

- [x] **T023** [P] Add category metadata to trappingRainWater2 plugin
  - **File**: `src/lib/plugins/trappingRainWater2.ts`
  - **Changes**:
    - Add `category: 'Dynamic Programming'` field to plugin object
    - Add `subcategory: '2D Array'` field
  - **Validation**: Plugin exports updated, matches navigation tree structure
  - **Dependencies**: None (metadata only)

- [x] **T024** [P] Add category metadata to uniquePathsWithObstacles plugin
  - **File**: `src/lib/plugins/uniquePathsWithObstacles.ts`
  - **Changes**:
    - Add `category: 'Graphs'` field to plugin object
    - Add `subcategory: 'Path Finding'` field
  - **Validation**: Plugin exports updated, matches navigation tree structure
  - **Dependencies**: None (metadata only)

---

## Phase 3.6: Integration & E2E Tests

**Status**: 🔴 Blocked - Wait for Phase 3.5 routing integration

### Integration Tests

- [ ] **T025** [P] E2E test: Sidebar visibility and toggle
  - **File**: `tests/integration/sidebar-visibility.test.ts`
  - **Test Cases** (from quickstart.md Tests 1, 5):
    - Sidebar visible on initial page load
    - Toggle button collapses sidebar (main content expands)
    - Toggle button expands sidebar (tree state preserved)
    - Sidebar state persists after page reload (localStorage)
  - **Tool**: Vitest browser mode or Playwright
  - **Validation**: All tests pass, sidebar behavior correct
  - **Dependencies**: T019 (sidebar in layout), T017 (Sidebar component)

- [ ] **T026** [P] E2E test: Tree expansion and collapse
  - **File**: `tests/integration/tree-expansion.test.ts`
  - **Test Cases** (from quickstart.md Tests 2, 3, 7):
    - Clicking category expands to show direct children only
    - Clicking expanded category collapses children
    - Multiple categories can be expanded simultaneously
    - Nested categories expand correctly (unlimited depth)
  - **ARIA Checks**: aria-expanded="true/false" on category nodes
  - **Validation**: All tests pass, tree expansion logic correct
  - **Dependencies**: T015 (NavigationTree), T014 (TreeNode)

- [ ] **T027** [P] E2E test: Algorithm selection and navigation
  - **File**: `tests/integration/algorithm-selection.test.ts`
  - **Test Cases** (from quickstart.md Tests 4, 7):
    - Clicking algorithm navigates to correct URL (/category/algorithm)
    - Active algorithm highlighted in tree (visual check or class assertion)
    - Main content displays correct algorithm visualization
    - Switching algorithms updates tree highlight
  - **Validation**: All tests pass, algorithm selection works
  - **Dependencies**: T020 (algorithm route), T021 (load function)

- [ ] **T028** [P] E2E test: URL deep linking and auto-expansion
  - **File**: `tests/integration/deep-linking.test.ts`
  - **Test Cases** (from quickstart.md Test 10, FR-013):
    - Direct navigation to `/dynamic-programming/trapping-rain-water-2` expands tree
    - Ancestor categories (DP → 2D Array) automatically expanded
    - Active algorithm visible and highlighted in tree
    - localStorage reflects expanded state
  - **Setup**: Clear localStorage before test
  - **Validation**: All tests pass, deep linking works (FR-013)
  - **Dependencies**: T021 (load function with expandPath)

- [ ] **T029** [P] E2E test: Mobile responsive drawer behavior
  - **File**: `tests/integration/mobile-drawer.test.ts`
  - **Test Cases** (from quickstart.md Tests 8, 9):
    - Mobile viewport (<768px): Sidebar hidden by default, hamburger button visible
    - Clicking hamburger opens drawer (translateX(0)), backdrop visible
    - Clicking backdrop closes drawer
    - Tablet viewport (768-1023px): Sidebar fixed at 220px width
    - Desktop viewport (≥1024px): Sidebar fixed at 280px width
  - **Viewports**: iPhone SE (375x667), iPad (768x1024), Desktop (1920x1080)
  - **Validation**: All tests pass, responsive behavior correct (FR-012, FR-012a)
  - **Dependencies**: T017 (Sidebar), T018 (CSS styles)

---

## Phase 3.7: Polish & Optimization

**Status**: 🔴 Blocked - Wait for Phase 3.6 integration tests

### Accessibility

- [ ] **T030** Add ARIA attributes to navigation tree
  - **Files**: `src/lib/components/navigation/NavigationTree.svelte`, `src/lib/components/navigation/TreeNode.svelte`
  - **Changes**:
    - NavigationTree: role="tree", aria-label="Algorithm categories"
    - CategoryNode: role="treeitem", aria-expanded="true/false"
    - AlgorithmNode: role="treeitem", aria-selected="true" (if active)
    - Keyboard navigation: Arrow keys (up/down/left/right), Enter, Space
  - **Reference**: W3C ARIA Tree View pattern (from research.md)
  - **Validation**: Screen reader announces correctly, keyboard navigation works
  - **Dependencies**: T014 (TreeNode), T015 (NavigationTree)
  - **Testing**: Use quickstart.md Test 12, 17

- [ ] **T031** [P] Add keyboard navigation handlers
  - **File**: `src/lib/components/navigation/NavigationTree.svelte`
  - **Changes**:
    - onKeyDown handler: ArrowDown (next node), ArrowUp (prev node), ArrowRight (expand), ArrowLeft (collapse), Enter (select)
    - Focus management (visible focus outline)
    - Tab order correct
  - **Validation**: All keyboard shortcuts work
  - **Dependencies**: T015 (NavigationTree)

### Performance

- [ ] **T032** [P] Performance validation: Expansion animation
  - **File**: Manual testing + DevTools Performance profiling
  - **Test** (from quickstart.md Test 13):
    - Open DevTools Performance tab
    - Record category expansion
    - Verify frames <16ms (60fps maintained)
    - Check for layout thrashing
  - **Target**: <16ms per frame, <200ms total transition
  - **Optimization**: If fails, check CSS transform usage (not left/right)
  - **Dependencies**: T018 (CSS styles)

- [ ] **T033** [P] Performance validation: Large tree (50+ nodes)
  - **File**: Create test fixture with 50 algorithm nodes
  - **Test** (from quickstart.md Test 14):
    - Add test data to navigation-tree.ts (temporary)
    - Expand all categories
    - Measure render time (<1s)
    - Rapid collapse/expand categories (60fps maintained)
  - **Validation**: Performance acceptable, no memory leaks
  - **Dependencies**: T011 (navigation tree)
  - **Note**: Remove test fixture after validation

### Documentation

- [ ] **T034** [P] Update README with navigation feature
  - **File**: `README.md`
  - **Changes**:
    - Add "Navigation" section describing tree-based sidebar
    - Update screenshots (if applicable)
    - Document mobile drawer behavior
    - Add deep linking examples
  - **Validation**: README accurate and up-to-date
  - **Dependencies**: Feature complete

### Final Validation

- [ ] **T035** Execute manual testing from quickstart.md
  - **File**: `specs/003-move-the-navigation/quickstart.md`
  - **Action**: Run all 17 manual tests (Tests 1-17)
  - **Browsers**: Chrome, Firefox, Safari (latest)
  - **Devices**: Mobile (real device or DevTools), Tablet, Desktop
  - **Checklist**: Use quickstart.md validation checklist at end
  - **Validation**: All tests pass, no regressions
  - **Dependencies**: All implementation tasks complete (T001-T031)

- [ ] **T036** Run full test suite and verify coverage
  - **Command**: `pnpm run test`
  - **Validation**:
    - All unit tests pass (T003-T009)
    - All integration tests pass (T025-T029)
    - NavigationState coverage >80% (constitutional requirement)
    - No console errors or warnings
  - **Dependencies**: All tests implemented (T003-T029)

- [ ] **T037** Cross-browser compatibility check
  - **Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
  - **Action**: Run Tests 1-10 from quickstart.md in each browser
  - **Validation**: Identical behavior, no console errors
  - **Dependencies**: T035 (manual testing complete)

---

## Dependencies Graph

```
Setup & Foundation:
  T001 → T002 [P] → T010

Tests First (TDD):
  T003 [P], T004 [P], T005 [P], T006 [P], T007 [P], T008 [P], T009 [P]
  (All independent, can run in parallel)
  (All must FAIL before Phase 3.3)

Core Implementation:
  T010 → T011, T013
  T011 → T012 [P]

Components:
  T013, T010 → T014
  T014, T013, T011 → T015
  (none) → T016 [P]
  T013, T015, T016 → T017
  (none) → T018 [P]

Routing & Integration:
  T013, T017 → T019
  T011 → T020
  T012, T020 → T021
  T019 → T022
  (none) → T023 [P], T024 [P]

E2E Tests:
  T019, T017 → T025 [P]
  T015, T014 → T026 [P]
  T020, T021 → T027 [P], T028 [P]
  T017, T018 → T029 [P]

Polish:
  T014, T015 → T030, T031 [P]
  T018 → T032 [P]
  T011 → T033 [P]
  (feature complete) → T034 [P]

Final Validation:
  T001-T031 → T035
  T003-T029 → T036
  T035 → T037
```

---

## Parallel Execution Examples

### Phase 3.2: All TDD tests in parallel (7 tasks)
```bash
# Run all test creation tasks simultaneously
# Each creates a different test file
pnpm claude-code task "T003: Schema validation test for navigation tree structure in tests/unit/navigation/navigation-tree-schema.test.ts" &
pnpm claude-code task "T004: Type guard tests in tests/unit/navigation/type-guards.test.ts" &
pnpm claude-code task "T005: Storage serialization tests in tests/unit/navigation/storage-serialization.test.ts" &
pnpm claude-code task "T006: NavigationState core logic test in tests/unit/navigation/NavigationState.test.ts" &
pnpm claude-code task "T007: NavigationState persistence test in tests/unit/navigation/NavigationState-persistence.test.ts" &
pnpm claude-code task "T008: Navigation tree data validation in tests/unit/navigation/navigation-tree-data.test.ts" &
pnpm claude-code task "T009: Tree query operations test in tests/unit/navigation/tree-queries.test.ts"
wait
```

### Phase 3.5: Plugin metadata updates (2 tasks)
```bash
# Update different plugin files simultaneously
pnpm claude-code task "T023: Add category metadata to trappingRainWater2.ts" &
pnpm claude-code task "T024: Add category metadata to uniquePathsWithObstacles.ts"
wait
```

### Phase 3.6: All E2E tests in parallel (5 tasks)
```bash
# Create all integration test files simultaneously
pnpm claude-code task "T025: E2E test sidebar visibility in tests/integration/sidebar-visibility.test.ts" &
pnpm claude-code task "T026: E2E test tree expansion in tests/integration/tree-expansion.test.ts" &
pnpm claude-code task "T027: E2E test algorithm selection in tests/integration/algorithm-selection.test.ts" &
pnpm claude-code task "T028: E2E test deep linking in tests/integration/deep-linking.test.ts" &
pnpm claude-code task "T029: E2E test mobile drawer in tests/integration/mobile-drawer.test.ts"
wait
```

### Phase 3.7: Polish tasks (5 tasks)
```bash
# Performance validation and docs simultaneously
pnpm claude-code task "T031: Add keyboard navigation handlers to NavigationTree.svelte" &
pnpm claude-code task "T032: Performance validation expansion animation" &
pnpm claude-code task "T033: Performance validation large tree 50+ nodes" &
pnpm claude-code task "T034: Update README with navigation feature"
wait
```

---

## Task Execution Notes

### TDD Workflow (Critical)
1. **Phase 3.2**: Write ALL tests first (T003-T009)
2. **Verify tests FAIL**: Run `pnpm run test` → expect failures
3. **Phase 3.3**: Implement code to make tests pass
4. **Verify tests PASS**: Run `pnpm run test` → expect success

### Component Testing Strategy
- **Unit tests**: Focus on `.svelte.ts` files (NavigationState, query functions)
- **Component tests**: Deferred to E2E due to Svelte 5 + happy-dom limitations
- **Integration tests**: Use Vitest browser mode or Playwright (T025-T029)

### localStorage Mocking
All tests using localStorage (T005, T007, T008, T028) must:
```typescript
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
```

### Mobile Testing
Tests requiring viewport changes (T029):
```typescript
// Vitest browser mode
page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

// Or Playwright
await page.setViewportSize({ width: 375, height: 667 });
```

### Performance Testing
- Use Chrome DevTools Performance tab (T032)
- Target: <16ms frame time, <100ms transition
- If fails: Check CSS transforms (not left/right/top/bottom)

---

## Validation Checklist

**Before marking feature complete, verify**:

- [ ] All 37 tasks completed
- [ ] All unit tests pass (T003-T009, T006-T007)
- [ ] All integration tests pass (T025-T029)
- [ ] NavigationState test coverage >80%
- [ ] Manual testing quickstart.md complete (T035)
- [ ] Cross-browser testing complete (T037)
- [ ] No console errors or warnings
- [ ] Performance targets met (<16ms, <100ms)
- [ ] ARIA attributes correct (role, aria-expanded, aria-selected)
- [ ] Deep linking works (FR-013)
- [ ] Mobile drawer works (FR-012)
- [ ] localStorage persists state (FR-008)
- [ ] Unlimited nesting supported (FR-010)
- [ ] PlaybackController integration works (no regressions)
- [ ] All acceptance scenarios pass (spec.md lines 70-79)

---

## Common Issues & Solutions

**Issue**: Tests fail with "localStorage is not defined"
- **Solution**: Mock localStorage in test setup (see Task T007 notes)

**Issue**: Svelte 5 component tests fail in happy-dom
- **Solution**: Skip component tests, rely on E2E (T025-T029) instead

**Issue**: Tree state not persisting across reloads
- **Solution**: Check NavigationState.persist() called in toggle/expandPath methods

**Issue**: Deep linking not expanding tree
- **Solution**: Verify getAncestorIds() returns correct path, expandPath() called in +page.ts load

**Issue**: Mobile drawer animation laggy
- **Solution**: Ensure CSS uses `transform: translateX()` not `left` property (GPU acceleration)

**Issue**: Duplicate IDs in navigation tree
- **Solution**: Run validateNavigationTree() in T008 test, fix data in navigation-tree.ts

---

## References

- **Feature Spec**: `B:\Projects\algo-vis\specs\003-move-the-navigation\spec.md`
- **Implementation Plan**: `B:\Projects\algo-vis\specs\003-move-the-navigation\plan.md`
- **Research**: `B:\Projects\algo-vis\specs\003-move-the-navigation\research.md`
- **Data Model**: `B:\Projects\algo-vis\specs\003-move-the-navigation\data-model.md`
- **Contracts**: `B:\Projects\algo-vis\specs\003-move-the-navigation\contracts\navigation-tree-schema.ts`
- **Quickstart**: `B:\Projects\algo-vis\specs\003-move-the-navigation\quickstart.md`
- **Constitution**: `B:\Projects\algo-vis\.specify\memory\constitution.md`

---

**Total Tasks**: 37
**Estimated Complexity**: Medium-High (3-5 days with TDD)
**Parallelizable Tasks**: 18 marked [P]
**Critical Path**: T001 → T010 → T013 → T017 → T019 → T022 → T035

**Next Step**: Execute Phase 3.1 (T001-T002) to set up project structure

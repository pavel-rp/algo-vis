# Tasks: GCD Array Visualization with Multi-Phase Framework

**Input**: Design documents from `/specs/005-new-algorithm-visualization/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Tech stack: TypeScript 5.0, Svelte 5 (runes), SvelteKit 2, Zod 3.22, Vitest 3.2.4
   → Structure: Single SvelteKit project (src/lib/)
2. Load design documents ✓
   → data-model.md: 6 new entities, 2 extended entities
   → contracts/: 3 schema files (phase, renderer, gcd plugin)
   → research.md: 6 technical decisions
   → quickstart.md: 10-step validation scenario
3. Generate tasks by category ✓
   → Setup: Type definitions, directory structure
   → Tests: 3 contract test files, 1 integration test
   → Core: 1 container, 2 renderers, 1 plugin
   → Integration: Navigation, routing, wiring
   → Polish: Performance, accessibility, docs
4. Apply task rules ✓
   → Tests before implementation (TDD)
   → Parallel tasks marked [P]
   → Sequential dependencies enforced
5. Number tasks sequentially (T001-T030) ✓
6. Generate dependency graph ✓
7. Create parallel execution examples ✓
8. Validate task completeness ✓
   → All contracts have tests ✓
   → All entities have implementations ✓
   → All tests before implementation ✓
9. Return: SUCCESS (30 tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- All file paths are absolute from repository root

## Path Conventions
- **Source**: `src/lib/` (components, plugins, types, utils)
- **Tests**: `tests/` (unit/, integration/)
- **Specs**: `specs/005-new-algorithm-visualization/`
- Project type: Single SvelteKit application

## Status Notes (2025-10-09)
- Implementation for the multi-phase framework and GCD plugin landed in `src/lib/components/visualization/PhaseContainer.svelte`, renderer components, `src/routes/[category]/[algorithm]/+page.svelte`, and `src/lib/plugins/findGCD.ts` (covers tasks T011, T012, T013, T014, T017).
- Runtime bug surfaced after wiring the GCD page: `PhaseContainer` executed before data stabilised and rune accessors were invoked incorrectly, leading to `$.get(...) is not a function` and later `Cannot read properties of undefined (reading 'map')`. Patched on 2025-10-09 by switching to `$state`-backed reactions (no manual rune invocation) and adding null checks around `phase.rendererConfigs` and `currentStep?.state`.
- Remaining setup, schema, and test tasks (T003-T010, T018-T030, etc.) are still outstanding; update this checklist as those gaps are closed.

---

## Phase 3.1: Setup & Type Definitions

- [x] **T001** Create directory structure for multi-phase visualization framework
  - **Files**: `src/lib/components/visualization/`, `src/lib/components/visualization/renderers/`, `src/lib/types/`, `src/lib/plugins/`
  - **Action**: Create directories if they don't exist (some may already exist)
  - **Validation**: All directories exist and are accessible
  - **Dependencies**: None (can run first)

- [x] **T002** Define Phase and RendererConfig types in `src/lib/types/phase.ts`
  - **Files**: `src/lib/types/phase.ts` (new file)
  - **Content**: Phase interface, RendererConfig discriminated union (array, scalarPair, status variants)
  - **Reference**: `specs/005-new-algorithm-visualization/contracts/phase-container-interface.ts` for type definitions
  - **Validation**: Types compile without errors, export Phase and RendererConfig
  - **Dependencies**: T001

- [ ] **T003** [P] Create Zod validation schemas in `src/lib/types/phase-schemas.ts`
  - **Files**: `src/lib/types/phase-schemas.ts` (new file)
  - **Content**: PhaseSchema, RendererConfigSchema (discriminated union), ArrayRendererConfigSchema, ScalarPairRendererConfigSchema, StatusRendererConfigSchema
  - **Reference**: `specs/005-new-algorithm-visualization/contracts/renderer-config-schema.ts`
  - **Validation**: Schemas export correctly, can validate sample configs
  - **Dependencies**: T002 (needs types)

- [ ] **T004** [P] Extend AlgorithmPlugin type for multi-phase support in `src/lib/types/algorithm.ts`
  - **Files**: `src/lib/types/algorithm.ts` (existing file - extend)
  - **Content**: Add optional `phases?: Phase[]` field to AlgorithmPlugin interface
  - **Reference**: data-model.md section "8. AlgorithmPlugin (Extended)"
  - **Validation**: Existing plugins still compile (backward compatible), new field available
  - **Dependencies**: T002 (needs Phase type)

- [ ] **T005** [P] Extend ExecutionStep type with phaseId in `src/lib/types/trace.ts`
  - **Files**: `src/lib/types/trace.ts` (existing file - extend)
  - **Content**: Add `phaseId?: string` field to ExecutionStep interface (optional for backward compatibility)
  - **Reference**: data-model.md section "7. ExecutionStep (Extended)"
  - **Validation**: Existing code compiles, new field available
  - **Dependencies**: T002 (needs Phase type for context)

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation in Phase 3.3**

- [ ] **T006** [P] Contract test for PhaseContainer component in `tests/unit/components/PhaseContainer.test.ts`
  - **Files**: `tests/unit/components/PhaseContainer.test.ts` (new file)
  - **Content**:
    - Test: PhaseContainer renders correct phase based on currentStep.phaseId
    - Test: Phase transition triggers when phaseId changes
    - Test: Renders correct renderer components based on phase config
    - Test: Passes correct props to child renderers
  - **Reference**: `contracts/phase-container-interface.ts` for PhaseContainerProps
  - **Expected**: All tests FAIL (component doesn't exist yet)
  - **Dependencies**: T002, T003 (needs types and schemas)

- [ ] **T007** [P] Contract test for ArrayRenderer component in `tests/unit/components/renderers/ArrayRenderer.test.ts`
  - **Files**: `tests/unit/components/renderers/ArrayRenderer.test.ts` (new file)
  - **Content**:
    - Test: Renders array values as cells
    - Test: Highlights cells by index with correct role class
    - Test: Supports horizontal and vertical orientation
    - Test: Applies custom cell size if provided
  - **Reference**: ArrayRendererConfig from `contracts/renderer-config-schema.ts`
  - **Expected**: All tests FAIL (component doesn't exist yet)
  - **Dependencies**: T002, T003 (needs types)

- [ ] **T008** [P] Contract test for ScalarPairRenderer component in `tests/unit/components/renderers/ScalarPairRenderer.test.ts`
  - **Files**: `tests/unit/components/renderers/ScalarPairRenderer.test.ts` (new file)
  - **Content**:
    - Test: Displays m and n values side-by-side
    - Test: Shows operation string if provided
    - Test: Applies custom labels if provided
    - Test: Highlights completed state (n === 0)
  - **Reference**: ScalarPairRendererConfig from `contracts/renderer-config-schema.ts`
  - **Expected**: All tests FAIL (component doesn't exist yet)
  - **Dependencies**: T002, T003 (needs types)

- [ ] **T009** [P] Unit test for GCD plugin trace generation in `tests/unit/plugins/findGCD.test.ts`
  - **Files**: `tests/unit/plugins/findGCD.test.ts` (new file)
  - **Content**:
    - Test: Generates correct min/max search phase steps for `[2, 5, 6, 9, 10]`
    - Test: Generates correct GCD computation steps for `gcd(2, 10)`
    - Test: Final step shows `isComplete: true` and `n === 0`
    - Test: Fibonacci preset `[233, 377]` produces ~13 GCD steps
    - Test: Input validation rejects empty arrays, out-of-range values, >1000 elements
    - Test: All 5 presets generate valid traces
  - **Reference**: `contracts/gcd-plugin-schema.ts` for validation schemas
  - **Expected**: All tests FAIL (plugin doesn't exist yet)
  - **Dependencies**: T002, T003, T005 (needs extended ExecutionStep type)

- [ ] **T010** [P] Integration test for full GCD visualization flow in `tests/integration/gcd-visualization.test.ts`
  - **Files**: `tests/integration/gcd-visualization.test.ts` (new file)
  - **Content**:
    - Test: Load GCD page, select Fibonacci preset, verify phase 1 renders array
    - Test: Step through min/max phase, verify highlights update
    - Test: Phase transition occurs automatically when trace advances
    - Test: Phase 2 renders scalar pair (m, n) correctly
    - Test: Custom input `[12, 18, 24]` generates valid trace
    - Test: Invalid input shows validation error
  - **Reference**: `specs/005-new-algorithm-visualization/quickstart.md` steps 1-7
  - **Expected**: All tests FAIL (integration not wired yet)
  - **Dependencies**: T002-T005 (needs all types)

---

## Phase 3.3: Core Implementation (ONLY after tests are failing)

**Prerequisites**: Verify T006-T010 tests exist and fail before proceeding

- [ ] **T011** Implement PhaseContainer component in `src/lib/components/visualization/PhaseContainer.svelte`
  - **Files**: `src/lib/components/visualization/PhaseContainer.svelte` (new file)
  - **Content**:
    - Accept `phases` and `currentStep` props
    - Derive active phase using `$derived(() => phases.find(p => p.id === currentStep.phaseId))`
    - Render phase label and description
    - Iterate over `activePhase.rendererConfigs` and render appropriate component based on `type`
    - Use `{#if renderer.type === 'array'}` discriminated union pattern
    - Emit `phaseChange` event when active phase changes (use `$effect`)
  - **Reference**: `contracts/phase-container-interface.ts`, research.md "Decision 1"
  - **Validation**: T006 tests pass
  - **Dependencies**: T006 (test must exist and fail first)

- [ ] **T012** [P] Implement ArrayRenderer component in `src/lib/components/visualization/renderers/ArrayRenderer.svelte`
  - **Files**: `src/lib/components/visualization/renderers/ArrayRenderer.svelte` (new file)
  - **Content**:
    - Accept `data: number[]`, `highlight?: { indices, role }`, `layout?: { orientation, cellSize }` props
    - Render cells using CSS Grid (horizontal or vertical based on orientation)
    - Apply highlight class based on role ('focus', 'min', 'max', 'result')
    - Use CSS transforms for highlight animations (scale, not width)
    - Support custom cell size via CSS variable
  - **Reference**: ArrayRendererConfig schema, research.md "Decision 3"
  - **Validation**: T007 tests pass
  - **Dependencies**: T007 (test must exist and fail first)

- [ ] **T013** [P] Implement ScalarPairRenderer component in `src/lib/components/visualization/renderers/ScalarPairRenderer.svelte`
  - **Files**: `src/lib/components/visualization/renderers/ScalarPairRenderer.svelte` (new file)
  - **Content**:
    - Accept `data: { m, n, operation? }`, `labels?: { m, n }` props
    - Display m and n side-by-side in two columns
    - Show operation string below values (if provided)
    - Highlight when `isComplete` (n === 0) with success styling
    - Apply labels if provided, default to "m" and "n"
  - **Reference**: ScalarPairRendererConfig schema, research.md "Decision 4"
  - **Validation**: T008 tests pass
  - **Dependencies**: T008 (test must exist and fail first)

- [ ] **T014** Implement GCD plugin in `src/lib/plugins/findGCD.ts`
  - **Files**: `src/lib/plugins/findGCD.ts` (new file)
  - **Content**:
    - Export `findGCDPlugin: AlgorithmPlugin` object
    - Define 2 phases: 'min-max-search' and 'gcd-computation' with renderer configs
    - Implement `generateTrace(input: GCDInput)`:
      - Phase 1: Iterate array, track min/max, create ArrayVisualizationState for each step
      - Phase 2: Run Euclidean algorithm on (max, min), create ScalarPairState for each iteration
      - Return trace with all steps, phaseId set correctly
    - Define 5 presets per FR-007 and clarifications (simple, common factors, extreme, all same, Fibonacci)
    - Add input validation using GCDInputSchema
  - **Reference**: `contracts/gcd-plugin-schema.ts`, data-model.md entities 3-6
  - **Validation**: T009 tests pass
  - **Dependencies**: T004, T005, T009 (types + test must exist)

- [ ] **T015** [P] Add GCD input validation helpers in `src/lib/utils/validation.ts`
  - **Files**: `src/lib/utils/validation.ts` (existing file - extend)
  - **Content**:
    - Export `validateGCDInput(input: unknown): GCDInput` function
    - Use GCDInputSchema.parse() with try/catch
    - Return user-friendly error messages for validation failures
  - **Reference**: `contracts/gcd-plugin-schema.ts`, FR-009 requirements
  - **Validation**: Rejects invalid inputs with clear messages
  - **Dependencies**: T003 (needs schemas)

---

## Phase 3.4: Integration & Wiring

- [ ] **T016** Add Math / Number Theory category to navigation tree in `src/lib/data/navigation-tree.ts`
  - **Files**: `src/lib/data/navigation-tree.ts` (existing file - extend)
  - **Content**:
    - Add 'Math' top-level category if it doesn't exist
    - Add 'Number Theory' subcategory under Math
    - Add 'Find GCD of Array' algorithm node:
      ```typescript
      {
        type: 'algorithm',
        id: 'find-gcd-array',
        label: 'Find GCD of Array',
        pluginId: 'find-gcd-array',
        path: '/math/number-theory/find-gcd-array'
      }
      ```
  - **Reference**: Clarifications session (Math / Number Theory), FR-012
  - **Validation**: Navigation tree compiles, new category visible
  - **Dependencies**: None (can run anytime after T001)

- [ ] **T017** Create GCD algorithm route in `src/routes/math/number-theory/find-gcd-array/+page.svelte`
  - **Files**: `src/routes/math/number-theory/find-gcd-array/+page.svelte` (new file)
  - **Content**:
    - Import findGCDPlugin
    - Import PhaseContainer, PlaybackController
    - Render algorithm title, description
    - Render preset selector (5 options)
    - Render custom input field with validation
    - Initialize PlaybackController with generated trace
    - Render PhaseContainer with plugin.phases and currentStep
    - Wire playback controls (play, pause, step forward/backward, speed)
  - **Reference**: Existing algorithm pages, quickstart.md steps 1-3
  - **Validation**: Page accessible at route, renders without errors
  - **Dependencies**: T011, T012, T013, T014 (all core components)

- [ ] **T018** [P] Create route loader in `src/routes/math/number-theory/find-gcd-array/+page.ts`
  - **Files**: `src/routes/math/number-theory/find-gcd-array/+page.ts` (new file)
  - **Content**:
    - Export `load` function
    - Load findGCDPlugin
    - Return plugin and algorithmId
    - Handle 404 if plugin not found
  - **Reference**: Existing route loaders, CLAUDE.md routing patterns
  - **Validation**: Page load function executes, returns plugin
  - **Dependencies**: T014 (needs plugin)

- [ ] **T019** Update NavigationState to auto-expand Math / Number Theory path in `src/lib/core/NavigationState.svelte.ts`
  - **Files**: `src/lib/core/NavigationState.svelte.ts` (existing file - extend)
  - **Content**:
    - When algorithmId is 'find-gcd-array', call `expandPath(['math', 'number-theory'])`
    - Ensure deep linking works (direct URL navigation expands tree)
  - **Reference**: CLAUDE.md "Navigation State Pattern", FR-012 (navigation category), clarifications (Math / Number Theory)
  - **Validation**: Direct navigation to GCD page expands correct tree nodes
  - **Dependencies**: T016 (navigation tree must have Math/Number Theory)

- [ ] **T020** Wire PhaseContainer to PlaybackController in algorithm page
  - **Files**: `src/routes/math/number-theory/find-gcd-array/+page.svelte` (modify from T017)
  - **Content**:
    - Pass `currentStep` from PlaybackController to PhaseContainer
    - Ensure PhaseContainer re-renders when currentStep changes (Svelte reactivity)
    - Handle phase transition events (optional: show toast notification)
  - **Reference**: PlaybackController API, research.md "Decision 6"
  - **Validation**: Stepping through trace updates phase container, renderers re-render
  - **Dependencies**: T017 (page must exist)

---

## Phase 3.5: Testing & Validation

- [ ] **T021** Verify all contract tests pass
  - **Files**: Run `pnpm test tests/unit/components/PhaseContainer.test.ts tests/unit/components/renderers/`
  - **Action**: Execute tests, ensure all assertions pass
  - **Expected**: T006-T008 tests all green
  - **Dependencies**: T011, T012, T013 (implementations complete)

- [ ] **T022** Verify plugin unit tests pass
  - **Files**: Run `pnpm test tests/unit/plugins/findGCD.test.ts`
  - **Action**: Execute tests, verify trace generation correctness
  - **Expected**: T009 tests all green
  - **Dependencies**: T014, T015 (plugin + validation implemented)

- [ ] **T023** Run integration test and verify end-to-end flow
  - **Files**: Run `pnpm test tests/integration/gcd-visualization.test.ts`
  - **Action**: Execute integration test
  - **Expected**: T010 tests all green (full user flow works)
  - **Dependencies**: T017, T018, T019, T020 (full integration complete)

- [ ] **T024** Execute quickstart manual validation
  - **Files**: Follow `specs/005-new-algorithm-visualization/quickstart.md` steps 1-10
  - **Action**: Manual testing in browser
  - **Validation**: All 10 steps pass, all checkboxes ✅
  - **Dependencies**: T021, T022, T023 (automated tests pass first)

- [ ] **T025** Performance verification: Trace generation <100ms
  - **Files**: Create performance test in `tests/unit/plugins/findGCD.performance.test.ts`
  - **Content**:
    - Test: Generate trace for 1000-element array in <100ms
    - Test: Generate trace for Fibonacci preset in <10ms (smaller input)
    - Use `performance.now()` or Vitest's `bench` API
  - **Reference**: FR-013, Constitutional Principle V
  - **Validation**: Both tests pass (meet performance targets)
  - **Dependencies**: T014 (plugin implemented)

- [ ] **T026** Performance verification: Rendering <16ms per frame
  - **Files**: Create performance test in `tests/integration/rendering-performance.test.ts`
  - **Content**:
    - Use Playwright or browser DevTools Recording API
    - Step through 50-element array trace
    - Measure frame render time (requestAnimationFrame delta)
    - Assert: All frames <16ms (60fps)
  - **Reference**: FR-014, Constitutional Principle V
  - **Validation**: Rendering consistently at 60fps
  - **Dependencies**: T017, T020 (rendering fully wired)

---

## Phase 3.6: Polish & Documentation

- [ ] **T027** [P] Add JSDoc comments and visual encoding documentation
  - **Files**:
    - `src/lib/components/visualization/PhaseContainer.svelte`
    - `src/lib/components/visualization/renderers/ArrayRenderer.svelte`
    - `src/lib/components/visualization/renderers/ScalarPairRenderer.svelte`
    - `specs/visual-encoding.md` (or create if doesn't exist)
  - **Content**:
    - Document props, events, usage examples in JSDoc
    - Explain when to use each renderer
    - Add constitutional principle alignment notes
    - Add visual-encoding.md entries for ArrayRenderer and ScalarPairRenderer highlight roles
  - **Reference**: Existing component documentation style, plan.md task 26
  - **Validation**: JSDoc renders in IDE hover tooltips, visual-encoding.md updated
  - **Dependencies**: T011, T012, T013 (components implemented)

- [ ] **T028** [P] Update CLAUDE.md with multi-phase visualization patterns
  - **Files**: `CLAUDE.md` (existing file - extend)
  - **Content**:
    - Add section on multi-phase visualization framework
    - Document PhaseContainer usage pattern
    - Explain declarative renderer composition
    - Add example of how to create multi-phase algorithm plugin
    - Update "Recent changes" section
  - **Reference**: plan.md summary, research.md decisions
  - **Validation**: CLAUDE.md contains clear multi-phase framework documentation
  - **Dependencies**: T011-T014 (all components implemented)

- [ ] **T029** [P] Verify accessibility: Keyboard navigation and ARIA labels
  - **Files**: Test all components manually + automated audit
  - **Action**:
    - Tab through all interactive elements (presets, playback controls, input field)
    - Verify focus indicators visible
    - Add ARIA labels to PhaseContainer, ArrayRenderer, ScalarPairRenderer
    - Run `pnpm test:a11y` (if exists) or Lighthouse audit
  - **Reference**: quickstart.md step 10, Svelte accessibility warnings
  - **Validation**: Lighthouse accessibility score >90
  - **Dependencies**: T017, T020 (full page rendering)

- [ ] **T030** Final review and cleanup
  - **Action**:
    - Remove console.log statements
    - Check for TODOs/FIXMEs
    - Run `pnpm lint` and fix issues
    - Run full test suite: `pnpm test`
    - Run coverage: `pnpm test:coverage` (verify >80% for new code)
    - Build production: `pnpm build` (verify no errors)
  - **Validation**: All checks pass, no warnings
  - **Dependencies**: T001-T029 (everything complete)

---

## Dependencies

**Critical Path** (must be sequential):
```
T001 (setup)
  → T002 (types)
  → T003, T004, T005 (schemas + type extensions)
  → T006-T010 (tests - all must FAIL)
  → T011-T014 (implementations - tests must PASS)
  → T017, T020 (integration)
  → T021-T024 (validation)
  → T030 (final review)
```

**Parallel Opportunities**:
- **After T002**: T003, T004, T005 can run in parallel (different files)
- **After T003-T005**: T006, T007, T008, T009, T010 can run in parallel (different test files)
- **After T006-T010**: T012, T013 can run in parallel (different components, T011 must be sequential with T017)
- **After T011-T020**: T025, T026, T027, T028, T029 can run in parallel (different concerns)

**Blocking Relationships**:
- T011 (PhaseContainer) blocks T017 (page needs container)
- T014 (plugin) blocks T017, T018 (page needs plugin)
- T016 (nav tree) blocks T019 (nav state needs tree)
- T017 blocks T020 (wiring needs page)
- T021-T023 block T024 (automated tests before manual)
- T024 blocks T030 (manual validation before final review)

---

## Parallel Execution Examples

### Example 1: Type Extensions (After T002)
```bash
# Run in parallel - different files, no dependencies on each other
pnpm exec vitest T003  # phase-schemas.ts
pnpm exec vitest T004  # algorithm.ts extension
pnpm exec vitest T005  # trace.ts extension
```

### Example 2: Contract Tests (After T003-T005)
```bash
# All tests can be written in parallel - different files
# Test files: PhaseContainer.test.ts, ArrayRenderer.test.ts, ScalarPairRenderer.test.ts, findGCD.test.ts, gcd-visualization.test.ts
# Expected: ALL MUST FAIL at this stage
```

### Example 3: Renderer Implementations (After T006-T010 fail)
```bash
# T012 and T013 can run in parallel - different files
# T011 must run first (PhaseContainer), then T017 can use it
```

### Example 4: Final Polish (After T021-T024)
```bash
# Run in parallel - different concerns
# T025: Performance test (trace)
# T026: Performance test (rendering)
# T027: JSDoc comments
# T028: CLAUDE.md update
# T029: Accessibility audit
```

---

## Validation Checklist

*GATE: All must pass before marking feature complete*

- [x] All contracts have corresponding tests (T006-T008 cover 3 contracts)
- [x] All entities have implementation tasks (Phase, RendererConfig, GCDInput, etc.)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (checked file paths)
- [x] Each task specifies exact file path (all tasks include file paths)
- [x] No task modifies same file as another [P] task (verified)
- [x] TDD enforced (T006-T010 must fail before T011-T014)
- [x] Performance targets testable (T025, T026)
- [x] Constitutional compliance verified (all 5 principles covered)

---

## Notes

- **[P] tasks** = different files, no dependencies (can run concurrently)
- **TDD Critical**: Tests T006-T010 MUST exist and fail before implementing T011-T014
- **Commit strategy**: Commit after each task for clean history
- **Performance**: T025, T026 verify <100ms trace, <16ms render (Constitutional V)
- **Accessibility**: T029 ensures WCAG compliance
- **Documentation**: T027, T028 maintain project knowledge base

---

**Total Tasks**: 30
**Estimated Parallel Tasks**: 12-15 (marked with [P])
**Estimated Sequential Tasks**: 15-18
**Critical Path Length**: ~15 tasks (setup → types → tests → implementations → integration → validation → final)

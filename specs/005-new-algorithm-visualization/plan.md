# Implementation Plan: GCD Array Visualization with Multi-Phase Framework

**Branch**: `005-new-algorithm-visualization` | **Date**: 2025-10-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-new-algorithm-visualization/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path ✓
2. Fill Technical Context ✓
   → Project Type: Single SvelteKit application
   → Structure Decision: Extend existing src/lib architecture
3. Fill Constitution Check ✓
4. Evaluate Constitution Check ✓
   → No violations - aligns with all constitutional principles
   → Update Progress Tracking: Initial Constitution Check ✓
5. Execute Phase 0 → research.md ✓
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md update ✓
7. Re-evaluate Constitution Check ✓
   → No new violations - design maintains constitutional compliance
   → Update Progress Tracking: Post-Design Constitution Check ✓
8. Plan Phase 2 → Describe task generation approach ✓
9. STOP - Ready for /tasks command ✓
```

**IMPORTANT**: The /plan command STOPS at step 8. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

This feature implements visualization for LeetCode problem 1979 "Find Greatest Common Divisor of Array" while introducing a **multi-phase visualization framework** that will benefit future algorithm implementations. The algorithm has two distinct phases: (1) finding min/max in array, (2) computing GCD via Euclidean algorithm. Rather than building these as one-off components, we're creating a reusable phase container system with declarative renderer composition, aligning perfectly with Constitutional Principle II (Framework Reusability).

**Key Innovation**: Framework provides generic renderers (array, scalar pairs, status text) and a phase container. Plugins declaratively specify which renderers to use in each phase with data bindings. This hybrid approach balances framework power with plugin flexibility.

## Technical Context

**Language/Version**: TypeScript 5.0, Svelte 5 (runes mode)
**Primary Dependencies**: SvelteKit 2.0, Tailwind CSS 4, Zod 3.22, Vitest 3.2.4
**Storage**: N/A (client-side only)
**Testing**: Vitest with @testing-library/svelte 5.2.8, happy-dom 19.0.2
**Target Platform**: Modern browsers (Chrome/Firefox/Safari latest 2 versions)
**Project Type**: Single SvelteKit application
**Performance Goals**:
- Trace generation <100ms (Constitutional V)
- Render updates <16ms for 60fps (Constitutional V)
- Support arrays up to 1000 elements
**Constraints**:
- Input validation: 1-1000 elements, values 1-10000
- No server-side processing
- Must work offline once loaded
**Scale/Scope**:
- 1 new algorithm plugin (GCD Array)
- 1 new framework component (PhaseContainer)
- 2-3 new generic renderers (ArrayRenderer, ScalarPairRenderer, potentially StatusRenderer enhancement)
- 5 preset examples

## Constitution Check

**Gate: Must pass before Phase 0 research. Re-check after Phase 1 design.**

### Principle I: Visualization-First Design ✅
- **Compliance**: Algorithm produces visual output at each step showing:
  - Current array element being examined (focus highlighting)
  - Current min/max values (highlighted)
  - Euclidean algorithm variables m, n during GCD computation
  - Phase transitions between min/max search and GCD calculation
- **Evidence**: FR-003, FR-004, FR-005 mandate visual highlighting; FR-011 requires step descriptions

### Principle II: Framework Reusability ✅
- **Compliance**: Multi-phase framework is algorithm-agnostic and composable:
  - PhaseContainer works for any multi-step algorithm
  - ArrayRenderer can visualize any 1D array algorithm
  - ScalarPairRenderer supports any algorithm tracking two values
  - Plugins declaratively configure renderers (FR-002a, FR-002b)
- **Evidence**: Design explicitly avoids GCD-specific rendering logic; components are configured via props/data bindings

### Principle III: Step-by-Step Traceability ✅
- **Compliance**:
  - Existing PlaybackController provides play/pause, step forward/backward (FR-006)
  - Plugin generates complete execution trace with all frames
  - Each frame contains immutable state snapshot
- **Evidence**: Leverages existing framework primitives; no new traceability infrastructure needed

### Principle IV: Interactive Learning ✅
- **Compliance**:
  - PlaybackController handles speed adjustment (existing)
  - 5 preset examples provided (FR-007)
  - Input validation for custom arrays (FR-008, FR-009)
  - Phase transitions create clear learning moments
- **Evidence**: Presets include worst-case (Fibonacci), best-case (all same), and typical scenarios

### Principle V: Performance & Scalability ✅
- **Compliance**:
  - Trace generation <100ms for 1000 elements (FR-013)
  - Render updates <16ms (FR-014)
  - Phase container uses CSS transforms for transitions
  - No full DOM reconstruction between frames
- **Evidence**: Existing GridRenderer patterns extended; reactive Svelte 5 runes minimize updates

**Initial Check Result**: ✅ PASS - All constitutional principles satisfied

## Project Structure

### Documentation (this feature)
```
specs/005-new-algorithm-visualization/
├── spec.md              # Feature specification with clarifications
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── phase-container-interface.ts
│   ├── renderer-config-schema.ts
│   └── gcd-plugin-schema.ts
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
src/lib/
├── components/
│   ├── visualization/
│   │   ├── PhaseContainer.svelte       # NEW: Multi-phase algorithm container
│   │   └── renderers/
│   │       ├── ArrayRenderer.svelte    # NEW: Generic 1D array visualization
│   │       ├── ScalarPairRenderer.svelte # NEW: Two-value display (m, n)
│   │       └── GridRenderer.svelte     # Existing (unchanged)
│   ├── navigation/                     # Existing (update navigation tree)
│   └── PlaybackControls.svelte         # Existing (unchanged)
├── plugins/
│   └── findGCD.ts                      # NEW: GCD Array algorithm plugin
├── types/
│   ├── phase.ts                        # NEW: Phase & renderer config types
│   └── algorithm.ts                    # UPDATE: Add multi-phase support
├── data/
│   └── navigation-tree.ts              # UPDATE: Add Math/Number Theory category
└── utils/
    └── validation.ts                   # UPDATE: Add array validation helpers

tests/
├── unit/
│   ├── plugins/
│   │   └── findGCD.test.ts             # Plugin algorithm logic tests
│   ├── components/
│   │   └── PhaseContainer.test.ts      # Phase container contract tests
│   └── renderers/
│       ├── ArrayRenderer.test.ts       # Array renderer tests
│       └── ScalarPairRenderer.test.ts  # Scalar pair renderer tests
└── integration/
    └── gcd-visualization.test.ts       # End-to-end visualization flow test
```

**Structure Decision**: Extend existing single-project SvelteKit structure. All framework components go in `src/lib/components/visualization/`, plugin in `src/lib/plugins/`, types in `src/lib/types/`. This maintains consistency with existing architecture (see CLAUDE.md directory map). The multi-phase framework is a natural extension of the current `PlaybackController` + renderer pattern.

## Phase 0: Outline & Research

**Status**: ✅ Complete (see [research.md](./research.md))

Research deliverable location: `B:\Projects\algo-vis\specs\005-new-algorithm-visualization\research.md`

## Phase 1: Design & Contracts

**Status**: ✅ Complete

Deliverables:
- [data-model.md](./data-model.md) - Entity definitions and relationships
- [quickstart.md](./quickstart.md) - End-to-end validation scenario
- `/contracts/` - TypeScript interfaces and Zod schemas
- CLAUDE.md update - Incremental agent context refresh

## Phase 2: Task Planning Approach

**IMPORTANT**: This section describes what the /tasks command will do - NOT executed during /plan

### Task Generation Strategy

The /tasks command will:
1. Load `.specify/templates/tasks-template.md` as base structure
2. Parse contracts from Phase 1 (`/contracts/*.ts`)
3. Parse data model entities from `data-model.md`
4. Generate dependency-ordered tasks following TDD workflow

### Task Categories & Ordering

**A. Foundation (Phase 1 - Framework Components)**
1. Define phase & renderer types (`src/lib/types/phase.ts`)
2. Create Zod schemas for renderer configs (`contracts/renderer-config-schema.ts`)
3. Write PhaseContainer contract test (should fail)
4. Implement PhaseContainer.svelte
5. Write ArrayRenderer contract test (should fail)
6. Implement ArrayRenderer.svelte [P]
7. Write ScalarPairRenderer contract test (should fail)
8. Implement ScalarPairRenderer.svelte [P]

**B. Plugin Implementation (Phase 2 - Algorithm)**
9. Define GCD plugin interface (`contracts/gcd-plugin-schema.ts`)
10. Write GCD trace generation tests (should fail)
11. Implement findGCD.ts trace generation
12. Add input validation with Zod
13. Create 5 preset examples (simple, common factors, extreme, same, Fibonacci)

**C. Integration (Phase 3 - Wiring)**
14. Update AlgorithmPlugin type for multi-phase support
15. Add Math/Number Theory category to navigation tree
16. Create GCD algorithm route (`[category]/[algorithm]/+page.svelte`)
17. Wire PhaseContainer to PlaybackController
18. Add validation helpers for array input

**D. Testing & Validation (Phase 4)**
19. Write integration test for full GCD visualization flow (should fail)
20. Implement missing integration points to pass test
21. Run quickstart.md validation steps manually
22. Verify performance: trace generation <100ms for 1000 elements
23. Verify performance: rendering <16ms per frame

**E. Documentation & Polish (Phase 5)**
24. Update CLAUDE.md with multi-phase patterns
25. Add JSDoc comments to PhaseContainer and renderer components
26. Create visual-encoding.md entry for new renderers
27. Verify accessibility (ARIA labels, keyboard navigation)

### Estimated Task Count
**27 tasks total**:
- 8 foundation tasks (types, components, tests)
- 5 plugin tasks (algorithm, validation, presets)
- 5 integration tasks (routing, wiring, nav tree)
- 4 testing/validation tasks
- 5 documentation/polish tasks

**Parallelization**: Tasks marked [P] can run in parallel (ArrayRenderer and ScalarPairRenderer are independent). Approximately 6-8 tasks can be parallelized across 3 phases.

### Dependency Graph Highlights
- PhaseContainer depends on phase types
- Renderers depend on renderer config schema but NOT on each other
- Plugin depends on validation schema
- Integration depends on all components + plugin
- Tests depend on corresponding implementations

**IMPORTANT**: The /tasks command will generate the complete tasks.md file with numbered tasks, dependencies, and acceptance criteria. This section only describes the approach.

## Phase 3+: Future Implementation

**These phases are beyond the scope of the /plan command**

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

### Implementation Notes for Phase 4
- Use Svelte 5 runes ($state, $derived, $effect) for reactive state
- Phase transitions driven by trace metadata (e.g., `{ phase: 'gcd-computation' }`)
- ArrayRenderer uses CSS transform for highlight animations (GPU-accelerated)
- Leverage existing PlaybackController - no modifications needed
- All renderers accept config via props (no global state)

### Validation Criteria for Phase 5
- All 27 tasks complete and tests passing
- quickstart.md executable without errors
- Performance benchmarks met (100ms trace, 16ms render)
- Constitutional compliance verified (all 5 principles)
- CLAUDE.md updated with new patterns

## Complexity Tracking

**No constitutional violations** - this section is empty because the design aligns with all constitutional principles. The multi-phase framework is a natural extension of existing patterns (PlaybackController + renderers) and directly supports Principle II (Framework Reusability).

## Progress Tracking

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - approach described)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (5 clarifications in spec)
- [x] Complexity deviations documented (none - no violations)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*

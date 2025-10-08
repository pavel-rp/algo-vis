# Testing Guide

## Test suite overview

- The Vitest suite currently spans **17 test files** with **303 total tests**; **299 pass** and **4 are skipped** (timer-driven playback assertions that remain flaky under mocked timers).
- Tests execute in the `happy-dom` environment with the Svelte plugin enabled, matching the configuration in `vitest.config.ts`.

## Suite breakdown

### Core controllers

- `PlaybackController.test.svelte.ts` validates playback transitions, frame indexing, and speed controls with runes-backed state, while explicitly skipping four timer assertions that require a browser timer bridge.
- `NavigationState.test.ts` and `NavigationState-persistence.test.ts` cover sidebar expansion, active-node tracking, and storage serialization, ensuring navigation state survives reloads.

### Navigation data & queries

- Schema guards protect the navigation tree definition (`navigation-tree-schema.test.ts`), and query helpers validate ancestor discovery and flattened lookups (`navigation-tree-data.test.ts`, `tree-queries.test.ts`).

### Algorithm plugins

- `src/lib/plugins/trappingRainWater2.test.ts` and `src/lib/plugins/uniquePathsWithObstacles.test.ts` verify trace generation, metrics, and validation logic for the two fully tested plugins.
- Contract-style tests in `tests/unit/plugins/swimInWater.test.ts` exercise the Zod schema but do **not** import the runtime plugin, leaving execution coverage at 0% for `swimInWater.ts`.

### Shared component contracts

- The component suites assert schema contracts for the visualization primitives (grid, priority queue, status display) rather than rendering actual `.svelte` files, so coverage for those modules remains 0%.
- `tests/unit/panels/LegendPanel.test.ts` confirms legend configuration handling but likewise exercises the TypeScript configuration module instead of the Svelte component.

### Integration smoke test

- `tests/integration/shared-components.test.ts` provides a high-level contract test that cross-checks shared component schemas across multiple features, acting as a regression guard for the specification files.

## Running tests

```bash
# Run the full suite once
pnpm test

# Run with coverage instrumentation
pnpm test:coverage

# Watch mode for local development
pnpm test:watch

# Launch the Vitest UI
pnpm test:ui
```

## Coverage summary

The latest `pnpm test:coverage` report highlights uneven coverage:

| Area | Statements | Notes |
| --- | --- | --- |
| Overall | 64.3% | Core controllers and validators are exercised; UI Svelte files are untouched by the current suites. |
| `src/lib/core` | 91.25% | `NavigationState` reaches 100%, `PlaybackController` meets the 80% threshold but still misses timer branches. |
| `src/lib/plugins` | 73.11% | `swimInWater.ts` remains untested in runtime scenarios, contributing 0% coverage for that file. |
| `src/lib/components` & `src/lib/renderers` | 0% | Schema-based tests do not execute the `.svelte` files, leaving UI logic unverified. |
| `src/lib/utils/MinHeap.ts` | 0% | The helper backs the Swim in Water implementation but lacks direct tests. |

Svelte's compiler surfaces additional accessibility warnings during the coverage run (tabindex usage, missing `aria-selected`, deprecated `on:` directives), which should be treated as actionable test findings for UI components.

## Known limitations

- Timer-driven playback behavior is only partially validated because mocked timers do not trigger `$effect`-scheduled intervals reliably in `happy-dom`; manual verification is still required for autoplay scenarios.
- The absence of DOM-level component tests means interactions such as button clicks, keyboard navigation, and responsive layout changes rely on manual QA.
- Performance targets from the constitution (trace generation <100 ms, smooth rendering for 20×20 grids) are not instrumented or enforced in the current suite.

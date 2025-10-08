# Constitution & Design Audit (2025-10-06)

## Summary

This audit reviews the current implementation against the Algorithm Visualization Framework Constitution and accompanying design expectations. The review surfaced several gaps that require follow-up to maintain constitutional compliance and product quality.

## Findings

### 1. Interactive input editing is missing (Principle IV)

Principle IV mandates that visualizations provide input modification capabilities so learners can experiment with custom data. The algorithm detail page currently exposes preset buttons only, without any form fields or editors for free-form input, leaving users unable to supply their own scenarios.

### 2. UI components lack runtime tests

The component-focused suites exercise Zod schemas instead of rendering `.svelte` components, so interactive behavior (clicks, keyboard focus, responsive layout) is unverified. This undermines the constitution's emphasis on reusable, interactive components and leaves multiple directories at 0% coverage.

### 3. Swim in Water execution path is untested

Although the `swimInWater` plugin ships with the application, no runtime tests load it; contract tests validate only the schema. Coverage reports confirm 0% execution for both the plugin and its supporting `MinHeap` utility, risking regressions in a critical algorithm-specific code path.

### 4. Accessibility warnings are currently ignored

`pnpm test:coverage` emits compiler warnings about tabindex usage, missing `aria-selected` attributes, deprecated event directives, and role mismatches in navigation components. These indicate non-compliance with accessibility best practices and should be triaged alongside functionality work.

### 5. Performance guarantees are not instrumented

The constitution requires render and trace performance targets, yet the documented test strategy acknowledges that no automated checks enforce these constraints. Future work should introduce profiling or smoke tests to validate the required thresholds.

## Recommendations

1. Add editable input widgets (e.g., JSON editors or grid builders) to each algorithm page and extend plugin validators accordingly.
2. Introduce Svelte Testing Library suites for navigation, playback controls, and the grid renderer to cover real DOM interactions and close coverage gaps.
3. Write execution tests for `swimInWater` that step through traces and assert heap behavior, and add targeted tests for `MinHeap` utilities.
4. Resolve the compiler-reported accessibility issues, then add regression tests (axe or unit-level attribute checks) to keep them from resurfacing.
5. Define performance budgets in the test suite—either via Vitest benchmarks or custom instrumentation—to uphold Principle V's latency requirements.

# Claude Context: Algorithm Visualizer

**Project**: Algorithm Visualizer (algo-vis)  
**Version**: 1.0.0  
**Last Reviewed**: 2025-10-06  
**Purpose**: Working notes for agents contributing to the codebase.

---

## High-level overview

- **Stack**: SvelteKit 2 + Svelte 5 runes, TypeScript, Tailwind CSS 4, Vitest, Zod.
- **Goal**: Visualize algorithm execution as a sequence of immutable frames that can be inspected, replayed, and annotated.
- **Core principles**: Visualization-first design, reusable components, step-by-step traceability, interactive learning, and performance guarantees per the project constitution.

### Primary flows

1. **Navigation** – The sidebar loads `navigationTree` data, persists expansion in `NavigationState`, and routes to algorithm detail pages using dynamic `[category]/[algorithm]` routes.
2. **Visualization** – Algorithm pages map the requested plugin ID to a concrete plugin module, load presets, drive playback with `PlaybackController`, and render the grid, legend, status, and optional priority-queue panels.
3. **Plugins** – Each algorithm plugin exports metadata, presets, validation, and a `trace` function that produces frame arrays consumed by the shared renderer.

### Directory map

```
algo-vis/
├── src/
│   ├── lib/
│   │   ├── components/            # Navigation, playback, panels, visualization helpers
│   │   ├── core/                  # PlaybackController, NavigationState
│   │   ├── data/                  # navigationTree definition
│   │   ├── plugins/               # Algorithm implementations + local tests
│   │   ├── renderers/             # GridRenderer
│   │   ├── theme/                 # Color tokens and CSS variables
│   │   ├── types/                 # Shared TypeScript contracts & schemas
│   │   └── utils/                 # Navigation queries, MinHeap helper
│   ├── routes/                    # Layout, home page, dynamic algorithm routes
│   └── app.css                    # Tailwind entrypoint and custom tokens
├── tests/
│   ├── unit/                      # Contract and schema-based tests
│   └── integration/               # Cross-component specification checks
├── specs/                         # Feature specs, plans, research, visual-encoding guide
└── .specify/memory/constitution.md # Project constitution
```

### Test & quality status

- `pnpm test` → 303 assertions across 17 files (299 pass, 4 skipped timer tests).
- `pnpm test:coverage` → 64.3% statement coverage; UI `.svelte` files for navigation, controls, and renderers remain untested; `swimInWater.ts` and `MinHeap.ts` lack coverage.
- Svelte compiler reports accessibility warnings (tabindex usage, missing `aria-selected`, deprecated `on:` directive) during the coverage run.

### Active gaps

- No UI for free-form input editing on algorithm pages, violating the interactive learning requirement for user-supplied data.
- Swim in Water plugin depends on `MinHeap` utility but lacks runtime tests, leaving important logic uncovered.
- Component contract tests validate Zod schemas rather than rendering `.svelte` components, so actual DOM interactions are unverified.

### Helpful commands

```bash
pnpm dev            # Start Vite dev server
pnpm test           # Run Vitest once
pnpm test:coverage  # Run with coverage & Svelte compiler diagnostics
pnpm build          # Production build output in build/
```

---

## Contribution tips

1. **Follow the constitution** – Prioritize reusable, algorithm-agnostic components and ensure new features expose visualization-friendly traces.
2. **Extend specs first** – Update or create entries under `specs/` before implementing a feature to keep the planning artifacts current.
3. **Add real component tests** – Where possible, supplement schema tests with `@testing-library/svelte` suites that exercise DOM behavior.
4. **Track accessibility** – Address compiler warnings surfaced during `pnpm test:coverage` before merging UI changes.

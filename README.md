# Algorithm Visualizer

Algorithm Visualizer is a SvelteKit application that renders step-by-step traces for grid-based algorithms. It pairs reusable Svelte 5 runes-based state management with pluggable algorithm definitions so educators and learners can explore how an algorithm evolves frame by frame.

## Application features

- **Tree-based navigation** with persistent sidebar state, deep linking, and storage-backed expansion using `NavigationState`.
- **Frame playback controls** (play, pause, single-step, reset) and speed adjustment driven by the shared `PlaybackController`.
- **Reusable grid renderer** that highlights focus cells, neighbors, and aggregated markers for each frame, with optional priority-queue summaries for heap-based algorithms.
- **Legend and status panels** that explain visual encodings and surface per-step descriptions and metrics supplied by each plugin.

## Available algorithms

| Algorithm | Category | Highlights |
| --- | --- | --- |
| Trapping Rain Water II | Dynamic Programming → 2D Array | Min-heap flood fill that tracks boundary expansion, trapped volume, and heap contents per frame.
| Unique Paths with Obstacles | Graphs → Path Finding | Dynamic programming over a grid that visualizes obstacle handling and path counts.
| Swim in Rising Water | Graphs → Priority Queue | Dijkstra-style traversal with a priority queue that models rising water levels over time.

Algorithm presets are selectable from the algorithm detail page so users can compare canonical scenarios without reloading the app.

## Architecture overview

- **SvelteKit layout shell** keeps the sidebar mounted while routing between the welcome screen and per-algorithm visualizations.
- **Dynamic algorithm routes** look up metadata from the navigation tree, validate the requested path, and hydrate the appropriate plugin at runtime.
- **Plugin contract** exposes `trace`, `validateInput`, optional legend overrides, and preset definitions so the UI can stay algorithm-agnostic.
- **Shared utilities** (navigation queries, theme tokens, heap helpers) live under `src/lib` and are consumed both by runtime code and the test suites.

## Development

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev

# Build for production
pnpm build

# Execute the Vitest suite
pnpm test

# Execute tests with coverage reporting
pnpm test:coverage
```

The project uses PNPM 10 and expects a Node.js 20+ runtime (Vite and SvelteKit 2 require ESM-compatible environments).

## Testing status

- `pnpm test` exercises 17 spec files, running 303 assertions with 4 intentionally skipped timer-based cases tied to the playback controller.
- `pnpm test:coverage` reports 64.3% statement coverage overall, with strong coverage for core state management but notable gaps for Svelte components and newer utilities; the run also surfaces accessibility warnings emitted by the Svelte compiler.

## Project documentation

- **Planning & specs** live under `specs/`, with feature-specific directories alongside the living master specification and visual-encoding guide.
- **Testing details** and suite breakdowns are maintained in [`TESTING.md`](./TESTING.md).
- **Agent context** for contributors is captured in [`CLAUDE.md`](./CLAUDE.md).

## Known gaps & risks

- Algorithm pages currently expose preset switching only; direct user input editing is not yet implemented, leaving the interactive learning constitutional requirement unmet.
- Component-focused tests rely on Zod contract validation rather than rendering actual Svelte components, so UI behavior is effectively untested despite high assertion counts.
- Accessibility warnings raised during `pnpm test:coverage` (tabindex usage, missing `aria-selected`, deprecated event bindings) indicate the navigation and legend components need follow-up refinements.
- The `swimInWater` plugin and supporting `MinHeap` helper execute in production but currently lack direct runtime tests, resulting in 0% coverage for those modules.

## License

ISC

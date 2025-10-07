# Visual Encoding Specification

This document standardizes the visual language for algorithm visualizations across grids, graphs, trees, arrays, strings, heaps, union-find structures, and dynamic programming tables. Use it to ensure consistent color assignments, accessible contrast, and deterministic layering when multiple states overlap, covering the core categories found in most LeetCode-style problems.

## 1. Global State Palette

Each algorithm frame should map its local and global state to the tokens below. Colors reference Tailwind CSS v4 utility tokens. Unless noted, light-theme fills render at full opacity while dark-theme fills use 80% opacity to maintain a minimum 4.5:1 contrast against base surfaces (`bg-white` for light, `bg-slate-900` for dark).

| State | Description | Structure Agnostic Encoding | Light Theme | Dark Theme |
| --- | --- | --- | --- | --- |
| `start` | Entry cell/node/root/first pointer. | Fill or primary badge. | `bg-emerald-700`, `border-emerald-800` | `bg-emerald-400/80`, `border-emerald-300/80` |
| `goal` | Exit cell/node/target/resolved pointer. | Fill with high contrast outline. | `bg-rose-600`, `border-rose-700` | `bg-rose-400/80`, `border-rose-300/80` |
| `frontier` / `open set` | Candidates pending expansion (queues, heaps, stacks). | Outline + optional badge. | `border-sky-500`, `ring-sky-500/90` | `border-sky-300/90`, `ring-sky-200/70` |
| `current` / `dequeued` | Element being processed this step. | Fill + pulse. | `bg-amber-500`, `border-amber-600` | `bg-amber-300/80`, `border-amber-200/80` |
| `visited` / `closed` | Explored elements excluded from frontier. | Fill only. | `bg-slate-400`, `border-slate-500` | `bg-slate-500/70`, `border-slate-400/60` |
| `tentative path` / `candidate` | Best-known path, cost, or candidate solution. | Stroke or dashed outline. | `stroke-indigo-500`, `stroke-[3px]` | `stroke-indigo-300/80`, `stroke-[3px]` |
| `confirmed path` / `answer` | Final path, value, or optimal set after completion. | Stroke + glow. | `stroke-amber-600`, `drop-shadow-[0_0_6px_rgba(217,119,6,0.6)]` | `stroke-amber-300`, `drop-shadow-[0_0_6px_rgba(253,230,138,0.7)]` |
| `obstacle` / `invalid` | Impassable cell/edge/constraint violation. | Fill or diagonal hatch overlay. | `bg-slate-700`, `border-slate-800` | `bg-slate-800/90`, `border-slate-950/80` |
| `weight` emphasis / `cost` | Weighted nodes/edges, dynamic costs. | Numeric badge. | `text-slate-700`, `bg-slate-100` | `text-slate-100`, `bg-slate-700/70` |
| `backtrack` marker / `recursion unwind` | States being retraced during reconstruction. | Outline + arrow chevrons. | `border-purple-400`, `ring-purple-300/70` | `border-purple-300/80`, `ring-purple-200/60` |
| `pruned` | Branch discarded by pruning/constraint failure. | Diagonal cross overlay. | `border-rose-400/90`, `bg-rose-50/70` | `border-rose-300/70`, `bg-rose-500/30` |
| `heuristic` emphasis | Heuristic-driven scoring (e.g., A*). | Corner badge. | `bg-cyan-200`, `text-cyan-900` | `bg-cyan-500/70`, `text-cyan-50` |
| `component` | Connected/component identifiers (Union Find, islands). | Label + subtle fill. | `bg-emerald-200/60`, `border-emerald-400/70` | `bg-emerald-500/40`, `border-emerald-400/50` |
| `window` / `sliding window` | Contiguous subarray/string focus region. | Semi-transparent span with outline. | `bg-sky-200/60`, `border-sky-400/80` | `bg-sky-500/40`, `border-sky-400/70` |
| `pivot` | Active partition element in sorting algorithms. | Badge anchored to element. | `bg-fuchsia-400`, `border-fuchsia-600/80` | `bg-fuchsia-500/70`, `border-fuchsia-400/80` |
| `comparison` | Elements currently compared during ordering. | Frontier outline + temporary wash. | `ring-sky-500/90`, `bg-sky-100/80` | `ring-sky-300/80`, `bg-sky-800/40` |
| `swap` | Elements exchanging positions. | Flash or transient fill. | `bg-amber-200/80`, `border-amber-500` | `bg-amber-600/50`, `border-amber-400/70` |
| `sorted` | Finalized order segments. | Stable fill or stroke. | `bg-emerald-200/80`, `stroke-amber-600` | `bg-emerald-500/40`, `stroke-amber-300` |

### 1.1 Opacity & Contrast Rules

- Ensure filled states maintain ≥ 4.5:1 contrast with any underlying base color. For example, `bg-emerald-700` (`#047857`) on `bg-white` reaches ≈5.6:1 contrast; in dark mode the `bg-emerald-400/80` overlay yields >7:1 against `bg-slate-900`.
- When stacking multiple fills, reduce each successive layer’s opacity by 10 percentage points to preserve legibility (minimum 60%).
- Text overlays (labels, metrics) must use `text-slate-900` in light mode and `text-slate-100` in dark mode to keep ≥ 7:1 contrast against their badge background.
- When a state must communicate both fill and text (e.g., `component` labels), ensure the combined fill + badge contrast remains ≥ 3:1 against the base surface and ≥ 4.5:1 for text.

### 1.2 Stroke and Outline Thickness

- Default outline thickness is `border-2` or `ring-2` for highlighted cells/nodes.
- Active states (`current`, `frontier`) may pulse using Tailwind `animate-ping` but must not drop below the base outline thickness.

## 2. Contextual Layout Guidance

### 2.1 Grids

- Use `grid-cols-*` layouts with `gap-px` to reveal cell borders. When overlaying multiple states, prefer outline-based indicators (`ring-*`) to avoid hiding underlying fills.
- Path strokes should use SVG overlays positioned above fills; maintain `stroke-[3px]` minimum.
- For sliding window problems, render windows as semi-transparent rectangles spanning contiguous cells with `bg-sky-200/60` (light) or `bg-sky-500/40` (dark) and `border-sky-400/80` outlines.
- Prefix sum or difference arrays may add a dotted underline (`border-b border-dotted border-indigo-300`) to clarify derived values.

### 2.2 Graphs

- Nodes use concentric circles: outer ring for `frontier`/`backtrack`, inner fill for `current`/`visited`/`start`/`goal`.
- Edge weights and paths should be rendered using SVG lines with gradient strokes reflecting `tentative` vs. `confirmed` tokens.
- When highlighting strongly connected components or articulation points, wrap nodes with `ring-violet-400/70` halos and label condensation graph edges using `text-violet-200` in dark mode or `text-violet-700` in light mode.

### 2.3 Trees

- Maintain consistent depth spacing. Root inherits `start` state styling. Leaves with goal state should apply `goal` colors even if they are not unique targets.
- Use `border-l` + `border-b` connectors with `border-slate-400` by default; override with path tokens as needed.
- Recursive traversal order (pre/in/post) can be indicated with numeric chips using `bg-amber-200` (light) or `bg-amber-600/60` (dark) to show visitation order.

### 2.4 Arrays & Strings

- Treat linear structures as flex rows with `gap-1` to expose outlines. Index labels should use `text-slate-500` (light) or `text-slate-300` (dark).
- Highlight elements under comparison with `ring-indigo-400/80` (light) or `ring-indigo-300/70` (dark).
- Sliding windows follow the grid guideline above; two-pointer techniques should render left/right pointers using arrow markers `after:content-['L']` or `after:content-['R']` with `bg-sky-500` badges.
- For string matching, matched substrings adopt `bg-emerald-200/70` overlays while mismatches use `bg-rose-200/80` (light) or `bg-rose-500/40` (dark).

### 2.5 Heaps & Priority Queues

- Represent heaps as binary trees plus an array backing store. The minimal/maximal element inherits the `current` style when popped.
- Pending queue entries should display their priority using pill badges `bg-cyan-100` (light) / `bg-cyan-600/50` (dark) with `text-cyan-900` / `text-cyan-50` text, ensuring ≥ 4.5:1 contrast.
- Decrease-key updates transition through the `tentative` style before settling into `frontier` or `visited` states.

### 2.6 Union Find & Disjoint Sets

- Roots receive `border-emerald-500` halos; non-root nodes have dashed connectors `border-dashed border-emerald-300` indicating parent pointers.
- Path compression animations may temporarily set affected nodes to `bg-purple-200/70` (light) or `bg-purple-500/40` (dark) to distinguish them from steady-state components.

### 2.7 Dynamic Programming Tables

- Use the heatmap overlay defined in §3.2 for value magnitude.
- Current transition evaluation uses `ring-amber-400/80` outlines with arrow badges pointing to source states (`stroke-amber-400`).
- Impossible states should show `bg-slate-200/70` (light) or `bg-slate-700/50` (dark) diagonal stripes to differentiate from zero values.

## 3. Overlay Rules

### 3.1 Water Level (Trapping Rain Water II)

- Base gradient: `bg-gradient-to-t from-sky-200/70 via-sky-300/70 to-sky-400/70` in light mode; `bg-gradient-to-t from-sky-300/60 via-sky-400/60 to-sky-500/60` in dark mode.
- Blend mode: `mix-blend-multiply` for light, `mix-blend-screen` for dark to maintain depth without overpowering walls.
- Always render beneath `visited` while allowing higher priority states (`current`, `frontier`, `confirmed path`) to remain fully visible above the water overlay.

### 3.2 Dynamic Programming Heatmap

- Use a sequential scale: `bg-amber-50` → `bg-amber-500` (light) and `bg-amber-900/50` → `bg-amber-300/80` (dark).
- Normalize values within each frame so viewers can compare cells in that snapshot; update `aria-label` with normalized percentages for screen readers and document if a visualization instead normalizes across the full run.
- Render as a background fill layer beneath path/selection states but above obstacles.

### 3.3 Shortest Path Highlight

- Apply `confirmed path` stroke plus an optional `ring-amber-400/70` halo on nodes.
- When combined with DP heatmaps, keep stroke opacity at 100% to satisfy 4.5:1 contrast over the warm gradient.

### 3.4 Range / Segment Tree Overlay

- Use alternating band fills `bg-indigo-100/60` and `bg-indigo-300/40` (light) or `bg-indigo-700/40` and `bg-indigo-500/30` (dark) to show covered intervals.
- Active query nodes receive `border-indigo-500` outlines; aggregated nodes fade to `opacity-60` after propagation.

### 3.5 Probability / Expectation Heatmap

- For problems modeling probability or expected values, use `bg-gradient-to-t from-emerald-200 via-sky-200 to-sky-400` gradients (light) and `bg-gradient-to-t from-emerald-500/50 via-sky-500/40 to-sky-700/50` (dark).
- Annotate tooltips with percentages and ensure overlays sit beneath `visited` while remaining above base terrain.

## 4. State Stacking & Priority

Renderers must apply states in the following z-order (bottom → top):

1. Base cell/node background
2. Obstacles (`obstacle`) and invalid/pruned annotations
3. Global overlays (`water level`, `DP heatmap`, range overlays, probability heatmap)
4. Component/segmentation fills
5. Visited/closed
6. Tentative path / candidate / heuristic previews
7. Frontier/open set / queue membership
8. Backtrack markers / recursion unwind
9. Current/dequeued
10. Start/goal markers (ensure visible when overlapping)
11. Confirmed path / final answer
12. UI focus/selection (e.g., hovered or keyboard focus rings)

### 4.1 Tie-Breaking Rules

- When a single element has both `start` and `goal`, prefer `goal` fill but add a `start` badge (`after:content-['S']`) in the corner.
- If `current` overlaps `goal`, apply `goal` fill and `current` outline (`border-amber-500`).
- Frontier nodes that become `visited` should fade their `ring-sky-*` outline using `transition-opacity` over 150ms while retaining the visited fill.

### 4.2 Outline vs. Fill

- Prefer fills for mutually exclusive states (`start`, `goal`, `visited`).
- Use outlines for transient or additive states (`frontier`, `backtrack`, `window`).
- Path states rely on strokes (SVG lines) and should not replace node fills.
- Label-based states (e.g., `component`, `pivot`) should use badges anchored to corners to avoid covering numeric values.

### 4.3 Sorting & Partitioning Defaults

- `pivot` elements use `bg-fuchsia-400` (light) or `bg-fuchsia-500/70` (dark) with `border-fuchsia-600/80` outlines.
- `comparison` pairs adopt the `frontier` outline plus a temporary `bg-sky-100/80` (light) or `bg-sky-800/40` (dark) fill.
- `swap` transitions flash `bg-amber-200/80` (light) or `bg-amber-600/50` (dark) for ≤150 ms; ensure `prefers-reduced-motion` disables the flash.
- Apply `motion-reduce:animate-none motion-reduce:transition-none` (or guard flashes with `motion-safe:`) so reduced-motion users see a static state change instead of an animation.
- Completed segments (`sorted`) reuse the global `confirmed path` stroke for arrays or `bg-emerald-200/80` fills for heaps.

## 5. Accessibility & Testing Checklist

- ✅ Verify color contrast using tooling (e.g., Tailwind color values with the WebAIM contrast checker) to meet WCAG AA (4.5:1 for normal text, 3:1 for graphical elements). Document any exceptions in plugin READMEs.
- ✅ Provide semantic annotations via `aria-label` describing active states per element.
- ✅ Ensure animations respect `prefers-reduced-motion`; pause pulsing effects when enabled.
- ✅ Validate that all states referenced by the plugin are declared in this document; if a new state is required, extend the palette and add tests/tooling updates in the same PR.

## 6. Implementation Notes

- Tailwind tokens above assume Tailwind CSS v4 default palette. If you extend the palette, update this document and notify maintainers.
- Automated renderers should expose a helper (e.g., `resolveStateStyles(state, theme)`) that reads directly from this spec to avoid divergence.
- Algorithm categories not explicitly listed (e.g., tries, suffix arrays, monotonic stacks) must map their states to the closest descriptors here (`component`, `frontier`, `window`, `pruned`) or document new tokens with accessibility data.

## 7. Legend Synchronization Requirements

- The shared `LegendPanel` component renders one entry for every `HighlightRole` declared in `HIGHLIGHT_COLOR_TOKENS`. Core roles are grouped into **Local states** (`current`, `frontier`, `queued`, `visited`) and **Global overlays** (`start`, `goal`, `path-active`, `path-final`, `obstacle`).
- Plugins that introduce additional highlight roles must extend `HIGHLIGHT_COLOR_TOKENS` **and** pass `legend` groups to the panel so all colors remain documented in the UI.
- When reusing existing roles in specialized ways (e.g., distinguishing multiple frontier queues), document the interpretation in the plugin README but keep the canonical label so learners see consistent terminology across visualizations.
- Any pull request that modifies highlight colors or roles MUST include corresponding updates to the legend test coverage (`tests/unit/panels/LegendPanel.test.ts`).

---

For questions or proposals to extend the palette, open an issue referencing this file.

# Research: Multi-Phase Visualization Framework

**Feature**: GCD Array Visualization
**Date**: 2025-10-09
**Phase**: 0 - Research & Technical Decisions

## Research Questions

1. How should multi-phase visualization be structured for maximum reusability?
2. What's the best approach for declarative renderer composition in Svelte 5?
3. How to optimize array rendering performance for 1000+ elements?
4. What visualization approach best teaches the Euclidean algorithm?
5. Which Fibonacci numbers provide digestible worst-case demonstration?

---

## Decision 1: Multi-Phase Container Architecture

**Decision**: Use a `PhaseContainer` component that accepts phase configurations as props, not Svelte slots.

**Rationale**:
- **Serializability**: Phase configurations need to be part of the trace data (immutable, JSON-serializable) for step-by-step playback
- **Time travel**: PlaybackController must be able to reconstruct any frame from trace data alone; slots require component instances
- **Simplicity**: Config-based approach = single source of truth (the trace); slot-based requires coordinating trace data + component tree
- **Existing pattern**: Current GridRenderer uses config props, not slots - consistency matters

**Alternatives Considered**:
- **Svelte slots**: More flexible, but breaks immutability principle; can't serialize component instances in trace
- **Render functions**: Too imperative for Svelte's reactive model; conflicts with declarative ethos
- **Hybrid slots + config**: Added complexity without clear benefit; violates YAGNI

**Implementation Notes**:
```typescript
// Phase config structure (simplified)
interface PhaseConfig {
  id: string;
  label: string;
  renderers: RendererConfig[];
}

interface RendererConfig {
  type: 'array' | 'scalarPair' | 'grid' | 'status';
  data: unknown; // type-safe via discriminated union
  highlight?: HighlightConfig;
}
```

---

## Decision 2: Declarative Renderer Composition

**Decision**: Use discriminated union types for `RendererConfig` with type-safe data bindings.

**Rationale**:
- **Type safety**: TypeScript narrows config type based on `type` field
- **Extensibility**: Adding new renderer = add variant to union + implement component
- **Validation**: Zod schemas validate config structure at runtime (catches plugin errors)
- **Svelte 5 compatibility**: Works naturally with `$derived` for reactive config updates

**Alternatives Considered**:
- **String-based templates**: Not type-safe, prone to injection issues
- **Class-based renderers**: Requires instantiation, conflicts with functional trace generation
- **Dynamic imports**: Async overhead, unnecessary complexity for small renderer set

**Implementation Pattern**:
```typescript
type RendererConfig =
  | { type: 'array'; data: number[]; highlight: number[] }
  | { type: 'scalarPair'; data: { m: number; n: number } }
  | { type: 'grid'; data: number[][]; ... };

// In PhaseContainer.svelte
{#if renderer.type === 'array'}
  <ArrayRenderer data={renderer.data} highlight={renderer.highlight} />
{:else if renderer.type === 'scalarPair'}
  <ScalarPairRenderer {...renderer.data} />
{/if}
```

---

## Decision 3: Array Rendering Performance

**Decision**: Use CSS transforms for highlights + virtualization only if performance testing shows need.

**Rationale**:
- **Premature optimization**: 1000 elements × 16px = 16000px height - within browser limits
- **CSS transforms**: GPU-accelerated highlight animations (`transform: scale()`, not `width`)
- **Svelte reactivity**: Only highlighted elements re-render when highlights change
- **Benchmark first**: If tests show <60fps, add virtual scrolling library (svelte-virtual)

**Alternatives Considered**:
- **Canvas rendering**: Loses accessibility, requires custom interaction logic, harder to style
- **Immediate virtualization**: Adds dependency + complexity before proving necessary
- **SVG**: DOM overhead similar to HTML, no benefit for rectangular cells

**Performance Strategy**:
1. Implement simple CSS Grid layout
2. Run performance test with 1000 elements
3. If <60fps: Add virtualization
4. If >60fps: Ship as-is

---

## Decision 4: Euclidean Algorithm Visualization

**Decision**: Show m, n values side-by-side with division/modulo equations below.

**Rationale**:
- **Clarity**: Seeing `m % n = remainder` connects operation to result
- **Learning goal**: Students need to understand the swap operation `[m, n] = [n, m % n]`
- **Consistency**: Matches how algorithm is taught in textbooks (two-column format)

**Layout**:
```
┌─────────────────────────────────┐
│ Phase 2: Computing GCD          │
├─────────────────────────────────┤
│  m = 377    n = 233              │
│  377 % 233 = 144                 │
│  Next: m=233, n=144              │
└─────────────────────────────────┘
```

**Alternatives Considered**:
- **Single line**: `(377, 233) → (233, 144)` - less clear what operation happened
- **Tree diagram**: Overkill for linear algorithm; better for recursion visualization

---

## Decision 5: Fibonacci Preset Selection

**Decision**: Use `[233, 377]` (F(13) and F(14)) for worst-case Euclidean demo.

**Rationale**:
- **Worst-case property**: Consecutive Fibonacci numbers require maximum Euclidean steps
- **Digestible size**: 8 steps for GCD(233, 377) - enough to show pattern, not overwhelming
- **Educational value**: Shows why algorithm is efficient even in worst case
- **Fits constraints**: Both values < 10000 (within validation range)

**Calculation**:
```
GCD(377, 233):
377 % 233 = 144
233 % 144 = 89
144 % 89 = 55
89 % 55 = 34
55 % 34 = 21
34 % 21 = 13
21 % 13 = 8
13 % 8 = 5
8 % 5 = 3
5 % 3 = 2
3 % 2 = 1
2 % 1 = 0
→ GCD = 1 (12 steps)
```

**Alternatives Considered**:
- **F(15), F(16)**: Too many steps (15+), tedious for demo
- **F(10), F(11)**: Only 6 steps, doesn't showcase worst-case as well
- **F(12), F(13)**: `[144, 233]` - solid choice, went with next pair for slightly longer demo

---

## Decision 6: Phase Transition Strategy

**Decision**: Phase metadata in trace determines active phase; container auto-switches.

**Rationale**:
- **Declarative**: Trace says `{ phase: 'gcd-computation', ...}`, container responds
- **No manual wiring**: Plugin doesn't call phase transition methods
- **Playback compatible**: Stepping backward automatically restores previous phase
- **Consistent with existing pattern**: Similar to how GridRenderer responds to cell highlights in trace

**Implementation**:
```typescript
// In trace generation
const trace = [
  { step: 0, phase: 'min-max-search', description: '...', ... },
  { step: 5, phase: 'min-max-search', description: '...', ... },
  { step: 6, phase: 'gcd-computation', description: '...', ... },  // Transition!
  { step: 12, phase: 'gcd-computation', description: '...', ... },
];

// PhaseContainer derives active phase
const activePhase = $derived(trace[currentStep].phase);
```

**Alternatives Considered**:
- **Explicit phase transition API**: `plugin.startPhase('gcd-computation')` - imperative, violates immutability
- **Duration-based**: Phase changes after N seconds - not compatible with step-by-step playback

---

## Research Summary

All technical decisions resolved:
- ✅ Phase container architecture (config-based, not slots)
- ✅ Renderer composition (discriminated unions, type-safe)
- ✅ Performance strategy (simple first, optimize if needed)
- ✅ Euclidean visualization (side-by-side m, n display)
- ✅ Fibonacci preset (F(13)=233, F(14)=377)
- ✅ Phase transitions (trace metadata-driven)

**No blockers** - Ready for Phase 1 (Design & Contracts)

**Key Insight**: The multi-phase framework perfectly aligns with Constitutional Principle II (Reusability). By making phase configuration data-driven, we enable ANY algorithm to use multi-phase visualization without framework changes. This will benefit future algorithms like:
- Dijkstra's (initialization → relaxation → path extraction phases)
- Merge Sort (divide → conquer → merge phases)
- Dynamic Programming (table building → traceback phases)

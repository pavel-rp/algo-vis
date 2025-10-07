# Claude Context: Algorithm Visualizer

**Project**: Algorithm Visualizer (algo-vis)
**Version**: 1.0.0
**Last Updated**: 2025-10-06
**Purpose**: Agent context file for efficient development

---

## Project Overview

**What**: Educational algorithm visualization framework built with Svelte 5 and TypeScript. Displays step-by-step execution traces of algorithms with interactive playback controls.

**Architecture**: Plugin-based system where algorithms are independent modules that generate execution traces. Framework renders traces with reusable visualization components.

**Key Technologies**:
- **Frontend**: Svelte 5 (runes mode), SvelteKit 2.0, TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **Testing**: Vitest 3.2.4, @testing-library/svelte 5.2.8, happy-dom 19.0.2
- **Validation**: Zod 3.22 for runtime type checking
- **Deployment**: Vercel (Node.js 22.x)

---

## Constitutional Principles

**Source**: `.specify/memory/constitution.md` (Algorithm Visualization Framework Constitution v1.0.0)

### Core Principles (NON-NEGOTIABLE)

1. **Visualization-First Design**: Every algorithm must output visual steps
2. **Framework Reusability**: All components must be algorithm-agnostic, composable, configurable, standalone
3. **Step-by-Step Traceability**: Complete execution history with forward/backward navigation
4. **Interactive Learning**: Real-time controls, adjustable speed, preset examples
5. **Performance & Scalability**: <100ms trace generation, <16ms render updates (60fps)

### Design Standards

**Component Architecture**:
- Separation of concerns: Visualization components ≠ algorithm logic
- State management: Svelte 5 runes ($state, $derived, $effect)
- Declarative: Components render based on state, not imperative updates

**Algorithm Integration**:
- Plugins export standardized interface (AlgorithmPlugin)
- Trace format: Array of execution steps with state snapshots
- No direct DOM manipulation in algorithm code

---

## Project Structure

```
algo-vis/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── navigation/          # Feature 003: Tree-based sidebar
│   │   │   │   ├── Sidebar.svelte
│   │   │   │   ├── TreeNode.svelte
│   │   │   │   └── NavigationTree.svelte
│   │   │   ├── PlaybackControls.svelte
│   │   │   └── ...
│   │   ├── core/
│   │   │   ├── PlaybackController.svelte.ts  # Main state manager (runes)
│   │   │   ├── NavigationState.svelte.ts     # Feature 003: Tree expansion state
│   │   │   └── validation.ts
│   │   ├── types/
│   │   │   ├── algorithm.ts         # AlgorithmPlugin interface
│   │   │   ├── trace.ts             # ExecutionTrace types
│   │   │   └── navigation.ts        # Feature 003: NavigationNode types
│   │   ├── data/
│   │   │   └── navigation-tree.ts   # Feature 003: Algorithm category structure
│   │   └── plugins/
│   │       ├── trappingRainWater2.ts
│   │       └── uniquePathsWithObstacles.ts
│   ├── routes/
│   │   ├── +layout.svelte           # Root layout (includes Sidebar)
│   │   ├── +page.svelte             # Home/visualization page
│   │   └── [category]/[algorithm]/+page.svelte  # Feature 003: Algorithm detail route
│   └── app.css                      # Tailwind + custom styles
├── tests/
│   ├── unit/
│   │   ├── core/
│   │   │   ├── PlaybackController.test.svelte.ts
│   │   │   └── validation.test.ts
│   │   ├── navigation/              # Feature 003 tests
│   │   │   ├── NavigationState.test.ts
│   │   │   └── navigation-tree.test.ts
│   │   └── plugins/
│   │       ├── trappingRainWater2.test.ts
│   │       └── uniquePathsWithObstacles.test.ts
│   └── integration/
│       └── sidebar-navigation.test.ts  # Feature 003 E2E tests
├── specs/
│   ├── 002-unit-test-suite/        # Feature 002 (completed)
│   └── 003-move-the-navigation/    # Feature 003 (planning phase)
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       ├── quickstart.md
│       └── contracts/
│           └── navigation-tree-schema.ts
└── .specify/                        # Specify framework templates
    ├── memory/
    │   └── constitution.md
    └── templates/
```

---

## Key Patterns & Conventions

### Svelte 5 Runes Pattern (State Management)

**When to use**: Complex state logic, cross-component communication

**Pattern**:
```typescript
// Example: PlaybackController.svelte.ts
import { type AlgorithmPlugin } from '$lib/types/algorithm';

export class PlaybackController {
  // Reactive state using $state()
  currentStepIndex = $state(0);
  isPlaying = $state(false);
  speed = $state(1);

  // Computed state using $derived()
  currentStep = $derived(() => {
    return this.trace[this.currentStepIndex];
  });

  // Side effects using $effect()
  constructor() {
    $effect(() => {
      if (this.isPlaying) {
        this.startAutoplay();
      } else {
        this.stopAutoplay();
      }
    });
  }

  // Methods mutate state directly (triggers reactivity)
  play(): void {
    this.isPlaying = true;
  }

  pause(): void {
    this.isPlaying = false;
  }
}
```

**Usage in components**:
```svelte
<script lang="ts">
  import { PlaybackController } from '$lib/core/PlaybackController.svelte';

  const controller = new PlaybackController();
</script>

<button onclick={() => controller.play()}>Play</button>
<div>Step {controller.currentStepIndex}</div>
```

**Key Rules**:
- Use `$state()` for reactive primitive values and objects
- Use `$derived()` for computed values (no side effects)
- Use `$effect()` sparingly (only for side effects like timers, storage sync)
- Avoid `$bindable()` unless two-way binding truly needed

---

### Algorithm Plugin Pattern

**Interface** (`src/lib/types/algorithm.ts`):
```typescript
export interface AlgorithmPlugin<TInput = unknown, TState = unknown> {
  id: string;
  name: string;
  category: string;              // Feature 003: Added for navigation tree
  subcategory?: string;          // Feature 003: Optional nesting
  description: string;
  generateTrace: (input: TInput) => ExecutionTrace<TState>;
  presets: Preset<TInput>[];
  visualize: (step: ExecutionStep<TState>) => VisualizationData;
}

export interface ExecutionTrace<TState> {
  steps: ExecutionStep<TState>[];
  metadata: TraceMetadata;
}

export interface ExecutionStep<TState> {
  index: number;
  state: TState;
  description: string;
  highlightedCells?: CellCoordinate[];
}
```

**Example Plugin**:
```typescript
export const trappingRainWater2Plugin: AlgorithmPlugin<Input, State> = {
  id: 'trapping-rain-water-2',
  name: 'Trapping Rain Water II',
  category: 'Dynamic Programming',     // For navigation tree
  subcategory: '2D Array',             // For navigation tree
  description: '...',

  generateTrace(input: Input): ExecutionTrace<State> {
    const steps: ExecutionStep<State>[] = [];
    // Algorithm logic here, push steps as execution progresses
    return { steps, metadata: { complexity: 'O(mn log(m+n))' } };
  },

  presets: [
    { name: 'Small 3x3', input: { heightMap: [[1,4,3],...] } }
  ],

  visualize(step: ExecutionStep<State>): VisualizationData {
    // Convert state to renderable format
    return { grid: step.state.heightMap, ... };
  }
};
```

**Registration**:
```typescript
// src/lib/data/navigation-tree.ts (Feature 003)
export const navigationTree: NavigationTree = {
  rootNodes: [
    {
      type: 'category',
      id: 'dynamic-programming',
      label: 'Dynamic Programming',
      children: [
        {
          type: 'algorithm',
          id: 'trapping-rain-water-2',
          pluginId: 'trapping-rain-water-2',  // Links to plugin.id
          path: '/dynamic-programming/trapping-rain-water-2'
        }
      ]
    }
  ]
};
```

---

### Navigation State Pattern (Feature 003)

**Pattern**: Tree-based sidebar navigation with hierarchical categories

**State Management**:
```typescript
// src/lib/core/NavigationState.svelte.ts
export class NavigationState {
  expandedNodes = $state(new Set<string>());
  activeAlgorithmId = $state<string | null>(null);
  sidebarOpen = $state(true);

  constructor() {
    // Load from localStorage
    $effect(() => {
      const stored = localStorage.getItem('algovis_expanded_nodes');
      if (stored) {
        this.expandedNodes = new Set(JSON.parse(stored));
      }
    });
  }

  toggle(nodeId: string): void {
    if (this.expandedNodes.has(nodeId)) {
      this.expandedNodes.delete(nodeId);
    } else {
      this.expandedNodes.add(nodeId);
    }
    this.persist();
  }

  expandPath(nodeIds: string[]): void {
    nodeIds.forEach(id => this.expandedNodes.add(id));
    this.persist();
  }

  private persist(): void {
    localStorage.setItem(
      'algovis_expanded_nodes',
      JSON.stringify([...this.expandedNodes])
    );
  }
}
```

**Recursive Tree Component**:
```svelte
<!-- src/lib/components/navigation/TreeNode.svelte -->
<script lang="ts">
  import type { NavigationNode } from '$lib/types/navigation';

  interface Props {
    node: NavigationNode;
    level: number;
    isExpanded: boolean;
    isActive: boolean;
    onToggle: (id: string) => void;
  }

  let { node, level, isExpanded, isActive, onToggle }: Props = $props();
</script>

{#if node.type === 'category'}
  <button onclick={() => onToggle(node.id)} class:expanded={isExpanded}>
    {node.label}
  </button>
  {#if isExpanded}
    <div style="padding-left: {level * 16}px">
      {#each node.children as child}
        <svelte:self
          node={child}
          level={level + 1}
          isExpanded={/* check state */}
          isActive={/* check state */}
          {onToggle}
        />
      {/each}
    </div>
  {/if}
{:else}
  <a href={node.path} class:active={isActive}>
    {node.label}
  </a>
{/if}
```

**Routing Integration**:
```typescript
// src/routes/[category]/[algorithm]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
  const { category, algorithm } = params;

  // Find algorithm plugin by ID
  const plugin = findPluginById(algorithm);
  if (!plugin) {
    throw error(404, 'Algorithm not found');
  }

  // Expand navigation path (handled in +layout.svelte)
  return { plugin, algorithmId: algorithm };
};
```

**Deep Linking** (FR-013):
- User navigates to `/dynamic-programming/trapping-rain-water-2`
- `+page.ts` load function extracts algorithmId
- Sidebar component calls `NavigationState.expandPath(['dynamic-programming', 'dp-2d-array'])`
- Tree automatically expands to show active algorithm

---

### Mobile Responsive Pattern (Feature 003)

**CSS Pattern**:
```css
/* Sidebar transitions using CSS transforms (60fps) */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 280px;
  transform: translateX(0);
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mobile: Drawer overlay */
@media (max-width: 767px) {
  .sidebar {
    transform: translateX(-100%);
    z-index: 50;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
  }
}

/* Tablet: Narrower fixed sidebar */
@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar {
    width: 220px;
  }
}

/* Desktop: Full-width sidebar */
@media (min-width: 1024px) {
  .sidebar {
    width: 280px;
  }
}
```

---

## Testing Conventions

### Unit Tests (Vitest)

**File Naming**: `*.test.ts` or `*.test.svelte.ts`

**Pattern**:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { NavigationState } from '$lib/core/NavigationState.svelte';

describe('NavigationState', () => {
  let state: NavigationState;

  beforeEach(() => {
    localStorage.clear();
    state = new NavigationState();
  });

  it('should expand category node', () => {
    state.toggle('graphs');
    expect(state.expandedNodes.has('graphs')).toBe(true);
  });

  it('should persist to localStorage', () => {
    state.toggle('graphs');
    const stored = JSON.parse(localStorage.getItem('algovis_expanded_nodes')!);
    expect(stored).toContain('graphs');
  });
});
```

**Known Limitation**: Svelte 5 component tests are deferred to E2E due to happy-dom limitations. Unit tests focus on logic classes (PlaybackController, NavigationState, validation).

### Integration Tests (E2E)

**File Naming**: `tests/integration/*.test.ts`

**Pattern** (Playwright or Vitest browser mode):
```typescript
import { test, expect } from '@playwright/test';

test('sidebar navigation expands categories', async ({ page }) => {
  await page.goto('/');

  // Category initially collapsed
  await expect(page.locator('[data-testid="dp-category"]')).toHaveAttribute('aria-expanded', 'false');

  // Click to expand
  await page.click('[data-testid="dp-category"]');
  await expect(page.locator('[data-testid="dp-category"]')).toHaveAttribute('aria-expanded', 'true');

  // Children visible
  await expect(page.locator('[data-testid="dp-2d-array"]')).toBeVisible();
});
```

---

## Common Development Tasks

### Adding a New Algorithm

1. **Create plugin file**: `src/lib/plugins/myAlgorithm.ts`
2. **Implement AlgorithmPlugin interface**
3. **Add to navigation tree**: `src/lib/data/navigation-tree.ts`
   ```typescript
   {
     type: 'algorithm',
     id: 'my-algorithm',
     label: 'My Algorithm',
     pluginId: 'my-algorithm',
     path: '/category/my-algorithm'
   }
   ```
4. **Write unit tests**: `tests/unit/plugins/myAlgorithm.test.ts`
5. **Test manually**: Run `pnpm run dev`, navigate to algorithm via sidebar

### Modifying Navigation Structure

1. **Edit navigation tree**: `src/lib/data/navigation-tree.ts`
2. **Run validation**: Zod schema in `contracts/navigation-tree-schema.ts` auto-validates
3. **Update tests**: If structure changes, update E2E tests
4. **Test deep linking**: Verify URL navigation still works

### Debugging State Issues

1. **Check localStorage**: DevTools → Application → Local Storage → `algovis_expanded_nodes`
2. **Inspect runes**: Use Svelte DevTools extension (if available)
3. **Add logging**:
   ```typescript
   $effect(() => {
     console.log('State changed:', this.expandedNodes);
   });
   ```

---

## Performance Optimization

### Lazy Rendering (Tree Nodes)

**Current Implementation**: Only render visible nodes using `{#if isExpanded}`

**Future Optimization** (if tree exceeds 100 nodes):
- Virtual scrolling for long lists
- Windowing library (e.g., svelte-virtual)

### Animation Performance

**Rule**: Always use CSS transforms for animations (GPU-accelerated)

**Good**:
```css
.sidebar { transform: translateX(-100%); }
.sidebar.open { transform: translateX(0); }
```

**Bad** (causes layout thrashing):
```css
.sidebar { left: -280px; }
.sidebar.open { left: 0; }
```

### Trace Generation Performance

**Target**: <100ms for trace generation (per constitutional principle V)

**Optimization**:
- Avoid deep cloning in hot loops
- Use typed arrays for large datasets
- Debounce expensive operations (e.g., visualization rendering)

---

## Deployment

### Vercel Configuration

**File**: `vercel.json`
```json
{
  "buildCommand": "pnpm run build",
  "framework": "sveltekit",
  "installCommand": "pnpm install",
  "nodejs": "22.x"
}
```

**Environment Variables**: None required (static site)

### CI/CD Pipeline

**File**: `.github/workflows/ci.yml`

**Steps**:
1. Install dependencies (`pnpm install`)
2. Run linter (`pnpm run lint`)
3. Run unit tests (`pnpm run test`)
4. Build project (`pnpm run build`)
5. Deploy to Vercel (on main branch push)

**Test Coverage Target**: >80% for core logic (PlaybackController, NavigationState, validation)

---

## Common Issues & Solutions

### Issue: Svelte 5 Component Tests Fail

**Symptom**: `happy-dom` errors when testing Svelte components

**Solution**: Defer component tests to E2E. Unit tests focus on `.svelte.ts` files (logic classes).

**Reference**: `specs/002-unit-test-suite/plan.md` line 243

---

### Issue: localStorage Not Persisting

**Symptom**: Tree state resets on page reload

**Solution**:
1. Check browser privacy settings (localStorage may be disabled)
2. Verify `NavigationState.persist()` called after state changes
3. Inspect Application → Local Storage in DevTools

---

### Issue: Deep Linking Not Expanding Tree

**Symptom**: Direct URL navigation doesn't show active algorithm

**Solution**:
1. Verify `getAncestorIds()` function returns correct path
2. Check `NavigationState.expandPath()` called in `+page.ts` load function
3. Ensure ancestor IDs match category node IDs in tree

---

### Issue: Mobile Drawer Not Dismissing

**Symptom**: Clicking backdrop doesn't close sidebar

**Solution**:
1. Check backdrop z-index (must be above content but below sidebar)
2. Verify click handler attached to backdrop element
3. Ensure `NavigationState.toggleSidebar()` called on click

---

## Feature Development Workflow

### Specify Framework

**Commands**:
- `/specify`: Create feature specification from natural language
- `/clarify`: Ask clarification questions and update spec
- `/plan`: Generate implementation plan and design artifacts
- `/tasks`: Generate dependency-ordered task list
- `/implement`: Execute tasks (coming soon)

**Phases**:
1. **Specification** (`spec.md`): What users need (no implementation details)
2. **Clarification** (`spec.md` updated): Resolve ambiguities
3. **Planning** (`plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/`): How to implement
4. **Task Generation** (`tasks.md`): Dependency-ordered checklist
5. **Implementation**: Execute tasks following constitutional principles
6. **Validation**: Run tests, verify acceptance scenarios

**Current Status** (Feature 003):
- [x] Phase 0: Research complete
- [x] Phase 1: Design complete
- [ ] Phase 2: Tasks generation (next step: run `/tasks` command)

---

## Quick Reference

**Start Dev Server**: `pnpm run dev`
**Run Tests**: `pnpm run test`
**Build**: `pnpm run build`
**Lint**: `pnpm run lint`

**Key Files**:
- State: `src/lib/core/PlaybackController.svelte.ts`, `src/lib/core/NavigationState.svelte.ts`
- Types: `src/lib/types/algorithm.ts`, `src/lib/types/navigation.ts`
- Data: `src/lib/data/navigation-tree.ts`
- Routing: `src/routes/+layout.svelte`, `src/routes/[category]/[algorithm]/+page.svelte`

**Documentation**:
- Constitution: `.specify/memory/constitution.md`
- Feature 003: `specs/003-move-the-navigation/`

---

**Last Updated**: 2025-10-06 (Feature 003: Tree-Based Sidebar Navigation planning phase)

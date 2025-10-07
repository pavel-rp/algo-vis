# Quickstart: Swim in Water Algorithm Visualization

**Feature**: 004-we-ll-implement
**Purpose**: Step-by-step guide to verify the implementation
**Audience**: Developers and testers

---

## Prerequisites

- Node.js 18+ and pnpm installed
- Repository cloned: `B:\Projects\algo-vis`
- Branch: `004-we-ll-implement`

---

## Installation

```bash
cd B:\Projects\algo-vis
pnpm install
```

---

## Step 1: Verify Shared Components

### 1.1 Test GridDisplay Component

```bash
pnpm test tests/unit/components/visualization/GridDisplay.test.ts
```

**Expected**: All tests pass, including:
- ✓ Renders N×N grid matching input dimensions
- ✓ Applies cell states (unvisited/processing/visited)
- ✓ Highlights specified cells
- ✓ Handles grids up to 50×50 without performance degradation

### 1.2 Test PriorityQueueDisplay Component

```bash
pnpm test tests/unit/components/visualization/PriorityQueueDisplay.test.ts
```

**Expected**: All tests pass, including:
- ✓ Displays top 5 items by default
- ✓ Shows "+ N more" when remainingCount > 0
- ✓ Handles empty queue gracefully
- ✓ Sorts items by priority (ascending)

### 1.3 Test StatusDisplay Component

```bash
pnpm test tests/unit/components/visualization/StatusDisplay.test.ts
```

**Expected**: All tests pass, including:
- ✓ Displays all metrics
- ✓ Shows progress indicator (currentStep / totalSteps)
- ✓ Updates reactively when props change

---

## Step 2: Verify Navigation Tree Update

### 2.1 Check Navigation Structure

Open `src/lib/data/navigation-tree.ts` and verify:

```typescript
{
  type: 'category',
  id: 'graphs',
  label: 'Graphs',
  children: [
    {
      type: 'category',
      id: 'graphs-priority-queue',
      label: 'Priority Queue',
      children: [
        {
          type: 'algorithm',
          id: 'swim-in-water',
          label: 'Swim in Water',
          pluginId: 'swim-in-water',
          path: '/graphs/swim-in-water'
        }
      ]
    }
  ]
}
```

### 2.2 Test Navigation Tree

```bash
pnpm test tests/unit/data/navigation-tree.test.ts
```

**Expected**: All tests pass, including:
- ✓ Navigation tree validates against schema
- ✓ "Graphs" → "Priority Queue" → "Swim in Water" path exists
- ✓ Plugin ID "swim-in-water" resolves correctly

---

## Step 3: Verify Swim in Water Plugin

### 3.1 Test Plugin Interface

```bash
pnpm test tests/unit/plugins/swimInWater.test.ts
```

**Expected**: All tests pass, including:
- ✓ Plugin conforms to AlgorithmPlugin interface
- ✓ `category: 'Graphs'` and `subcategory: 'Priority Queue'`
- ✓ Has 3 preset examples (3×3, 5×5, edge case)
- ✓ Validates input (rejects 51×51 grid, accepts 50×50)

### 3.2 Test Trace Generation

**Test**: Generate trace for 3×3 grid

```typescript
import { swimInWaterPlugin } from '$lib/plugins/swimInWater';

const input = { grid: [[0,2,1],[3,1,4],[7,5,6]] };
const trace = swimInWaterPlugin.generateTrace(input);

console.log(`Generated ${trace.steps.length} steps`);
console.log(`Final answer: ${trace.steps[trace.steps.length - 1].state.currentMaxElevation}`);
```

**Expected Output**:
```
Generated 15 steps
Final answer: 6
```

### 3.3 Test Performance (50×50 grid)

```bash
pnpm test tests/unit/plugins/swimInWater.performance.test.ts
```

**Expected**: Trace generation <100ms (Constitution V)

---

## Step 4: Verify Shared Component Reusability

### 4.1 Test Trapping Rain Water II Refactor

```bash
pnpm test tests/unit/plugins/trappingRainWater2.test.ts
```

**Expected**: All tests pass (backward compatibility maintained)

### 4.2 Integration Test: Component Reuse

```bash
pnpm test tests/integration/shared-components.test.ts
```

**Expected**: Tests verify:
- ✓ PriorityQueueDisplay used by both swimInWater and trappingRainWater2
- ✓ GridDisplay renders correctly for both algorithms
- ✓ Props schemas validated for both use cases

---

## Step 5: End-to-End Visualization Test

### 5.1 Start Development Server

```bash
pnpm run dev
```

### 5.2 Navigate to Algorithm

1. Open browser: `http://localhost:5173`
2. Expand sidebar: "Graphs" → "Priority Queue"
3. Click "Swim in Water"
4. Verify URL: `/graphs/swim-in-water`

### 5.3 Test Visualization

**Preset: Small 3×3**

1. Select preset "Small 3×3" from dropdown
2. Click "Play" button
3. **Verify**:
   - ✓ Grid displays 3×3 matrix with elevation values
   - ✓ Cell (0,0) initially marked as visited (blue)
   - ✓ Priority queue panel shows top 3-5 items + count
   - ✓ Status display shows current max elevation
   - ✓ Step description updates (e.g., "Dequeue cell (1,0)...")
   - ✓ Animation completes at cell (2,2) with final answer 6

4. Click "Step Backward" (◀)
   - **Verify**: State restores to previous step, PQ updated

5. Click "Step Forward" (▶)
   - **Verify**: Advances one step, updates all visualizations

**Preset: Medium 5×5**

1. Select preset "Medium 5×5"
2. Adjust speed slider to "Fast"
3. Click "Play"
4. **Verify**:
   - ✓ Grid renders 5×5 without lag
   - ✓ Priority queue displays "+ N more" when queue > 5 items
   - ✓ Final answer displayed correctly

**Large Grid: 50×50**

1. Click "Custom Input" (if available) or manually edit preset
2. Generate 50×50 grid (code snippet below)
3. **Verify**:
   - ✓ Grid renders within <16ms (60fps, no lag)
   - ✓ Trace generation completes within <100ms
   - ✓ All cells visible (use scroll if virtualized)

```javascript
// Generate 50×50 grid for testing
const grid = Array.from({ length: 50 }, (_, i) =>
  Array.from({ length: 50 }, (_, j) => (i + j) % 20)
);
```

---

## Step 6: Validation Scenarios

### Scenario 1: Initial State (Acceptance Scenario 1)

**Given**: 3×3 grid [[0,2,1],[3,1,4],[7,5,6]]
**When**: Load algorithm and select preset
**Then**:
- ✓ Cell (0,0) shows elevation 0, marked as visited (blue)
- ✓ Priority queue shows 1 item: (0,0) with elevation 0
- ✓ Current max elevation: 0
- ✓ Step description: "Initial state: Start at cell (0,0)..."

### Scenario 2: Step Forward (Acceptance Scenario 2)

**Given**: Visualization in progress (step 5)
**When**: Click "Step Forward" button
**Then**:
- ✓ Next cell dequeued from priority queue
- ✓ Current max elevation updated (monotonically increases)
- ✓ Newly explored neighbors highlighted (green border)
- ✓ Visited cells marked (blue)
- ✓ Priority queue display updated

### Scenario 3: Priority Queue with >5 Items (Acceptance Scenario 6)

**Given**: Visualization at step where PQ has 12 items
**When**: View priority queue panel
**Then**:
- ✓ Displays exactly 5 items (top priorities)
- ✓ Shows "+ 7 more" below the list
- ✓ Items sorted by elevation (ascending)

### Scenario 4: Grid Size Validation (Acceptance Scenario 8)

**Given**: Custom input form
**When**: Attempt to input 51×51 grid
**Then**:
- ✓ Validation error: "Grid size exceeds maximum limit of 50×50"
- ✓ Input rejected, cannot proceed to visualization

---

## Step 7: Performance Validation

### 7.1 Trace Generation Performance

```bash
pnpm test tests/performance/swimInWater.bench.ts
```

**Expected**:
- 3×3 grid: <5ms
- 10×10 grid: <20ms
- 50×50 grid: <100ms (Constitution V requirement)

### 7.2 Render Performance

**Manual Test**:
1. Load 50×50 grid
2. Open browser DevTools → Performance tab
3. Record while clicking "Play"
4. **Verify**: Frame render time <16ms (60fps target)

---

## Step 8: Cross-Algorithm Component Test

### 8.1 Navigate to Trapping Rain Water II

1. Sidebar: "Dynamic Programming" → "2D Array" → "Trapping Rain Water II"
2. **Verify**:
   - ✓ Uses same PriorityQueueDisplay component
   - ✓ Uses same GridDisplay component
   - ✓ Rendering identical to Swim in Water (same component)

### 8.2 Compare Visual Consistency

**Side-by-side test**:
- Open Swim in Water in one tab
- Open Trapping Rain Water II in another tab
- **Verify**: Priority queue panels look identical (same styling, layout)

---

## Success Criteria Checklist

- [ ] All unit tests pass (GridDisplay, PriorityQueueDisplay, StatusDisplay)
- [ ] All plugin tests pass (swimInWater interface, trace generation, validation)
- [ ] Navigation tree includes Graphs → Priority Queue → Swim in Water
- [ ] Shared components reused in both swimInWater and trappingRainWater2
- [ ] E2E test passes (visualization renders, playback controls work)
- [ ] Performance targets met (<100ms trace, <16ms render)
- [ ] All 9 acceptance scenarios validated manually
- [ ] Backward compatibility maintained (trappingRainWater2 tests pass)

---

## Troubleshooting

### Issue: Grid not rendering

**Check**:
1. Browser console for errors
2. `cellStates` dimensions match `grid` dimensions
3. Component imported correctly: `import GridDisplay from '$lib/components/visualization/GridDisplay.svelte'`

### Issue: Priority queue display empty

**Check**:
1. `items` array sorted by priority (ascending)
2. `remainingCount` calculated correctly: `totalQueueSize - items.length`
3. `maxDisplay` prop set (default 5)

### Issue: Performance below target

**Check**:
1. Grid size (ensure ≤50×50)
2. Virtual scrolling enabled for large grids (if implemented)
3. Svelte component using `$state()` for reactivity (not full re-render)

---

## Next Steps

After completing this quickstart:
1. Run full test suite: `pnpm test`
2. Check code coverage: `pnpm test:coverage` (target >80% for core logic)
3. Build production: `pnpm run build`
4. Deploy preview: `vercel --prod` (if configured)

---

**Document Status**: Ready for testing
**Last Updated**: 2025-10-06

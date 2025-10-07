# Data Model: Swim in Water Algorithm Visualization

**Feature**: 004-we-ll-implement
**Date**: 2025-10-06
**Source**: Extracted from spec.md Key Entities

---

## Core Algorithm Entities

### SwimInWaterInput
**Purpose**: Input data for the Swim in Water algorithm

**Fields**:
```typescript
interface SwimInWaterInput {
  grid: number[][];  // N×N matrix of elevation values
}
```

**Validation Rules** (FR-011):
- Grid MUST be square (grid.length === grid[0].length)
- Grid size MUST be ≥ 1×1 and ≤ 50×50
- All elevation values MUST be non-negative integers
- All rows MUST have equal length

**Zod Schema**:
```typescript
const SwimInWaterInputSchema = z.object({
  grid: z.array(z.array(z.number().int().nonnegative()))
    .refine(grid => grid.length > 0, "Grid must not be empty")
    .refine(grid => grid.length <= 50, "Grid size exceeds 50×50 limit")
    .refine(grid => grid.every(row => row.length === grid.length),
      "Grid must be square")
});
```

---

### SwimInWaterState
**Purpose**: Represents algorithm state at a single execution step

**Fields**:
```typescript
interface SwimInWaterState {
  heightMap: number[][];           // Original grid (immutable)
  visited: boolean[][];            // Cell visit status
  currentCell: Coordinate;         // Currently processing cell
  currentMaxElevation: number;     // Accumulated answer (max elevation on path)
  priorityQueue: PriorityQueueSnapshot;  // Queue state for visualization
}
```

**Relationships**:
- `heightMap` references original input grid (never modified)
- `visited[r][c]` corresponds to `heightMap[r][c]`
- `currentCell` points to cell being dequeued from priority queue
- `currentMaxElevation` monotonically increases (max function)

**State Transitions**:
1. **Initial State**: `(0,0)` visited, `currentMaxElevation = grid[0][0]`, PQ has `(0,0)`
2. **Step Forward**: Dequeue cell → mark visited → enqueue unvisited neighbors → update max elevation
3. **Terminal State**: `currentCell = (N-1, N-1)` (bottom-right corner reached)

---

### PriorityQueueSnapshot
**Purpose**: Captures displayable portion of priority queue for visualization (FR-013)

**Fields**:
```typescript
interface PriorityQueueSnapshot {
  topItems: QueueItem[];     // Top 3-5 items (lowest elevations first)
  remainingCount: number;    // Total items in queue - topItems.length
}

interface QueueItem {
  elevation: number;  // Priority (elevation value)
  row: number;        // Cell row coordinate
  col: number;        // Cell column coordinate
}
```

**Invariants**:
- `topItems.length` ≤ 5 (FR-013: display max 5 items)
- `topItems.length` ≤ total queue size
- `topItems` sorted by elevation (ascending - min-heap property)
- `remainingCount` ≥ 0

**Example**:
```typescript
// Queue with 12 items: elevations [1,2,3,4,5,6,7,8,9,10,11,12]
{
  topItems: [
    {elevation: 1, row: 0, col: 1},
    {elevation: 2, row: 1, col: 0},
    {elevation: 3, row: 0, col: 2},
    {elevation: 4, row: 2, col: 0},
    {elevation: 5, row: 1, col: 1}
  ],
  remainingCount: 7  // 12 - 5
}
// Display: "Next: [(1,0,1), (2,1,0), (3,0,2), (4,2,0), (5,1,1)] + 7 more"
```

---

### ExecutionStep<SwimInWaterState>
**Purpose**: Single frame in the execution trace (Constitution III: Step-by-Step Traceability)

**Fields**:
```typescript
interface ExecutionStep {
  index: number;                    // Step number (0-indexed)
  state: SwimInWaterState;          // Algorithm state snapshot
  description: string;              // Human-readable action description
  highlightedCells?: Coordinate[];  // Cells to highlight (neighbors being explored)
}
```

**Description Examples**:
- `"Initial state: Start at cell (0,0) with elevation 0"`
- `"Dequeue cell (1,0) with elevation 3, current max: 3"`
- `"Exploring neighbors of (1,0): right (1,1), down (2,0)"`
- `"Enqueue cell (1,1) with elevation 1 to priority queue"`
- `"Reached destination (2,2) with elevation 6, minimum time: 6"`

**Highlighted Cells**:
- Current step's neighbors being added to priority queue
- Up to 4 cells (up, down, left, right directions)

---

## Shared Visualization Component Props

### GridDisplayProps
**Purpose**: Reusable grid visualization component (FR-001, FR-002, FR-014)

**Fields**:
```typescript
interface GridDisplayProps {
  grid: number[][];                  // Cell values to display
  cellStates: CellState[][];         // Visual state of each cell
  highlightedCells?: Coordinate[];   // Cells to highlight (optional)
  onCellClick?: (row: number, col: number) => void;  // Interaction handler (optional)
}

type CellState = 'unvisited' | 'processing' | 'visited';

interface Coordinate {
  row: number;
  col: number;
}
```

**Visual Mapping** (FR-002):
- `unvisited`: Gray background, normal opacity
- `processing`: Yellow/gold background, pulsing animation
- `visited`: Blue background, reduced opacity
- `highlightedCells`: Border highlight (e.g., green border)

**Component Contract**:
- MUST render N×N grid matching input dimensions
- MUST apply `cellStates[r][c]` styling to each cell
- MUST display `grid[r][c]` value in each cell
- MUST call `onCellClick(r, c)` when cell clicked (if provided)
- MUST support grids up to 50×50 (2,500 cells)

---

### StatusDisplayProps
**Purpose**: Reusable status/metrics display component (FR-004, FR-012, FR-014)

**Fields**:
```typescript
interface StatusDisplayProps {
  metrics: Record<string, string | number>;  // Key-value metrics to display
  currentStep: number;                       // Current execution step
  totalSteps: number;                        // Total steps in trace
}
```

**Example Usage**:
```typescript
<StatusDisplay
  metrics={{
    "Algorithm": "Swim in Water",
    "Current Max Elevation": 5,
    "Grid Size": "5×5",
    "Complexity": "O(N² log N)"
  }}
  currentStep={12}
  totalSteps={38}
/>
```

**Component Contract**:
- MUST display all metrics in readable format
- MUST show progress indicator (`currentStep` / `totalSteps`)
- MUST handle dynamic metric updates (Svelte reactivity)

---

### PriorityQueueDisplayProps
**Purpose**: Reusable priority queue visualization component (FR-013, FR-014, FR-015)

**Fields**:
```typescript
interface PriorityQueueDisplayProps {
  items: QueueDisplayItem[];     // Items to display (top 3-5)
  remainingCount: number;        // Additional items not shown
  maxDisplay?: number;           // Max items to show (default 5)
}

interface QueueDisplayItem {
  priority: number;              // Priority value (for sorting)
  label: string;                 // Display label (e.g., "Cell (1,2)")
  data?: unknown;                // Optional algorithm-specific data
}
```

**Component Contract**:
- MUST display items sorted by priority (ascending - lowest first)
- MUST limit display to `min(items.length, maxDisplay)` items
- MUST show `remainingCount > 0` as "+ N more" suffix (FR-013)
- MUST handle empty queue (display "Queue empty")
- MUST be algorithm-agnostic (works for any priority-based data)

**Example Display**:
```
Priority Queue (17 items):
┌─────────────────────────┐
│ 1. Cell (0,1) - elev 2  │
│ 2. Cell (1,0) - elev 3  │
│ 3. Cell (0,2) - elev 5  │
│ 4. Cell (2,0) - elev 6  │
│ 5. Cell (1,1) - elev 7  │
│ + 12 more                │
└─────────────────────────┘
```

---

## Navigation Tree Entities

### NavigationNode (Modified)
**Purpose**: Tree structure for algorithm navigation (FR-010)

**Fields**:
```typescript
type NavigationNode = CategoryNode | AlgorithmNode;

interface CategoryNode {
  type: 'category';
  id: string;              // Unique ID (kebab-case)
  label: string;           // Display name
  children: NavigationNode[];  // Subcategories or algorithms
}

interface AlgorithmNode {
  type: 'algorithm';
  id: string;              // Unique ID (kebab-case)
  label: string;           // Display name
  pluginId: string;        // References AlgorithmPlugin.id
  path: string;            // Route path (e.g., "/graphs/swim-in-water")
}
```

**New Nodes for Feature 004**:
```typescript
// Add to navigation tree
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

---

## AlgorithmPlugin Interface (Modified)

**Purpose**: Standard interface for all algorithm implementations (Constitution II: Reusability)

**Fields** (NEW: category/subcategory):
```typescript
interface AlgorithmPlugin<TInput = unknown, TState = unknown> {
  id: string;                  // Unique algorithm ID
  name: string;                // Display name
  category: string;            // NEW: Top-level category (e.g., "Graphs")
  subcategory?: string;        // NEW: Optional subcategory (e.g., "Priority Queue")
  description: string;         // Algorithm description
  generateTrace: (input: TInput) => ExecutionTrace<TState>;
  presets: Preset<TInput>[];
  visualize: (step: ExecutionStep<TState>) => VisualizationData;
}
```

**Swim in Water Plugin Example**:
```typescript
export const swimInWaterPlugin: AlgorithmPlugin<SwimInWaterInput, SwimInWaterState> = {
  id: 'swim-in-water',
  name: 'Swim in Water',
  category: 'Graphs',           // NEW
  subcategory: 'Priority Queue', // NEW
  description: 'Find minimum time to swim from top-left to bottom-right...',
  generateTrace: (input) => { /* ... */ },
  presets: [
    { name: 'Small 3×3', input: { grid: [[0,2,1],[3,1,4],[7,5,6]] } },
    { name: 'Medium 5×5', input: { grid: [...] } },
    { name: 'Edge Case', input: { grid: [...] } }
  ],
  visualize: (step) => { /* ... */ }
};
```

---

## Validation Rules Summary

| Entity | Rule | Source |
|--------|------|--------|
| SwimInWaterInput.grid | Square (N×N) | FR-011 |
| SwimInWaterInput.grid | 1 ≤ N ≤ 50 | FR-011 |
| SwimInWaterInput.grid | All values ≥ 0 | FR-011 |
| PriorityQueueSnapshot.topItems | length ≤ 5 | FR-013 |
| GridDisplayProps.grid | Supports up to 50×50 | FR-011, Constitution V |
| ExecutionStep.description | Human-readable | Constitution III |
| AlgorithmPlugin.category | Required (non-empty) | FR-010 |

---

## Performance Constraints

| Metric | Target | Source |
|--------|--------|--------|
| Trace generation (50×50 grid) | <100ms | Constitution V |
| Grid render update | <16ms (60fps) | Constitution V |
| Memory per snapshot (50×50) | <500 KB | Research.md (top-K strategy) |
| Total trace memory (1000 steps) | <500 MB | Research.md analysis |

---

**Document Status**: Complete
**Next Steps**: Generate contracts (Zod schemas) in `/contracts/` directory

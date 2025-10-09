# Data Model: Multi-Phase Visualization & GCD Algorithm

**Feature**: GCD Array Visualization with Multi-Phase Framework
**Date**: 2025-10-09
**Phase**: 1 - Design & Contracts

## Entity Overview

This feature introduces **6 new entities** and **extends 2 existing entities**:

### New Entities
1. **Phase** - Container for algorithm execution segment
2. **RendererConfig** - Declarative renderer specification
3. **ArrayVisualizationState** - 1D array snapshot with highlights
4. **ScalarPairState** - Two-value state (m, n) for Euclidean algorithm
5. **GCDInput** - Validated input for GCD algorithm
6. **GCDPreset** - Pre-configured example arrays

### Extended Entities
7. **ExecutionStep** (existing) - Add phase metadata
8. **AlgorithmPlugin** (existing) - Add multi-phase support

---

## Entity Definitions

### 1. Phase

**Purpose**: Represents a distinct segment of multi-step algorithm execution with its own visualization configuration.

**Fields**:
- `id`: `string` - Unique identifier (e.g., 'min-max-search', 'gcd-computation')
- `label`: `string` - Human-readable name (e.g., 'Finding Min/Max')
- `description`?: `string` - Optional explanation of phase purpose
- `rendererConfigs`: `RendererConfig[]` - Array of renderer specifications for this phase

**Validation Rules**:
- `id` must be lowercase kebab-case (regex: `/^[a-z][a-z0-9-]*$/`)
- `label` must be 1-50 characters
- `rendererConfigs` must contain at least 1 renderer

**Relationships**:
- Phase **contains** multiple RendererConfigs (1:many)
- ExecutionStep **references** Phase via `phaseId` (many:1)

**Example**:
```typescript
{
  id: 'min-max-search',
  label: 'Finding Min & Max',
  description: 'Iterate through array to find minimum and maximum values',
  rendererConfigs: [
    { type: 'array', ... },
    { type: 'status', ... }
  ]
}
```

---

### 2. RendererConfig

**Purpose**: Declarative specification of which generic renderer to use and how to configure it.

**Structure**: Discriminated union based on `type` field

**Variants**:

#### ArrayRendererConfig
```typescript
{
  type: 'array';
  data: number[];
  highlight?: {
    indices: number[];
    role: 'focus' | 'min' | 'max' | 'result';
  };
  layout?: {
    orientation: 'horizontal' | 'vertical';
    cellSize?: number;
  };
}
```

#### ScalarPairRendererConfig
```typescript
{
  type: 'scalarPair';
  data: {
    m: number;
    n: number;
    operation?: string; // e.g., "377 % 233 = 144"
  };
  labels?: {
    m: string;
    n: string;
  };
}
```

#### StatusRendererConfig (extends existing)
```typescript
{
  type: 'status';
  data: {
    message: string;
    level: 'info' | 'success' | 'warning';
  };
}
```

**Validation Rules**:
- `type` must be one of valid renderer types
- Each variant has type-specific constraints (e.g., `data` array length <= 1000 for ArrayRenderer)
- Highlight indices must exist in data array
- Highlight role must be from defined set

**Relationships**:
- RendererConfig **belongs to** Phase (many:1)
- RendererConfig **specifies** which component to render (mapping to Svelte component)

---

### 3. ArrayVisualizationState

**Purpose**: Snapshot of 1D array state with highlight metadata for a single execution step.

**Fields**:
- `array`: `number[]` - The array values at this step
- `focusIndex`?: `number` - Currently examined element (if applicable)
- `minIndex`?: `number` - Index of current minimum value
- `maxIndex`?: `number` - Index of current maximum value
- `minValue`?: `number` - Current minimum value
- `maxValue`?: `number` - Current maximum value

**Validation Rules**:
- `array` length: 1-1000 elements
- `array` values: 1-10000 (per FR-008)
- All index fields must be valid indices into `array`
- `minValue` must equal `array[minIndex]` if both present
- `maxValue` must equal `array[maxIndex]` if both present

**Relationships**:
- ArrayVisualizationState **is part of** ExecutionStep.state
- ArrayVisualizationState **maps to** ArrayRendererConfig.data

**Example**:
```typescript
{
  array: [2, 5, 6, 9, 10],
  focusIndex: 3,
  minIndex: 0,
  maxIndex: 4,
  minValue: 2,
  maxValue: 10
}
```

---

### 4. ScalarPairState

**Purpose**: Tracks two-value state during Euclidean algorithm execution.

**Fields**:
- `m`: `number` - First value (larger in GCD algorithm)
- `n`: `number` - Second value (smaller in GCD algorithm)
- `operation`?: `string` - Explanation of current step (e.g., "377 % 233 = 144")
- `isComplete`: `boolean` - Whether algorithm has terminated (n === 0)

**Validation Rules**:
- Both `m` and `n` must be >= 0
- If `isComplete` is true, `n` must equal 0
- Operation string must match pattern: `\d+ % \d+ = \d+` (if present)

**Relationships**:
- ScalarPairState **is part of** ExecutionStep.state
- ScalarPairState **maps to** ScalarPairRendererConfig.data

**Example**:
```typescript
{
  m: 377,
  n: 233,
  operation: "377 % 233 = 144",
  isComplete: false
}
```

---

### 5. GCDInput

**Purpose**: Validated input for GCD Array algorithm.

**Fields**:
- `nums`: `number[]` - Input array of positive integers

**Validation Rules** (per FR-008, FR-009):
- `nums` length: 1-1000 elements
- Each element: integer in range 1-10000
- No null/undefined/NaN values
- Must be valid JSON-serializable array

**Relationships**:
- GCDInput **is validated by** Zod schema
- GCDInput **is used by** GCDPlugin.generateTrace()

**Zod Schema**:
```typescript
const GCDInputSchema = z.object({
  nums: z.array(
    z.number().int().min(1).max(10000)
  ).min(1).max(1000)
});
```

---

### 6. GCDPreset

**Purpose**: Pre-configured example array with educational metadata.

**Fields**:
- `name`: `string` - Preset name (e.g., 'Simple Case', 'Fibonacci Worst-Case')
- `description`: `string` - Explanation of what this preset demonstrates
- `input`: `GCDInput` - The array values
- `expectedGCD`: `number` - Expected result (for validation)

**Validation Rules**:
- `name` must be 3-50 characters
- `description` must be 10-200 characters
- `input` must pass GCDInput validation
- `expectedGCD` must be positive integer

**Relationships**:
- GCDPreset **contains** GCDInput (1:1)
- GCDPlugin **provides** multiple GCDPresets

**Examples** (per FR-007 and clarifications):
```typescript
const presets: GCDPreset[] = [
  {
    name: 'Simple Case',
    description: 'Small array with distinct values',
    input: { nums: [2, 5, 6, 9, 10] },
    expectedGCD: gcd(2, 10) // = 2
  },
  {
    name: 'Common Factors',
    description: 'All values share factor of 6',
    input: { nums: [12, 18, 24] },
    expectedGCD: gcd(12, 24) // = 12
  },
  {
    name: 'Extreme Range',
    description: 'Minimum and maximum possible values',
    input: { nums: [1, 100] },
    expectedGCD: 1
  },
  {
    name: 'All Same',
    description: 'Identical values (immediate termination)',
    input: { nums: [7, 7, 7] },
    expectedGCD: 7
  },
  {
    name: 'Fibonacci Worst-Case',
    description: 'Consecutive Fibonacci numbers require maximum Euclidean steps',
    input: { nums: [233, 377] },
    expectedGCD: 1
  }
];
```

---

## Extended Entities

### 7. ExecutionStep (Extended)

**Existing Fields** (unchanged):
- `index`: `number`
- `state`: `TState` (generic)
- `description`: `string`
- `highlightedCells`?: `CellCoordinate[]`

**New Fields**:
- `phaseId`: `string` - References Phase.id to determine active visualization

**Updated Type**:
```typescript
interface ExecutionStep<TState = unknown> {
  index: number;
  phaseId: string;  // NEW
  state: TState;
  description: string;
  highlightedCells?: CellCoordinate[];  // Optional, for grid-based algorithms
}
```

**Validation Rules**:
- `phaseId` must reference a valid Phase.id declared in plugin metadata
- First step must have phaseId (no default phase)

---

### 8. AlgorithmPlugin (Extended)

**Existing Fields** (unchanged):
- `id`, `name`, `category`, `description`
- `generateTrace()`, `presets`, `visualize()`

**New Fields**:
- `phases`?: `Phase[]` - Optional array of phase definitions (for multi-phase algorithms)

**Updated Type**:
```typescript
interface AlgorithmPlugin<TInput = unknown, TState = unknown> {
  id: string;
  name: string;
  category: string;
  description: string;
  phases?: Phase[];  // NEW - undefined for single-phase algorithms
  generateTrace: (input: TInput) => ExecutionTrace<TState>;
  presets: Preset<TInput>[];
  visualize: (step: ExecutionStep<TState>) => VisualizationData;
}
```

**Backward Compatibility**:
- Existing single-phase algorithms: `phases` field undefined, work as before
- Multi-phase algorithms: `phases` array required, ExecutionStep.phaseId must match

---

## Data Flow Diagram

```
┌─────────────┐
│ GCDInput    │
│ (validated) │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ GCDPlugin           │
│ .generateTrace()    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐         ┌──────────────┐
│ ExecutionTrace      │◄────────│ Phase[]      │
│ ├─ ExecutionStep[]  │         │ (metadata)   │
│ │  ├─ phaseId  ────┼─────────►└──────────────┘
│ │  ├─ state        │
│ │  └─ description  │
│ └─ metadata         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐         ┌──────────────────┐
│ PlaybackController  │────────►│ PhaseContainer   │
│ (current step)      │         │ (active phase)   │
└─────────────────────┘         └────────┬─────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
          ┌─────────────────┐  ┌──────────────────┐  ┌─────────────┐
          │ ArrayRenderer   │  │ ScalarPairRenderer│  │ StatusRenderer│
          │ (min/max phase) │  │ (GCD phase)       │  │ (messages)   │
          └─────────────────┘  └──────────────────┘  └─────────────┘
```

---

## State Transitions

### Min/Max Search Phase
```
Initial State:
  array: [2, 5, 6, 9, 10]
  focusIndex: null
  minIndex: null, maxIndex: null
  minValue: Infinity, maxValue: -Infinity

Step 1 (index 0):
  focusIndex: 0
  minIndex: 0, maxIndex: 0
  minValue: 2, maxValue: 2

Step 2 (index 1):
  focusIndex: 1
  minIndex: 0, maxIndex: 1
  minValue: 2, maxValue: 5

...

Final State (after index 4):
  focusIndex: 4
  minIndex: 0, maxIndex: 4
  minValue: 2, maxValue: 10
```

### GCD Computation Phase
```
Initial State (from min/max phase):
  m: 10, n: 2
  operation: null
  isComplete: false

Step 1:
  m: 10, n: 2
  operation: "10 % 2 = 0"
  isComplete: false

Step 2:
  m: 2, n: 0
  operation: "2 % 0 = undefined (terminate)"
  isComplete: true
```

---

## Validation Summary

All entities have:
- ✅ Clear field definitions with types
- ✅ Validation rules (constraints)
- ✅ Relationships to other entities
- ✅ Examples demonstrating structure

**Next Step**: Generate contract TypeScript files and Zod schemas in `/contracts/` directory.

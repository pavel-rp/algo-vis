# Quickstart: Creating Your First Algorithm Plugin

**Goal**: Create a simple Bubble Sort visualization plugin in under 30 minutes

**Prerequisites**: None - this guide walks you through the complete process

---

## What You'll Build

A working algorithm plugin that visualizes bubble sort on an array of numbers, with:
- ✅ Step-by-step execution showing comparisons and swaps
- ✅ Visual highlighting of elements being compared
- ✅ Metrics (comparisons, swaps) displayed in real-time
- ✅ Pre-configured example inputs
- ✅ Input validation

---

## Step 1: Create Plugin File

Create `src/plugins/bubble-sort/index.ts`:

```typescript
import type { AlgorithmPlugin, Frame, Trace, ValidationResult } from '$lib/types/plugin';

// Define our state type (what the visualization will render)
interface BubbleSortState {
  array: number[];
  comparing: [number, number] | null; // Indices being compared
  sorted: boolean[];                   // Which elements are in final position
  swaps: number;
  comparisons: number;
}

// Export the plugin (framework auto-discovers this)
const bubbleSortPlugin: AlgorithmPlugin<number[], BubbleSortState> = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  description: 'A simple comparison-based sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in wrong order.',
  category: 'Sorting',
  visualizationType: 'array',

  // Input format for UI
  inputSchema: {
    type: 'json',
    description: 'Array of numbers to sort (e.g., [5, 2, 8, 1, 9])'
  },

  // Pre-configured examples
  presets: [
    {
      name: 'Small Array (5 elements)',
      data: [5, 2, 8, 1, 9],
      description: 'Simple example showing basic behavior'
    },
    {
      name: 'Nearly Sorted',
      data: [1, 2, 4, 3, 5, 6],
      description: 'Best-case scenario with minimal swaps'
    },
    {
      name: 'Reverse Sorted',
      data: [9, 7, 5, 3, 1],
      description: 'Worst-case scenario requiring maximum swaps'
    }
  ],

  // Generate execution trace
  trace(input: number[]): Trace<BubbleSortState> {
    const frames: Frame<BubbleSortState>[] = [];
    const arr = [...input]; // Copy to avoid mutating input
    const sorted = new Array(arr.length).fill(false);
    let swaps = 0;
    let comparisons = 0;
    let step = 0;

    // Initial state
    frames.push({
      step: step++,
      state: { array: [...arr], comparing: null, sorted: [...sorted], swaps, comparisons },
      description: 'Initial array before sorting begins'
    });

    // Bubble sort algorithm
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - 1 - i; j++) {
        // Comparison step
        comparisons++;
        frames.push({
          step: step++,
          state: { array: [...arr], comparing: [j, j + 1], sorted: [...sorted], swaps, comparisons },
          focus: [
            { type: 'array-index', id: String(j) },
            { type: 'array-index', id: String(j + 1) }
          ],
          metrics: { comparisons, swaps },
          description: `Comparing elements at positions ${j} and ${j + 1}: ${arr[j]} vs ${arr[j + 1]}`
        });

        // Swap if needed
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swaps++;
          frames.push({
            step: step++,
            state: { array: [...arr], comparing: [j, j + 1], sorted: [...sorted], swaps, comparisons },
            focus: [
              { type: 'array-index', id: String(j), style: { color: 'red' } },
              { type: 'array-index', id: String(j + 1), style: { color: 'red' } }
            ],
            metrics: { comparisons, swaps },
            description: `Swapped ${arr[j + 1]} and ${arr[j]} because ${arr[j + 1]} > ${arr[j]}`
          });
        }
      }
      // Mark element as sorted
      sorted[arr.length - 1 - i] = true;
      frames.push({
        step: step++,
        state: { array: [...arr], comparing: null, sorted: [...sorted], swaps, comparisons },
        metrics: { comparisons, swaps },
        description: `Element ${arr[arr.length - 1 - i]} is now in its final position`
      });
    }

    // Mark first element as sorted (last remaining)
    sorted[0] = true;

    // Final state
    frames.push({
      step: step++,
      state: { array: [...arr], comparing: null, sorted: [...sorted], swaps, comparisons },
      metrics: { comparisons, swaps },
      description: `Sorting complete! Array is now sorted with ${swaps} swaps and ${comparisons} comparisons.`
    });

    return {
      frames,
      totalSteps: frames.length,
      completed: true,
      metadata: { swaps, comparisons }
    };
  },

  // Validate user input
  validateInput(input: number[]): ValidationResult {
    if (!Array.isArray(input)) {
      return { valid: false, errors: ['Input must be an array'] };
    }
    if (input.length === 0) {
      return { valid: false, errors: ['Array cannot be empty'] };
    }
    if (input.length > 100) {
      return { valid: false, errors: ['Array too large (max 100 elements)'] };
    }
    if (!input.every(x => typeof x === 'number')) {
      return { valid: false, errors: ['All elements must be numbers'] };
    }
    if (input.some(x => !Number.isFinite(x))) {
      return { valid: false, errors: ['All numbers must be finite (no Infinity or NaN)'] };
    }
    return { valid: true };
  }
};

export default bubbleSortPlugin;
```

---

## Step 2: Test Your Plugin

The framework will automatically discover and load your plugin. To test:

1. **Start dev server**: `pnpm dev`
2. **Navigate to**: `http://localhost:5173`
3. **Select algorithm**: Choose "Bubble Sort" from dropdown
4. **Load preset**: Click "Small Array (5 elements)"
5. **Play visualization**: Click ▶️ Play button

You should see:
- Array elements rendering as bars/boxes
- Focus highlights on elements being compared
- Swap animations when elements exchange positions
- Metrics (comparisons, swaps) updating in status panel
- Step descriptions in the log

---

## Step 3: Verify Plugin Contract

Run contract tests to ensure your plugin is valid:

```bash
pnpm test:contract bubble-sort
```

Tests verify:
- ✅ Plugin exports default object implementing `AlgorithmPlugin`
- ✅ All presets pass `validateInput()`
- ✅ `trace()` returns sequential frames starting at step 0
- ✅ Frame descriptions are non-empty
- ✅ Focus markers reference valid array indices
- ✅ Plugin ID matches filename

---

## Step 4: Add Optional Code Highlighting

To show code alongside visualization, add the `code` property:

```typescript
const bubbleSortPlugin: AlgorithmPlugin = {
  // ... existing properties ...

  code: {
    language: 'typescript',
    source: `function bubbleSort(arr: number[]): number[] {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
    stepToLines: {
      0: [1, 1],   // Initial state -> function signature
      1: [2, 3],   // Comparison -> inner loop comparison
      5: [3, 5],   // Swap -> swap lines
      // ... map more steps to line ranges
    }
  }
};
```

Now the code panel will highlight the corresponding lines as the visualization plays.

**If you omit `code`**, the framework will auto-generate pseudocode from your frame descriptions (FR-019a).

---

## Step 5: Customize Visualization (Optional)

To customize how your algorithm renders, you can provide style hints in focus markers:

```typescript
focus: [
  {
    type: 'array-index',
    id: String(j),
    style: {
      color: 'blue',      // Custom highlight color
      intensity: 0.8,     // Opacity/brightness
      pulse: true         // Animated pulsing effect
    }
  }
]
```

The array renderer component will use these hints to adjust visual appearance.

---

## Common Pitfalls & Solutions

### ❌ Frames have duplicate step numbers
**Cause**: Forgot to increment `step` counter
**Fix**: Use `step++` when pushing each frame

### ❌ Validation passes but trace() fails
**Cause**: Mismatch between validation logic and trace expectations
**Fix**: Test all presets with `trace()` to ensure they work

### ❌ Focus markers don't highlight anything
**Cause**: ID format doesn't match array indices
**Fix**: Use `String(index)` for array-index type (e.g., "0", "1", "2")

### ❌ Too many frames (performance issues)
**Cause**: Creating frame for every minor state change
**Solution**: Group related operations (e.g., comparison + swap in fewer frames)
**Note**: Framework auto-samples if >5000 frames, but aim for <1000 for best UX

---

## Next Steps

You've created a working algorithm plugin! To deepen your understanding:

1. **Explore other plugins**: Check `src/plugins/trapping-rain-water-ii/` for grid-based example
2. **Read the plugin contract**: See `specs/master/contracts/plugin-interface.ts`
3. **Add more presets**: Test edge cases (single element, already sorted, etc.)
4. **Customize metrics**: Add algorithm-specific measurements to frame.metrics
5. **Write integration tests**: Create `src/plugins/bubble-sort/index.test.ts` (see template)

---

## Plugin Checklist

Before submitting a plugin, verify:

- [ ] Plugin ID is unique (kebab-case)
- [ ] At least 2 presets (simple + classic)
- [ ] All presets pass `validateInput()`
- [ ] `trace()` returns frames with sequential steps
- [ ] Each frame has non-empty description
- [ ] Focus markers use correct ID format for visualization type
- [ ] Validation rejects invalid inputs with clear error messages
- [ ] Plugin works with all standard controls (play, pause, step, speed)
- [ ] Contract tests pass (`pnpm test:contract <plugin-id>`)

---

## Getting Help

- **Plugin Contract Reference**: `specs/master/contracts/plugin-interface.ts`
- **Data Model**: `specs/master/data-model.md`
- **Example Plugins**: `src/plugins/*/` directory
- **Community**: GitHub Discussions (link TBD)

**Estimated time**: 20-30 minutes for first plugin, 10-15 minutes for subsequent plugins

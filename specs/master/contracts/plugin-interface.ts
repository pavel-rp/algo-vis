/**
 * Algorithm Plugin Contract
 *
 * This interface defines the contract that all algorithm plugins MUST implement
 * to integrate with the visualization framework.
 *
 * Constitutional Alignment:
 * - Framework Reusability (II): Algorithm-agnostic interface
 * - Step-by-Step Traceability (III): trace() returns complete execution history
 * - Interactive Learning (IV): Presets enable input experimentation
 */

/**
 * Frame: Single step in algorithm execution
 *
 * Immutable snapshot of algorithm state at a specific step.
 * Framework uses this to render visualization and update UI.
 */
export interface Frame<TState = any> {
  /** Step number (0-indexed, sequential) */
  step: number;

  /** Algorithm-specific state data (e.g., grid values, tree nodes, array) */
  state: TState;

  /** Optional: cells/nodes currently being processed (highlighted in amber) */
  focus?: FocusMarker[];

  /** Optional: related cells/nodes (e.g., neighbors, highlighted in green) */
  neighbors?: FocusMarker[];

  /** Optional: algorithm-specific metrics displayed in status panel */
  metrics?: Record<string, number | string>;

  /** Human-readable explanation of what's happening this step */
  description: string;
}

/**
 * Focus/Neighbor Marker
 *
 * Identifies a cell, node, or element for visual highlighting
 */
export interface FocusMarker {
  /** Type of element (determines which renderer handles it) */
  type: 'grid-cell' | 'array-index' | 'tree-node' | 'graph-node';

  /** Unique identifier (e.g., "2,3" for grid row 2 col 3, "node-5" for tree) */
  id: string;

  /** Optional: additional styling hints (e.g., color intensity, border thickness) */
  style?: Record<string, any>;
}

/**
 * Trace: Complete execution history
 *
 * Generated once per algorithm run, consumed by PlaybackController
 */
export interface Trace<TState = any> {
  /** Array of frames (must be sequential, immutable) */
  frames: Frame<TState>[];

  /** Total number of steps (frames.length) */
  totalSteps: number;

  /** Whether execution completed successfully */
  completed: boolean;

  /** Optional: metadata (execution time, memory usage, etc.) */
  metadata?: Record<string, any>;
}

/**
 * Input Preset
 *
 * Pre-configured example inputs for quick experimentation
 */
export interface InputPreset<TInput = any> {
  /** Display name (e.g., "Tiny 3×3 bowl", "Random 10×10") */
  name: string;

  /** Actual input data matching algorithm's expected format */
  data: TInput;

  /** Optional: brief description shown in UI */
  description?: string;
}

/**
 * Algorithm Plugin
 *
 * Main contract that framework calls to integrate an algorithm.
 * Plugins export a default object implementing this interface.
 */
export interface AlgorithmPlugin<TInput = any, TState = any> {
  /** Unique identifier (kebab-case, e.g., "trapping-rain-water-ii") */
  id: string;

  /** Display name shown in algorithm selector */
  name: string;

  /** Brief description of algorithm (2-3 sentences) */
  description: string;

  /** Category for grouping (e.g., "Graph", "Sorting", "Dynamic Programming") */
  category: string;

  /**
   * Generate complete execution trace for given input
   *
   * MUST:
   * - Return immutable frames (no mutation after return)
   * - Include step 0 (initial state) and final state
   * - Provide descriptions for all steps
   * - Apply smart sampling if frames exceed 5000 (FR-004a)
   *
   * @param input User-provided input (validated before calling)
   * @returns Complete trace with all frames
   */
  trace(input: TInput): Trace<TState>;

  /**
   * Validate user input before trace generation
   *
   * MUST:
   * - Return { valid: true } for correct inputs
   * - Return { valid: false, errors: [...] } with specific error messages
   * - Handle type mismatches, range violations, structural issues
   *
   * @param input User-provided input (potentially invalid)
   * @returns Validation result
   */
  validateInput(input: TInput): ValidationResult;

  /**
   * Preset input examples for experimentation
   *
   * MUST include at least:
   * - 1 small/simple example (for quick understanding)
   * - 1 medium/classic example (demonstrates typical usage)
   * - Optional: complex/edge-case example
   */
  presets: InputPreset<TInput>[];

  /**
   * Optional: Source code for syntax highlighting
   *
   * If omitted, framework auto-generates pseudocode from frame descriptions (FR-019a).
   * If provided, MUST include line numbers corresponding to step focus.
   */
  code?: CodeDefinition;

  /**
   * Visualization component type this algorithm requires
   *
   * Framework uses this to select appropriate renderer.
   * Currently supported: 'grid', 'array', 'tree', 'graph'
   */
  visualizationType: 'grid' | 'array' | 'tree' | 'graph';

  /**
   * Input schema definition (for UI generation)
   *
   * Describes expected input format so framework can render appropriate input controls.
   * Example: { type: 'json', schema: { type: 'array', items: { type: 'array', items: { type: 'number' } } } }
   */
  inputSchema: InputSchema;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Code Definition
 *
 * Optional source code for highlighting during visualization
 */
export interface CodeDefinition {
  /** Programming language (e.g., 'typescript', 'python', 'pseudocode') */
  language: string;

  /** Source code string (with line breaks) */
  source: string;

  /**
   * Optional: Map frame step numbers to highlighted line ranges
   * If omitted, all code visible but no line highlighting
   *
   * Example: { 0: [1, 3], 1: [5, 7], ... } highlights lines 1-3 at step 0, etc.
   */
  stepToLines?: Record<number, [number, number]>;
}

/**
 * Input Schema (simplified subset for UI generation)
 */
export type InputSchema =
  | { type: 'json'; description?: string }
  | { type: 'text'; description?: string; placeholder?: string }
  | { type: 'number'; min?: number; max?: number; description?: string };

/**
 * Example Plugin Implementation (Trapping Rain Water II)
 *
 * Shows how a plugin exports the AlgorithmPlugin interface.
 */
export const examplePlugin: AlgorithmPlugin<number[][], GridState> = {
  id: 'trapping-rain-water-ii',
  name: 'Trapping Rain Water II',
  description: 'Given a 2D height map, compute how much water can be trapped after it rains using a min-heap boundary expansion approach.',
  category: 'Heap / Matrix',

  visualizationType: 'grid',

  inputSchema: {
    type: 'json',
    description: '2D array of heights (e.g., [[1,4,3],[3,2,5]])'
  },

  presets: [
    {
      name: 'Tiny 3×3 bowl',
      data: [[5,5,5],[5,1,5],[5,5,5]],
      description: 'Simple bowl shape, traps water in center'
    },
    {
      name: 'Classic 5×6 basin',
      data: [
        [1,4,3,1,3,2],
        [3,2,1,3,2,4],
        [2,3,3,2,3,1],
        [4,3,2,2,3,4],
        [5,5,5,5,5,5],
      ],
      description: 'Complex terrain with multiple water pockets'
    }
  ],

  trace(heightMap: number[][]): Trace<GridState> {
    // Implementation would go here
    // Returns Trace with frames capturing each heap pop and neighbor expansion
    throw new Error('Example only - implementation in actual plugin file');
  },

  validateInput(input: number[][]): ValidationResult {
    if (!Array.isArray(input)) {
      return { valid: false, errors: ['Input must be a 2D array'] };
    }
    if (input.length === 0 || !Array.isArray(input[0])) {
      return { valid: false, errors: ['Input must be a non-empty 2D array'] };
    }
    const cols = input[0].length;
    for (const row of input) {
      if (!Array.isArray(row) || row.length !== cols) {
        return { valid: false, errors: ['All rows must have same length'] };
      }
      if (!row.every(cell => typeof cell === 'number')) {
        return { valid: false, errors: ['All cells must be numbers'] };
      }
    }
    return { valid: true };
  },

  code: {
    language: 'typescript',
    source: `function trapRainWater(heightMap: number[][]): number {
  const m = heightMap.length, n = heightMap[0].length;
  const heap = new MinHeap();
  const visited = new Set();

  // Add boundary cells to heap
  for (let i = 0; i < m; i++) {
    heap.push([i, 0, heightMap[i][0]]);
    heap.push([i, n-1, heightMap[i][n-1]]);
    visited.add(\`\${i},0\`);
    visited.add(\`\${i},\${n-1}\`);
  }

  let totalWater = 0;
  while (!heap.isEmpty()) {
    const [r, c, boundaryHeight] = heap.pop();
    for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n && !visited.has(\`\${nr},\${nc}\`)) {
        visited.add(\`\${nr},\${nc}\`);
        const nh = heightMap[nr][nc];
        totalWater += Math.max(0, boundaryHeight - nh);
        heap.push([nr, nc, Math.max(nh, boundaryHeight)]);
      }
    }
  }
  return totalWater;
}`,
    stepToLines: {
      0: [1, 3],  // Initial setup
      1: [6, 12], // Boundary seeding
      // ... more mappings
    }
  }
};

/** Grid state type (example for grid-based algorithms) */
interface GridState {
  grid: number[][];
  visited: boolean[][];
  water: number[][];
  heap: [number, number, number][];
  totalWater: number;
}

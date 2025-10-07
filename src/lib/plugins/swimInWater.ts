/**
 * Swim in Rising Water Algorithm Visualization Plugin
 * LeetCode #778: Swim in Rising Water
 * https://leetcode.com/problems/swim-in-rising-water/
 *
 * Feature: 004-we-ll-implement
 * Tasks: T015-T018
 *
 * Algorithm: BFS with priority queue (min-heap by elevation)
 * Problem: Find minimum time to swim from top-left to bottom-right in an N×N grid
 * Time Complexity: O(N² log N)
 * Space Complexity: O(N²)
 */

import type { AlgorithmPlugin, Trace, Frame, ValidationResult } from '$lib/types';
import type { GridState } from '$lib/types/state';
import { SwimInWaterInputSchema } from '$lib/types/swimInWater';
import { MinHeap } from '$lib/utils/MinHeap';

interface QueueItem {
	elevation: number;
	row: number;
	col: number;
}

/**
 * Generate execution trace for Swim in Rising Water algorithm
 *
 * Algorithm steps:
 * 1. Start at (0,0), mark as visited, add to priority queue
 * 2. While queue not empty:
 *    a. Dequeue cell with minimum elevation
 *    b. Update currentMaxElevation = max(current, cell.elevation)
 *    c. If reached destination (N-1, N-1), return answer
 *    d. Explore 4 neighbors (up, down, left, right)
 *    e. Add unvisited neighbors to queue
 *
 * @param input - Grid with elevation values
 * @returns Execution trace with steps
 */
function swimInRisingWaterTrace(input: { grid: number[][] }): Trace<GridState> {
	const { grid } = input;
	const frames: Frame<GridState>[] = [];
	const n = grid.length;

	// Initialize state
	const visited: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
	const heap = new MinHeap<QueueItem>((a, b) => a.elevation - b.elevation);

	let currentMaxElevation = grid[0][0];
	let step = 0;

	// Directions: up, down, left, right
	const directions = [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1]
	];

	// Frame 0: Initial state
	frames.push({
		step: step++,
		state: {
			grid: grid.map((row) => [...row]),
			visited: visited.map((row) => [...row])
		},
		description: 'Initial grid. Starting at cell (0,0).',
		metrics: {
			'Current Time': currentMaxElevation,
			'Grid Size': `${n}×${n}`
		}
	});

	// Frame 1: Start at (0,0)
	visited[0][0] = true;
	heap.push({ elevation: grid[0][0], row: 0, col: 0 });

        const snapshotHighlights = () => {
                const highlights: NonNullable<Frame<GridState>['globalHighlights']> = [];
                const visitedNodes = visited
                        .map((row, i) => row.map((isVisited, j) => (isVisited ? `${i},${j}` : null)))
                        .flat()
                        .filter((id): id is string => Boolean(id));
                const queueNodes = heap
                        .toArray()
                        .map((item) => `${item.row},${item.col}`);

                if (visitedNodes.length > 0) {
                        highlights.push({ role: 'visited', nodes: visitedNodes });
                }
                if (queueNodes.length > 0) {
                        highlights.push({ role: 'queued', nodes: queueNodes });
                }

                return highlights.length > 0 ? highlights : undefined;
        };

        frames.push({
                step: step++,
                state: {
                        grid: grid.map((row) => [...row]),
                        visited: visited.map((row) => [...row]),
                        heap: heap.toArray()
                },
                focus: [{ type: 'grid-cell', id: '0,0', role: 'start' }],
                globalHighlights: snapshotHighlights(),
                description: `Starting at cell (0,0) with elevation ${grid[0][0]}. This is our entry point.`,
                metrics: {
                        'Current Time': currentMaxElevation,
                        'Queue Size': heap.size()
                }
	});

	// BFS with priority queue
        while (!heap.isEmpty()) {
                const current = heap.pop()!;
                const { row, col, elevation } = current;

                const previousMaxElevation = currentMaxElevation;
                const updatedMaxElevation = Math.max(previousMaxElevation, elevation);
                currentMaxElevation = updatedMaxElevation;
                const maxNote =
                        updatedMaxElevation !== previousMaxElevation
                                ? `Aggregate update: Updated max time via max(${previousMaxElevation}, ${elevation}) = ${updatedMaxElevation}`
                                : `Aggregate check: Evaluated max(${previousMaxElevation}, ${elevation}) = ${updatedMaxElevation} (unchanged)`;

		// Check if reached destination
		if (row === n - 1 && col === n - 1) {
			frames.push({
				step: step++,
				state: {
					grid: grid.map((row) => [...row]),
					visited: visited.map((row) => [...row]),
					heap: []
				},
                                focus: [{ type: 'grid-cell', id: `${row},${col}`, role: 'goal' }],
                                globalHighlights: snapshotHighlights(),
                                description: `Reached destination (${row},${col})! Minimum time required: ${currentMaxElevation}.\nAggregate summary: Final time = ${currentMaxElevation}`,
                                metrics: {
                                        '**Final Answer**': currentMaxElevation,
                                        'Grid Size': `${n}×${n}`
                                }
			});
			break;
		}

		// Explore neighbors
		const neighbors = [];
		const neighborCells = [];

		for (const [dr, dc] of directions) {
			const newRow = row + dr;
			const newCol = col + dc;

			// Check bounds and visited status
			if (newRow >= 0 && newRow < n && newCol >= 0 && newCol < n && !visited[newRow][newCol]) {
				visited[newRow][newCol] = true;
				heap.push({ elevation: grid[newRow][newCol], row: newRow, col: newCol });
                                neighbors.push({ type: 'grid-cell' as const, id: `${newRow},${newCol}`, role: 'frontier' });
                                neighborCells.push({ row: newRow, col: newCol, elev: grid[newRow][newCol] });
                        }
                }

                // Create description
                let desc = `Processing cell (${row},${col}) with elevation ${elevation}.`;
                if (neighbors.length > 0) {
                        desc += ` Found ${neighbors.length} unvisited neighbor(s): `;
                        desc += neighborCells.map((c) => `(${c.row},${c.col})→${c.elev}`).join(', ');
                } else {
                        desc += ' No new neighbors to explore.';
                }

                desc += `\n${maxNote}`;

		// Capture frame after exploring neighbors
                frames.push({
                        step: step++,
                        state: {
                                grid: grid.map((row) => [...row]),
                                visited: visited.map((row) => [...row]),
                                heap: heap.toArray()
                        },
                        focus: [
                                {
                                        type: 'grid-cell',
                                        id: `${row},${col}`,
                                        role: row === n - 1 && col === n - 1 ? 'goal' : 'current'
                                }
                        ],
                        neighbors: neighbors.length > 0 ? neighbors : undefined,
                        globalHighlights: snapshotHighlights(),
                        description: desc,
                        metrics: {
                                'Current Time': currentMaxElevation,
                                'Current Cell': `(${row},${col})`,
                                'Cell Elevation': elevation,
				'Queue Size': heap.size()
			}
		});
	}

	return {
		frames,
		totalSteps: frames.length,
		completed: true,
		metadata: {
			algorithm: 'Swim in Rising Water',
			finalAnswer: currentMaxElevation,
			complexity: 'O(N² log N)',
			leetcode: 778,
			leetcodeUrl: 'https://leetcode.com/problems/swim-in-rising-water/'
		}
	};
}

/**
 * Validate input for Swim in Rising Water algorithm
 *
 * @param input - Input to validate
 * @returns Validation result with errors if invalid
 */
function validateSwimInRisingWaterInput(input: any): ValidationResult {
	const result = SwimInWaterInputSchema.safeParse(input);

	if (result.success) {
		return { valid: true };
	}

	const errors = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);

	return {
		valid: false,
		errors
	};
}

/**
 * Swim in Rising Water Algorithm Plugin
 * LeetCode #778
 */
export const swimInWaterPlugin: AlgorithmPlugin<{ grid: number[][] }, GridState> = {
	id: 'swim-in-water',
	name: 'Swim in Rising Water',
	description:
		'You are given an N×N grid where each cell has an elevation. At time t, the water level is t. You can swim to adjacent cells (up, down, left, right) if the water level is at least as high as the cell\'s elevation. Find the minimum time required to swim from the top-left corner (0,0) to the bottom-right corner (N-1,N-1). Uses BFS with a priority queue to always explore cells in order of increasing elevation. LeetCode #778',
	category: 'Graphs',
	subcategory: 'Priority Queue',
	visualizationType: 'grid',

	/**
	 * Preset examples
	 */
	presets: [
		{
			name: 'Small 3×3',
			data: {
				grid: [
					[0, 2, 1],
					[3, 1, 4],
					[7, 5, 6]
				]
			},
			description: 'Small example with answer 6. Path: (0,0)→(0,1)→(1,1)→(1,2)→(2,2), max elevation = 6'
		},
		{
			name: 'Simple 2×2',
			data: {
				grid: [
					[0, 1],
					[2, 3]
				]
			},
			description: 'Minimal example with answer 3. Must wait for time 3 to swim to bottom-right.'
		},
		{
			name: 'Medium 5×5 Spiral',
			data: {
				grid: [
					[0, 1, 2, 3, 4],
					[24, 23, 22, 21, 5],
					[12, 13, 14, 15, 16],
					[11, 17, 18, 19, 20],
					[10, 9, 8, 7, 6]
				]
			},
			description:
				'Spiral pattern with answer 16. Tests priority queue with many items. Path goes around the spiral.'
		},
		{
			name: 'Edge Case: High Wall',
			data: {
				grid: [
					[0, 2, 10],
					[3, 1, 11],
					[4, 5, 6]
				]
			},
			description:
				'High wall blocks direct path. Must find alternative route. Answer: 6'
		}
	],

	/**
	 * Trace generation
	 */
	trace: swimInRisingWaterTrace,

	/**
	 * Input validation
	 */
	validateInput: validateSwimInRisingWaterInput
};

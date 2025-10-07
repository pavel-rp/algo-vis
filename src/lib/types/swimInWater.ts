/**
 * Swim in Water Algorithm Types
 * Feature: 004-we-ll-implement
 * Task: T014
 *
 * Type definitions and validation schemas for the Swim in Water algorithm
 */

import { z } from 'zod';
import type { Coordinate } from './visualization';

// ============================================================================
// Input Types
// ============================================================================

export interface SwimInWaterInput {
	grid: number[][];
}

/**
 * Validation schema for Swim in Water input
 * Constraints (FR-011):
 * - Grid must be square (N×N)
 * - Grid size: 1 ≤ N ≤ 50
 * - All elevation values must be non-negative integers
 */
export const SwimInWaterInputSchema = z
	.object({
		grid: z
			.array(z.array(z.number().int().nonnegative()))
			.refine((grid) => grid.length > 0, 'Grid must not be empty')
			.refine((grid) => grid.length <= 50, 'Grid size exceeds maximum limit of 50×50')
			.refine(
				(grid) => grid.every((row) => row.length === grid.length),
				'Grid must be square (N×N)'
			)
	})
	.strict();

// ============================================================================
// Priority Queue Types
// ============================================================================

/**
 * Single item in the priority queue
 */
export interface QueueItem {
	elevation: number; // Priority value (elevation at this cell)
	row: number; // Cell row coordinate
	col: number; // Cell column coordinate
}

/**
 * Snapshot of priority queue for visualization
 * Contains top K items (default 5) plus count of remaining items
 */
export interface PriorityQueueSnapshot {
	topItems: QueueItem[]; // Top 3-5 items with lowest elevations
	remainingCount: number; // Number of items not displayed (total - topItems.length)
}

// ============================================================================
// Algorithm State Types
// ============================================================================

/**
 * Complete state of the Swim in Water algorithm at a single step
 */
export interface SwimInWaterState {
	heightMap: number[][]; // Original grid (immutable)
	visited: boolean[][]; // Cell visit status
	currentCell: Coordinate; // Currently processing cell
	currentMaxElevation: number; // Maximum elevation encountered so far (answer)
	priorityQueue: PriorityQueueSnapshot; // Queue state for visualization
}

/**
 * Extended grid state for visualization compatibility
 */
export interface SwimInWaterGridState {
	grid: number[][];
	visited: boolean[][];
	currentCell: Coordinate | null;
	neighbors: Coordinate[];
	currentMaxElevation: number;
	priorityQueue: QueueItem[];
	priorityQueueCount: number;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if input is valid SwimInWaterInput
 */
export function isValidSwimInWaterInput(input: unknown): input is SwimInWaterInput {
	return SwimInWaterInputSchema.safeParse(input).success;
}

// ============================================================================
// Example Usage
// ============================================================================

/**
 * Example input:
 * {
 *   grid: [
 *     [0, 2, 1],
 *     [3, 1, 4],
 *     [7, 5, 6]
 *   ]
 * }
 *
 * Example state:
 * {
 *   heightMap: [[0,2,1],[3,1,4],[7,5,6]],
 *   visited: [[true, false, false], [false, false, false], [false, false, false]],
 *   currentCell: { row: 0, col: 0 },
 *   currentMaxElevation: 0,
 *   priorityQueue: {
 *     topItems: [
 *       { elevation: 2, row: 0, col: 1 },
 *       { elevation: 3, row: 1, col: 0 }
 *     ],
 *     remainingCount: 0
 *   }
 * }
 */

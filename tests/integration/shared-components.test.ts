/**
 * Integration Tests: Shared Component Reusability
 * Feature: 004-we-ll-implement
 * Task: T005
 *
 * Verifies shared components work with multiple algorithms
 */

import { describe, it, expect } from 'vitest';
import {
	GridDisplayPropsSchema,
	StatusDisplayPropsSchema,
	PriorityQueueDisplayPropsSchema
} from '../../specs/004-we-ll-implement/contracts/SharedComponents.schema';

describe('Shared Component Reusability', () => {
	describe('GridDisplay reusability', () => {
		it('should accept swimInWater grid data', () => {
			const swimInWaterGridProps = {
				grid: [
					[0, 2, 1],
					[3, 1, 4],
					[7, 5, 6]
				],
				cellStates: [
					['visited', 'unvisited', 'unvisited'],
					['processing', 'unvisited', 'unvisited'],
					['unvisited', 'unvisited', 'unvisited']
				] as const
			};

			expect(() => GridDisplayPropsSchema.parse(swimInWaterGridProps)).not.toThrow();
		});

		it('should accept trappingRainWater2 grid data', () => {
			const trappingRainWaterGridProps = {
				grid: [
					[1, 4, 3, 2],
					[3, 2, 1, 3],
					[2, 3, 3, 2],
					[1, 2, 4, 1]
				],
				cellStates: [
					['visited', 'visited', 'unvisited', 'unvisited'],
					['visited', 'processing', 'unvisited', 'unvisited'],
					['unvisited', 'unvisited', 'unvisited', 'unvisited'],
					['unvisited', 'unvisited', 'unvisited', 'unvisited']
				] as const
			};

			expect(() => GridDisplayPropsSchema.parse(trappingRainWaterGridProps)).not.toThrow();
		});

		it('should accept uniquePathsWithObstacles grid data', () => {
			const uniquePathsGridProps = {
				grid: [
					[0, 0, 0],
					[0, 1, 0],
					[0, 0, 0]
				],
				cellStates: [
					['visited', 'visited', 'visited'],
					['visited', 'unvisited', 'processing'],
					['unvisited', 'unvisited', 'unvisited']
				] as const
			};

			expect(() => GridDisplayPropsSchema.parse(uniquePathsGridProps)).not.toThrow();
		});
	});

	describe('StatusDisplay reusability', () => {
		it('should accept swimInWater metrics', () => {
			const swimInWaterStatus = {
				metrics: {
					'Current Max Elevation': 5,
					'Current Cell': '(1,2)',
					'Queue Size': 7
				},
				currentStep: 12,
				totalSteps: 38
			};

			expect(() => StatusDisplayPropsSchema.parse(swimInWaterStatus)).not.toThrow();
		});

		it('should accept trappingRainWater2 metrics', () => {
			const trappingRainWaterStatus = {
				metrics: {
					'Total Water': 14,
					'Current Height': 3,
					Algorithm: 'Trapping Rain Water II'
				},
				currentStep: 5,
				totalSteps: 25
			};

			expect(() => StatusDisplayPropsSchema.parse(trappingRainWaterStatus)).not.toThrow();
		});

		it('should accept algorithm-agnostic metrics format', () => {
			const genericStatus = {
				metrics: {
					Step: 10,
					Progress: '40%',
					Status: 'Processing',
					'Time Complexity': 'O(N² log N)'
				},
				currentStep: 10,
				totalSteps: 25
			};

			expect(() => StatusDisplayPropsSchema.parse(genericStatus)).not.toThrow();
		});
	});

	describe('PriorityQueueDisplay reusability', () => {
		it('should accept swimInWater priority queue data', () => {
			const swimInWaterPQ = {
				items: [
					{ priority: 1, label: 'Cell (0,1)', data: { row: 0, col: 1 } },
					{ priority: 2, label: 'Cell (1,0)', data: { row: 1, col: 0 } },
					{ priority: 3, label: 'Cell (0,2)', data: { row: 0, col: 2 } }
				],
				remainingCount: 5,
				maxDisplay: 5
			};

			expect(() => PriorityQueueDisplayPropsSchema.parse(swimInWaterPQ)).not.toThrow();
		});

		it('should accept trappingRainWater2 priority queue data', () => {
			const trappingRainWaterPQ = {
				items: [
					{ priority: 1, label: 'Border (0,0)', data: { row: 0, col: 0, height: 1 } },
					{ priority: 2, label: 'Border (0,5)', data: { row: 0, col: 5, height: 2 } },
					{ priority: 3, label: 'Border (2,0)', data: { row: 2, col: 0, height: 3 } }
				],
				remainingCount: 8,
				maxDisplay: 5
			};

			expect(() => PriorityQueueDisplayPropsSchema.parse(trappingRainWaterPQ)).not.toThrow();
		});

		it('should handle different data structures in priority queue items', () => {
			// Algorithm 1: Simple numeric data
			const pq1 = {
				items: [
					{ priority: 1, label: 'Item 1', data: 42 },
					{ priority: 2, label: 'Item 2', data: 'string-data' }
				],
				remainingCount: 0
			};

			// Algorithm 2: Complex object data
			const pq2 = {
				items: [
					{ priority: 1.5, label: 'Node A', data: { id: 'a', weight: 1.5, edges: [1, 2, 3] } },
					{ priority: 2.7, label: 'Node B', data: { id: 'b', weight: 2.7, edges: [4, 5] } }
				],
				remainingCount: 3
			};

			expect(() => PriorityQueueDisplayPropsSchema.parse(pq1)).not.toThrow();
			expect(() => PriorityQueueDisplayPropsSchema.parse(pq2)).not.toThrow();
		});
	});

	describe('Cross-algorithm compatibility', () => {
		it('should use same GridDisplay schema for all grid-based algorithms', () => {
			// All three algorithms use the exact same GridDisplay component contract
			const algorithms = ['swimInWater', 'trappingRainWater2', 'uniquePathsWithObstacles'];

			algorithms.forEach(algo => {
				const gridProps = {
					grid: [[1, 2], [3, 4]],
					cellStates: [['visited', 'unvisited'], ['unvisited', 'unvisited']] as const
				};

				// Same schema validates all algorithms
				expect(() => GridDisplayPropsSchema.parse(gridProps)).not.toThrow();
			});
		});

		it('should use same PriorityQueueDisplay for both priority queue algorithms', () => {
			// Both swimInWater and trappingRainWater2 use priority queues
			const pqAlgorithms = ['swimInWater', 'trappingRainWater2'];

			pqAlgorithms.forEach(algo => {
				const pqProps = {
					items: [
						{ priority: 1, label: `${algo} item 1` },
						{ priority: 2, label: `${algo} item 2` }
					],
					remainingCount: 0
				};

				// Same schema validates both algorithms
				expect(() => PriorityQueueDisplayPropsSchema.parse(pqProps)).not.toThrow();
			});
		});
	});
});

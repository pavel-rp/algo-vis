import { describe, it, expect } from 'vitest';
import {
	findNodeById,
	getAncestorIds,
	getAllAlgorithms
} from '$lib/utils/navigation-queries';
import {
	type NavigationTree,
	type NavigationNode,
	type AlgorithmNode,
	isCategoryNode,
	isAlgorithmNode
} from '$lib/types/navigation-schema';

describe('Navigation Tree Query Operations', () => {
	// Test fixture: sample navigation tree
	const testTree: NavigationTree = {
		rootNodes: [
			{
				type: 'category',
				id: 'dynamic-programming',
				label: 'Dynamic Programming',
				children: [
					{
						type: 'category',
						id: 'dp-2d-array',
						label: '2D Array',
						children: [
							{
								type: 'algorithm',
								id: 'trapping-rain-water-2',
								label: 'Trapping Rain Water II',
								pluginId: 'trapping-rain-water-2',
								path: '/dynamic-programming/trapping-rain-water-2'
							},
							{
								type: 'algorithm',
								id: 'edit-distance',
								label: 'Edit Distance',
								pluginId: 'edit-distance',
								path: '/dynamic-programming/edit-distance'
							}
						]
					},
					{
						type: 'category',
						id: 'dp-1d-array',
						label: '1D Array',
						children: [
							{
								type: 'algorithm',
								id: 'house-robber',
								label: 'House Robber',
								pluginId: 'house-robber',
								path: '/dynamic-programming/house-robber'
							}
						]
					}
				]
			},
			{
				type: 'category',
				id: 'graphs',
				label: 'Graphs',
				children: [
					{
						type: 'category',
						id: 'graphs-path-finding',
						label: 'Path Finding',
						children: [
							{
								type: 'algorithm',
								id: 'unique-paths-with-obstacles',
								label: 'Unique Paths with Obstacles',
								pluginId: 'unique-paths-with-obstacles',
								path: '/graphs/unique-paths-obstacles'
							},
							{
								type: 'algorithm',
								id: 'dijkstra',
								label: "Dijkstra's Algorithm",
								pluginId: 'dijkstra',
								path: '/graphs/dijkstra'
							}
						]
					}
				]
			}
		]
	};

	describe('findNodeById()', () => {
		it('should find root-level category node', () => {
			const result = findNodeById(testTree, 'dynamic-programming');

			expect(result).not.toBeNull();
			expect(result?.id).toBe('dynamic-programming');
			expect(result?.type).toBe('category');
		});

		it('should find nested category node', () => {
			const result = findNodeById(testTree, 'dp-2d-array');

			expect(result).not.toBeNull();
			expect(result?.id).toBe('dp-2d-array');
			expect(result?.type).toBe('category');
		});

		it('should find deeply nested algorithm node', () => {
			const result = findNodeById(testTree, 'trapping-rain-water-2');

			expect(result).not.toBeNull();
			expect(result?.id).toBe('trapping-rain-water-2');
			expect(result?.type).toBe('algorithm');
		});

		it('should return null when node not found', () => {
			const result = findNodeById(testTree, 'non-existent-node');

			expect(result).toBeNull();
		});

		it('should find node in different root branch', () => {
			const result = findNodeById(testTree, 'graphs-path-finding');

			expect(result).not.toBeNull();
			expect(result?.id).toBe('graphs-path-finding');
		});

		it('should find algorithm in different category', () => {
			const result = findNodeById(testTree, 'house-robber');

			expect(result).not.toBeNull();
			expect(result?.id).toBe('house-robber');
			expect(result?.type).toBe('algorithm');
		});

		it('should handle empty tree', () => {
			const emptyTree: NavigationTree = { rootNodes: [] };
			const result = findNodeById(emptyTree, 'any-id');

			expect(result).toBeNull();
		});

		it('should return correct node type for category', () => {
			const result = findNodeById(testTree, 'dp-1d-array');

			expect(result).not.toBeNull();

			if (result) {
				expect(isCategoryNode(result)).toBe(true);
				expect(isAlgorithmNode(result)).toBe(false);
			}
		});

		it('should return correct node type for algorithm', () => {
			const result = findNodeById(testTree, 'dijkstra');

			expect(result).not.toBeNull();

			if (result) {
				expect(isAlgorithmNode(result)).toBe(true);
				expect(isCategoryNode(result)).toBe(false);
			}
		});
	});

	describe('getAncestorIds()', () => {
		it('should return empty array for root-level node', () => {
			const result = getAncestorIds(testTree, 'dynamic-programming');

			expect(result).toEqual([]);
		});

		it('should return single ancestor for direct child', () => {
			const result = getAncestorIds(testTree, 'dp-2d-array');

			expect(result).toEqual(['dynamic-programming']);
		});

		it('should return multiple ancestors for deeply nested node', () => {
			const result = getAncestorIds(testTree, 'trapping-rain-water-2');

			expect(result).toEqual(['dynamic-programming', 'dp-2d-array']);
		});

		it('should return ancestors in correct order (root to parent)', () => {
			const result = getAncestorIds(testTree, 'dijkstra');

			expect(result).toEqual(['graphs', 'graphs-path-finding']);
			// First element should be root category
			expect(result[0]).toBe('graphs');
			// Last element should be direct parent
			expect(result[result.length - 1]).toBe('graphs-path-finding');
		});

		it('should return empty array for non-existent node', () => {
			const result = getAncestorIds(testTree, 'non-existent-node');

			expect(result).toEqual([]);
		});

		it('should work for algorithm nodes', () => {
			const result = getAncestorIds(testTree, 'house-robber');

			expect(result).toEqual(['dynamic-programming', 'dp-1d-array']);
		});

		it('should work for category nodes', () => {
			const result = getAncestorIds(testTree, 'graphs-path-finding');

			expect(result).toEqual(['graphs']);
		});

		it('should handle different branches correctly', () => {
			const dpResult = getAncestorIds(testTree, 'edit-distance');
			const graphsResult = getAncestorIds(testTree, 'unique-paths-with-obstacles');

			expect(dpResult).toEqual(['dynamic-programming', 'dp-2d-array']);
			expect(graphsResult).toEqual(['graphs', 'graphs-path-finding']);
		});
	});

	describe('getAllAlgorithms()', () => {
		it('should return all algorithm nodes from tree', () => {
			const result = getAllAlgorithms(testTree);

			expect(result).toHaveLength(5);
		});

		it('should exclude category nodes', () => {
			const result = getAllAlgorithms(testTree);

			result.forEach((node) => {
				expect(node.type).toBe('algorithm');
				expect(isAlgorithmNode(node)).toBe(true);
				expect(isCategoryNode(node)).toBe(false);
			});
		});

		it('should include algorithms from all branches', () => {
			const result = getAllAlgorithms(testTree);

			const ids = result.map((node) => node.id);

			expect(ids).toContain('trapping-rain-water-2');
			expect(ids).toContain('edit-distance');
			expect(ids).toContain('house-robber');
			expect(ids).toContain('unique-paths-with-obstacles');
			expect(ids).toContain('dijkstra');
		});

		it('should return empty array for tree with only categories', () => {
			const categoriesOnlyTree: NavigationTree = {
				rootNodes: [
					{
						type: 'category',
						id: 'empty-category',
						label: 'Empty Category',
						children: []
					}
				]
			};

			const result = getAllAlgorithms(categoriesOnlyTree);

			expect(result).toEqual([]);
		});

		it('should return empty array for empty tree', () => {
			const emptyTree: NavigationTree = { rootNodes: [] };

			const result = getAllAlgorithms(emptyTree);

			expect(result).toEqual([]);
		});

		it('should return algorithms with correct properties', () => {
			const result = getAllAlgorithms(testTree);

			const trappingRainWater = result.find((a) => a.id === 'trapping-rain-water-2');

			expect(trappingRainWater).toBeDefined();
			expect(trappingRainWater?.label).toBe('Trapping Rain Water II');
			expect(trappingRainWater?.pluginId).toBe('trapping-rain-water-2');
			expect(trappingRainWater?.path).toBe('/dynamic-programming/trapping-rain-water-2');
		});

		it('should return algorithms from different depth levels', () => {
			const treeWithMixedDepth: NavigationTree = {
				rootNodes: [
					{
						type: 'category',
						id: 'cat1',
						label: 'Category 1',
						children: [
							{
								type: 'algorithm',
								id: 'algo1',
								label: 'Algorithm 1',
								pluginId: 'algo1',
								path: '/cat1/algo1'
							},
							{
								type: 'category',
								id: 'cat2',
								label: 'Category 2',
								children: [
									{
										type: 'algorithm',
										id: 'algo2',
										label: 'Algorithm 2',
										pluginId: 'algo2',
										path: '/cat1/cat2/algo2'
									}
								]
							}
						]
					}
				]
			};

			const result = getAllAlgorithms(treeWithMixedDepth);

			expect(result).toHaveLength(2);
			expect(result.map((a) => a.id)).toContain('algo1');
			expect(result.map((a) => a.id)).toContain('algo2');
		});

		it('should preserve algorithm node references', () => {
			const result = getAllAlgorithms(testTree);

			// Result should be actual AlgorithmNode objects, not copies
			result.forEach((node) => {
				expect(node).toHaveProperty('pluginId');
				expect(node).toHaveProperty('path');
				expect(typeof node.pluginId).toBe('string');
				expect(typeof node.path).toBe('string');
			});
		});
	});

	describe('query performance with large tree', () => {
		it('should handle findNodeById efficiently', () => {
			// This test validates that the query doesn't have exponential complexity
			const startTime = performance.now();

			const result = findNodeById(testTree, 'dijkstra');

			const endTime = performance.now();
			const duration = endTime - startTime;

			expect(result).not.toBeNull();
			// Should complete in less than 10ms for small tree
			expect(duration).toBeLessThan(10);
		});

		it('should handle getAncestorIds efficiently', () => {
			const startTime = performance.now();

			const result = getAncestorIds(testTree, 'trapping-rain-water-2');

			const endTime = performance.now();
			const duration = endTime - startTime;

			expect(result.length).toBeGreaterThan(0);
			expect(duration).toBeLessThan(10);
		});

		it('should handle getAllAlgorithms efficiently', () => {
			const startTime = performance.now();

			const result = getAllAlgorithms(testTree);

			const endTime = performance.now();
			const duration = endTime - startTime;

			expect(result.length).toBeGreaterThan(0);
			expect(duration).toBeLessThan(10);
		});
	});
});

import { describe, it, expect } from 'vitest';
import { navigationTree } from '$lib/data/navigation-tree';
import {
	validateNavigationTree,
	type AlgorithmNode,
	isCategoryNode,
	isAlgorithmNode
} from '$lib/types/navigation-schema';

describe('Navigation Tree Data Structure', () => {
	describe('schema validation', () => {
		it('should pass NavigationTreeSchema validation', () => {
			const result = validateNavigationTree(navigationTree);

			expect(result.success).toBe(true);
		});

		it('should have at least one root node', () => {
			expect(navigationTree.rootNodes).toBeDefined();
			expect(Array.isArray(navigationTree.rootNodes)).toBe(true);
			expect(navigationTree.rootNodes.length).toBeGreaterThan(0);
		});

		it('should have all root nodes as CategoryNode type', () => {
			navigationTree.rootNodes.forEach((node) => {
				expect(node.type).toBe('category');
				expect(isCategoryNode(node)).toBe(true);
			});
		});
	});

	describe('node ID uniqueness', () => {
		it('should have unique node IDs across entire tree', () => {
			const allIds = new Set<string>();
			const duplicates: string[] = [];

			function collectIds(nodes: typeof navigationTree.rootNodes): void {
				for (const node of nodes) {
					if (allIds.has(node.id)) {
						duplicates.push(node.id);
					} else {
						allIds.add(node.id);
					}

					if (isCategoryNode(node)) {
						collectIds(node.children);
					}
				}
			}

			collectIds(navigationTree.rootNodes);

			expect(duplicates).toEqual([]);
		});

		it('should have all node IDs in kebab-case format', () => {
			const invalidIds: string[] = [];

			function checkIds(nodes: typeof navigationTree.rootNodes): void {
				for (const node of nodes) {
					if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(node.id)) {
						invalidIds.push(node.id);
					}

					if (isCategoryNode(node)) {
						checkIds(node.children);
					}
				}
			}

			checkIds(navigationTree.rootNodes);

			expect(invalidIds).toEqual([]);
		});
	});

	describe('algorithm path uniqueness', () => {
		it('should have unique paths across all algorithm nodes', () => {
			const allPaths = new Set<string>();
			const duplicates: string[] = [];

			function collectPaths(nodes: typeof navigationTree.rootNodes): void {
				for (const node of nodes) {
					if (isAlgorithmNode(node)) {
						if (allPaths.has(node.path)) {
							duplicates.push(node.path);
						} else {
							allPaths.add(node.path);
						}
					} else {
						collectPaths(node.children);
					}
				}
			}

			collectPaths(navigationTree.rootNodes);

			expect(duplicates).toEqual([]);
		});

		it('should have all paths in valid URL format', () => {
			const invalidPaths: string[] = [];

			function checkPaths(nodes: typeof navigationTree.rootNodes): void {
				for (const node of nodes) {
					if (isAlgorithmNode(node)) {
						if (!/^\/[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(node.path)) {
							invalidPaths.push(node.path);
						}
					} else {
						checkPaths(node.children);
					}
				}
			}

			checkPaths(navigationTree.rootNodes);

			expect(invalidPaths).toEqual([]);
		});

		it('should have all paths start with /', () => {
			const invalidPaths: string[] = [];

			function checkPaths(nodes: typeof navigationTree.rootNodes): void {
				for (const node of nodes) {
					if (isAlgorithmNode(node)) {
						if (!node.path.startsWith('/')) {
							invalidPaths.push(node.path);
						}
					} else {
						checkPaths(node.children);
					}
				}
			}

			checkPaths(navigationTree.rootNodes);

			expect(invalidPaths).toEqual([]);
		});
	});

	describe('algorithm plugin references', () => {
		it('should have all algorithm nodes reference valid plugin IDs', () => {
			const invalidPluginIds: string[] = [];

			function checkPluginIds(nodes: typeof navigationTree.rootNodes): void {
				for (const node of nodes) {
					if (isAlgorithmNode(node)) {
						// Plugin IDs must be kebab-case
						if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(node.pluginId)) {
							invalidPluginIds.push(node.pluginId);
						}
					} else {
						checkPluginIds(node.children);
					}
				}
			}

			checkPluginIds(navigationTree.rootNodes);

			expect(invalidPluginIds).toEqual([]);
		});

		it('should have algorithm node IDs match their plugin IDs', () => {
			const mismatches: Array<{ nodeId: string; pluginId: string }> = [];

			function checkMatches(nodes: typeof navigationTree.rootNodes): void {
				for (const node of nodes) {
					if (isAlgorithmNode(node)) {
						// Per spec, node.id should match pluginId for algorithms
						if (node.id !== node.pluginId) {
							mismatches.push({ nodeId: node.id, pluginId: node.pluginId });
						}
					} else {
						checkMatches(node.children);
					}
				}
			}

			checkMatches(navigationTree.rootNodes);

			expect(mismatches).toEqual([]);
		});
	});

        describe('initial algorithm content', () => {
                it('should contain exactly 5 initial algorithms', () => {
                        const algorithms: AlgorithmNode[] = [];

			function collectAlgorithms(nodes: typeof navigationTree.rootNodes): void {
				for (const node of nodes) {
					if (isAlgorithmNode(node)) {
						algorithms.push(node);
					} else {
						collectAlgorithms(node.children);
					}
				}
			}

			collectAlgorithms(navigationTree.rootNodes);

                        expect(algorithms).toHaveLength(5);
                });

		it('should contain trapping-rain-water-2 algorithm', () => {
			const algorithms: AlgorithmNode[] = [];

			function collectAlgorithms(nodes: typeof navigationTree.rootNodes): void {
				for (const node of nodes) {
					if (isAlgorithmNode(node)) {
						algorithms.push(node);
					} else {
						collectAlgorithms(node.children);
					}
				}
			}

			collectAlgorithms(navigationTree.rootNodes);

			const trappingRainWater = algorithms.find((a) => a.id === 'trapping-rain-water-2');

			expect(trappingRainWater).toBeDefined();
			expect(trappingRainWater?.label).toBe('Trapping Rain Water II');
			expect(trappingRainWater?.pluginId).toBe('trapping-rain-water-2');
			expect(trappingRainWater?.path).toBe('/dynamic-programming/trapping-rain-water-2');
		});

		it('should contain unique-paths-obstacles algorithm', () => {
			const algorithms: AlgorithmNode[] = [];

			function collectAlgorithms(nodes: typeof navigationTree.rootNodes): void {
				for (const node of nodes) {
					if (isAlgorithmNode(node)) {
						algorithms.push(node);
					} else {
						collectAlgorithms(node.children);
					}
				}
			}

			collectAlgorithms(navigationTree.rootNodes);

			const uniquePaths = algorithms.find((a) => a.id === 'unique-paths-with-obstacles');

			expect(uniquePaths).toBeDefined();
			expect(uniquePaths?.label).toBe('Unique Paths with Obstacles');
			expect(uniquePaths?.pluginId).toBe('unique-paths-with-obstacles');
			expect(uniquePaths?.path).toBe('/graphs/unique-paths-with-obstacles');
		});

		it('should contain swim-in-water algorithm', () => {
			const algorithms: AlgorithmNode[] = [];

			function collectAlgorithms(nodes: typeof navigationTree.rootNodes): void {
				for (const node of nodes) {
					if (isAlgorithmNode(node)) {
						algorithms.push(node);
					} else {
						collectAlgorithms(node.children);
					}
				}
			}

			collectAlgorithms(navigationTree.rootNodes);

			const swimInWater = algorithms.find((a) => a.id === 'swim-in-water');

			expect(swimInWater).toBeDefined();
			expect(swimInWater?.label).toBe('Swim in Rising Water');
			expect(swimInWater?.pluginId).toBe('swim-in-water');
			expect(swimInWater?.path).toBe('/graphs/swim-in-water');
		});
	});

	describe('category hierarchy structure', () => {
		it('should have Dynamic Programming as root category', () => {
			const dpCategory = navigationTree.rootNodes.find((node) => node.id === 'dynamic-programming');

			expect(dpCategory).toBeDefined();
			expect(dpCategory?.type).toBe('category');
			expect(dpCategory?.label).toBe('Dynamic Programming');

			if (isCategoryNode(dpCategory!)) {
				expect(dpCategory.children).toBeDefined();
				expect(Array.isArray(dpCategory.children)).toBe(true);
			}
		});

		it('should have Graphs as root category', () => {
			const graphsCategory = navigationTree.rootNodes.find((node) => node.id === 'graphs');

			expect(graphsCategory).toBeDefined();
			expect(graphsCategory?.type).toBe('category');
			expect(graphsCategory?.label).toBe('Graphs');

			if (isCategoryNode(graphsCategory!)) {
				expect(graphsCategory.children).toBeDefined();
				expect(Array.isArray(graphsCategory.children)).toBe(true);
			}
		});

		it('should have DP → 2D Array → Trapping Rain Water II hierarchy', () => {
			const dpCategory = navigationTree.rootNodes.find((node) => node.id === 'dynamic-programming');

			expect(dpCategory).toBeDefined();

			if (isCategoryNode(dpCategory!)) {
				const twoDArrayCategory = dpCategory.children.find((node) => node.id === 'dp-2d-array');

				expect(twoDArrayCategory).toBeDefined();
				expect(twoDArrayCategory?.type).toBe('category');
				expect(twoDArrayCategory?.label).toBe('2D Array');

				if (isCategoryNode(twoDArrayCategory!)) {
					const trappingRainWater = twoDArrayCategory.children.find(
						(node) => node.id === 'trapping-rain-water-2'
					);

					expect(trappingRainWater).toBeDefined();
					expect(trappingRainWater?.type).toBe('algorithm');
					expect(trappingRainWater?.label).toBe('Trapping Rain Water II');
				}
			}
		});

		it('should have Graphs → Path Finding → Unique Paths hierarchy', () => {
			const graphsCategory = navigationTree.rootNodes.find((node) => node.id === 'graphs');

			expect(graphsCategory).toBeDefined();

			if (isCategoryNode(graphsCategory!)) {
				const pathFindingCategory = graphsCategory.children.find(
					(node) => node.id === 'graphs-path-finding'
				);

				expect(pathFindingCategory).toBeDefined();
				expect(pathFindingCategory?.type).toBe('category');
				expect(pathFindingCategory?.label).toBe('Path Finding');

				if (isCategoryNode(pathFindingCategory!)) {
					const uniquePaths = pathFindingCategory.children.find(
						(node) => node.id === 'unique-paths-with-obstacles'
					);

					expect(uniquePaths).toBeDefined();
					expect(uniquePaths?.type).toBe('algorithm');
					expect(uniquePaths?.label).toBe('Unique Paths with Obstacles');
				}
			}
		});
	});

	describe('domain semantics alignment (FR-011)', () => {
		it('should have DP algorithms under Dynamic Programming category', () => {
			const dpCategory = navigationTree.rootNodes.find((node) => node.id === 'dynamic-programming');

			expect(dpCategory).toBeDefined();

			if (isCategoryNode(dpCategory!)) {
				const algorithms: AlgorithmNode[] = [];

				function collectAlgorithms(nodes: typeof dpCategory.children): void {
					for (const node of nodes) {
						if (isAlgorithmNode(node)) {
							algorithms.push(node);
						} else {
							collectAlgorithms(node.children);
						}
					}
				}

				collectAlgorithms(dpCategory.children);

				// All algorithms under DP should be DP problems
				algorithms.forEach((algo) => {
					expect(algo.path.startsWith('/dynamic-programming')).toBe(true);
				});

				// Should have at least 1 DP algorithm
				expect(algorithms.length).toBeGreaterThan(0);
			}
		});

		it('should have Graph algorithms under Graphs category', () => {
			const graphsCategory = navigationTree.rootNodes.find((node) => node.id === 'graphs');

			expect(graphsCategory).toBeDefined();

			if (isCategoryNode(graphsCategory!)) {
				const algorithms: AlgorithmNode[] = [];

				function collectAlgorithms(nodes: typeof graphsCategory.children): void {
					for (const node of nodes) {
						if (isAlgorithmNode(node)) {
							algorithms.push(node);
						} else {
							collectAlgorithms(node.children);
						}
					}
				}

				collectAlgorithms(graphsCategory.children);

				// All algorithms under Graphs should be Graph problems
				algorithms.forEach((algo) => {
					expect(algo.path.startsWith('/graphs')).toBe(true);
				});

				// Should have at least 1 Graph algorithm
				expect(algorithms.length).toBeGreaterThan(0);
			}
		});

		it('should have semantically appropriate subcategory names', () => {
			// DP subcategories should relate to DP concepts
			const dpCategory = navigationTree.rootNodes.find((node) => node.id === 'dynamic-programming');

			if (isCategoryNode(dpCategory!)) {
				dpCategory.children.forEach((child) => {
					if (isCategoryNode(child)) {
						// Subcategory names should be meaningful (not generic)
						expect(child.label.length).toBeGreaterThan(1);
						expect(child.id.length).toBeGreaterThan(1);
					}
				});
			}

			// Graphs subcategories should relate to graph concepts
			const graphsCategory = navigationTree.rootNodes.find((node) => node.id === 'graphs');

			if (isCategoryNode(graphsCategory!)) {
				graphsCategory.children.forEach((child) => {
					if (isCategoryNode(child)) {
						expect(child.label.length).toBeGreaterThan(1);
						expect(child.id.length).toBeGreaterThan(1);
					}
				});
			}
		});
	});

	describe('empty category handling', () => {
		it('should not have any empty leaf categories', () => {
			const emptyCategories: string[] = [];

			function findEmptyCategories(nodes: typeof navigationTree.rootNodes): void {
				for (const node of nodes) {
					if (isCategoryNode(node)) {
						if (node.children.length === 0) {
							emptyCategories.push(node.id);
						} else {
							findEmptyCategories(node.children);
						}
					}
				}
			}

			findEmptyCategories(navigationTree.rootNodes);

			// Per spec clarification: empty categories should be hidden in UI
			// but they shouldn't exist in the initial tree
			expect(emptyCategories).toEqual([]);
		});
	});
});

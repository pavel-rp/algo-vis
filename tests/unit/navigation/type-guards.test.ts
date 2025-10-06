import { describe, it, expect } from 'vitest';
import {
	isCategoryNode,
	isAlgorithmNode,
	type CategoryNode,
	type AlgorithmNode,
	type NavigationNode
} from '$lib/types/navigation-schema';

describe('Navigation Type Guards', () => {
	describe('isCategoryNode', () => {
		it('should return true for valid CategoryNode', () => {
			const categoryNode: NavigationNode = {
				type: 'category',
				id: 'test-category',
				label: 'Test Category',
				children: []
			};

			expect(isCategoryNode(categoryNode)).toBe(true);
		});

		it('should return false for AlgorithmNode', () => {
			const algorithmNode: NavigationNode = {
				type: 'algorithm',
				id: 'test-algorithm',
				label: 'Test Algorithm',
				pluginId: 'test-plugin',
				path: '/test/algorithm'
			};

			expect(isCategoryNode(algorithmNode)).toBe(false);
		});

		it('should narrow type to CategoryNode when true', () => {
			const node: NavigationNode = {
				type: 'category',
				id: 'test',
				label: 'Test',
				children: [
					{
						type: 'algorithm',
						id: 'child',
						label: 'Child',
						pluginId: 'child-plugin',
						path: '/test/child'
					}
				]
			};

			if (isCategoryNode(node)) {
				// TypeScript should recognize node.children exists
				expect(node.children).toBeDefined();
				expect(Array.isArray(node.children)).toBe(true);
				// This should not cause TypeScript error
				const childCount = node.children.length;
				expect(childCount).toBe(1);
			} else {
				// Should not reach here
				expect(true).toBe(false);
			}
		});
	});

	describe('isAlgorithmNode', () => {
		it('should return true for valid AlgorithmNode', () => {
			const algorithmNode: NavigationNode = {
				type: 'algorithm',
				id: 'test-algorithm',
				label: 'Test Algorithm',
				pluginId: 'test-plugin',
				path: '/category/test-algorithm'
			};

			expect(isAlgorithmNode(algorithmNode)).toBe(true);
		});

		it('should return false for CategoryNode', () => {
			const categoryNode: NavigationNode = {
				type: 'category',
				id: 'test-category',
				label: 'Test Category',
				children: []
			};

			expect(isAlgorithmNode(categoryNode)).toBe(false);
		});

		it('should narrow type to AlgorithmNode when true', () => {
			const node: NavigationNode = {
				type: 'algorithm',
				id: 'dijkstra',
				label: "Dijkstra's Algorithm",
				pluginId: 'dijkstra-plugin',
				path: '/graphs/dijkstra'
			};

			if (isAlgorithmNode(node)) {
				// TypeScript should recognize node.pluginId and node.path exist
				expect(node.pluginId).toBe('dijkstra-plugin');
				expect(node.path).toBe('/graphs/dijkstra');
				// This should not cause TypeScript error
				const pluginRef = node.pluginId;
				expect(pluginRef).toBeDefined();
			} else {
				// Should not reach here
				expect(true).toBe(false);
			}
		});
	});

	describe('type guards are mutually exclusive', () => {
		it('should never be both category and algorithm', () => {
			const nodes: NavigationNode[] = [
				{
					type: 'category',
					id: 'cat1',
					label: 'Category 1',
					children: []
				},
				{
					type: 'algorithm',
					id: 'algo1',
					label: 'Algorithm 1',
					pluginId: 'plugin1',
					path: '/test/algo1'
				}
			];

			nodes.forEach((node) => {
				const isCategory = isCategoryNode(node);
				const isAlgorithm = isAlgorithmNode(node);

				// Exactly one should be true
				expect(isCategory !== isAlgorithm).toBe(true);

				// Never both true
				expect(isCategory && isAlgorithm).toBe(false);

				// Never both false (one must be true)
				expect(!isCategory && !isAlgorithm).toBe(false);
			});
		});
	});

	describe('type guard with nested structures', () => {
		it('should correctly identify category nodes with nested children', () => {
			const nestedCategory: NavigationNode = {
				type: 'category',
				id: 'graphs',
				label: 'Graphs',
				children: [
					{
						type: 'category',
						id: 'shortest-path',
						label: 'Shortest Path',
						children: [
							{
								type: 'algorithm',
								id: 'dijkstra',
								label: 'Dijkstra',
								pluginId: 'dijkstra',
								path: '/graphs/dijkstra'
							}
						]
					}
				]
			};

			expect(isCategoryNode(nestedCategory)).toBe(true);
			expect(isAlgorithmNode(nestedCategory)).toBe(false);

			if (isCategoryNode(nestedCategory)) {
				const firstChild = nestedCategory.children[0];
				expect(isCategoryNode(firstChild)).toBe(true);

				if (isCategoryNode(firstChild)) {
					const grandchild = firstChild.children[0];
					expect(isAlgorithmNode(grandchild)).toBe(true);
				}
			}
		});
	});
});

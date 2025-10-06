import { describe, it, expect } from 'vitest';
import {
	validateNavigationTree,
	NavigationNodeSchema,
	CategoryNodeSchema,
	AlgorithmNodeSchema,
	type NavigationTree
} from '$lib/types/navigation-schema';

describe('NavigationTreeSchema', () => {
	describe('valid navigation tree', () => {
		it('should pass validation for a well-formed tree', () => {
			const validTree: NavigationTree = {
				rootNodes: [
					{
						type: 'category',
						id: 'dynamic-programming',
						label: 'Dynamic Programming',
						children: [
							{
								type: 'algorithm',
								id: 'trapping-rain-water-2',
								label: 'Trapping Rain Water II',
								pluginId: 'trapping-rain-water-2',
								path: '/dynamic-programming/trapping-rain-water-2'
							}
						]
					}
				]
			};

			const result = validateNavigationTree(validTree);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(validTree);
			}
		});

		it('should pass validation for category with empty children array', () => {
			const validNode = {
				type: 'category',
				id: 'empty-category',
				label: 'Empty Category',
				children: []
			};

			const result = CategoryNodeSchema.safeParse(validNode);
			expect(result.success).toBe(true);
		});

		it('should pass validation for algorithm node with all required fields', () => {
			const validNode = {
				type: 'algorithm',
				id: 'test-algorithm',
				label: 'Test Algorithm',
				pluginId: 'test-plugin',
				path: '/category/test-algorithm'
			};

			const result = AlgorithmNodeSchema.safeParse(validNode);
			expect(result.success).toBe(true);
		});
	});

	describe('invalid node IDs', () => {
		it('should fail validation for non-kebab-case IDs (camelCase)', () => {
			const invalidTree = {
				rootNodes: [
					{
						type: 'category',
						id: 'dynamicProgramming', // camelCase not allowed
						label: 'Dynamic Programming',
						children: []
					}
				]
			};

			const result = validateNavigationTree(invalidTree);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors.some(e => e.includes('kebab-case'))).toBe(true);
			}
		});

		it('should fail validation for non-kebab-case IDs (spaces)', () => {
			const invalidTree = {
				rootNodes: [
					{
						type: 'category',
						id: 'dynamic programming', // spaces not allowed
						label: 'Dynamic Programming',
						children: []
					}
				]
			};

			const result = validateNavigationTree(invalidTree);
			expect(result.success).toBe(false);
		});

		it('should fail validation for non-kebab-case IDs (uppercase)', () => {
			const invalidTree = {
				rootNodes: [
					{
						type: 'category',
						id: 'Dynamic-Programming', // uppercase not allowed
						label: 'Dynamic Programming',
						children: []
					}
				]
			};

			const result = validateNavigationTree(invalidTree);
			expect(result.success).toBe(false);
		});
	});

	describe('duplicate node IDs', () => {
		it('should fail validation when duplicate IDs exist in tree', () => {
			const treeWithDuplicates = {
				rootNodes: [
					{
						type: 'category',
						id: 'graphs',
						label: 'Graphs',
						children: [
							{
								type: 'algorithm',
								id: 'duplicate-id',
								label: 'Algorithm 1',
								pluginId: 'algo-1',
								path: '/graphs/algo-1'
							}
						]
					},
					{
						type: 'category',
						id: 'dynamic-programming',
						label: 'Dynamic Programming',
						children: [
							{
								type: 'algorithm',
								id: 'duplicate-id', // Duplicate!
								label: 'Algorithm 2',
								pluginId: 'algo-2',
								path: '/dp/algo-2'
							}
						]
					}
				]
			};

			const result = validateNavigationTree(treeWithDuplicates);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors.some(e => e.includes('Duplicate node IDs'))).toBe(true);
			}
		});
	});

	describe('duplicate algorithm paths', () => {
		it('should fail validation when duplicate paths exist', () => {
			const treeWithDuplicatePaths = {
				rootNodes: [
					{
						type: 'category',
						id: 'graphs',
						label: 'Graphs',
						children: [
							{
								type: 'algorithm',
								id: 'algo-1',
								label: 'Algorithm 1',
								pluginId: 'plugin-1',
								path: '/graphs/algorithm' // Duplicate path
							},
							{
								type: 'algorithm',
								id: 'algo-2',
								label: 'Algorithm 2',
								pluginId: 'plugin-2',
								path: '/graphs/algorithm' // Duplicate path
							}
						]
					}
				]
			};

			const result = validateNavigationTree(treeWithDuplicatePaths);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors.some(e => e.includes('Duplicate paths'))).toBe(true);
			}
		});
	});

	describe('empty root nodes', () => {
		it('should fail validation for empty root nodes array', () => {
			const emptyTree = {
				rootNodes: []
			};

			const result = validateNavigationTree(emptyTree);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors.some(e => e.includes('at least one root node'))).toBe(true);
			}
		});
	});

	describe('NavigationNodeSchema discriminated union', () => {
		it('should correctly parse category nodes', () => {
			const categoryNode = {
				type: 'category',
				id: 'test-category',
				label: 'Test Category',
				children: []
			};

			const result = NavigationNodeSchema.safeParse(categoryNode);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.type).toBe('category');
			}
		});

		it('should correctly parse algorithm nodes', () => {
			const algorithmNode = {
				type: 'algorithm',
				id: 'test-algo',
				label: 'Test Algorithm',
				pluginId: 'test-plugin',
				path: '/category/test-algo'
			};

			const result = NavigationNodeSchema.safeParse(algorithmNode);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.type).toBe('algorithm');
			}
		});

		it('should fail for invalid type discriminator', () => {
			const invalidNode = {
				type: 'invalid',
				id: 'test',
				label: 'Test'
			};

			const result = NavigationNodeSchema.safeParse(invalidNode);
			expect(result.success).toBe(false);
		});
	});
});

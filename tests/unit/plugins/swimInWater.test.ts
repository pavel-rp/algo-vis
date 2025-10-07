/**
 * Contract Tests for swimInWater AlgorithmPlugin
 * Feature: 004-we-ll-implement
 * Task: T004
 *
 * Validates plugin conforms to AlgorithmPlugin interface with category/subcategory
 */

import { describe, it, expect } from 'vitest';
import { AlgorithmPluginSchema } from '../../../specs/004-we-ll-implement/contracts/AlgorithmPlugin.schema';

describe('swimInWater Plugin Contract Tests', () => {
	describe('Valid plugin structure', () => {
		it('should accept valid plugin with all required fields', () => {
			const validPlugin = {
				id: 'swim-in-water',
				name: 'Swim in Water',
				category: 'Graphs',
				subcategory: 'Priority Queue',
				description: 'Find minimum time to swim from top-left to bottom-right in a grid',
				generateTrace: (input: unknown) => ({
					steps: [
						{
							index: 0,
							state: {},
							description: 'Initial state'
						}
					],
					metadata: {}
				}),
				presets: [
					{
						name: 'Small 3x3',
						input: { grid: [[1, 2], [3, 4]] }
					}
				],
				visualize: (step: any) => ({ data: 'visualization' })
			};

			expect(() => AlgorithmPluginSchema.parse(validPlugin)).not.toThrow();
		});

		it('should accept plugin without optional subcategory', () => {
			const validPlugin = {
				id: 'test-algorithm',
				name: 'Test Algorithm',
				category: 'Test Category',
				// subcategory omitted
				description: 'Test description that is long enough',
				generateTrace: (input: unknown) => ({
					steps: [{ index: 0, state: {}, description: 'test' }],
					metadata: {}
				}),
				presets: [{ name: 'Test', input: {} }],
				visualize: (step: any) => ({})
			};

			expect(() => AlgorithmPluginSchema.parse(validPlugin)).not.toThrow();
		});

		it('should accept plugin with complex metadata', () => {
			const validPlugin = {
				id: 'complex-plugin',
				name: 'Complex Plugin',
				category: 'Advanced',
				description: 'Complex algorithm with detailed metadata',
				generateTrace: (input: unknown) => ({
					steps: [{ index: 0, state: {}, description: 'step' }],
					metadata: {
						complexity: 'O(N² log N)',
						spaceComplexity: 'O(N²)',
						customField: 'allowed'
					}
				}),
				presets: [{ name: 'Preset', input: {} }],
				visualize: (step: any) => ({})
			};

			expect(() => AlgorithmPluginSchema.parse(validPlugin)).not.toThrow();
		});
	});

	describe('Plugin ID validation', () => {
		it('should accept kebab-case plugin ID', () => {
			const validPlugin = {
				id: 'swim-in-water-algorithm',
				name: 'Test',
				category: 'Test',
				description: 'Test description',
				generateTrace: () => ({ steps: [{ index: 0, state: {}, description: 'test' }], metadata: {} }),
				presets: [{ name: 'Test', input: {} }],
				visualize: () => ({})
			};

			expect(() => AlgorithmPluginSchema.parse(validPlugin)).not.toThrow();
		});

		it('should reject plugin ID with uppercase letters', () => {
			const invalidPlugin = {
				id: 'swimInWater',
				name: 'Test',
				category: 'Test',
				description: 'Test description',
				generateTrace: () => ({ steps: [{ index: 0, state: {}, description: 'test' }], metadata: {} }),
				presets: [{ name: 'Test', input: {} }],
				visualize: () => ({})
			};

			expect(() => AlgorithmPluginSchema.parse(invalidPlugin)).toThrow('Plugin ID must be kebab-case');
		});

		it('should reject plugin ID with underscores', () => {
			const invalidPlugin = {
				id: 'swim_in_water',
				name: 'Test',
				category: 'Test',
				description: 'Test description',
				generateTrace: () => ({ steps: [{ index: 0, state: {}, description: 'test' }], metadata: {} }),
				presets: [{ name: 'Test', input: {} }],
				visualize: () => ({})
			};

			expect(() => AlgorithmPluginSchema.parse(invalidPlugin)).toThrow('Plugin ID must be kebab-case');
		});

		it('should reject empty plugin ID', () => {
			const invalidPlugin = {
				id: '',
				name: 'Test',
				category: 'Test',
				description: 'Test description',
				generateTrace: () => ({ steps: [{ index: 0, state: {}, description: 'test' }], metadata: {} }),
				presets: [{ name: 'Test', input: {} }],
				visualize: () => ({})
			};

			expect(() => AlgorithmPluginSchema.parse(invalidPlugin)).toThrow('Plugin ID cannot be empty');
		});
	});

	describe('Category validation (NEW fields)', () => {
		it('should require category field', () => {
			const invalidPlugin = {
				id: 'test',
				name: 'Test',
				// category missing
				description: 'Test description',
				generateTrace: () => ({ steps: [{ index: 0, state: {}, description: 'test' }], metadata: {} }),
				presets: [{ name: 'Test', input: {} }],
				visualize: () => ({})
			};

			expect(() => AlgorithmPluginSchema.parse(invalidPlugin)).toThrow();
		});

		it('should reject empty category string', () => {
			const invalidPlugin = {
				id: 'test',
				name: 'Test',
				category: '',
				description: 'Test description',
				generateTrace: () => ({ steps: [{ index: 0, state: {}, description: 'test' }], metadata: {} }),
				presets: [{ name: 'Test', input: {} }],
				visualize: () => ({})
			};

			expect(() => AlgorithmPluginSchema.parse(invalidPlugin)).toThrow('Category is required');
		});

		it('should accept valid category and subcategory', () => {
			const validPlugin = {
				id: 'test',
				name: 'Test',
				category: 'Graphs',
				subcategory: 'Priority Queue',
				description: 'Test description',
				generateTrace: () => ({ steps: [{ index: 0, state: {}, description: 'test' }], metadata: {} }),
				presets: [{ name: 'Test', input: {} }],
				visualize: () => ({})
			};

			expect(() => AlgorithmPluginSchema.parse(validPlugin)).not.toThrow();
		});
	});

	describe('Description validation', () => {
		it('should require description at least 10 characters', () => {
			const invalidPlugin = {
				id: 'test',
				name: 'Test',
				category: 'Test',
				description: 'Short',
				generateTrace: () => ({ steps: [{ index: 0, state: {}, description: 'test' }], metadata: {} }),
				presets: [{ name: 'Test', input: {} }],
				visualize: () => ({})
			};

			expect(() => AlgorithmPluginSchema.parse(invalidPlugin)).toThrow(
				'Description must be at least 10 characters'
			);
		});
	});

	describe('Preset validation', () => {
		it('should require at least one preset', () => {
			const invalidPlugin = {
				id: 'test',
				name: 'Test',
				category: 'Test',
				description: 'Test description',
				generateTrace: () => ({ steps: [{ index: 0, state: {}, description: 'test' }], metadata: {} }),
				presets: [],
				visualize: () => ({})
			};

			expect(() => AlgorithmPluginSchema.parse(invalidPlugin)).toThrow(
				'Plugin must have at least one preset example'
			);
		});

		it('should reject preset with empty name', () => {
			const invalidPlugin = {
				id: 'test',
				name: 'Test',
				category: 'Test',
				description: 'Test description',
				generateTrace: () => ({ steps: [{ index: 0, state: {}, description: 'test' }], metadata: {} }),
				presets: [{ name: '', input: {} }],
				visualize: () => ({})
			};

			expect(() => AlgorithmPluginSchema.parse(invalidPlugin)).toThrow('Preset name cannot be empty');
		});
	});

	describe('ExecutionTrace validation', () => {
		it('should require at least one step in trace', () => {
			const invalidPlugin = {
				id: 'test',
				name: 'Test',
				category: 'Test',
				description: 'Test description',
				generateTrace: () => ({
					steps: [],
					metadata: {}
				}),
				presets: [{ name: 'Test', input: {} }],
				visualize: () => ({})
			};

			// This validation happens when generateTrace is called, not on plugin structure
			const plugin = AlgorithmPluginSchema.parse(invalidPlugin);
			expect(() => plugin.generateTrace({})).toThrow('Trace must have at least one step');
		});

		it('should require description in each step', () => {
			const invalidPlugin = {
				id: 'test',
				name: 'Test',
				category: 'Test',
				description: 'Test description',
				generateTrace: () => ({
					steps: [
						{
							index: 0,
							state: {},
							description: ''
						}
					],
					metadata: {}
				}),
				presets: [{ name: 'Test', input: {} }],
				visualize: () => ({})
			};

			const plugin = AlgorithmPluginSchema.parse(invalidPlugin);
			expect(() => plugin.generateTrace({})).toThrow('Description cannot be empty');
		});
	});
});

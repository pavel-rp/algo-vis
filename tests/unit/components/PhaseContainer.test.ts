/**
 * PhaseContainer Contract Tests
 *
 * Tests the multi-phase visualization container component contract.
 * These tests verify the Phase and RendererConfig type system works correctly.
 *
 * Constitutional Alignment: Principle II (Framework Reusability)
 * Visual Standards: specs/master/visual-encoding.md
 *
 * NOTE: These tests are EXPECTED TO FAIL until T011 (PhaseContainer implementation) is complete.
 */

import { describe, it, expect } from 'vitest';
import type { Phase, RendererConfig } from '$lib/types/phase';
import { PhaseSchema, RendererConfigSchema } from '$lib/types/phase-schemas';

describe('PhaseContainer Contract', () => {
	describe('Phase Type Validation', () => {
		it('should validate a valid phase with array renderer', () => {
			const phase: Phase = {
				id: 'min-max-search',
				label: 'Finding Min & Max',
				description: 'Traverse array to find minimum and maximum values',
				rendererConfigs: [
					{
						type: 'array',
						data: [2, 5, 6, 9, 10],
						highlight: {
							indices: [0],
							role: 'focus'
						},
						layout: {
							orientation: 'horizontal'
						}
					}
				]
			};

			const result = PhaseSchema.safeParse(phase);
			expect(result.success).toBe(true);
		});

		it('should reject phase with invalid ID (not kebab-case)', () => {
			const phase = {
				id: 'MinMaxSearch', // Invalid: must be kebab-case
				label: 'Finding Min & Max',
				rendererConfigs: [
					{
						type: 'array',
						data: [2, 5, 6, 9, 10]
					}
				]
			};

			const result = PhaseSchema.safeParse(phase);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toMatch(/kebab-case/);
			}
		});

		it('should reject phase with empty label', () => {
			const phase = {
				id: 'min-max-search',
				label: '',
				rendererConfigs: [
					{
						type: 'array',
						data: [2, 5, 6, 9, 10]
					}
				]
			};

			const result = PhaseSchema.safeParse(phase);
			expect(result.success).toBe(false);
		});

		it('should reject phase with no renderer configs', () => {
			const phase = {
				id: 'min-max-search',
				label: 'Finding Min & Max',
				rendererConfigs: []
			};

			const result = PhaseSchema.safeParse(phase);
			expect(result.success).toBe(false);
		});

		it('should accept phase without description (optional field)', () => {
			const phase: Phase = {
				id: 'gcd-computation',
				label: 'Computing GCD',
				rendererConfigs: [
					{
						type: 'scalarPair',
						data: { m: 10, n: 6 }
					}
				]
			};

			const result = PhaseSchema.safeParse(phase);
			expect(result.success).toBe(true);
		});
	});

	describe('RendererConfig Discriminated Union', () => {
		it('should validate array renderer config', () => {
			const config: RendererConfig = {
				type: 'array',
				data: [1, 2, 3, 4, 5],
				highlight: {
					indices: [0, 1],
					role: 'focus'
				}
			};

			const result = RendererConfigSchema.safeParse(config);
			expect(result.success).toBe(true);
		});

		it('should validate scalarPair renderer config', () => {
			const config: RendererConfig = {
				type: 'scalarPair',
				data: {
					m: 233,
					n: 144,
					operation: '233 % 144 = 89'
				},
				labels: {
					m: 'Maximum',
					n: 'Minimum'
				}
			};

			const result = RendererConfigSchema.safeParse(config);
			expect(result.success).toBe(true);
		});

		it('should validate status renderer config', () => {
			const config: RendererConfig = {
				type: 'status',
				data: {
					message: 'GCD found: 1',
					level: 'success'
				}
			};

			const result = RendererConfigSchema.safeParse(config);
			expect(result.success).toBe(true);
		});

		it('should reject unknown renderer type', () => {
			const config = {
				type: 'unknown',
				data: {}
			};

			const result = RendererConfigSchema.safeParse(config);
			expect(result.success).toBe(false);
		});
	});

	describe('ArrayRenderer Config Validation (FR-008 constraints)', () => {
		it('should accept valid array with values in range 1-10000', () => {
			const config: RendererConfig = {
				type: 'array',
				data: [1, 100, 5000, 10000]
			};

			const result = RendererConfigSchema.safeParse(config);
			expect(result.success).toBe(true);
		});

		it('should reject array with values below 1', () => {
			const config = {
				type: 'array',
				data: [0, 5, 10]
			};

			const result = RendererConfigSchema.safeParse(config);
			expect(result.success).toBe(false);
		});

		it('should reject array with values above 10000', () => {
			const config = {
				type: 'array',
				data: [1, 5, 10001]
			};

			const result = RendererConfigSchema.safeParse(config);
			expect(result.success).toBe(false);
		});

		it('should reject array with more than 1000 elements', () => {
			const config = {
				type: 'array',
				data: new Array(1001).fill(1)
			};

			const result = RendererConfigSchema.safeParse(config);
			expect(result.success).toBe(false);
		});

		it('should reject empty array', () => {
			const config = {
				type: 'array',
				data: []
			};

			const result = RendererConfigSchema.safeParse(config);
			expect(result.success).toBe(false);
		});

		it('should validate highlight roles from visual-encoding.md', () => {
			const validRoles: Array<'focus' | 'min' | 'max' | 'result'> = [
				'focus',
				'min',
				'max',
				'result'
			];

			validRoles.forEach((role) => {
				const config: RendererConfig = {
					type: 'array',
					data: [1, 2, 3],
					highlight: {
						indices: [0],
						role
					}
				};

				const result = RendererConfigSchema.safeParse(config);
				expect(result.success).toBe(true);
			});
		});

		it('should reject invalid highlight role', () => {
			const config = {
				type: 'array',
				data: [1, 2, 3],
				highlight: {
					indices: [0],
					role: 'invalid'
				}
			};

			const result = RendererConfigSchema.safeParse(config);
			expect(result.success).toBe(false);
		});
	});

	describe('ScalarPairRenderer Config Validation', () => {
		it('should validate Euclidean algorithm step format', () => {
			const config: RendererConfig = {
				type: 'scalarPair',
				data: {
					m: 377,
					n: 233,
					operation: '377 % 233 = 144'
				}
			};

			const result = RendererConfigSchema.safeParse(config);
			expect(result.success).toBe(true);
		});

		it('should reject invalid operation format', () => {
			const config = {
				type: 'scalarPair',
				data: {
					m: 377,
					n: 233,
					operation: 'invalid format'
				}
			};

			const result = RendererConfigSchema.safeParse(config);
			expect(result.success).toBe(false);
		});

		it('should accept config without operation (optional)', () => {
			const config: RendererConfig = {
				type: 'scalarPair',
				data: {
					m: 10,
					n: 5
				}
			};

			const result = RendererConfigSchema.safeParse(config);
			expect(result.success).toBe(true);
		});

		it('should reject negative values', () => {
			const config = {
				type: 'scalarPair',
				data: {
					m: -10,
					n: 5
				}
			};

			const result = RendererConfigSchema.safeParse(config);
			expect(result.success).toBe(false);
		});

		it('should validate custom labels', () => {
			const config: RendererConfig = {
				type: 'scalarPair',
				data: {
					m: 10,
					n: 5
				},
				labels: {
					m: 'Max',
					n: 'Min'
				}
			};

			const result = RendererConfigSchema.safeParse(config);
			expect(result.success).toBe(true);
		});

		it('should reject labels exceeding 20 characters', () => {
			const config = {
				type: 'scalarPair',
				data: {
					m: 10,
					n: 5
				},
				labels: {
					m: 'This label is way too long for display',
					n: 'Min'
				}
			};

			const result = RendererConfigSchema.safeParse(config);
			expect(result.success).toBe(false);
		});
	});

	describe('Multi-Renderer Phase Configuration', () => {
		it('should validate phase with multiple renderer configs', () => {
			const phase: Phase = {
				id: 'gcd-computation',
				label: 'Computing GCD',
				description: 'Euclidean algorithm with Fibonacci numbers',
				rendererConfigs: [
					{
						type: 'scalarPair',
						data: { m: 233, n: 144, operation: '233 % 144 = 89' },
						labels: { m: 'M', n: 'N' }
					},
					{
						type: 'status',
						data: {
							message: 'Swapping values: M becomes N, N becomes remainder',
							level: 'info'
						}
					}
				]
			};

			const result = PhaseSchema.safeParse(phase);
			expect(result.success).toBe(true);
		});

		it('should validate phase with array + status renderers (min/max search)', () => {
			const phase: Phase = {
				id: 'min-max-search',
				label: 'Finding Min & Max',
				rendererConfigs: [
					{
						type: 'array',
						data: [2, 5, 6, 9, 10],
						highlight: {
							indices: [1, 3],
							role: 'min'
						}
					},
					{
						type: 'status',
						data: {
							message: 'Current min: 2, Current max: 9',
							level: 'info'
						}
					}
				]
			};

			const result = PhaseSchema.safeParse(phase);
			expect(result.success).toBe(true);
		});
	});
});

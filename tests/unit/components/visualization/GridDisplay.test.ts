/**
 * Contract Tests for GridDisplay Component
 * Feature: 004-we-ll-implement (Swim in Water)
 * Task: T001
 *
 * Tests GridDisplayPropsSchema validation against valid/invalid props
 */

import { describe, it, expect } from 'vitest';
import {
	GridDisplayPropsSchema,
	type GridDisplayProps
} from '../../../../specs/004-we-ll-implement/contracts/SharedComponents.schema';

describe('GridDisplay Contract Tests', () => {
	describe('Valid props', () => {
		it('should accept valid 3×3 grid with matching cellStates', () => {
			const validProps: GridDisplayProps = {
				grid: [
					[0, 2, 1],
					[3, 1, 4],
					[7, 5, 6]
				],
				cellStates: [
					['visited', 'unvisited', 'unvisited'],
					['processing', 'unvisited', 'unvisited'],
					['unvisited', 'unvisited', 'unvisited']
				]
			};

			expect(() => GridDisplayPropsSchema.parse(validProps)).not.toThrow();
		});

		it('should accept grid with highlightedCells', () => {
			const validProps: GridDisplayProps = {
				grid: [[1, 2], [3, 4]],
				cellStates: [['visited', 'unvisited'], ['unvisited', 'unvisited']],
				highlightedCells: [{ row: 0, col: 1 }, { row: 1, col: 0 }]
			};

			expect(() => GridDisplayPropsSchema.parse(validProps)).not.toThrow();
		});

		it('should accept grid with onCellClick handler', () => {
			const validProps: GridDisplayProps = {
				grid: [[1]],
				cellStates: [['visited']],
				onCellClick: (row: number, col: number) => {
					console.log(`Clicked ${row},${col}`);
				}
			};

			expect(() => GridDisplayPropsSchema.parse(validProps)).not.toThrow();
		});

		it('should accept minimum 1×1 grid', () => {
			const validProps: GridDisplayProps = {
				grid: [[5]],
				cellStates: [['visited']]
			};

			expect(() => GridDisplayPropsSchema.parse(validProps)).not.toThrow();
		});

		it('should accept maximum 50×50 grid', () => {
			const grid = Array.from({ length: 50 }, () => Array(50).fill(0));
			const cellStates = Array.from({ length: 50 }, () =>
				Array(50).fill('unvisited' as const)
			);

			const validProps: GridDisplayProps = {
				grid,
				cellStates
			};

			expect(() => GridDisplayPropsSchema.parse(validProps)).not.toThrow();
		});
	});

	describe('Invalid props - grid validation', () => {
		it('should reject empty grid', () => {
			const invalidProps = {
				grid: [],
				cellStates: []
			};

			expect(() => GridDisplayPropsSchema.parse(invalidProps)).toThrow('Grid cannot be empty');
		});

		it('should reject grid exceeding 50×50', () => {
			const grid = Array.from({ length: 51 }, () => Array(51).fill(0));
			const cellStates = Array.from({ length: 51 }, () =>
				Array(51).fill('unvisited' as const)
			);

			const invalidProps = {
				grid,
				cellStates
			};

			expect(() => GridDisplayPropsSchema.parse(invalidProps)).toThrow(
				'Grid exceeds maximum size of 50×50'
			);
		});

		it('should reject non-square grid', () => {
			const invalidProps = {
				grid: [[1, 2, 3], [4, 5]], // 3x2 not square
				cellStates: [
					['visited', 'unvisited', 'unvisited'],
					['unvisited', 'unvisited']
				]
			};

			expect(() => GridDisplayPropsSchema.parse(invalidProps)).toThrow(
				'Grid must be square (N×N)'
			);
		});
	});

	describe('Invalid props - cellStates validation', () => {
		it('should reject cellStates with mismatched dimensions', () => {
			const invalidProps = {
				grid: [[1, 2], [3, 4]],
				cellStates: [['visited', 'unvisited']] // Only 1 row instead of 2
			};

			expect(() => GridDisplayPropsSchema.parse(invalidProps)).toThrow(
				'cellStates dimensions must match grid dimensions'
			);
		});

		it('should reject cellStates with wrong row length', () => {
			const invalidProps = {
				grid: [[1, 2], [3, 4]],
				cellStates: [
					['visited', 'unvisited'],
					['visited'] // Row 2 has only 1 column instead of 2
				]
			};

			expect(() => GridDisplayPropsSchema.parse(invalidProps)).toThrow(
				'cellStates dimensions must match grid dimensions'
			);
		});

		it('should reject invalid cell state values', () => {
			const invalidProps = {
				grid: [[1]],
				cellStates: [['invalid-state' as any]]
			};

			expect(() => GridDisplayPropsSchema.parse(invalidProps)).toThrow();
		});
	});

	describe('highlightedCells validation', () => {
		it('should reject highlightedCells with negative coordinates', () => {
			const invalidProps = {
				grid: [[1, 2], [3, 4]],
				cellStates: [['visited', 'unvisited'], ['unvisited', 'unvisited']],
				highlightedCells: [{ row: -1, col: 0 }]
			};

			expect(() => GridDisplayPropsSchema.parse(invalidProps)).toThrow();
		});

		it('should reject highlightedCells with non-integer coordinates', () => {
			const invalidProps = {
				grid: [[1, 2], [3, 4]],
				cellStates: [['visited', 'unvisited'], ['unvisited', 'unvisited']],
				highlightedCells: [{ row: 0.5, col: 1 }]
			};

			expect(() => GridDisplayPropsSchema.parse(invalidProps)).toThrow();
		});
	});
});

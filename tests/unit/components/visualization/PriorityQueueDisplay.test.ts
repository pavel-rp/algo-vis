/**
 * Contract Tests for PriorityQueueDisplay Component
 * Feature: 004-we-ll-implement (Swim in Water)
 * Task: T003
 *
 * Tests PriorityQueueDisplayPropsSchema validation against valid/invalid props
 */

import { describe, it, expect } from 'vitest';
import {
	PriorityQueueDisplayPropsSchema,
	type PriorityQueueDisplayProps
} from '../../../../specs/004-we-ll-implement/contracts/SharedComponents.schema';

describe('PriorityQueueDisplay Contract Tests', () => {
	describe('Valid props', () => {
		it('should accept valid priority queue with sorted items', () => {
			const validProps: PriorityQueueDisplayProps = {
				items: [
					{ priority: 1, label: 'Cell (0,1)', data: { row: 0, col: 1 } },
					{ priority: 2, label: 'Cell (1,0)', data: { row: 1, col: 0 } },
					{ priority: 3, label: 'Cell (0,2)', data: { row: 0, col: 2 } }
				],
				remainingCount: 7,
				maxDisplay: 5
			};

			expect(() => PriorityQueueDisplayPropsSchema.parse(validProps)).not.toThrow();
		});

		it('should accept empty queue', () => {
			const validProps: PriorityQueueDisplayProps = {
				items: [],
				remainingCount: 0
			};

			expect(() => PriorityQueueDisplayPropsSchema.parse(validProps)).not.toThrow();
		});

		it('should accept items without optional data field', () => {
			const validProps: PriorityQueueDisplayProps = {
				items: [
					{ priority: 1, label: 'Item 1' },
					{ priority: 2, label: 'Item 2' }
				],
				remainingCount: 0
			};

			expect(() => PriorityQueueDisplayPropsSchema.parse(validProps)).not.toThrow();
		});

		it('should accept default maxDisplay (5)', () => {
			const validProps = {
				items: [{ priority: 1, label: 'Test' }],
				remainingCount: 0
				// maxDisplay omitted, should default to 5
			};

			const parsed = PriorityQueueDisplayPropsSchema.parse(validProps);
			expect(parsed.maxDisplay).toBe(5);
		});

		it('should accept items with negative priority', () => {
			const validProps: PriorityQueueDisplayProps = {
				items: [
					{ priority: -5, label: 'Item A' },
					{ priority: -2, label: 'Item B' },
					{ priority: 0, label: 'Item C' }
				],
				remainingCount: 0
			};

			expect(() => PriorityQueueDisplayPropsSchema.parse(validProps)).not.toThrow();
		});

		it('should accept items with decimal priority', () => {
			const validProps: PriorityQueueDisplayProps = {
				items: [
					{ priority: 1.5, label: 'Item A' },
					{ priority: 2.7, label: 'Item B' },
					{ priority: 3.1, label: 'Item C' }
				],
				remainingCount: 0
			};

			expect(() => PriorityQueueDisplayPropsSchema.parse(validProps)).not.toThrow();
		});
	});

	describe('Invalid props - items validation', () => {
		it('should reject unsorted items (descending)', () => {
			const invalidProps = {
				items: [
					{ priority: 3, label: 'Item C' },
					{ priority: 2, label: 'Item B' },
					{ priority: 1, label: 'Item A' }
				],
				remainingCount: 0
			};

			expect(() => PriorityQueueDisplayPropsSchema.parse(invalidProps)).toThrow(
				'Items must be sorted by priority (ascending)'
			);
		});

		it('should reject items with out-of-order priority', () => {
			const invalidProps = {
				items: [
					{ priority: 1, label: 'Item A' },
					{ priority: 3, label: 'Item C' },
					{ priority: 2, label: 'Item B' } // Out of order
				],
				remainingCount: 0
			};

			expect(() => PriorityQueueDisplayPropsSchema.parse(invalidProps)).toThrow(
				'Items must be sorted by priority (ascending)'
			);
		});

		it('should reject items with empty label', () => {
			const invalidProps = {
				items: [{ priority: 1, label: '' }],
				remainingCount: 0
			};

			expect(() => PriorityQueueDisplayPropsSchema.parse(invalidProps)).toThrow(
				'Label cannot be empty'
			);
		});
	});

	describe('Invalid props - remainingCount validation', () => {
		it('should reject negative remainingCount', () => {
			const invalidProps = {
				items: [{ priority: 1, label: 'Test' }],
				remainingCount: -5
			};

			expect(() => PriorityQueueDisplayPropsSchema.parse(invalidProps)).toThrow();
		});

		it('should reject non-integer remainingCount', () => {
			const invalidProps = {
				items: [{ priority: 1, label: 'Test' }],
				remainingCount: 2.5
			};

			expect(() => PriorityQueueDisplayPropsSchema.parse(invalidProps)).toThrow();
		});
	});

	describe('Invalid props - maxDisplay validation', () => {
		it('should reject maxDisplay > 10', () => {
			const invalidProps = {
				items: [{ priority: 1, label: 'Test' }],
				remainingCount: 0,
				maxDisplay: 11
			};

			expect(() => PriorityQueueDisplayPropsSchema.parse(invalidProps)).toThrow(
				'maxDisplay should not exceed 10 for readability'
			);
		});

		it('should reject zero or negative maxDisplay', () => {
			const invalidProps = {
				items: [{ priority: 1, label: 'Test' }],
				remainingCount: 0,
				maxDisplay: 0
			};

			expect(() => PriorityQueueDisplayPropsSchema.parse(invalidProps)).toThrow();
		});
	});
});

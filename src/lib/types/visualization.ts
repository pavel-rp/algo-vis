/**
 * Shared Visualization Component Types
 * Feature: 004-we-ll-implement
 * Task: T009
 *
 * Type definitions and schemas for shared visualization components
 * Based on contracts from specs/004-we-ll-implement/contracts/SharedComponents.schema.ts
 */

import { z } from 'zod';

// ============================================================================
// GridDisplay Component
// ============================================================================

export const CellStateSchema = z.enum(['unvisited', 'processing', 'visited']);

export const CoordinateSchema = z.object({
	row: z.number().int().nonnegative(),
	col: z.number().int().nonnegative()
});

export const GridDisplayPropsSchema = z
	.object({
		grid: z
			.array(z.array(z.number()))
			.refine((grid) => grid.length > 0, 'Grid cannot be empty')
			.refine((grid) => grid.length <= 50, 'Grid exceeds maximum size of 50×50')
			.refine((grid) => grid.every((row) => row.length === grid.length), 'Grid must be square (N×N)'),

		cellStates: z.array(z.array(CellStateSchema)),

		highlightedCells: z.array(CoordinateSchema).optional(),

		onCellClick: z
			.function()
			.args(z.number(), z.number()) // (row, col)
			.returns(z.void())
			.optional()
	})
	.superRefine((data, ctx) => {
		// Cross-field validation: cellStates must match grid dimensions
		if (data.cellStates.length !== data.grid.length) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'cellStates dimensions must match grid dimensions',
				path: ['cellStates']
			});
		}
		for (let i = 0; i < data.cellStates.length; i++) {
			if (data.cellStates[i].length !== data.grid[i]?.length) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'cellStates dimensions must match grid dimensions',
					path: ['cellStates', i]
				});
			}
		}
	});

// ============================================================================
// StatusDisplay Component
// ============================================================================

export const StatusDisplayPropsSchema = z
	.object({
		metrics: z
			.record(z.string(), z.union([z.string(), z.number()]))
			.refine((m) => Object.keys(m).length > 0, 'Metrics cannot be empty'),

		currentStep: z.number().int().nonnegative(),

		totalSteps: z.number().int().positive()
	})
	.superRefine((data, ctx) => {
		// Cross-field validation: currentStep must be less than totalSteps
		if (data.currentStep >= data.totalSteps) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'currentStep must be less than totalSteps',
				path: ['currentStep']
			});
		}
	});

// ============================================================================
// PriorityQueueDisplay Component
// ============================================================================

export const QueueDisplayItemSchema = z.object({
	priority: z.number(), // Priority value (can be negative, float, etc.)

	label: z.string().min(1, 'Label cannot be empty'),

	data: z.unknown().optional() // Algorithm-specific data
});

export const PriorityQueueDisplayPropsSchema = z.object({
	items: z
		.array(QueueDisplayItemSchema)
		.refine(
			(items) => {
				// Verify items are sorted by priority (ascending - min-heap)
				for (let i = 1; i < items.length; i++) {
					if (items[i].priority < items[i - 1].priority) {
						return false;
					}
				}
				return true;
			},
			'Items must be sorted by priority (ascending)'
		),

	remainingCount: z.number().int().nonnegative(),

	maxDisplay: z
		.number()
		.int()
		.positive()
		.default(5)
		.refine((max) => max <= 10, 'maxDisplay should not exceed 10 for readability')
});

// ============================================================================
// Type Exports
// ============================================================================

export type CellState = z.infer<typeof CellStateSchema>;
export type Coordinate = z.infer<typeof CoordinateSchema>;
export type GridDisplayProps = z.infer<typeof GridDisplayPropsSchema>;
export type StatusDisplayProps = z.infer<typeof StatusDisplayPropsSchema>;
export type QueueDisplayItem = z.infer<typeof QueueDisplayItemSchema>;
export type PriorityQueueDisplayProps = z.infer<typeof PriorityQueueDisplayPropsSchema>;

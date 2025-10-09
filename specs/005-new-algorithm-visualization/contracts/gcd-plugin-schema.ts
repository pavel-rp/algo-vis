/**
 * GCD Algorithm Plugin Contract
 *
 * Input validation and trace format specification for the GCD Array algorithm.
 *
 * Constitutional Alignment:
 * - Principle I (Visualization-First): State includes all visualization data
 * - Principle III (Traceability): Immutable frames with complete history
 */

import { z } from 'zod';

/**
 * Input schema for GCD Array algorithm
 * Constraints per FR-008, FR-009
 */
export const GCDInputSchema = z.object({
	nums: z
		.array(z.number().int().min(1).max(10000), {
			required_error: 'Array is required',
			invalid_type_error: 'Array must contain numbers'
		})
		.min(1, 'Array must contain at least 1 element')
		.max(1000, 'Array cannot exceed 1000 elements')
});

export type GCDInput = z.infer<typeof GCDInputSchema>;

/**
 * State for min/max search phase
 */
export const ArrayVisualizationStateSchema = z.object({
	array: z.array(z.number().int().min(1).max(10000)).min(1).max(1000),
	focusIndex: z.number().int().nonnegative().optional(),
	minIndex: z.number().int().nonnegative().optional(),
	maxIndex: z.number().int().nonnegative().optional(),
	minValue: z.number().int().optional(),
	maxValue: z.number().int().optional()
});

export type ArrayVisualizationState = z.infer<typeof ArrayVisualizationStateSchema>;

/**
 * State for GCD computation phase
 */
export const ScalarPairStateSchema = z.object({
	m: z.number().int().nonnegative(),
	n: z.number().int().nonnegative(),
	operation: z.string().optional(),
	isComplete: z.boolean()
});

export type ScalarPairState = z.infer<typeof ScalarPairStateSchema>;

/**
 * Combined state (union of phase states)
 */
export const GCDStateSchema = z.union([ArrayVisualizationStateSchema, ScalarPairStateSchema]);

export type GCDState = z.infer<typeof GCDStateSchema>;

/**
 * Preset configuration schema
 */
export const GCDPresetSchema = z.object({
	name: z.string().min(3).max(50),
	description: z.string().min(10).max(200),
	input: GCDInputSchema,
	expectedGCD: z.number().int().positive()
});

export type GCDPreset = z.infer<typeof GCDPresetSchema>;

/**
 * Execution step with phase metadata
 */
export const GCDExecutionStepSchema = z.object({
	index: z.number().int().nonnegative(),
	phaseId: z.enum(['min-max-search', 'gcd-computation']),
	state: GCDStateSchema,
	description: z.string().min(1).max(500)
});

export type GCDExecutionStep = z.infer<typeof GCDExecutionStepSchema>;

/**
 * Complete trace schema
 */
export const GCDTraceSchema = z.object({
	steps: z.array(GCDExecutionStepSchema).min(1),
	metadata: z.object({
		algorithm: z.literal('find-gcd-array'),
		complexity: z.string(),
		input: GCDInputSchema
	})
});

export type GCDTrace = z.infer<typeof GCDTraceSchema>;

/**
 * Validation helper functions
 */
export function validateGCDInput(input: unknown): GCDInput {
	return GCDInputSchema.parse(input);
}

export function validateGCDTrace(trace: unknown): GCDTrace {
	return GCDTraceSchema.parse(trace);
}

/**
 * Type guards
 */
export function isArrayState(state: GCDState): state is ArrayVisualizationState {
	return 'array' in state;
}

export function isScalarPairState(state: GCDState): state is ScalarPairState {
	return 'm' in state && 'n' in state;
}

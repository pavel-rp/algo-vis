/**
 * Phase and Renderer Configuration Zod Schemas
 *
 * Runtime validation for multi-phase visualization configurations.
 * Catches plugin errors early and provides type-safe validation.
 *
 * Constitutional Alignment: Principle II (Framework Reusability)
 */

import { z } from 'zod';

/**
 * Schema for array renderer configuration
 *
 * Validates array visualization data and highlighting config.
 * Enforces: 1-1000 elements, values 1-10000 (per FR-008)
 */
export const ArrayRendererConfigSchema = z.object({
	type: z.literal('array'),
	data: z.array(z.number().int().min(1).max(10000)).min(1).max(1000),
	highlight: z
		.object({
			indices: z.array(z.number().int().nonnegative()),
			role: z.enum(['focus', 'min', 'max', 'result'])
		})
		.optional(),
	layout: z
		.object({
			orientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
			cellSize: z.number().positive().optional()
		})
		.optional()
});

/**
 * Schema for scalar pair renderer configuration
 *
 * Validates two-value display (e.g., Euclidean algorithm m, n).
 * Operation string must match pattern: "N % M = R"
 */
export const ScalarPairRendererConfigSchema = z.object({
	type: z.literal('scalarPair'),
	data: z.object({
		m: z.number().int().nonnegative(),
		n: z.number().int().nonnegative(),
		operation: z.string().regex(/^\d+ % \d+ = \d+$/).optional()
	}),
	labels: z
		.object({
			m: z.string().min(1).max(20),
			n: z.string().min(1).max(20)
		})
		.optional()
});

/**
 * Schema for status message renderer configuration
 *
 * Validates status/notification messages.
 */
export const StatusRendererConfigSchema = z.object({
	type: z.literal('status'),
	data: z.object({
		message: z.string().min(1).max(500),
		level: z.enum(['info', 'success', 'warning'])
	})
});

/**
 * Discriminated union schema for all renderer configurations
 *
 * Type-safe validation using Zod's discriminatedUnion.
 * Automatically narrows type based on 'type' field.
 */
export const RendererConfigSchema = z.discriminatedUnion('type', [
	ArrayRendererConfigSchema,
	ScalarPairRendererConfigSchema,
	StatusRendererConfigSchema
]);

/**
 * Schema for phase definition
 *
 * Validates:
 * - ID: lowercase kebab-case (e.g., 'min-max-search')
 * - Label: 1-50 characters
 * - Description: 10-200 characters (optional)
 * - At least 1 renderer configuration
 */
export const PhaseSchema = z.object({
	id: z.string().regex(/^[a-z][a-z0-9-]*$/, 'Phase ID must be lowercase kebab-case'),
	label: z.string().min(1).max(50),
	description: z.string().min(10).max(200).optional(),
	rendererConfigs: z.array(RendererConfigSchema).min(1)
});

/**
 * Type exports (inferred from schemas for type/schema alignment)
 */
export type ArrayRendererConfig = z.infer<typeof ArrayRendererConfigSchema>;
export type ScalarPairRendererConfig = z.infer<typeof ScalarPairRendererConfigSchema>;
export type StatusRendererConfig = z.infer<typeof StatusRendererConfigSchema>;
export type RendererConfig = z.infer<typeof RendererConfigSchema>;
export type Phase = z.infer<typeof PhaseSchema>;

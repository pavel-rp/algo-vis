/**
 * Renderer Configuration Zod Schemas
 *
 * Runtime validation for renderer configurations to catch plugin errors early.
 *
 * Constitutional Alignment: Principle II (Framework Reusability)
 */

import { z } from 'zod';

/**
 * Schema for array renderer configuration
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
 * Schema for status renderer configuration
 */
export const StatusRendererConfigSchema = z.object({
	type: z.literal('status'),
	data: z.object({
		message: z.string().min(1).max(500),
		level: z.enum(['info', 'success', 'warning'])
	})
});

/**
 * Union schema for all renderer configurations
 */
export const RendererConfigSchema = z.discriminatedUnion('type', [
	ArrayRendererConfigSchema,
	ScalarPairRendererConfigSchema,
	StatusRendererConfigSchema
]);

/**
 * Schema for phase definition
 */
export const PhaseSchema = z.object({
	id: z.string().regex(/^[a-z][a-z0-9-]*$/, 'Phase ID must be lowercase kebab-case'),
	label: z.string().min(1).max(50),
	description: z.string().min(10).max(200).optional(),
	rendererConfigs: z.array(RendererConfigSchema).min(1)
});

/**
 * Type exports (inferred from schemas)
 */
export type ArrayRendererConfig = z.infer<typeof ArrayRendererConfigSchema>;
export type ScalarPairRendererConfig = z.infer<typeof ScalarPairRendererConfigSchema>;
export type StatusRendererConfig = z.infer<typeof StatusRendererConfigSchema>;
export type RendererConfig = z.infer<typeof RendererConfigSchema>;
export type Phase = z.infer<typeof PhaseSchema>;

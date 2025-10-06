import { z } from 'zod';
import type { Frame, Trace, AlgorithmPlugin } from './plugin';

/** Zod schema for Frame validation */
export const FrameSchema = z.object({
	step: z.number().int().nonnegative(),
	state: z.any(),
	focus: z.array(z.object({
		type: z.enum(['grid-cell', 'array-index', 'tree-node', 'graph-node']),
		id: z.string(),
		style: z.record(z.any()).optional()
	})).optional(),
	neighbors: z.array(z.object({
		type: z.enum(['grid-cell', 'array-index', 'tree-node', 'graph-node']),
		id: z.string(),
		style: z.record(z.any()).optional()
	})).optional(),
	metrics: z.record(z.union([z.number(), z.string()])).optional(),
	description: z.string().min(1)
});

/** Zod schema for Trace validation */
export const TraceSchema = z.object({
	frames: z.array(FrameSchema).min(1),
	totalSteps: z.number().int().positive(),
	completed: z.boolean(),
	metadata: z.record(z.any()).optional()
});

/** Validate a trace object */
export function validateTrace(trace: unknown): Trace {
	return TraceSchema.parse(trace);
}

/** Validate frame sequence (steps must be sequential starting from 0) */
export function validateFrameSequence(frames: Frame[]): boolean {
	for (let i = 0; i < frames.length; i++) {
		if (frames[i].step !== i) {
			return false;
		}
	}
	return true;
}

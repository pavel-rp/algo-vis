import { z } from 'zod';
import type { Frame, Trace, HighlightRole } from './plugin';

const highlightRoles: HighlightRole[] = [
        'start',
        'goal',
        'current',
        'frontier',
        'queued',
        'visited',
        'path-active',
        'path-final',
        'obstacle',
        'weight-peek',
        'auxiliary'
];

const HighlightRoleSchema = z.enum(highlightRoles);

const FocusMarkerSchema = z.object({
        type: z.enum(['grid-cell', 'array-index', 'tree-node', 'graph-node']),
        id: z.string(),
        role: HighlightRoleSchema,
        style: z.record(z.any()).optional()
});

const GlobalHighlightSchema = z.object({
        role: HighlightRoleSchema,
        nodes: z.array(z.string()).min(1),
        weight: z
                .object({
                        value: z.number(),
                        label: z.string().optional(),
                        unit: z.string().optional()
                })
                .optional(),
        metadata: z.record(z.any()).optional()
});

/** Zod schema for Frame validation */
export const FrameSchema = z.object({
        step: z.number().int().nonnegative(),
        state: z.any(),
        focus: z.array(FocusMarkerSchema).optional(),
        neighbors: z.array(FocusMarkerSchema).optional(),
        globalHighlights: z.array(GlobalHighlightSchema).optional(),
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

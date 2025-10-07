import { describe, it, expect } from 'vitest';
import { validateTrace, validateFrameSequence, FrameSchema, TraceSchema } from './validation';
import type { Frame, Trace } from './plugin';

describe('validation', () => {
	describe('FrameSchema', () => {
		it('should validate a valid frame', () => {
			const validFrame = {
				step: 0,
				state: { grid: [[1]], visited: [[false]] },
				description: 'Initial state'
			};

			expect(() => FrameSchema.parse(validFrame)).not.toThrow();
		});

		it('should reject frame with negative step', () => {
			const invalidFrame = {
				step: -1,
				state: {},
				description: 'Test'
			};

			expect(() => FrameSchema.parse(invalidFrame)).toThrow();
		});

		it('should reject frame with empty description', () => {
			const invalidFrame = {
				step: 0,
				state: {},
				description: ''
			};

			expect(() => FrameSchema.parse(invalidFrame)).toThrow();
		});

                it('should allow optional focus and neighbors', () => {
                        const frameWithMarkers = {
                                step: 0,
                                state: {},
                                focus: [{ type: 'grid-cell' as const, id: '0,0', role: 'current' as const }],
                                neighbors: [{ type: 'grid-cell' as const, id: '0,1', role: 'frontier' as const }],
                                description: 'With markers'
                        };

                        expect(() => FrameSchema.parse(frameWithMarkers)).not.toThrow();
                });

                it('should validate focus marker types', () => {
                        const validTypes = ['grid-cell', 'array-index', 'tree-node', 'graph-node'];

                        validTypes.forEach((type) => {
                                const frame = {
                                        step: 0,
                                        state: {},
                                        focus: [{ type, id: 'test', role: 'auxiliary' as const }],
                                        description: 'Test'
                                };

                                expect(() => FrameSchema.parse(frame)).not.toThrow();
                        });
		});

                it('should reject invalid focus marker type', () => {
                        const frame = {
                                step: 0,
                                state: {},
                                focus: [{ type: 'invalid-type', id: 'test', role: 'current' as const }],
                                description: 'Test'
                        };

                        expect(() => FrameSchema.parse(frame)).toThrow();
                });

                it('should allow global highlights with weight metadata', () => {
                        const frameWithHighlights = {
                                step: 0,
                                state: {},
                                description: 'With highlights',
                                globalHighlights: [
                                        {
                                                role: 'path-final' as const,
                                                nodes: ['0,0', '0,1'],
                                                weight: { label: 'Total', value: 2 }
                                        }
                                ]
                        };

                        expect(() => FrameSchema.parse(frameWithHighlights)).not.toThrow();
                });

		it('should allow optional metrics', () => {
			const frameWithMetrics = {
				step: 0,
				state: {},
				metrics: { count: 5, name: 'test' },
				description: 'With metrics'
			};

			expect(() => FrameSchema.parse(frameWithMetrics)).not.toThrow();
		});
	});

	describe('TraceSchema', () => {
		it('should validate a valid trace', () => {
			const validTrace: Trace = {
				frames: [
					{ step: 0, state: {}, description: 'Step 0' },
					{ step: 1, state: {}, description: 'Step 1' }
				],
				totalSteps: 2,
				completed: true
			};

			expect(() => TraceSchema.parse(validTrace)).not.toThrow();
		});

		it('should reject trace with empty frames array', () => {
			const invalidTrace = {
				frames: [],
				totalSteps: 0,
				completed: true
			};

			expect(() => TraceSchema.parse(invalidTrace)).toThrow();
		});

		it('should reject trace with non-positive totalSteps', () => {
			const invalidTrace = {
				frames: [{ step: 0, state: {}, description: 'Test' }],
				totalSteps: 0,
				completed: true
			};

			expect(() => TraceSchema.parse(invalidTrace)).toThrow();
		});

		it('should require boolean completed field', () => {
			const invalidTrace = {
				frames: [{ step: 0, state: {}, description: 'Test' }],
				totalSteps: 1
				// missing completed
			};

			expect(() => TraceSchema.parse(invalidTrace)).toThrow();
		});

		it('should allow optional metadata', () => {
			const traceWithMetadata: Trace = {
				frames: [{ step: 0, state: {}, description: 'Test' }],
				totalSteps: 1,
				completed: true,
				metadata: { algorithm: 'test', custom: 123 }
			};

			expect(() => TraceSchema.parse(traceWithMetadata)).not.toThrow();
		});
	});

	describe('validateTrace', () => {
		it('should return valid trace when parsing succeeds', () => {
			const validTrace: Trace = {
				frames: [
					{ step: 0, state: {}, description: 'Start' },
					{ step: 1, state: {}, description: 'End' }
				],
				totalSteps: 2,
				completed: true
			};

			const result = validateTrace(validTrace);
			expect(result).toEqual(validTrace);
		});

		it('should throw when trace is invalid', () => {
			const invalidTrace = {
				frames: [],
				totalSteps: 0
			};

			expect(() => validateTrace(invalidTrace)).toThrow();
		});

		it('should handle unknown input gracefully', () => {
			expect(() => validateTrace(null)).toThrow();
			expect(() => validateTrace(undefined)).toThrow();
			expect(() => validateTrace('not an object')).toThrow();
			expect(() => validateTrace(123)).toThrow();
		});
	});

	describe('validateFrameSequence', () => {
		it('should return true for sequential frames starting at 0', () => {
			const frames: Frame[] = [
				{ step: 0, state: {}, description: 'A' },
				{ step: 1, state: {}, description: 'B' },
				{ step: 2, state: {}, description: 'C' }
			];

			expect(validateFrameSequence(frames)).toBe(true);
		});

		it('should return false for non-sequential frames', () => {
			const frames: Frame[] = [
				{ step: 0, state: {}, description: 'A' },
				{ step: 2, state: {}, description: 'B' }, // skipped step 1
				{ step: 3, state: {}, description: 'C' }
			];

			expect(validateFrameSequence(frames)).toBe(false);
		});

		it('should return false if not starting at 0', () => {
			const frames: Frame[] = [
				{ step: 1, state: {}, description: 'A' },
				{ step: 2, state: {}, description: 'B' }
			];

			expect(validateFrameSequence(frames)).toBe(false);
		});

		it('should return true for single frame at step 0', () => {
			const frames: Frame[] = [{ step: 0, state: {}, description: 'Only' }];

			expect(validateFrameSequence(frames)).toBe(true);
		});

		it('should return false for single frame not at step 0', () => {
			const frames: Frame[] = [{ step: 5, state: {}, description: 'Wrong' }];

			expect(validateFrameSequence(frames)).toBe(false);
		});

		it('should handle empty array', () => {
			expect(validateFrameSequence([])).toBe(true); // vacuously true
		});
	});
});

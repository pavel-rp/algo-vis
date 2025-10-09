import { describe, it, expect } from 'vitest';
import { minTimeToBrewPotionsPlugin } from './minTimeToBrewPotions';
import { TraceSchema, validateFrameSequence } from '$lib/types/validation';

describe('minTimeToBrewPotionsPlugin', () => {
        describe('validateInput', () => {
                it('accepts a well-formed configuration', () => {
                        const result = minTimeToBrewPotionsPlugin.validateInput({
                                skill: [1, 5, 2, 4],
                                mana: [5, 1, 4, 2]
                        });

                        expect(result.valid).toBe(true);
                });

                it('rejects empty skill array', () => {
                        const result = minTimeToBrewPotionsPlugin.validateInput({
                                skill: [],
                                mana: [1]
                        });

                        expect(result.valid).toBe(false);
                        expect(result.errors).toContain('Skill array must contain at least one wizard');
                });

                it('rejects non-positive values', () => {
                        const result = minTimeToBrewPotionsPlugin.validateInput({
                                skill: [2, 0],
                                mana: [3, -1]
                        });

                        expect(result.valid).toBe(false);
                        expect(result.errors).toContain('Skill[1] must be a positive integer');
                        expect(result.errors).toContain('Mana[1] must be a positive integer');
                });

                it('rejects instances exceeding visualization bounds', () => {
                        const result = minTimeToBrewPotionsPlugin.validateInput({
                                skill: Array(13).fill(1),
                                mana: [1]
                        });

                        expect(result.valid).toBe(false);
                        expect(result.errors?.some((message) => message.includes('at most 12 wizards'))).toBe(true);
                });
        });

        describe('trace', () => {
                const sampleInput = {
                        skill: [1, 5, 2, 4],
                        mana: [5, 1, 4, 2],
                        grid: Array.from({ length: 4 }, () => Array(4).fill(0))
                };

                it('produces a valid trace for the LeetCode sample (total = 110)', () => {
                        const trace = minTimeToBrewPotionsPlugin.trace(sampleInput);

                        expect(() => TraceSchema.parse(trace)).not.toThrow();
                        expect(validateFrameSequence(trace.frames)).toBe(true);
                        expect(trace.completed).toBe(true);
                        expect(trace.totalSteps).toBe(trace.frames.length);

                        const finalFrame = trace.frames[trace.frames.length - 1];
                        expect(finalFrame.metrics?.['Total Time']).toBe(110);
                        expect(trace.metadata?.totalTime).toBe(110);
                });

                it('emits one frame per wizard/potion cell plus bookends', () => {
                        const trace = minTimeToBrewPotionsPlugin.trace(sampleInput);
                        const expectedMinimumFrames = sampleInput.skill.length * sampleInput.mana.length + 2; // intro + summary
                        expect(trace.frames.length).toBeGreaterThanOrEqual(expectedMinimumFrames);
                });

                it('records finish times in the dp matrix', () => {
                        const trace = minTimeToBrewPotionsPlugin.trace(sampleInput);
                        const lastProcessingFrame = trace.frames.at(-2);
                        expect(lastProcessingFrame?.state?.dp?.[3]?.[3]).toBe(110);
                });

                it('always highlights the start and goal cells', () => {
                        const trace = minTimeToBrewPotionsPlugin.trace(sampleInput);
                        const startId = '0,0';
                        const goalId = '3,3';

                        trace.frames.forEach((frame) => {
                                const roles = frame.globalHighlights ?? [];
                                const startHighlight = roles.find((entry) => entry.role === 'start');
                                const goalHighlight = roles.find((entry) => entry.role === 'goal');
                                expect(startHighlight?.nodes).toContain(startId);
                                expect(goalHighlight?.nodes).toContain(goalId);
                        });
                });
        });
});

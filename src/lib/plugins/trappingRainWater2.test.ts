import { describe, it, expect } from 'vitest';
import { trappingRainWater2Plugin } from './trappingRainWater2';
import { TraceSchema } from '$lib/types/validation';

describe('trappingRainWater2Plugin', () => {
	describe('validateInput', () => {
		it('should validate a valid 3x3 grid', () => {
			const validGrid = [
				[1, 2, 1],
				[2, 0, 2],
				[1, 2, 1]
			];
			const result = trappingRainWater2Plugin.validateInput(validGrid);
			expect(result.valid).toBe(true);
		});

		it('should reject empty array', () => {
			const result = trappingRainWater2Plugin.validateInput([]);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Input must be a non-empty 2D array');
		});

		it('should reject non-array input', () => {
			const result = trappingRainWater2Plugin.validateInput('not an array' as any);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Input must be a non-empty 2D array');
		});

		it('should reject grid with empty rows', () => {
			const result = trappingRainWater2Plugin.validateInput([[]]);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Grid rows must not be empty');
		});

		it('should reject grid with inconsistent row lengths', () => {
			const invalidGrid = [
				[1, 2, 3],
				[4, 5],
				[6, 7, 8]
			];
			const result = trappingRainWater2Plugin.validateInput(invalidGrid);
			expect(result.valid).toBe(false);
			expect(result.errors?.[0]).toMatch(/Row 1 has inconsistent length/);
		});

		it('should reject grid with negative values', () => {
			const invalidGrid = [
				[1, 2, 3],
				[4, -5, 6],
				[7, 8, 9]
			];
			const result = trappingRainWater2Plugin.validateInput(invalidGrid);
			expect(result.valid).toBe(false);
			expect(result.errors?.[0]).toMatch(/Invalid value at \[1\]\[1\]/);
		});

		it('should reject grid with non-numeric values', () => {
			const invalidGrid = [
				[1, 2, 3],
				[4, 'five' as any, 6],
				[7, 8, 9]
			];
			const result = trappingRainWater2Plugin.validateInput(invalidGrid);
			expect(result.valid).toBe(false);
			expect(result.errors?.[0]).toMatch(/Invalid value at \[1\]\[1\]/);
		});

		it('should reject grid smaller than 3x3', () => {
			const smallGrid = [
				[1, 2],
				[3, 4]
			];
			const result = trappingRainWater2Plugin.validateInput(smallGrid);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Grid must be at least 3x3 to trap water');
		});

		it('should accept grid larger than 3x3', () => {
			const largeGrid = [
				[1, 2, 3, 4],
				[5, 0, 0, 6],
				[7, 0, 0, 8],
				[9, 10, 11, 12]
			];
			const result = trappingRainWater2Plugin.validateInput(largeGrid);
			expect(result.valid).toBe(true);
		});
	});

	describe('trace', () => {
		it('should produce valid trace for simple 3x3 grid', () => {
			const grid = [
				[5, 5, 5],
				[5, 1, 5],
				[5, 5, 5]
			];
			const trace = trappingRainWater2Plugin.trace(grid);

			// Validate against schema
			expect(() => TraceSchema.parse(trace)).not.toThrow();

			// Basic trace properties
			expect(trace.frames.length).toBeGreaterThan(0);
			expect(trace.totalSteps).toBe(trace.frames.length);
			expect(trace.completed).toBe(true);

			// First frame should have initial state
			expect(trace.frames[0].step).toBe(0);
			expect(trace.frames[0].description).toContain('Starting');

			// Last frame should have completion message
			const lastFrame = trace.frames[trace.frames.length - 1];
			expect(lastFrame.description).toContain('complete');
		});

		it('should calculate correct water volume for classic example', () => {
			const grid = [
				[5, 5, 5],
				[5, 1, 5],
				[5, 5, 5]
			];
			const trace = trappingRainWater2Plugin.trace(grid);
			const lastFrame = trace.frames[trace.frames.length - 1];

			// Center cell can trap water up to height 5, currently at 1, so 4 units
			expect(lastFrame.metrics?.['Total Water']).toBe(4);
		});


		it('should produce frames with grid state', () => {
			const grid = [
				[3, 3, 3],
				[3, 1, 3],
				[3, 3, 3]
			];
			const trace = trappingRainWater2Plugin.trace(grid);

			// All frames should have grid state
			trace.frames.forEach((frame) => {
				expect(frame.state.grid).toBeDefined();
				expect(Array.isArray(frame.state.grid)).toBe(true);
				expect(frame.state.visited).toBeDefined();
				expect(Array.isArray(frame.state.visited)).toBe(true);
			});
		});

		it('should include focus markers for current processing cell', () => {
			const grid = [
				[3, 3, 3],
				[3, 1, 3],
				[3, 3, 3]
			];
			const trace = trappingRainWater2Plugin.trace(grid);

			// Should have frames with focus markers (excluding initial/final frames)
			const framesWithFocus = trace.frames.filter((f) => f.focus && f.focus.length > 0);
			expect(framesWithFocus.length).toBeGreaterThan(0);

			// Focus markers should be grid-cell type
                        framesWithFocus.forEach((frame) => {
                                frame.focus?.forEach((marker) => {
                                        expect(marker.type).toBe('grid-cell');
                                        expect(marker.id).toMatch(/^\d+,\d+$/); // "row,col" format
                                        expect(marker.role).toBeDefined();
                                });
                        });
                });

                it('should include global highlight snapshots with water totals', () => {
                        const grid = [
                                [3, 3, 3],
                                [3, 1, 3],
                                [3, 3, 3]
                        ];
                        const trace = trappingRainWater2Plugin.trace(grid);

                        const framesWithHighlights = trace.frames.filter((frame) => frame.globalHighlights && frame.globalHighlights.length > 0);
                        expect(framesWithHighlights.length).toBeGreaterThan(0);

                        const finalHighlights = trace.frames[trace.frames.length - 1].globalHighlights ?? [];
                        const waterHighlight = finalHighlights.find((highlight) => highlight.role === 'weight-peek');

                        expect(waterHighlight).toBeDefined();
                        expect(waterHighlight?.weight?.label).toBe('Total Water');
                        expect(waterHighlight?.weight?.value).toBe(trace.frames[trace.frames.length - 1].metrics?.['Total Water']);
                });

		it('should handle grid with no water to trap', () => {
			const grid = [
				[5, 4, 3],
				[4, 3, 2],
				[3, 2, 1]
			];
			const trace = trappingRainWater2Plugin.trace(grid);
			const lastFrame = trace.frames[trace.frames.length - 1];

			expect(lastFrame.metrics?.['Total Water']).toBe(0);
			expect(() => TraceSchema.parse(trace)).not.toThrow();
		});

		it('should produce sequential step numbers', () => {
			const grid = [
				[3, 3, 3],
				[3, 1, 3],
				[3, 3, 3]
			];
			const trace = trappingRainWater2Plugin.trace(grid);

			for (let i = 0; i < trace.frames.length; i++) {
				expect(trace.frames[i].step).toBe(i);
			}
		});

		it('should include metrics in frames', () => {
			const grid = [
				[5, 5, 5],
				[5, 1, 5],
				[5, 5, 5]
			];
			const trace = trappingRainWater2Plugin.trace(grid);

			// Initial frame should have metrics
			expect(trace.frames[0].metrics).toBeDefined();
			expect(trace.frames[0].metrics?.['Total Water']).toBe(0);
		});
	});

	describe('plugin metadata', () => {
		it('should have required plugin properties', () => {
			expect(trappingRainWater2Plugin.id).toBe('trapping-rain-water-2');
			expect(trappingRainWater2Plugin.name).toBe('Trapping Rain Water II');
			expect(trappingRainWater2Plugin.description).toBeTruthy();
			expect(trappingRainWater2Plugin.category).toBe('Dynamic Programming');
			expect(trappingRainWater2Plugin.visualizationType).toBe('grid');
		});

		it('should have preset inputs', () => {
			expect(trappingRainWater2Plugin.presets).toBeDefined();
			expect(trappingRainWater2Plugin.presets.length).toBeGreaterThan(0);

			// Each preset should be valid
			trappingRainWater2Plugin.presets.forEach((preset) => {
				expect(preset.name).toBeTruthy();
				expect(preset.description).toBeTruthy();
				expect(Array.isArray(preset.data)).toBe(true);

				const validation = trappingRainWater2Plugin.validateInput(preset.data);
				expect(validation.valid).toBe(true);
			});
		});
	});
});

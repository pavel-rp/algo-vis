import { describe, it, expect } from 'vitest';
import { uniquePathsWithObstaclesPlugin } from './uniquePathsWithObstacles';
import { TraceSchema } from '$lib/types/validation';

describe('uniquePathsWithObstaclesPlugin', () => {
	describe('validateInput', () => {
		it('should validate a valid grid with 0s and 1s', () => {
			const validGrid = [
				[0, 0, 0],
				[0, 1, 0],
				[0, 0, 0]
			];
			const result = uniquePathsWithObstaclesPlugin.validateInput(validGrid);
			expect(result.valid).toBe(true);
		});

		it('should validate grid with all 0s', () => {
			const validGrid = [
				[0, 0],
				[0, 0]
			];
			const result = uniquePathsWithObstaclesPlugin.validateInput(validGrid);
			expect(result.valid).toBe(true);
		});

		it('should reject empty array', () => {
			const result = uniquePathsWithObstaclesPlugin.validateInput([]);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Input must be a non-empty 2D array');
		});

		it('should reject non-array input', () => {
			const result = uniquePathsWithObstaclesPlugin.validateInput(null as any);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Input must be a non-empty 2D array');
		});

		it('should reject grid with empty rows', () => {
			const result = uniquePathsWithObstaclesPlugin.validateInput([[]]);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Grid rows must not be empty');
		});

		it('should reject grid with inconsistent row lengths', () => {
			const invalidGrid = [
				[0, 0, 0],
				[0, 0],
				[0, 0, 0]
			];
			const result = uniquePathsWithObstaclesPlugin.validateInput(invalidGrid);
			expect(result.valid).toBe(false);
			expect(result.errors?.[0]).toMatch(/Row 1 has inconsistent length/);
		});

		it('should reject grid with values other than 0 or 1', () => {
			const invalidGrid = [
				[0, 0, 0],
				[0, 2, 0],
				[0, 0, 0]
			];
			const result = uniquePathsWithObstaclesPlugin.validateInput(invalidGrid);
			expect(result.valid).toBe(false);
			expect(result.errors?.[0]).toMatch(/Invalid value at \[1\]\[1\]: must be 0 \(empty\) or 1 \(obstacle\)/);
		});

		it('should reject grid with negative values', () => {
			const invalidGrid = [
				[0, 0, 0],
				[0, -1, 0],
				[0, 0, 0]
			];
			const result = uniquePathsWithObstaclesPlugin.validateInput(invalidGrid);
			expect(result.valid).toBe(false);
			expect(result.errors?.[0]).toMatch(/Invalid value at \[1\]\[1\]/);
		});

		it('should reject grid with non-numeric values', () => {
			const invalidGrid = [
				[0, 0, 0],
				[0, 'x' as any, 0],
				[0, 0, 0]
			];
			const result = uniquePathsWithObstaclesPlugin.validateInput(invalidGrid);
			expect(result.valid).toBe(false);
			expect(result.errors?.[0]).toMatch(/Invalid value at \[1\]\[1\]/);
		});

		it('should accept 1x1 grid', () => {
			const result = uniquePathsWithObstaclesPlugin.validateInput([[0]]);
			expect(result.valid).toBe(true);
		});
	});

	describe('trace', () => {
		it('should produce valid trace for simple 2x2 grid', () => {
			const grid = [
				[0, 0],
				[0, 0]
			];
			const trace = uniquePathsWithObstaclesPlugin.trace(grid);

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

		it('should calculate correct paths for 2x2 grid without obstacles', () => {
			const grid = [
				[0, 0],
				[0, 0]
			];
			const trace = uniquePathsWithObstaclesPlugin.trace(grid);
			const lastFrame = trace.frames[trace.frames.length - 1];

			// 2x2 grid has 2 unique paths: right-down, down-right
			expect(lastFrame.metrics?.['Total Paths']).toBe(2);
		});

		it('should calculate correct paths for 3x3 grid with obstacle', () => {
			const grid = [
				[0, 0, 0],
				[0, 1, 0],
				[0, 0, 0]
			];
			const trace = uniquePathsWithObstaclesPlugin.trace(grid);
			const lastFrame = trace.frames[trace.frames.length - 1];

			// Center obstacle blocks direct paths
			expect(lastFrame.metrics?.['Total Paths']).toBe(2);
		});

		it('should return 0 paths when start has obstacle', () => {
			const grid = [
				[1, 0],
				[0, 0]
			];
			const trace = uniquePathsWithObstaclesPlugin.trace(grid);
			const lastFrame = trace.frames[trace.frames.length - 1];

			expect(lastFrame.metrics?.['Total Paths']).toBe(0);
		});

		it('should return 0 paths when end has obstacle', () => {
			const grid = [
				[0, 0],
				[0, 1]
			];
			const trace = uniquePathsWithObstaclesPlugin.trace(grid);
			const lastFrame = trace.frames[trace.frames.length - 1];

			expect(lastFrame.metrics?.['Total Paths']).toBe(0);
		});

		it('should produce frames with grid and dp state', () => {
			const grid = [
				[0, 0],
				[0, 0]
			];
			const trace = uniquePathsWithObstaclesPlugin.trace(grid);

			// All frames should have required state
			trace.frames.forEach((frame) => {
				expect(frame.state.grid).toBeDefined();
				expect(Array.isArray(frame.state.grid)).toBe(true);
				expect(frame.state.dp).toBeDefined();
				expect(Array.isArray(frame.state.dp)).toBe(true);
			});
		});

		it('should include focus markers for current cell', () => {
			const grid = [
				[0, 0],
				[0, 0]
			];
			const trace = uniquePathsWithObstaclesPlugin.trace(grid);

			// Should have frames with focus markers
			const framesWithFocus = trace.frames.filter((f) => f.focus && f.focus.length > 0);
			expect(framesWithFocus.length).toBeGreaterThan(0);

			// Focus markers should be grid-cell type
			framesWithFocus.forEach((frame) => {
				frame.focus?.forEach((marker) => {
					expect(marker.type).toBe('grid-cell');
					expect(marker.id).toMatch(/^\d+,\d+$/); // "row,col" format
				});
			});
		});

		it('should produce sequential step numbers', () => {
			const grid = [
				[0, 0],
				[0, 0]
			];
			const trace = uniquePathsWithObstaclesPlugin.trace(grid);

			for (let i = 0; i < trace.frames.length; i++) {
				expect(trace.frames[i].step).toBe(i);
			}
		});

		it('should include metrics in frames', () => {
			const grid = [
				[0, 0, 0],
				[0, 0, 0]
			];
			const trace = uniquePathsWithObstaclesPlugin.trace(grid);

			// Initial frame should have metrics
			expect(trace.frames[0].metrics).toBeDefined();
			expect(trace.frames[0].metrics?.Paths).toBe(0);
		});

		it('should handle 1x1 grid without obstacle', () => {
			const grid = [[0]];
			const trace = uniquePathsWithObstaclesPlugin.trace(grid);
			const lastFrame = trace.frames[trace.frames.length - 1];

			// 1x1 grid has exactly 1 path (stay in place)
			expect(lastFrame.metrics?.['Total Paths']).toBe(1);
			expect(() => TraceSchema.parse(trace)).not.toThrow();
		});

		it('should handle 1x1 grid with obstacle', () => {
			const grid = [[1]];
			const trace = uniquePathsWithObstaclesPlugin.trace(grid);
			const lastFrame = trace.frames[trace.frames.length - 1];

			expect(lastFrame.metrics?.['Total Paths']).toBe(0);
			expect(() => TraceSchema.parse(trace)).not.toThrow();
		});
	});

	describe('plugin metadata', () => {
		it('should have required plugin properties', () => {
			expect(uniquePathsWithObstaclesPlugin.id).toBe('unique-paths-with-obstacles');
			expect(uniquePathsWithObstaclesPlugin.name).toBe('Unique Paths with Obstacles');
			expect(uniquePathsWithObstaclesPlugin.description).toBeTruthy();
			expect(uniquePathsWithObstaclesPlugin.category).toBe('Graphs');
			expect(uniquePathsWithObstaclesPlugin.visualizationType).toBe('grid');
		});

		it('should have preset inputs', () => {
			expect(uniquePathsWithObstaclesPlugin.presets).toBeDefined();
			expect(uniquePathsWithObstaclesPlugin.presets.length).toBeGreaterThan(0);

			// Each preset should be valid
			uniquePathsWithObstaclesPlugin.presets.forEach((preset) => {
				expect(preset.name).toBeTruthy();
				expect(preset.description).toBeTruthy();
				expect(Array.isArray(preset.data)).toBe(true);

				const validation = uniquePathsWithObstaclesPlugin.validateInput(preset.data);
				expect(validation.valid).toBe(true);
			});
		});
	});
});

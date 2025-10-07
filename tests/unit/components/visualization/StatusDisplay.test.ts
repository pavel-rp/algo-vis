/**
 * Contract Tests for StatusDisplay Component
 * Feature: 004-we-ll-implement (Swim in Water)
 * Task: T002
 *
 * Tests StatusDisplayPropsSchema validation against valid/invalid props
 */

import { describe, it, expect } from 'vitest';
import {
	StatusDisplayPropsSchema,
	type StatusDisplayProps
} from '../../../../specs/004-we-ll-implement/contracts/SharedComponents.schema';

describe('StatusDisplay Contract Tests', () => {
	describe('Valid props', () => {
		it('should accept valid metrics with mixed types', () => {
			const validProps: StatusDisplayProps = {
				metrics: {
					Algorithm: 'Swim in Water',
					'Current Max Elevation': 5,
					Complexity: 'O(N² log N)',
					'Grid Size': '5×5'
				},
				currentStep: 12,
				totalSteps: 38
			};

			expect(() => StatusDisplayPropsSchema.parse(validProps)).not.toThrow();
		});

		it('should accept metrics with only strings', () => {
			const validProps: StatusDisplayProps = {
				metrics: {
					Algorithm: 'Test',
					Description: 'Testing'
				},
				currentStep: 0,
				totalSteps: 10
			};

			expect(() => StatusDisplayPropsSchema.parse(validProps)).not.toThrow();
		});

		it('should accept metrics with only numbers', () => {
			const validProps: StatusDisplayProps = {
				metrics: {
					Step: 5,
					Total: 10,
					Progress: 50
				},
				currentStep: 5,
				totalSteps: 10
			};

			expect(() => StatusDisplayPropsSchema.parse(validProps)).not.toThrow();
		});

		it('should accept currentStep at 0 (initial)', () => {
			const validProps: StatusDisplayProps = {
				metrics: { Test: 'value' },
				currentStep: 0,
				totalSteps: 1
			};

			expect(() => StatusDisplayPropsSchema.parse(validProps)).not.toThrow();
		});

		it('should accept currentStep at totalSteps - 1 (last step)', () => {
			const validProps: StatusDisplayProps = {
				metrics: { Test: 'value' },
				currentStep: 9,
				totalSteps: 10
			};

			expect(() => StatusDisplayPropsSchema.parse(validProps)).not.toThrow();
		});
	});

	describe('Invalid props - metrics validation', () => {
		it('should reject empty metrics object', () => {
			const invalidProps = {
				metrics: {},
				currentStep: 0,
				totalSteps: 10
			};

			expect(() => StatusDisplayPropsSchema.parse(invalidProps)).toThrow(
				'Metrics cannot be empty'
			);
		});

		it('should reject metrics with invalid value types', () => {
			const invalidProps = {
				metrics: {
					Valid: 'string',
					Invalid: { nested: 'object' } as any
				},
				currentStep: 0,
				totalSteps: 10
			};

			expect(() => StatusDisplayPropsSchema.parse(invalidProps)).toThrow();
		});
	});

	describe('Invalid props - step validation', () => {
		it('should reject negative currentStep', () => {
			const invalidProps = {
				metrics: { Test: 'value' },
				currentStep: -1,
				totalSteps: 10
			};

			expect(() => StatusDisplayPropsSchema.parse(invalidProps)).toThrow();
		});

		it('should reject non-integer currentStep', () => {
			const invalidProps = {
				metrics: { Test: 'value' },
				currentStep: 1.5,
				totalSteps: 10
			};

			expect(() => StatusDisplayPropsSchema.parse(invalidProps)).toThrow();
		});

		it('should reject zero or negative totalSteps', () => {
			const invalidProps = {
				metrics: { Test: 'value' },
				currentStep: 0,
				totalSteps: 0
			};

			expect(() => StatusDisplayPropsSchema.parse(invalidProps)).toThrow();
		});

		it('should reject currentStep >= totalSteps', () => {
			const invalidProps = {
				metrics: { Test: 'value' },
				currentStep: 10,
				totalSteps: 10
			};

			expect(() => StatusDisplayPropsSchema.parse(invalidProps)).toThrow(
				'currentStep must be less than totalSteps'
			);
		});

		it('should reject currentStep > totalSteps', () => {
			const invalidProps = {
				metrics: { Test: 'value' },
				currentStep: 15,
				totalSteps: 10
			};

			expect(() => StatusDisplayPropsSchema.parse(invalidProps)).toThrow(
				'currentStep must be less than totalSteps'
			);
		});
	});
});

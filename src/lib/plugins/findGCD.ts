/**
 * Find Greatest Common Divisor of Array Plugin
 *
 * LeetCode Problem 1979: Find Greatest Common Divisor of Array
 *
 * Algorithm:
 * 1. Phase 1 (Min/Max Search): Traverse array to find minimum and maximum values
 * 2. Phase 2 (GCD Computation): Use Euclidean algorithm on min and max
 *
 * Constitutional Alignment: All 5 principles
 * Feature Requirements: FR-001 through FR-014
 *
 * @module plugins/findGCD
 */

import type { AlgorithmPlugin, Trace, ValidationResult, InputPreset, Frame } from '$lib/types/plugin';
import type { Phase } from '$lib/types/phase';

/**
 * Input type for GCD Array algorithm
 */
export interface GCDInput {
	nums: number[];
}

/**
 * State type for execution trace
 */
export interface GCDState {
	// Array data (for visualization)
	nums?: number[];

	// Phase 1: Min/Max Search
	currentIndex?: number;
	currentMin?: number;
	currentMax?: number;
	minIndex?: number;
	maxIndex?: number;

	// Phase 2: GCD Computation
	m?: number;
	n?: number;
	previousM?: number;
	previousN?: number;
	operation?: string;

	// Final result
	result?: number;
}

/**
 * Validate input constraints per FR-008, FR-009
 */
function validateInput(input: GCDInput): ValidationResult {
	const errors: string[] = [];

	// Check array is not empty
	if (!input.nums || input.nums.length === 0) {
		errors.push('Array must contain at least one element');
	}

	// Check array length ≤ 1000
	if (input.nums && input.nums.length > 1000) {
		errors.push('Array length must not exceed 1000 elements');
	}

	// Check all values are integers in range 1-10000
	if (input.nums) {
		input.nums.forEach((val, idx) => {
			if (!Number.isInteger(val)) {
				errors.push(`Value at index ${idx} must be an integer`);
			} else if (val < 1 || val > 10000) {
				errors.push(`Value at index ${idx} (${val}) must be in range 1-10000`);
			}
		});
	}

	return {
		valid: errors.length === 0,
		errors: errors.length > 0 ? errors : undefined
	};
}

/**
 * Generate execution trace with two phases
 * Per FR-002: Min/max search → GCD computation
 */
function trace(input: GCDInput): Trace<GCDState> {
	const frames: Frame<GCDState>[] = [];
	const nums = [...input.nums]; // Immutable copy per Principle III

	// Edge case: single element (FR-009 edge case)
	if (nums.length === 1) {
		frames.push({
			step: 0,
			phaseId: 'min-max-search',
			state: {
				nums: [...nums],
				currentMin: nums[0],
				currentMax: nums[0],
				minIndex: 0,
				maxIndex: 0,
				result: nums[0]
			},
			description: `Single element array: min = max = ${nums[0]}, GCD = ${nums[0]}`
		});

		return {
			frames,
			totalSteps: 1,
			completed: true
		};
	}

	// Phase 1: Min/Max Search (FR-003, FR-004)
	let currentMin = nums[0];
	let currentMax = nums[0];
	let minIndex = 0;
	let maxIndex = 0;

	// Initial frame
	frames.push({
		step: 0,
		phaseId: 'min-max-search',
		state: {
			nums: [...nums],
			currentIndex: 0,
			currentMin,
			currentMax,
			minIndex,
			maxIndex
		},
		description: `Starting min/max search. Initial min = ${currentMin}, max = ${currentMax}`
	});

	// Traverse array
	for (let i = 1; i < nums.length; i++) {
		const currentValue = nums[i];
		let updated = false;

		if (currentValue < currentMin) {
			currentMin = currentValue;
			minIndex = i;
			updated = true;
		}

		if (currentValue > currentMax) {
			currentMax = currentValue;
			maxIndex = i;
			updated = true;
		}

		// FR-011: Descriptive text for each step
		const description = updated
			? `Examining element at index ${i} (value: ${currentValue}). Updated: ${
					currentValue < currentMin ? 'min' : ''
			  } ${currentValue > currentMax ? 'max' : ''}. Current min = ${currentMin}, max = ${currentMax}`
			: `Examining element at index ${i} (value: ${currentValue}). No updates. Current min = ${currentMin}, max = ${currentMax}`;

		frames.push({
			step: frames.length,
			phaseId: 'min-max-search',
			state: {
				nums: [...nums],
				currentIndex: i,
				currentMin,
				currentMax,
				minIndex,
				maxIndex
			},
			description
		});
	}

	// Transition frame
	frames.push({
		step: frames.length,
		phaseId: 'min-max-search',
		state: {
			nums: [...nums],
			currentMin,
			currentMax,
			minIndex,
			maxIndex
		},
		description: `Min/max search complete. Found min = ${currentMin} (index ${minIndex}), max = ${currentMax} (index ${maxIndex}). Starting GCD computation...`
	});

	// Phase 2: Euclidean Algorithm (FR-005, FR-010)
	let m = currentMax;
	let n = currentMin;

	frames.push({
		step: frames.length,
		phaseId: 'gcd-computation',
		state: {
			m,
			n,
			currentMin,
			currentMax
		},
		description: `Initializing Euclidean algorithm with m = ${m} (max), n = ${n} (min)`
	});

	// Euclidean algorithm loop
	while (n !== 0) {
		const previousM = m;
		const previousN = n;
		const remainder = m % n;

		frames.push({
			step: frames.length,
			phaseId: 'gcd-computation',
			state: {
				m,
				n,
				operation: `${m} % ${n} = ${remainder}`,
				previousM,
				previousN
			},
			description: `Computing ${m} % ${n} = ${remainder}`
		});

		// Swap: [m, n] = [n, m % n]
		m = n;
		n = remainder;

		frames.push({
			step: frames.length,
			phaseId: 'gcd-computation',
			state: {
				m,
				n,
				operation: previousM !== m ? `${previousM} % ${previousN} = ${n}` : undefined,
				previousM,
				previousN
			},
			description: `Swapping values: m = ${m}, n = ${n}${n === 0 ? ' (termination condition reached)' : ''}`
		});
	}

	// Final result (FR-010)
	frames.push({
		step: frames.length,
		phaseId: 'gcd-computation',
		state: {
			m,
			n,
			currentMin,
			currentMax,
			result: m
		},
		description: `GCD computation complete. Result: GCD(${currentMin}, ${currentMax}) = ${m}`
	});

	return {
		frames,
		totalSteps: frames.length,
		completed: true,
		metadata: {
			algorithm: 'Euclidean GCD',
			inputSize: nums.length,
			min: currentMin,
			max: currentMax,
			result: m,
			leetcode: 1979,
			leetcodeUrl: 'https://leetcode.com/problems/find-greatest-common-divisor-of-array/'
		}
	};
}

/**
 * Phase definitions per FR-002a, FR-002b
 * Declarative renderer configuration (hybrid approach)
 */
const phases: Phase[] = [
	{
		id: 'min-max-search',
		label: 'Finding Min & Max',
		description: 'Traverse array to find minimum and maximum values',
		rendererConfigs: [
			{
				type: 'array',
				data: [], // Will be populated dynamically from frame state
				layout: {
					orientation: 'horizontal'
				}
			},
			{
				type: 'status',
				data: {
					message: 'Searching for minimum and maximum values...',
					level: 'info'
				}
			}
		]
	},
	{
		id: 'gcd-computation',
		label: 'Computing GCD',
		description: 'Using Euclidean algorithm to compute greatest common divisor',
		rendererConfigs: [
			{
				type: 'scalarPair',
				data: {
					m: 0,
					n: 0
				},
				labels: {
					m: 'M',
					n: 'N'
				}
			},
			{
				type: 'status',
				data: {
					message: 'Computing GCD using Euclidean algorithm...',
					level: 'info'
				}
			}
		]
	}
];

/**
 * Preset examples per FR-007
 */
const presets: InputPreset<GCDInput>[] = [
	{
		name: 'LeetCode Example 1',
		description: 'Official sample with min=2, max=10 → GCD = 2',
		data: { nums: [2, 5, 6, 9, 10] }
	},
	{
		name: 'LeetCode Example 2',
		description: 'Official sample returning 1 because numbers share no common divisor > 1',
		data: { nums: [7, 5, 6, 8, 3] }
	},
	{
		name: 'LeetCode Example 3',
		description: 'Official sample with identical numbers yielding GCD = 3',
		data: { nums: [3, 3] }
	},
	{
		name: 'Common Factors Demo',
		description: 'Array with shared divisor 6',
		data: { nums: [12, 18, 24] }
	},
	{
		name: 'Fibonacci Worst-Case',
		description: 'F(13)=233, F(14)=377 (12 Euclidean steps)',
		data: { nums: [233, 377] }
	}
];

/**
 * Find GCD Array Plugin Export
 * Per FR-001, FR-012: LeetCode 1979, categorized under Math / Number Theory
 */
export const findGCDPlugin: AlgorithmPlugin<GCDInput, GCDState> = {
	id: 'find-gcd-array',
	name: 'Find Greatest Common Divisor of Array',
	description:
		'Find the greatest common divisor of the smallest and largest numbers in an array using the Euclidean algorithm. Visualizes both the min/max search and GCD computation phases.',
	category: 'Math',
	subcategory: 'Number Theory',
	visualizationType: 'array',
	presets,
	trace,
	validateInput,
	phases
};

/**
 * Phase Container Interface Contract
 *
 * This file defines the TypeScript interface for the PhaseContainer component,
 * which orchestrates multi-phase algorithm visualizations.
 *
 * Constitutional Alignment: Principle II (Framework Reusability)
 */

import type { ExecutionStep } from '$lib/types/trace';

/**
 * Phase definition for multi-step algorithm execution
 */
export interface Phase {
	/** Unique identifier (kebab-case, e.g., 'min-max-search') */
	id: string;
	/** Human-readable label (e.g., 'Finding Min & Max') */
	label: string;
	/** Optional explanation of phase purpose */
	description?: string;
	/** Renderer configurations for this phase */
	rendererConfigs: RendererConfig[];
}

/**
 * Discriminated union of renderer configurations
 */
export type RendererConfig =
	| ArrayRendererConfig
	| ScalarPairRendererConfig
	| StatusRendererConfig;

/**
 * Configuration for array visualization renderer
 */
export interface ArrayRendererConfig {
	type: 'array';
	data: number[];
	highlight?: {
		indices: number[];
		role: 'focus' | 'min' | 'max' | 'result';
	};
	layout?: {
		orientation: 'horizontal' | 'vertical';
		cellSize?: number;
	};
}

/**
 * Configuration for two-value (scalar pair) renderer
 */
export interface ScalarPairRendererConfig {
	type: 'scalarPair';
	data: {
		m: number;
		n: number;
		operation?: string;
	};
	labels?: {
		m: string;
		n: string;
	};
}

/**
 * Configuration for status message renderer
 */
export interface StatusRendererConfig {
	type: 'status';
	data: {
		message: string;
		level: 'info' | 'success' | 'warning';
	};
}

/**
 * Props interface for PhaseContainer component
 */
export interface PhaseContainerProps {
	/** Array of phase definitions */
	phases: Phase[];
	/** Current execution step (determines active phase) */
	currentStep: ExecutionStep<unknown>;
	/** Optional CSS class for styling */
	class?: string;
}

/**
 * Events emitted by PhaseContainer
 */
export interface PhaseContainerEvents {
	/** Fired when phase transition occurs */
	phaseChange: {
		from: string;
		to: string;
		step: number;
	};
}

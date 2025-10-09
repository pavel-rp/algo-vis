/**
 * Phase and Renderer Configuration Types
 *
 * This module defines types for the multi-phase visualization framework,
 * enabling algorithm-agnostic phase containers and declarative renderer composition.
 *
 * Constitutional Alignment: Principle II (Framework Reusability)
 */

import type { Frame } from './plugin';

/**
 * Phase definition for multi-step algorithm execution
 *
 * A phase represents a distinct segment of algorithm execution with its own
 * visualization configuration. Multiple phases enable complex algorithms to
 * separate concerns (e.g., search phase vs. computation phase).
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
 *
 * Type-safe configuration for different visualization renderers.
 * TypeScript narrows the type based on the 'type' discriminator field.
 */
export type RendererConfig =
	| ArrayRendererConfig
	| ScalarPairRendererConfig
	| StatusRendererConfig;

/**
 * Configuration for array visualization renderer
 *
 * Used for visualizing 1D arrays with element highlighting.
 * Example use cases: array traversal, sorting, search algorithms.
 */
export interface ArrayRendererConfig {
	type: 'array';
	/** Array values to display */
	data: number[];
	/** Optional highlighting configuration */
	highlight?: {
		/** Indices of elements to highlight */
		indices: number[];
		/** Role/purpose of highlighted elements (affects styling) */
		role: 'focus' | 'min' | 'max' | 'result';
	};
	/** Optional layout configuration */
	layout?: {
		/** Display orientation */
		orientation: 'horizontal' | 'vertical';
		/** Custom cell size in pixels */
		cellSize?: number;
	};
}

/**
 * Configuration for two-value (scalar pair) renderer
 *
 * Used for visualizing algorithms that track two related values.
 * Example use cases: GCD (Euclidean algorithm), binary search bounds, two-pointer technique.
 */
export interface ScalarPairRendererConfig {
	type: 'scalarPair';
	/** The two scalar values to display */
	data: {
		/** First value */
		m: number;
		/** Second value */
		n: number;
		/** Optional operation description (e.g., "377 % 233 = 144") */
		operation?: string;
	};
	/** Optional custom labels for the values */
	labels?: {
		m: string;
		n: string;
	};
}

/**
 * Configuration for status message renderer
 *
 * Used for displaying algorithm state messages and notifications.
 * Example use cases: completion messages, error states, phase transitions.
 */
export interface StatusRendererConfig {
	type: 'status';
	/** Status message configuration */
	data: {
		/** Message text to display */
		message: string;
		/** Severity level (affects styling) */
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
	currentStep: Frame<unknown>;
	/** Optional CSS class for styling */
	class?: string;
}

/**
 * Events emitted by PhaseContainer
 */
export interface PhaseContainerEvents {
	/** Fired when phase transition occurs */
	phaseChange: {
		/** ID of previous phase */
		from: string;
		/** ID of new phase */
		to: string;
		/** Step index where transition occurred */
		step: number;
	};
}

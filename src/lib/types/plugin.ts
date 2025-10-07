/**
 * Algorithm Plugin Contract
 *
 * Core interfaces for the algorithm visualization framework.
 * Based on contracts/plugin-interface.ts from design docs.
 */

export type HighlightRole =
        | 'start'
        | 'goal'
        | 'current'
        | 'frontier'
        | 'queued'
        | 'visited'
        | 'path-active'
        | 'path-final'
        | 'obstacle'
        | 'weight-peek'
        | 'auxiliary';

export interface FocusMarker {
        type: 'grid-cell' | 'array-index' | 'tree-node' | 'graph-node';
        id: string;
        role: HighlightRole;
        style?: Record<string, any>;
}

export interface GlobalHighlight {
        role: HighlightRole;
        nodes: string[];
        weight?: {
                value: number;
                label?: string;
                unit?: string;
        };
        metadata?: Record<string, any>;
}

export interface Frame<TState = any> {
        step: number;
        state: TState;
        focus?: FocusMarker[];
        neighbors?: FocusMarker[];
        globalHighlights?: GlobalHighlight[];
        metrics?: Record<string, number | string>;
        description: string;
}

export interface Trace<TState = any> {
	frames: Frame<TState>[];
	totalSteps: number;
	completed: boolean;
	metadata?: Record<string, any>;
}

export interface InputPreset<TInput = any> {
	name: string;
	data: TInput;
	description?: string;
}

export interface CodeDefinition {
	language: string;
	source: string;
	stepToLines?: Record<number, [number, number]>;
}

export interface ValidationResult {
	valid: boolean;
	errors?: string[];
}

export interface AlgorithmPlugin<TInput = any, TState = any> {
	id: string;
	name: string;
	description: string;
	category: string;
	subcategory?: string; // Feature 004: Optional subcategory for navigation tree
	visualizationType: 'grid' | 'array' | 'tree' | 'graph';
	presets: InputPreset<TInput>[];
	trace(input: TInput): Trace<TState>;
	validateInput(input: TInput): ValidationResult;
	code?: CodeDefinition;
}

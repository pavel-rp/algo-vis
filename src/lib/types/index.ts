// Re-export all types for clean imports
export type {
	AlgorithmPlugin,
	Frame,
	Trace,
	FocusMarker,
	InputPreset,
	CodeDefinition,
	ValidationResult
} from './plugin';

export type { GridState } from './state';

export {
	FrameSchema,
	TraceSchema,
	validateTrace,
	validateFrameSequence
} from './validation';

/**
 * Zod Schema for AlgorithmPlugin Interface
 * Feature: 004-we-ll-implement (Swim in Water)
 *
 * Validates algorithm plugin structure including NEW fields:
 * - category: Required top-level categorization (e.g., "Graphs")
 * - subcategory: Optional subcategorization (e.g., "Priority Queue")
 */

import { z } from 'zod';

// Coordinate schema (used in ExecutionStep)
export const CoordinateSchema = z.object({
  row: z.number().int().nonnegative(),
  col: z.number().int().nonnegative()
});

// ExecutionStep schema
export const ExecutionStepSchema = z.object({
  index: z.number().int().nonnegative(),
  state: z.unknown(), // Algorithm-specific state (generic)
  description: z.string().min(1, "Description cannot be empty"),
  highlightedCells: z.array(CoordinateSchema).optional()
});

// ExecutionTrace schema
export const ExecutionTraceSchema = z.object({
  steps: z.array(ExecutionStepSchema).min(1, "Trace must have at least one step"),
  metadata: z.object({
    complexity: z.string().optional(),
    spaceComplexity: z.string().optional()
  }).passthrough() // Allow additional metadata fields
});

// Preset schema
export const PresetSchema = z.object({
  name: z.string().min(1, "Preset name cannot be empty"),
  input: z.unknown() // Algorithm-specific input type
});

// VisualizationData schema (algorithm-specific output)
export const VisualizationDataSchema = z.unknown(); // Flexible for different visualizations

// AlgorithmPlugin schema (UPDATED with category/subcategory)
export const AlgorithmPluginSchema = z.object({
  id: z.string()
    .min(1, "Plugin ID cannot be empty")
    .regex(/^[a-z0-9-]+$/, "Plugin ID must be kebab-case"),

  name: z.string().min(1, "Plugin name cannot be empty"),

  category: z.string().min(1, "Category is required"), // NEW: Required field

  subcategory: z.string().optional(), // NEW: Optional subcategory

  description: z.string().min(10, "Description must be at least 10 characters"),

  generateTrace: z.function()
    .args(z.unknown()) // Input type (algorithm-specific)
    .returns(ExecutionTraceSchema),

  presets: z.array(PresetSchema)
    .min(1, "Plugin must have at least one preset example"),

  visualize: z.function()
    .args(ExecutionStepSchema)
    .returns(VisualizationDataSchema)
});

// Type exports for TypeScript
export type Coordinate = z.infer<typeof CoordinateSchema>;
export type ExecutionStep = z.infer<typeof ExecutionStepSchema>;
export type ExecutionTrace = z.infer<typeof ExecutionTraceSchema>;
export type Preset = z.infer<typeof PresetSchema>;
export type AlgorithmPlugin = z.infer<typeof AlgorithmPluginSchema>;

/**
 * Example usage:
 *
 * const plugin = {
 *   id: 'swim-in-water',
 *   name: 'Swim in Water',
 *   category: 'Graphs',
 *   subcategory: 'Priority Queue',
 *   description: 'Find minimum time to swim...',
 *   generateTrace: (input) => ({ steps: [...], metadata: {} }),
 *   presets: [{ name: 'Small 3×3', input: {...} }],
 *   visualize: (step) => ({...})
 * };
 *
 * AlgorithmPluginSchema.parse(plugin); // Validates structure
 */

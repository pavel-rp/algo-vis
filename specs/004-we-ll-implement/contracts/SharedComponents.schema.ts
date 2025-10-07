/**
 * Zod Schemas for Shared Visualization Components
 * Feature: 004-we-ll-implement (Swim in Water)
 *
 * Defines prop schemas for reusable components:
 * - GridDisplay: Grid visualization (FR-001, FR-002, FR-014)
 * - StatusDisplay: Metrics/status display (FR-004, FR-012, FR-014)
 * - PriorityQueueDisplay: Priority queue visualization (FR-013, FR-014, FR-015)
 */

import { z } from 'zod';

// ============================================================================
// GridDisplay Component
// ============================================================================

export const CellStateSchema = z.enum(['unvisited', 'processing', 'visited']);

export const CoordinateSchema = z.object({
  row: z.number().int().nonnegative(),
  col: z.number().int().nonnegative()
});

export const GridDisplayPropsSchema = z.object({
  grid: z.array(z.array(z.number()))
    .refine(grid => grid.length > 0, "Grid cannot be empty")
    .refine(grid => grid.length <= 50, "Grid exceeds maximum size of 50×50")
    .refine(
      grid => grid.every(row => row.length === grid.length),
      "Grid must be square (N×N)"
    ),

  cellStates: z.array(z.array(CellStateSchema)),

  highlightedCells: z.array(CoordinateSchema).optional(),

  onCellClick: z.function()
    .args(z.number(), z.number()) // (row, col)
    .returns(z.void())
    .optional()
}).superRefine((data, ctx) => {
  // Cross-field validation: cellStates must match grid dimensions
  if (data.cellStates.length !== data.grid.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "cellStates dimensions must match grid dimensions",
      path: ['cellStates']
    });
  }
  for (let i = 0; i < data.cellStates.length; i++) {
    if (data.cellStates[i].length !== data.grid[i]?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "cellStates dimensions must match grid dimensions",
        path: ['cellStates', i]
      });
    }
  }
});

// ============================================================================
// StatusDisplay Component
// ============================================================================

export const StatusDisplayPropsSchema = z.object({
  metrics: z.record(z.string(), z.union([z.string(), z.number()]))
    .refine(m => Object.keys(m).length > 0, "Metrics cannot be empty"),

  currentStep: z.number().int().nonnegative(),

  totalSteps: z.number().int().positive()
}).superRefine((data, ctx) => {
  // Cross-field validation: currentStep must be less than totalSteps
  if (data.currentStep >= data.totalSteps) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "currentStep must be less than totalSteps",
      path: ['currentStep']
    });
  }
});

// ============================================================================
// PriorityQueueDisplay Component
// ============================================================================

export const QueueDisplayItemSchema = z.object({
  priority: z.number(), // Priority value (can be negative, float, etc.)

  label: z.string().min(1, "Label cannot be empty"),

  data: z.unknown().optional() // Algorithm-specific data
});

export const PriorityQueueDisplayPropsSchema = z.object({
  items: z.array(QueueDisplayItemSchema)
    .refine(
      items => {
        // Verify items are sorted by priority (ascending - min-heap)
        for (let i = 1; i < items.length; i++) {
          if (items[i].priority < items[i - 1].priority) {
            return false;
          }
        }
        return true;
      },
      "Items must be sorted by priority (ascending)"
    ),

  remainingCount: z.number().int().nonnegative(),

  maxDisplay: z.number().int().positive().default(5)
    .refine(max => max <= 10, "maxDisplay should not exceed 10 for readability")
});

// ============================================================================
// Type Exports
// ============================================================================

export type CellState = z.infer<typeof CellStateSchema>;
export type Coordinate = z.infer<typeof CoordinateSchema>;
export type GridDisplayProps = z.infer<typeof GridDisplayPropsSchema>;
export type StatusDisplayProps = z.infer<typeof StatusDisplayPropsSchema>;
export type QueueDisplayItem = z.infer<typeof QueueDisplayItemSchema>;
export type PriorityQueueDisplayProps = z.infer<typeof PriorityQueueDisplayPropsSchema>;

/**
 * Example usage:
 *
 * // GridDisplay
 * const gridProps = {
 *   grid: [[0,2,1],[3,1,4],[7,5,6]],
 *   cellStates: [
 *     ['visited', 'unvisited', 'unvisited'],
 *     ['processing', 'unvisited', 'unvisited'],
 *     ['unvisited', 'unvisited', 'unvisited']
 *   ],
 *   highlightedCells: [{row: 0, col: 1}, {row: 1, col: 0}],
 *   onCellClick: (row, col) => console.log(`Clicked ${row},${col}`)
 * };
 * GridDisplayPropsSchema.parse(gridProps);
 *
 * // StatusDisplay
 * const statusProps = {
 *   metrics: {
 *     "Algorithm": "Swim in Water",
 *     "Current Max Elevation": 5,
 *     "Complexity": "O(N² log N)"
 *   },
 *   currentStep: 12,
 *   totalSteps: 38
 * };
 * StatusDisplayPropsSchema.parse(statusProps);
 *
 * // PriorityQueueDisplay
 * const pqProps = {
 *   items: [
 *     { priority: 1, label: "Cell (0,1)", data: {row: 0, col: 1} },
 *     { priority: 2, label: "Cell (1,0)", data: {row: 1, col: 0} },
 *     { priority: 3, label: "Cell (0,2)", data: {row: 0, col: 2} }
 *   ],
 *   remainingCount: 7,
 *   maxDisplay: 5
 * };
 * PriorityQueueDisplayPropsSchema.parse(pqProps);
 */

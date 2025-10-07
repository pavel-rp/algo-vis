/**
 * Zod Schema for Navigation Tree Structure
 * Feature: 004-we-ll-implement (Swim in Water)
 *
 * Validates navigation tree structure for algorithm categorization (FR-010)
 * Supports hierarchical categories: Graphs → Priority Queue → Swim in Water
 */

import { z } from 'zod';

// Base node schema (common fields)
const BaseNodeSchema = z.object({
  id: z.string()
    .min(1, "Node ID cannot be empty")
    .regex(/^[a-z0-9-]+$/, "Node ID must be kebab-case"),

  label: z.string().min(1, "Node label cannot be empty")
});

// Category node schema (has children)
export const CategoryNodeSchema = BaseNodeSchema.extend({
  type: z.literal('category'),

  children: z.lazy(() => z.array(NavigationNodeSchema))
    .refine(children => children.length > 0, "Category must have at least one child")
});

// Algorithm node schema (leaf node with plugin reference)
export const AlgorithmNodeSchema = BaseNodeSchema.extend({
  type: z.literal('algorithm'),

  pluginId: z.string()
    .min(1, "Plugin ID cannot be empty")
    .regex(/^[a-z0-9-]+$/, "Plugin ID must be kebab-case"),

  path: z.string()
    .min(1, "Path cannot be empty")
    .regex(/^\/[a-z0-9-/]+$/, "Path must start with / and use kebab-case")
    .refine(
      path => !path.endsWith('/'),
      "Path should not end with /"
    )
});

// Discriminated union of node types
export const NavigationNodeSchema = z.discriminatedUnion('type', [
  CategoryNodeSchema,
  AlgorithmNodeSchema
]);

// Navigation tree root schema
export const NavigationTreeSchema = z.object({
  rootNodes: z.array(NavigationNodeSchema)
    .min(1, "Navigation tree must have at least one root node")
});

// ============================================================================
// Type Exports
// ============================================================================

export type CategoryNode = z.infer<typeof CategoryNodeSchema>;
export type AlgorithmNode = z.infer<typeof AlgorithmNodeSchema>;
export type NavigationNode = z.infer<typeof NavigationNodeSchema>;
export type NavigationTree = z.infer<typeof NavigationTreeSchema>;

/**
 * Example usage (Feature 004: Add Graphs → Priority Queue → Swim in Water):
 *
 * const navigationTree: NavigationTree = {
 *   rootNodes: [
 *     {
 *       type: 'category',
 *       id: 'graphs',
 *       label: 'Graphs',
 *       children: [
 *         {
 *           type: 'category',
 *           id: 'graphs-priority-queue',
 *           label: 'Priority Queue',
 *           children: [
 *             {
 *               type: 'algorithm',
 *               id: 'swim-in-water',
 *               label: 'Swim in Water',
 *               pluginId: 'swim-in-water',
 *               path: '/graphs/swim-in-water'
 *             }
 *           ]
 *         },
 *         {
 *           type: 'category',
 *           id: 'graphs-path-finding',
 *           label: 'Path Finding',
 *           children: [
 *             {
 *               type: 'algorithm',
 *               id: 'unique-paths-with-obstacles',
 *               label: 'Unique Paths with Obstacles',
 *               pluginId: 'unique-paths-with-obstacles',
 *               path: '/graphs/unique-paths-with-obstacles'
 *             }
 *           ]
 *         }
 *       ]
 *     },
 *     {
 *       type: 'category',
 *       id: 'dynamic-programming',
 *       label: 'Dynamic Programming',
 *       children: [
 *         {
 *           type: 'category',
 *           id: 'dp-2d-array',
 *           label: '2D Array',
 *           children: [
 *             {
 *               type: 'algorithm',
 *               id: 'trapping-rain-water-2',
 *               label: 'Trapping Rain Water II',
 *               pluginId: 'trapping-rain-water-2',
 *               path: '/dynamic-programming/trapping-rain-water-2'
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * };
 *
 * NavigationTreeSchema.parse(navigationTree); // Validates structure
 */

/**
 * Validation Rules:
 *
 * 1. IDs must be unique across the entire tree (enforced by application logic, not schema)
 * 2. Category nodes MUST have at least one child
 * 3. Algorithm nodes MUST reference a valid plugin ID
 * 4. Paths MUST be URL-safe and follow /category/algorithm pattern
 * 5. Maximum nesting depth: 3 levels (recommended for UX, not enforced)
 *    Example: Graphs (L1) → Priority Queue (L2) → Swim in Water (L3)
 */

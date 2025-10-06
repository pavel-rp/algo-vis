/**
 * Navigation Tree Schema Contracts
 *
 * Zod validation schemas for hierarchical navigation tree structure.
 * These schemas enforce type safety and runtime validation for the
 * tree-based sidebar navigation system.
 *
 * Feature: 003-move-the-navigation
 * Date: 2025-10-06
 */

import { z } from 'zod';

// ============================================================================
// Core Schemas
// ============================================================================

/**
 * Category Node Schema
 *
 * Represents a branch node in the navigation tree that can contain
 * subcategories or algorithm leaf nodes.
 *
 * Constraints:
 * - id: kebab-case, 1-100 characters, unique across tree
 * - label: Human-readable display name, 1-100 characters
 * - children: Array of NavigationNode (recursive), can be empty
 */
export const CategoryNodeSchema = z.object({
  type: z.literal('category'),
  id: z.string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Node ID must be kebab-case')
    .min(1, 'Node ID cannot be empty')
    .max(100, 'Node ID must be ≤100 characters'),
  label: z.string()
    .min(1, 'Label cannot be empty')
    .max(100, 'Label must be ≤100 characters'),
  children: z.lazy(() => z.array(NavigationNodeSchema))
});

/**
 * Algorithm Node Schema
 *
 * Represents a leaf node in the navigation tree corresponding to an
 * individual algorithm that can be visualized.
 *
 * Constraints:
 * - id: kebab-case, 1-100 characters, unique across tree
 * - label: Human-readable display name, 1-100 characters
 * - pluginId: Must match AlgorithmPlugin.id, kebab-case
 * - path: Valid URL path starting with /, matching /{category}/{algorithm} pattern
 */
export const AlgorithmNodeSchema = z.object({
  type: z.literal('algorithm'),
  id: z.string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Node ID must be kebab-case')
    .min(1, 'Node ID cannot be empty')
    .max(100, 'Node ID must be ≤100 characters'),
  label: z.string()
    .min(1, 'Label cannot be empty')
    .max(100, 'Label must be ≤100 characters'),
  pluginId: z.string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Plugin ID must be kebab-case')
    .min(1, 'Plugin ID cannot be empty'),
  path: z.string()
    .regex(/^\/[a-z0-9-]+(\/[a-z0-9-]+)*$/, 'Path must be valid URL path')
    .startsWith('/', 'Path must start with /')
});

/**
 * Navigation Node Schema (Discriminated Union)
 *
 * Union type representing any node in the navigation tree.
 * Discriminated by the 'type' field for type-safe pattern matching.
 *
 * Type Guards:
 * - node.type === 'category' → CategoryNode
 * - node.type === 'algorithm' → AlgorithmNode
 */
export const NavigationNodeSchema = z.discriminatedUnion('type', [
  CategoryNodeSchema,
  AlgorithmNodeSchema
]);

/**
 * Navigation Tree Schema
 *
 * Root container for the entire navigation hierarchy.
 *
 * Constraints:
 * - rootNodes: Non-empty array of top-level categories
 * - Typically contains major algorithmic concepts (Graphs, DP, etc.)
 */
export const NavigationTreeSchema = z.object({
  rootNodes: z.array(NavigationNodeSchema)
    .min(1, 'Navigation tree must have at least one root node')
});

// ============================================================================
// State Management Schemas
// ============================================================================

/**
 * Expanded Nodes State Schema
 *
 * Represents the set of category IDs that are currently expanded.
 * Used for localStorage persistence.
 *
 * Constraints:
 * - Array of kebab-case strings (converted to/from Set in code)
 * - Only category nodes can be expanded (not algorithms)
 */
export const ExpandedNodesStateSchema = z.array(
  z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
);

/**
 * Sidebar Visibility State Schema
 *
 * Represents whether the sidebar is open or closed.
 * Used for sessionStorage persistence.
 */
export const SidebarVisibilitySchema = z.boolean();

/**
 * Active Algorithm State Schema
 *
 * Represents the currently selected algorithm ID.
 * Derived from URL params, not directly persisted.
 */
export const ActiveAlgorithmSchema = z.string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .nullable();

// ============================================================================
// TypeScript Type Exports
// ============================================================================

/**
 * TypeScript types inferred from Zod schemas.
 * Use these for type annotations throughout the codebase.
 */
export type CategoryNode = z.infer<typeof CategoryNodeSchema>;
export type AlgorithmNode = z.infer<typeof AlgorithmNodeSchema>;
export type NavigationNode = z.infer<typeof NavigationNodeSchema>;
export type NavigationTree = z.infer<typeof NavigationTreeSchema>;
export type ExpandedNodesState = z.infer<typeof ExpandedNodesStateSchema>;
export type SidebarVisibility = z.infer<typeof SidebarVisibilitySchema>;
export type ActiveAlgorithm = z.infer<typeof ActiveAlgorithmSchema>;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate navigation tree structure
 *
 * Ensures:
 * - Schema compliance (types, formats)
 * - ID uniqueness across entire tree
 * - Path uniqueness for algorithm nodes
 * - No cycles (enforced by structure)
 *
 * @param tree - Navigation tree to validate
 * @returns Validation result with detailed errors
 */
export function validateNavigationTree(
  tree: unknown
): { success: true; data: NavigationTree } | { success: false; errors: string[] } {
  // Step 1: Schema validation
  const schemaResult = NavigationTreeSchema.safeParse(tree);
  if (!schemaResult.success) {
    return {
      success: false,
      errors: schemaResult.error.errors.map(e =>
        `${e.path.join('.')}: ${e.message}`
      )
    };
  }

  const validatedTree = schemaResult.data;

  // Step 2: ID uniqueness validation
  const allIds = new Set<string>();
  const duplicateIds: string[] = [];

  function collectIds(nodes: NavigationNode[]): void {
    for (const node of nodes) {
      if (allIds.has(node.id)) {
        duplicateIds.push(node.id);
      } else {
        allIds.add(node.id);
      }

      if (node.type === 'category') {
        collectIds(node.children);
      }
    }
  }

  collectIds(validatedTree.rootNodes);

  if (duplicateIds.length > 0) {
    return {
      success: false,
      errors: [`Duplicate node IDs found: ${duplicateIds.join(', ')}`]
    };
  }

  // Step 3: Path uniqueness validation (algorithm nodes only)
  const allPaths = new Set<string>();
  const duplicatePaths: string[] = [];

  function collectPaths(nodes: NavigationNode[]): void {
    for (const node of nodes) {
      if (node.type === 'algorithm') {
        if (allPaths.has(node.path)) {
          duplicatePaths.push(node.path);
        } else {
          allPaths.add(node.path);
        }
      } else {
        collectPaths(node.children);
      }
    }
  }

  collectPaths(validatedTree.rootNodes);

  if (duplicatePaths.length > 0) {
    return {
      success: false,
      errors: [`Duplicate paths found: ${duplicatePaths.join(', ')}`]
    };
  }

  return { success: true, data: validatedTree };
}

/**
 * Validate node ID format
 *
 * @param id - Node ID to validate
 * @returns True if ID is valid kebab-case
 */
export function isValidNodeId(id: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id);
}

/**
 * Validate path format
 *
 * @param path - URL path to validate
 * @returns True if path is valid
 */
export function isValidPath(path: string): boolean {
  return /^\/[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(path);
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for CategoryNode
 *
 * @param node - Node to check
 * @returns True if node is a CategoryNode
 */
export function isCategoryNode(node: NavigationNode): node is CategoryNode {
  return node.type === 'category';
}

/**
 * Type guard for AlgorithmNode
 *
 * @param node - Node to check
 * @returns True if node is an AlgorithmNode
 */
export function isAlgorithmNode(node: NavigationNode): node is AlgorithmNode {
  return node.type === 'algorithm';
}

// ============================================================================
// Storage Serialization Helpers
// ============================================================================

/**
 * Serialize expanded nodes state for localStorage
 *
 * @param expandedNodes - Set of expanded category IDs
 * @returns JSON string for storage
 */
export function serializeExpandedNodes(expandedNodes: Set<string>): string {
  return JSON.stringify([...expandedNodes]);
}

/**
 * Deserialize expanded nodes state from localStorage
 *
 * @param json - JSON string from storage
 * @returns Set of category IDs, or empty set if invalid
 */
export function deserializeExpandedNodes(json: string): Set<string> {
  try {
    const parsed = JSON.parse(json);
    const validated = ExpandedNodesStateSchema.parse(parsed);
    return new Set(validated);
  } catch {
    return new Set();
  }
}

/**
 * Serialize sidebar visibility for sessionStorage
 *
 * @param isOpen - Sidebar open state
 * @returns String for storage
 */
export function serializeSidebarVisibility(isOpen: boolean): string {
  return JSON.stringify(isOpen);
}

/**
 * Deserialize sidebar visibility from sessionStorage
 *
 * @param json - JSON string from storage
 * @returns Boolean state, defaults to true if invalid
 */
export function deserializeSidebarVisibility(json: string): boolean {
  try {
    const parsed = JSON.parse(json);
    return SidebarVisibilitySchema.parse(parsed);
  } catch {
    return true; // Default to open
  }
}

// ============================================================================
// Test Fixtures
// ============================================================================

/**
 * Example valid navigation tree for testing
 */
export const exampleNavigationTree: NavigationTree = {
  rootNodes: [
    {
      type: 'category',
      id: 'dynamic-programming',
      label: 'Dynamic Programming',
      children: [
        {
          type: 'category',
          id: 'dp-2d-array',
          label: '2D Array',
          children: [
            {
              type: 'algorithm',
              id: 'trapping-rain-water-2',
              label: 'Trapping Rain Water II',
              pluginId: 'trapping-rain-water-2',
              path: '/dynamic-programming/trapping-rain-water-2'
            }
          ]
        }
      ]
    },
    {
      type: 'category',
      id: 'graphs',
      label: 'Graphs',
      children: [
        {
          type: 'category',
          id: 'graphs-path-finding',
          label: 'Path Finding',
          children: [
            {
              type: 'algorithm',
              id: 'unique-paths-obstacles',
              label: 'Unique Paths with Obstacles',
              pluginId: 'unique-paths-with-obstacles',
              path: '/graphs/unique-paths-obstacles'
            }
          ]
        }
      ]
    }
  ]
};

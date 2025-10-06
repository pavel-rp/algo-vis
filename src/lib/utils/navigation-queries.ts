/**
 * Navigation Tree Query Utilities
 *
 * Provides helper functions for traversing and querying the navigation tree.
 * These utilities enable finding nodes, computing ancestor paths, and
 * extracting algorithm lists from the hierarchical structure.
 *
 * Feature: 003-move-the-navigation
 * Date: 2025-10-06
 */

import type {
	NavigationTree,
	NavigationNode,
	AlgorithmNode
} from '$lib/types/navigation';
import { isCategoryNode, isAlgorithmNode } from '$lib/types/navigation';

/**
 * Find a navigation node by its ID
 *
 * Performs depth-first search through the tree to locate the node with the given ID.
 *
 * @param tree - Navigation tree to search
 * @param nodeId - Node ID to find
 * @returns The matching node, or null if not found
 *
 * @example
 * const node = findNodeById(navigationTree, 'trapping-rain-water-2');
 * if (node && isAlgorithmNode(node)) {
 *   console.log(node.path); // '/dynamic-programming/trapping-rain-water-2'
 * }
 */
export function findNodeById(
	tree: NavigationTree,
	nodeId: string
): NavigationNode | null {
	function searchNodes(nodes: NavigationNode[]): NavigationNode | null {
		for (const node of nodes) {
			if (node.id === nodeId) {
				return node;
			}

			if (isCategoryNode(node)) {
				const found = searchNodes(node.children);
				if (found) {
					return found;
				}
			}
		}

		return null;
	}

	return searchNodes(tree.rootNodes);
}

/**
 * Get the ancestor IDs for a given node
 *
 * Returns an array of ancestor node IDs from root to the direct parent.
 * Used for expanding the tree to reveal a specific node.
 *
 * @param tree - Navigation tree to search
 * @param targetId - Node ID to find ancestors for
 * @returns Array of ancestor IDs in root-to-parent order, or empty array if not found
 *
 * @example
 * const ancestors = getAncestorIds(navigationTree, 'trapping-rain-water-2');
 * // Returns: ['dynamic-programming', 'dp-2d-array']
 */
export function getAncestorIds(tree: NavigationTree, targetId: string): string[] {
	function searchWithPath(nodes: NavigationNode[], path: string[]): string[] | null {
		for (const node of nodes) {
			if (node.id === targetId) {
				return path;
			}

			if (isCategoryNode(node)) {
				const found = searchWithPath(node.children, [...path, node.id]);
				if (found) {
					return found;
				}
			}
		}

		return null;
	}

	const result = searchWithPath(tree.rootNodes, []);
	return result || [];
}

/**
 * Get all algorithm nodes from the tree
 *
 * Performs depth-first traversal to collect all leaf algorithm nodes.
 * Excludes category nodes from the result.
 *
 * @param tree - Navigation tree to search
 * @returns Array of all algorithm nodes
 *
 * @example
 * const algorithms = getAllAlgorithms(navigationTree);
 * console.log(algorithms.length); // 2
 * console.log(algorithms.map(a => a.label));
 * // ['Trapping Rain Water II', 'Unique Paths with Obstacles']
 */
export function getAllAlgorithms(tree: NavigationTree): AlgorithmNode[] {
	const algorithms: AlgorithmNode[] = [];

	function collectAlgorithms(nodes: NavigationNode[]): void {
		for (const node of nodes) {
			if (isAlgorithmNode(node)) {
				algorithms.push(node);
			} else {
				collectAlgorithms(node.children);
			}
		}
	}

	collectAlgorithms(tree.rootNodes);
	return algorithms;
}

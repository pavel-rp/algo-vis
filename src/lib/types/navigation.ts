/**
 * Navigation Type Definitions
 *
 * Re-exports navigation types from the schema for convenient importing.
 * This barrel file provides a cleaner import path for components.
 *
 * Feature: 003-move-the-navigation
 * Date: 2025-10-06
 */

export type {
	CategoryNode,
	AlgorithmNode,
	NavigationNode,
	NavigationTree,
	ExpandedNodesState,
	SidebarVisibility,
	ActiveAlgorithm
} from './navigation-schema';

export {
	validateNavigationTree,
	isValidNodeId,
	isValidPath,
	isCategoryNode,
	isAlgorithmNode,
	serializeExpandedNodes,
	deserializeExpandedNodes,
	serializeSidebarVisibility,
	deserializeSidebarVisibility
} from './navigation-schema';

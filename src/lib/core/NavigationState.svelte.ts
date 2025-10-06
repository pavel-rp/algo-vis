/**
 * Navigation State Management
 *
 * Manages the sidebar navigation state using Svelte 5 runes.
 * Handles expanded nodes, active algorithm, and sidebar visibility with
 * automatic persistence to localStorage/sessionStorage.
 *
 * State:
 * - expandedNodes: Set<string> (persisted to localStorage)
 * - activeAlgorithmId: string | null (derived from URL)
 * - sidebarOpen: boolean (persisted to sessionStorage)
 *
 * Feature: 003-move-the-navigation
 * Date: 2025-10-06
 */

import {
	serializeExpandedNodes,
	deserializeExpandedNodes,
	serializeSidebarVisibility,
	deserializeSidebarVisibility
} from '$lib/types/navigation-schema';

const EXPANDED_NODES_KEY = 'algovis_expanded_nodes';
const SIDEBAR_OPEN_KEY = 'algovis_sidebar_open';

export class NavigationState {
	// Reactive state using Svelte 5 runes
	expandedNodes = $state<Set<string>>(new Set());
	activeAlgorithmId = $state<string | null>(null);
	sidebarOpen = $state<boolean>(true);

	constructor() {
		// Load persisted state from storage
		this.loadPersistedState();
	}

	/**
	 * Toggle a category node between expanded and collapsed
	 *
	 * @param nodeId - Category node ID to toggle
	 */
	toggle(nodeId: string): void {
		const newSet = new Set(this.expandedNodes);
		if (newSet.has(nodeId)) {
			newSet.delete(nodeId);
		} else {
			newSet.add(nodeId);
		}
		this.expandedNodes = newSet;

		this.persist();
	}

	/**
	 * Expand a category node (idempotent)
	 *
	 * @param nodeId - Category node ID to expand
	 */
	expand(nodeId: string): void {
		const newSet = new Set(this.expandedNodes);
		newSet.add(nodeId);
		this.expandedNodes = newSet;
		this.persist();
	}

	/**
	 * Collapse a category node (idempotent)
	 *
	 * @param nodeId - Category node ID to collapse
	 */
	collapse(nodeId: string): void {
		const newSet = new Set(this.expandedNodes);
		newSet.delete(nodeId);
		this.expandedNodes = newSet;
		this.persist();
	}

	/**
	 * Expand all nodes in a path (for revealing deep nodes)
	 *
	 * @param nodeIds - Array of category node IDs to expand
	 *
	 * @example
	 * state.expandPath(['dynamic-programming', 'dp-2d-array']);
	 */
	expandPath(nodeIds: string[]): void {
		const newSet = new Set(this.expandedNodes);
		for (const nodeId of nodeIds) {
			newSet.add(nodeId);
		}
		this.expandedNodes = newSet;

		this.persist();
	}

	/**
	 * Set the active algorithm
	 *
	 * @param algorithmId - Algorithm node ID to set as active
	 */
	setActive(algorithmId: string): void {
		this.activeAlgorithmId = algorithmId;
	}

	/**
	 * Clear the active algorithm
	 */
	clearActive(): void {
		this.activeAlgorithmId = null;
	}

	/**
	 * Toggle sidebar visibility
	 */
	toggleSidebar(): void {
		this.sidebarOpen = !this.sidebarOpen;
		this.persistSidebar();
	}

	/**
	 * Check if a category node is expanded
	 *
	 * @param nodeId - Category node ID to check
	 * @returns True if the node is expanded
	 */
	isExpanded(nodeId: string): boolean {
		return this.expandedNodes.has(nodeId);
	}

	/**
	 * Check if an algorithm is active
	 *
	 * @param algorithmId - Algorithm node ID to check
	 * @returns True if the algorithm is active
	 */
	isActive(algorithmId: string): boolean {
		return this.activeAlgorithmId === algorithmId;
	}

	/**
	 * Load persisted state from localStorage/sessionStorage
	 */
	private loadPersistedState(): void {
		// Load expanded nodes from localStorage
		if (typeof window !== 'undefined' && window.localStorage) {
			const stored = localStorage.getItem(EXPANDED_NODES_KEY);
			if (stored) {
				this.expandedNodes = deserializeExpandedNodes(stored);
			}
		}

		// Load sidebar visibility from sessionStorage
		if (typeof window !== 'undefined' && window.sessionStorage) {
			const stored = sessionStorage.getItem(SIDEBAR_OPEN_KEY);
			if (stored) {
				this.sidebarOpen = deserializeSidebarVisibility(stored);
			}
		}
	}

	/**
	 * Persist expanded nodes to localStorage
	 */
	private persist(): void {
		if (typeof window !== 'undefined' && window.localStorage) {
			const serialized = serializeExpandedNodes(this.expandedNodes);
			localStorage.setItem(EXPANDED_NODES_KEY, serialized);
		}
	}

	/**
	 * Persist sidebar visibility to sessionStorage
	 */
	private persistSidebar(): void {
		if (typeof window !== 'undefined' && window.sessionStorage) {
			const serialized = serializeSidebarVisibility(this.sidebarOpen);
			sessionStorage.setItem(SIDEBAR_OPEN_KEY, serialized);
		}
	}
}

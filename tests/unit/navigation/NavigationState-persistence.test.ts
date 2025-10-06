import { describe, it, expect, beforeEach } from 'vitest';
import { NavigationState } from '$lib/core/NavigationState.svelte';
import {
	serializeExpandedNodes,
	deserializeExpandedNodes
} from '$lib/types/navigation-schema';

describe('NavigationState Persistence', () => {
	// Mock localStorage
	const localStorageMock = (() => {
		let store: Record<string, string> = {};

		return {
			getItem: (key: string) => store[key] || null,
			setItem: (key: string, value: string) => {
				store[key] = value.toString();
			},
			clear: () => {
				store = {};
			},
			// Expose internal store for testing
			_getStore: () => store
		};
	})();

	beforeEach(() => {
		// Replace global localStorage with mock
		Object.defineProperty(window, 'localStorage', {
			value: localStorageMock,
			writable: true
		});
		localStorageMock.clear();
	});

	describe('toggle() persistence', () => {
		it('should write to localStorage when expanding node', () => {
			const state = new NavigationState();

			state.toggle('graphs');

			const stored = localStorage.getItem('algovis_expanded_nodes');
			expect(stored).not.toBeNull();

			if (stored) {
				const deserialized = deserializeExpandedNodes(stored);
				expect(deserialized.has('graphs')).toBe(true);
			}
		});

		it('should write to localStorage when collapsing node', () => {
			const state = new NavigationState();

			state.toggle('graphs'); // Expand
			state.toggle('graphs'); // Collapse

			const stored = localStorage.getItem('algovis_expanded_nodes');
			expect(stored).not.toBeNull();

			if (stored) {
				const deserialized = deserializeExpandedNodes(stored);
				expect(deserialized.has('graphs')).toBe(false);
			}
		});

		it('should persist multiple expanded nodes', () => {
			const state = new NavigationState();

			state.toggle('graphs');
			state.toggle('dynamic-programming');
			state.toggle('dp-2d-array');

			const stored = localStorage.getItem('algovis_expanded_nodes');
			expect(stored).not.toBeNull();

			if (stored) {
				const deserialized = deserializeExpandedNodes(stored);
				expect(deserialized.has('graphs')).toBe(true);
				expect(deserialized.has('dynamic-programming')).toBe(true);
				expect(deserialized.has('dp-2d-array')).toBe(true);
				expect(deserialized.size).toBe(3);
			}
		});
	});

	describe('expand() persistence', () => {
		it('should write to localStorage when expanding', () => {
			const state = new NavigationState();

			state.expand('graphs');

			const stored = localStorage.getItem('algovis_expanded_nodes');
			expect(stored).not.toBeNull();

			if (stored) {
				const deserialized = deserializeExpandedNodes(stored);
				expect(deserialized.has('graphs')).toBe(true);
			}
		});
	});

	describe('collapse() persistence', () => {
		it('should write to localStorage when collapsing', () => {
			const state = new NavigationState();

			state.expand('graphs');
			state.collapse('graphs');

			const stored = localStorage.getItem('algovis_expanded_nodes');
			expect(stored).not.toBeNull();

			if (stored) {
				const deserialized = deserializeExpandedNodes(stored);
				expect(deserialized.has('graphs')).toBe(false);
			}
		});
	});

	describe('expandPath() persistence', () => {
		it('should persist all expanded nodes in path', () => {
			const state = new NavigationState();

			state.expandPath(['graphs', 'graphs-path-finding']);

			const stored = localStorage.getItem('algovis_expanded_nodes');
			expect(stored).not.toBeNull();

			if (stored) {
				const deserialized = deserializeExpandedNodes(stored);
				expect(deserialized.has('graphs')).toBe(true);
				expect(deserialized.has('graphs-path-finding')).toBe(true);
				expect(deserialized.size).toBe(2);
			}
		});
	});

	describe('constructor loading from localStorage', () => {
		it('should load expandedNodes from localStorage on initialization', () => {
			// Pre-populate localStorage
			const expandedNodes = new Set(['graphs', 'dynamic-programming']);
			const serialized = serializeExpandedNodes(expandedNodes);
			localStorage.setItem('algovis_expanded_nodes', serialized);

			const state = new NavigationState();

			expect(state.isExpanded('graphs')).toBe(true);
			expect(state.isExpanded('dynamic-programming')).toBe(true);
		});

		it('should initialize with empty Set when localStorage is empty', () => {
			// localStorage is already cleared in beforeEach

			const state = new NavigationState();

			expect(state.isExpanded('graphs')).toBe(false);
			expect(state.isExpanded('dynamic-programming')).toBe(false);
		});

		it('should handle invalid localStorage data gracefully', () => {
			// Write invalid JSON to localStorage
			localStorage.setItem('algovis_expanded_nodes', '{ invalid json }');

			const state = new NavigationState();

			// Should default to empty Set, not throw
			expect(state.isExpanded('graphs')).toBe(false);
		});

		it('should handle non-array JSON data gracefully', () => {
			// Write valid JSON but wrong type
			localStorage.setItem('algovis_expanded_nodes', JSON.stringify({ key: 'value' }));

			const state = new NavigationState();

			// Should default to empty Set
			expect(state.isExpanded('graphs')).toBe(false);
		});

		it('should handle localStorage with invalid node IDs', () => {
			// Write array with non-kebab-case IDs
			localStorage.setItem(
				'algovis_expanded_nodes',
				JSON.stringify(['InvalidNode', 'node with spaces'])
			);

			const state = new NavigationState();

			// Should filter out or default to empty
			expect(state.isExpanded('InvalidNode')).toBe(false);
			expect(state.isExpanded('node with spaces')).toBe(false);
		});
	});

	describe('sessionStorage for sidebar visibility', () => {
		// Mock sessionStorage
		const sessionStorageMock = (() => {
			let store: Record<string, string> = {};

			return {
				getItem: (key: string) => store[key] || null,
				setItem: (key: string, value: string) => {
					store[key] = value.toString();
				},
				clear: () => {
					store = {};
				}
			};
		})();

		beforeEach(() => {
			Object.defineProperty(window, 'sessionStorage', {
				value: sessionStorageMock,
				writable: true
			});
			sessionStorageMock.clear();
		});

		it('should write sidebar state to sessionStorage on toggle', () => {
			const state = new NavigationState();

			state.toggleSidebar(); // false

			const stored = sessionStorage.getItem('algovis_sidebar_open');
			expect(stored).not.toBeNull();

			if (stored) {
				expect(JSON.parse(stored)).toBe(false);
			}
		});

		it('should load sidebar state from sessionStorage on initialization', () => {
			// Pre-populate sessionStorage
			sessionStorage.setItem('algovis_sidebar_open', JSON.stringify(false));

			const state = new NavigationState();

			expect(state.sidebarOpen).toBe(false);
		});

		it('should default to true when sessionStorage is empty', () => {
			// sessionStorage is already cleared

			const state = new NavigationState();

			expect(state.sidebarOpen).toBe(true);
		});

		it('should handle invalid sessionStorage data gracefully', () => {
			sessionStorage.setItem('algovis_sidebar_open', 'invalid json');

			const state = new NavigationState();

			// Should default to true
			expect(state.sidebarOpen).toBe(true);
		});
	});

	describe('persistence data format', () => {
		it('should store expandedNodes as JSON array of strings', () => {
			const state = new NavigationState();

			state.expand('graphs');
			state.expand('dynamic-programming');

			const stored = localStorage.getItem('algovis_expanded_nodes');
			expect(stored).not.toBeNull();

			if (stored) {
				const parsed = JSON.parse(stored);
				expect(Array.isArray(parsed)).toBe(true);
				expect(parsed).toContain('graphs');
				expect(parsed).toContain('dynamic-programming');
			}
		});

		it('should store sidebar visibility as JSON boolean', () => {
			const state = new NavigationState();

			state.toggleSidebar(); // false

			const stored = sessionStorage.getItem('algovis_sidebar_open');
			expect(stored).not.toBeNull();

			if (stored) {
				const parsed = JSON.parse(stored);
				expect(typeof parsed).toBe('boolean');
				expect(parsed).toBe(false);
			}
		});
	});

	describe('persistence isolation', () => {
		it('should not interfere with other localStorage keys', () => {
			localStorage.setItem('other_key', 'other_value');

			const state = new NavigationState();
			state.expand('graphs');

			expect(localStorage.getItem('other_key')).toBe('other_value');
		});

		it('should not interfere with other sessionStorage keys', () => {
			sessionStorage.setItem('other_key', 'other_value');

			const state = new NavigationState();
			state.toggleSidebar();

			expect(sessionStorage.getItem('other_key')).toBe('other_value');
		});
	});
});

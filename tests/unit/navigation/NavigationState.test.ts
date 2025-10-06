import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NavigationState } from '$lib/core/NavigationState.svelte';

describe('NavigationState Core Logic', () => {
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
			}
		};
	})();

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
		// Replace global localStorage with mock
		Object.defineProperty(window, 'localStorage', {
			value: localStorageMock,
			writable: true
		});
		localStorageMock.clear();

		// Replace global sessionStorage with mock
		Object.defineProperty(window, 'sessionStorage', {
			value: sessionStorageMock,
			writable: true
		});
		sessionStorageMock.clear();
	});

	describe('toggle()', () => {
		it('should add node to expandedNodes when collapsed', () => {
			const state = new NavigationState();

			expect(state.isExpanded('graphs')).toBe(false);

			state.toggle('graphs');

			expect(state.isExpanded('graphs')).toBe(true);
		});

		it('should remove node from expandedNodes when expanded', () => {
			const state = new NavigationState();

			state.toggle('graphs'); // Expand
			expect(state.isExpanded('graphs')).toBe(true);

			state.toggle('graphs'); // Collapse

			expect(state.isExpanded('graphs')).toBe(false);
		});

		it('should be idempotent when toggling twice', () => {
			const state = new NavigationState();

			state.toggle('graphs'); // Expand
			state.toggle('graphs'); // Collapse
			state.toggle('graphs'); // Expand again

			expect(state.isExpanded('graphs')).toBe(true);
		});
	});

	describe('expand()', () => {
		it('should add node to expandedNodes', () => {
			const state = new NavigationState();

			expect(state.isExpanded('dynamic-programming')).toBe(false);

			state.expand('dynamic-programming');

			expect(state.isExpanded('dynamic-programming')).toBe(true);
		});

		it('should be idempotent (calling twice has no effect)', () => {
			const state = new NavigationState();

			state.expand('dp-2d-array');
			state.expand('dp-2d-array');

			expect(state.isExpanded('dp-2d-array')).toBe(true);
		});

		it('should allow expanding multiple nodes', () => {
			const state = new NavigationState();

			state.expand('graphs');
			state.expand('dynamic-programming');
			state.expand('dp-2d-array');

			expect(state.isExpanded('graphs')).toBe(true);
			expect(state.isExpanded('dynamic-programming')).toBe(true);
			expect(state.isExpanded('dp-2d-array')).toBe(true);
		});
	});

	describe('collapse()', () => {
		it('should remove node from expandedNodes', () => {
			const state = new NavigationState();

			state.expand('graphs');
			expect(state.isExpanded('graphs')).toBe(true);

			state.collapse('graphs');

			expect(state.isExpanded('graphs')).toBe(false);
		});

		it('should be idempotent (calling on collapsed node has no effect)', () => {
			const state = new NavigationState();

			state.collapse('graphs'); // Already collapsed

			expect(state.isExpanded('graphs')).toBe(false);
		});

		it('should not affect other expanded nodes', () => {
			const state = new NavigationState();

			state.expand('graphs');
			state.expand('dynamic-programming');

			state.collapse('graphs');

			expect(state.isExpanded('graphs')).toBe(false);
			expect(state.isExpanded('dynamic-programming')).toBe(true);
		});
	});

	describe('expandPath()', () => {
		it('should expand all nodes in the path', () => {
			const state = new NavigationState();

			state.expandPath(['graphs', 'graphs-path-finding']);

			expect(state.isExpanded('graphs')).toBe(true);
			expect(state.isExpanded('graphs-path-finding')).toBe(true);
		});

		it('should handle empty path array', () => {
			const state = new NavigationState();

			state.expandPath([]);

			// Should not throw, state remains unchanged
			expect(state.isExpanded('graphs')).toBe(false);
		});

		it('should handle single-element path', () => {
			const state = new NavigationState();

			state.expandPath(['dynamic-programming']);

			expect(state.isExpanded('dynamic-programming')).toBe(true);
		});

		it('should expand deeply nested paths', () => {
			const state = new NavigationState();

			state.expandPath(['dynamic-programming', 'dp-2d-array', 'dp-hard-problems']);

			expect(state.isExpanded('dynamic-programming')).toBe(true);
			expect(state.isExpanded('dp-2d-array')).toBe(true);
			expect(state.isExpanded('dp-hard-problems')).toBe(true);
		});
	});

	describe('setActive()', () => {
		it('should set activeAlgorithmId', () => {
			const state = new NavigationState();

			expect(state.isActive('trapping-rain-water-2')).toBe(false);

			state.setActive('trapping-rain-water-2');

			expect(state.isActive('trapping-rain-water-2')).toBe(true);
		});

		it('should replace previous active algorithm', () => {
			const state = new NavigationState();

			state.setActive('trapping-rain-water-2');
			expect(state.isActive('trapping-rain-water-2')).toBe(true);

			state.setActive('unique-paths-obstacles');

			expect(state.isActive('trapping-rain-water-2')).toBe(false);
			expect(state.isActive('unique-paths-obstacles')).toBe(true);
		});

		it('should handle setting the same algorithm twice', () => {
			const state = new NavigationState();

			state.setActive('trapping-rain-water-2');
			state.setActive('trapping-rain-water-2');

			expect(state.isActive('trapping-rain-water-2')).toBe(true);
		});
	});

	describe('clearActive()', () => {
		it('should set activeAlgorithmId to null', () => {
			const state = new NavigationState();

			state.setActive('trapping-rain-water-2');
			expect(state.isActive('trapping-rain-water-2')).toBe(true);

			state.clearActive();

			expect(state.isActive('trapping-rain-water-2')).toBe(false);
		});

		it('should be idempotent when called on null state', () => {
			const state = new NavigationState();

			state.clearActive(); // Already null

			expect(state.isActive('any-algorithm')).toBe(false);
		});
	});

	describe('toggleSidebar()', () => {
		it('should toggle sidebarOpen from true to false', () => {
			const state = new NavigationState();

			// Default is true
			expect(state.sidebarOpen).toBe(true);

			state.toggleSidebar();

			expect(state.sidebarOpen).toBe(false);
		});

		it('should toggle sidebarOpen from false to true', () => {
			const state = new NavigationState();

			state.toggleSidebar(); // false
			state.toggleSidebar(); // true

			expect(state.sidebarOpen).toBe(true);
		});

		it('should toggle multiple times correctly', () => {
			const state = new NavigationState();

			state.toggleSidebar(); // false
			state.toggleSidebar(); // true
			state.toggleSidebar(); // false
			state.toggleSidebar(); // true

			expect(state.sidebarOpen).toBe(true);
		});
	});

	describe('isExpanded()', () => {
		it('should return true for expanded nodes', () => {
			const state = new NavigationState();

			state.expand('graphs');

			expect(state.isExpanded('graphs')).toBe(true);
		});

		it('should return false for collapsed nodes', () => {
			const state = new NavigationState();

			expect(state.isExpanded('graphs')).toBe(false);
		});

		it('should return false for non-existent nodes', () => {
			const state = new NavigationState();

			expect(state.isExpanded('non-existent-node')).toBe(false);
		});
	});

	describe('isActive()', () => {
		it('should return true for active algorithm', () => {
			const state = new NavigationState();

			state.setActive('trapping-rain-water-2');

			expect(state.isActive('trapping-rain-water-2')).toBe(true);
		});

		it('should return false for inactive algorithm', () => {
			const state = new NavigationState();

			state.setActive('trapping-rain-water-2');

			expect(state.isActive('unique-paths-obstacles')).toBe(false);
		});

		it('should return false when no algorithm is active', () => {
			const state = new NavigationState();

			expect(state.isActive('any-algorithm')).toBe(false);
		});
	});

	describe('initial state', () => {
		it('should initialize with empty expandedNodes', () => {
			const state = new NavigationState();

			expect(state.isExpanded('graphs')).toBe(false);
			expect(state.isExpanded('dynamic-programming')).toBe(false);
		});

		it('should initialize with null activeAlgorithmId', () => {
			const state = new NavigationState();

			expect(state.isActive('any-algorithm')).toBe(false);
		});

		it('should initialize with sidebarOpen = true', () => {
			const state = new NavigationState();

			expect(state.sidebarOpen).toBe(true);
		});
	});
});

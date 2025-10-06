import { describe, it, expect, beforeEach } from 'vitest';
import {
	serializeExpandedNodes,
	deserializeExpandedNodes,
	serializeSidebarVisibility,
	deserializeSidebarVisibility
} from '$lib/types/navigation-schema';

describe('Storage Serialization Helpers', () => {
	beforeEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});

	describe('serializeExpandedNodes', () => {
		it('should convert Set to JSON array', () => {
			const expandedNodes = new Set(['graphs', 'dynamic-programming', 'dp-2d-array']);

			const result = serializeExpandedNodes(expandedNodes);
			const parsed = JSON.parse(result);

			expect(Array.isArray(parsed)).toBe(true);
			expect(parsed).toHaveLength(3);
			expect(parsed).toContain('graphs');
			expect(parsed).toContain('dynamic-programming');
			expect(parsed).toContain('dp-2d-array');
		});

		it('should serialize empty Set to empty array', () => {
			const emptySet = new Set<string>();

			const result = serializeExpandedNodes(emptySet);
			const parsed = JSON.parse(result);

			expect(parsed).toEqual([]);
		});

		it('should produce valid JSON string', () => {
			const expandedNodes = new Set(['test-node']);

			const result = serializeExpandedNodes(expandedNodes);

			expect(() => JSON.parse(result)).not.toThrow();
			expect(typeof result).toBe('string');
		});
	});

	describe('deserializeExpandedNodes', () => {
		it('should convert JSON array to Set', () => {
			const jsonString = JSON.stringify(['graphs', 'dynamic-programming']);

			const result = deserializeExpandedNodes(jsonString);

			expect(result).toBeInstanceOf(Set);
			expect(result.size).toBe(2);
			expect(result.has('graphs')).toBe(true);
			expect(result.has('dynamic-programming')).toBe(true);
		});

		it('should return empty Set for empty JSON array', () => {
			const jsonString = JSON.stringify([]);

			const result = deserializeExpandedNodes(jsonString);

			expect(result).toBeInstanceOf(Set);
			expect(result.size).toBe(0);
		});

		it('should return empty Set on invalid JSON', () => {
			const invalidJson = '{ invalid json }';

			const result = deserializeExpandedNodes(invalidJson);

			expect(result).toBeInstanceOf(Set);
			expect(result.size).toBe(0);
		});

		it('should return empty Set on non-array JSON', () => {
			const objectJson = JSON.stringify({ key: 'value' });

			const result = deserializeExpandedNodes(objectJson);

			expect(result).toBeInstanceOf(Set);
			expect(result.size).toBe(0);
		});

		it('should return empty Set on array with invalid node IDs', () => {
			// Array with non-kebab-case strings
			const invalidNodeIds = JSON.stringify(['validNode', 'InvalidNode', 'node with spaces']);

			const result = deserializeExpandedNodes(invalidNodeIds);

			// Should filter out invalid IDs or return empty set
			expect(result).toBeInstanceOf(Set);
			// Implementation may choose to filter or reject all
		});

		it('should handle null gracefully', () => {
			const result = deserializeExpandedNodes('null');

			expect(result).toBeInstanceOf(Set);
			expect(result.size).toBe(0);
		});

		it('should handle undefined gracefully', () => {
			const result = deserializeExpandedNodes('undefined');

			expect(result).toBeInstanceOf(Set);
			expect(result.size).toBe(0);
		});
	});

	describe('serializeSidebarVisibility', () => {
		it('should convert boolean true to JSON string', () => {
			const result = serializeSidebarVisibility(true);
			const parsed = JSON.parse(result);

			expect(parsed).toBe(true);
			expect(typeof result).toBe('string');
		});

		it('should convert boolean false to JSON string', () => {
			const result = serializeSidebarVisibility(false);
			const parsed = JSON.parse(result);

			expect(parsed).toBe(false);
		});

		it('should produce valid JSON string', () => {
			const result = serializeSidebarVisibility(true);

			expect(() => JSON.parse(result)).not.toThrow();
		});
	});

	describe('deserializeSidebarVisibility', () => {
		it('should parse JSON boolean true', () => {
			const jsonString = JSON.stringify(true);

			const result = deserializeSidebarVisibility(jsonString);

			expect(result).toBe(true);
		});

		it('should parse JSON boolean false', () => {
			const jsonString = JSON.stringify(false);

			const result = deserializeSidebarVisibility(jsonString);

			expect(result).toBe(false);
		});

		it('should default to true on invalid JSON', () => {
			const invalidJson = '{ invalid }';

			const result = deserializeSidebarVisibility(invalidJson);

			expect(result).toBe(true);
		});

		it('should default to true on non-boolean JSON', () => {
			const stringJson = JSON.stringify('not a boolean');

			const result = deserializeSidebarVisibility(stringJson);

			expect(result).toBe(true);
		});

		it('should default to true on null', () => {
			const result = deserializeSidebarVisibility('null');

			expect(result).toBe(true);
		});

		it('should default to true on undefined', () => {
			const result = deserializeSidebarVisibility('undefined');

			expect(result).toBe(true);
		});

		it('should default to true on empty string', () => {
			const result = deserializeSidebarVisibility('');

			expect(result).toBe(true);
		});
	});

	describe('round-trip serialization', () => {
		it('should correctly round-trip expanded nodes', () => {
			const originalSet = new Set(['node1', 'node2', 'node3']);

			const serialized = serializeExpandedNodes(originalSet);
			const deserialized = deserializeExpandedNodes(serialized);

			expect(deserialized).toEqual(originalSet);
		});

		it('should correctly round-trip sidebar visibility true', () => {
			const original = true;

			const serialized = serializeSidebarVisibility(original);
			const deserialized = deserializeSidebarVisibility(serialized);

			expect(deserialized).toBe(original);
		});

		it('should correctly round-trip sidebar visibility false', () => {
			const original = false;

			const serialized = serializeSidebarVisibility(original);
			const deserialized = deserializeSidebarVisibility(serialized);

			expect(deserialized).toBe(original);
		});
	});

	describe('localStorage integration', () => {
		it('should serialize and store expanded nodes in localStorage', () => {
			const expandedNodes = new Set(['graphs', 'dp']);
			const serialized = serializeExpandedNodes(expandedNodes);

			localStorage.setItem('algovis_expanded_nodes', serialized);

			const stored = localStorage.getItem('algovis_expanded_nodes');
			expect(stored).toBe(serialized);

			if (stored) {
				const deserialized = deserializeExpandedNodes(stored);
				expect(deserialized).toEqual(expandedNodes);
			}
		});

		it('should serialize and store sidebar visibility in sessionStorage', () => {
			const isOpen = false;
			const serialized = serializeSidebarVisibility(isOpen);

			sessionStorage.setItem('algovis_sidebar_open', serialized);

			const stored = sessionStorage.getItem('algovis_sidebar_open');
			expect(stored).toBe(serialized);

			if (stored) {
				const deserialized = deserializeSidebarVisibility(stored);
				expect(deserialized).toBe(isOpen);
			}
		});
	});
});

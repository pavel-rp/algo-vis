/**
 * Generic MinHeap Implementation
 * Feature: 004-we-ll-implement (Swim in Water)
 * Task: T013
 *
 * Purpose: Reusable min-heap data structure with snapshot capability for visualization
 * Performance: O(log n) push/pop operations
 * Source: Extracted and generalized from trappingRainWater2.ts
 */

export class MinHeap<T> {
	private heap: T[] = [];
	private compareFn: (a: T, b: T) => number;

	/**
	 * Create a MinHeap with a custom comparator function
	 * @param compareFn - Function that returns a negative number if a < b, positive if a > b, 0 if equal
	 *                    Default: assumes T has numeric values and compares them directly
	 */
	constructor(compareFn?: (a: T, b: T) => number) {
		this.compareFn =
			compareFn ||
			((a: any, b: any) => {
				if (typeof a === 'number' && typeof b === 'number') {
					return a - b;
				}
				throw new Error('MinHeap requires a compareFn for non-numeric types');
			});
	}

	/**
	 * Add an element to the heap
	 * @param node - Element to add
	 * Time complexity: O(log n)
	 */
	push(node: T): void {
		this.heap.push(node);
		this.bubbleUp(this.heap.length - 1);
	}

	/**
	 * Remove and return the minimum element
	 * @returns The minimum element, or undefined if heap is empty
	 * Time complexity: O(log n)
	 */
	pop(): T | undefined {
		if (this.heap.length === 0) return undefined;
		if (this.heap.length === 1) return this.heap.pop();

		const min = this.heap[0];
		this.heap[0] = this.heap.pop()!;
		this.bubbleDown(0);
		return min;
	}

	/**
	 * Get the minimum element without removing it
	 * @returns The minimum element, or undefined if heap is empty
	 * Time complexity: O(1)
	 */
	peek(): T | undefined {
		return this.heap[0];
	}

	/**
	 * Check if the heap is empty
	 * @returns True if heap is empty
	 * Time complexity: O(1)
	 */
	isEmpty(): boolean {
		return this.heap.length === 0;
	}

	/**
	 * Get the number of elements in the heap
	 * @returns The size of the heap
	 * Time complexity: O(1)
	 */
	size(): number {
		return this.heap.length;
	}

	/**
	 * Get a shallow copy of the heap as an array
	 * Used for visualization snapshots
	 * @returns Array of heap elements (not in sorted order)
	 * Time complexity: O(n)
	 */
	toArray(): T[] {
		return [...this.heap];
	}

	/**
	 * Restore heap property by moving element up
	 * @param index - Index of element to bubble up
	 */
	private bubbleUp(index: number): void {
		while (index > 0) {
			const parentIndex = Math.floor((index - 1) / 2);
			if (this.compareFn(this.heap[index], this.heap[parentIndex]) >= 0) break;
			[this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
			index = parentIndex;
		}
	}

	/**
	 * Restore heap property by moving element down
	 * @param index - Index of element to bubble down
	 */
	private bubbleDown(index: number): void {
		while (true) {
			let smallest = index;
			const left = 2 * index + 1;
			const right = 2 * index + 2;

			if (
				left < this.heap.length &&
				this.compareFn(this.heap[left], this.heap[smallest]) < 0
			) {
				smallest = left;
			}
			if (
				right < this.heap.length &&
				this.compareFn(this.heap[right], this.heap[smallest]) < 0
			) {
				smallest = right;
			}
			if (smallest === index) break;

			[this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
			index = smallest;
		}
	}
}

/**
 * Example usage:
 *
 * // For numbers (default comparator)
 * const numHeap = new MinHeap<number>();
 * numHeap.push(5);
 * numHeap.push(2);
 * numHeap.push(8);
 * console.log(numHeap.pop()); // 2
 *
 * // For objects with custom comparator
 * interface Cell {
 *   row: number;
 *   col: number;
 *   elevation: number;
 * }
 *
 * const cellHeap = new MinHeap<Cell>((a, b) => a.elevation - b.elevation);
 * cellHeap.push({ row: 0, col: 0, elevation: 5 });
 * cellHeap.push({ row: 1, col: 0, elevation: 2 });
 * console.log(cellHeap.pop()); // { row: 1, col: 0, elevation: 2 }
 *
 * // For visualization snapshots
 * const snapshot = cellHeap.toArray().slice(0, 5); // Top 5 elements
 */

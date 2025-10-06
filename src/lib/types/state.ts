/**
 * State type definitions for different visualization types
 */

/** Grid state for 2D grid-based algorithms */
export interface GridState {
	/** Current grid values */
	grid: number[][];
	/** Which cells have been visited/processed */
	visited: boolean[][];
	/** Optional: overlay data (e.g., water levels) */
	water?: number[][];
	/** Optional: algorithm-specific data structures (e.g., heap) */
	heap?: any[];
	/** Extensible for algorithm-specific state */
	[key: string]: any;
}

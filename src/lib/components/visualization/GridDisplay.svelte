<script lang="ts">
	/**
	 * GridDisplay - Shared Grid Visualization Component
	 * Feature: 004-we-ll-implement
	 * Task: T006
	 *
	 * Algorithm-agnostic grid display with cell states and highlighting.
	 * Supports grids up to 50×50 (2,500 cells).
	 */

	import type { GridDisplayProps } from '$lib/types/visualization';

	interface Props extends GridDisplayProps {}

	let { grid, cellStates, highlightedCells, onCellClick }: Props = $props();

	function getCellClasses(row: number, col: number): string {
		const state = cellStates[row][col];
		const isHighlighted = highlightedCells?.some((c) => c.row === row && c.col === col);

		let classes =
			'w-10 h-10 flex items-center justify-center rounded transition-colors duration-200 border ';

		// Apply state-based styling
		switch (state) {
			case 'visited':
				classes += 'bg-blue-100 dark:bg-blue-900 border-blue-400 text-blue-900 dark:text-blue-100';
				break;
			case 'processing':
				classes +=
					'bg-yellow-200 dark:bg-yellow-700 border-yellow-500 text-yellow-900 dark:text-yellow-100 animate-pulse';
				break;
			case 'unvisited':
			default:
				classes +=
					'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100';
		}

		// Apply highlight styling
		if (isHighlighted) {
			classes += ' ring-2 ring-green-500 ring-offset-1';
		}

		// Add interactivity if click handler provided
		if (onCellClick) {
			classes += ' cursor-pointer hover:scale-105 hover:shadow-md';
		}

		return classes;
	}
</script>

<div class="grid-container overflow-auto p-4">
	{#if grid.length === 0}
		<div class="text-gray-500 dark:text-gray-400 text-center py-8">No grid data available</div>
	{:else}
		<div
			class="grid gap-0.5 w-fit mx-auto"
			style="grid-template-columns: repeat({grid[0].length}, 40px);"
		>
			{#each grid as row, rowIdx}
				{#each row as value, colIdx}
					<div
						class={getCellClasses(rowIdx, colIdx)}
						onclick={() => onCellClick?.(rowIdx, colIdx)}
						role={onCellClick ? 'button' : undefined}
						tabindex={onCellClick ? 0 : undefined}
						onkeydown={(e) => {
							if (onCellClick && (e.key === 'Enter' || e.key === ' ')) {
								e.preventDefault();
								onCellClick(rowIdx, colIdx);
							}
						}}
					>
						<span class="text-xs font-semibold">
							{value}
						</span>
					</div>
				{/each}
			{/each}
		</div>
	{/if}
</div>

<style>
	.grid-container {
		max-width: 100%;
		max-height: 600px;
	}

	@media (max-width: 640px) {
		.grid-container {
			max-height: 400px;
		}
	}
</style>

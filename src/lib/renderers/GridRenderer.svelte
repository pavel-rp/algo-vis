<script lang="ts">
	import type { Frame } from '$lib/types';
	import type { GridState } from '$lib/types/state';

	interface Props {
		frame: Frame<GridState> | null;
		heightMap: number[][];
		mode?: 'height' | 'obstacle' | 'dp'; // Display mode
	}

	let { frame, heightMap, mode = 'height' }: Props = $props();

	// Compute cell styling based on focus/neighbors
	function getCellClasses(rowIdx: number, colIdx: number): string {
		if (!frame) return 'bg-gray-100 dark:bg-gray-800';

		const cellId = `${rowIdx},${colIdx}`;
		const isFocus = frame.focus?.some((f) => f.id === cellId);
		const isNeighbor = frame.neighbors?.some((n) => n.id === cellId);
		const isVisited = frame.state.visited?.[rowIdx]?.[colIdx];
		const isObstacle = mode === 'obstacle' && heightMap[rowIdx][colIdx] === 1;

		if (isObstacle) return 'bg-gray-800 dark:bg-gray-900 border-2 border-gray-600';
		if (isFocus) return 'bg-[var(--cell-focus)] border-2 border-orange-600';
		if (isNeighbor) return 'bg-[var(--cell-neighbor)] border-2 border-green-600';
		if (isVisited) return 'bg-[var(--cell-visited)] border border-blue-400';
		return 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600';
	}

	function getWaterHeight(rowIdx: number, colIdx: number): number {
		return frame?.state.water?.[rowIdx]?.[colIdx] ?? 0;
	}

	function getDPValue(rowIdx: number, colIdx: number): number | null {
		return frame?.state.dp?.[rowIdx]?.[colIdx] ?? null;
	}

	function getCellDisplay(rowIdx: number, colIdx: number): string {
		const isObstacle = heightMap[rowIdx][colIdx] === 1;

		if (mode === 'obstacle') {
			const dpVal = getDPValue(rowIdx, colIdx);
			if (isObstacle) {
				return '🚫';
			}
			// Show DP value if computed, otherwise empty
			return dpVal !== null && dpVal !== undefined ? String(dpVal) : '';
		} else if (mode === 'dp') {
			const dpVal = getDPValue(rowIdx, colIdx);
			return dpVal !== null ? String(dpVal) : '';
		}
		return String(heightMap[rowIdx][colIdx]);
	}
</script>

<div class="grid-container overflow-auto p-4">
	{#if heightMap.length === 0}
		<div class="text-gray-500 text-center py-8">No grid data available</div>
	{:else}
		<div
			class="grid gap-0.5 w-fit mx-auto"
			style="grid-template-columns: repeat({heightMap[0].length}, 40px);"
		>
			{#each heightMap as row, rowIdx}
				{#each row as height, colIdx}
					{@const water = getWaterHeight(rowIdx, colIdx)}
					{@const cellDisplay = getCellDisplay(rowIdx, colIdx)}
					{@const isObstacle = mode === 'obstacle' && height === 1}
					<div
						class="relative w-10 h-10 flex flex-col items-center justify-center rounded transition-colors {getCellClasses(
							rowIdx,
							colIdx
						)}"
					>
						<!-- Cell value (height, obstacle marker, or DP value) -->
						<span
							class="text-[11px] font-semibold z-10 {isObstacle
								? 'text-white'
								: 'text-gray-900 dark:text-white'}"
						>
							{cellDisplay}
						</span>

						<!-- Water overlay (for water algorithms) -->
						{#if mode === 'height' && water > 0}
							<div
								class="absolute inset-0 bg-[var(--cell-water)] opacity-40 rounded flex items-end justify-center pb-0.5"
							>
								<span class="text-[10px] font-bold text-cyan-900">💧{water}</span>
							</div>
						{/if}
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
</style>

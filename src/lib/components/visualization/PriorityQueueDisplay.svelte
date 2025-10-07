<script lang="ts">
	/**
	 * PriorityQueueDisplay - Shared Priority Queue Visualization Component
	 * Feature: 004-we-ll-implement
	 * Task: T008
	 *
	 * Algorithm-agnostic priority queue display showing top K items.
	 * Used by both swimInWater and trappingRainWater2 algorithms.
	 */

	import type { PriorityQueueDisplayProps } from '$lib/types/visualization';

	interface Props extends PriorityQueueDisplayProps {}

	let { items, remainingCount, maxDisplay = 5 }: Props = $props();

	const displayedItems = $derived(items.slice(0, maxDisplay));
	const hasMore = $derived(remainingCount > 0);
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2">
	<h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Priority Queue</h3>

	{#if items.length === 0}
		<p class="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">Queue empty</p>
	{:else}
		<div class="space-y-1">
			{#each displayedItems as item, idx}
				<div
					class="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
				>
					<span class="text-gray-500 dark:text-gray-400 font-mono text-xs">#{idx + 1}</span>
					<span class="flex-1 text-center font-mono text-gray-900 dark:text-white"
						>{item.label}</span
					>
					<span class="text-xs text-gray-500 dark:text-gray-400">
						P: {item.priority}
					</span>
				</div>
			{/each}

			{#if hasMore}
				<div
					class="text-xs text-gray-500 dark:text-gray-400 text-center pt-1 italic border-t border-gray-200 dark:border-gray-600 mt-2"
				>
					+ {remainingCount} more item{remainingCount !== 1 ? 's' : ''}
				</div>
			{/if}
		</div>

		<!-- Queue summary -->
		<div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
			<div class="flex justify-between text-xs text-gray-600 dark:text-gray-400">
				<span>Total items:</span>
				<span class="font-semibold">{items.length + remainingCount}</span>
			</div>
		</div>
	{/if}
</div>

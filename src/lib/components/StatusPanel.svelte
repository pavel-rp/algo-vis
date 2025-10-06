<script lang="ts">
	import type { PlaybackController } from '$lib/core/PlaybackController.svelte';

	interface Props {
		controller: PlaybackController;
	}

	let { controller }: Props = $props();
</script>

<div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-3">
	<!-- Progress bar -->
	<div class="space-y-1">
		<div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
			<span>Step {controller.currentIndex + 1} of {controller.totalSteps}</span>
			<span>{Math.round(controller.progress)}%</span>
		</div>
		<div class="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
			<div
				class="bg-blue-500 h-full transition-all duration-200"
				style="width: {controller.progress}%"
			></div>
		</div>
	</div>

	<!-- Description -->
	{#if controller.currentFrame}
		<div class="text-sm">
			<p class="font-semibold text-gray-700 dark:text-gray-300 mb-1">Description:</p>
			<p class="text-gray-600 dark:text-gray-400">{controller.currentFrame.description}</p>
		</div>

		<!-- Metrics -->
		{#if controller.currentFrame.metrics && Object.keys(controller.currentFrame.metrics).length > 0}
			<div class="text-sm">
				<p class="font-semibold text-gray-700 dark:text-gray-300 mb-1">Metrics:</p>
				<div class="grid grid-cols-2 gap-2">
					{#each Object.entries(controller.currentFrame.metrics) as [key, value]}
						<div class="flex justify-between">
							<span class="text-gray-600 dark:text-gray-400">{key}:</span>
							<span class="font-mono text-gray-800 dark:text-gray-200">{value}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<p class="text-sm text-gray-500 dark:text-gray-500 italic">No trace loaded</p>
	{/if}
</div>

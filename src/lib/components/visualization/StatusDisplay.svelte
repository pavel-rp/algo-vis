<script lang="ts">
	/**
	 * StatusDisplay - Shared Status Visualization Component
	 * Feature: 004-we-ll-implement
	 * Task: T007
	 *
	 * Algorithm-agnostic metrics and progress display.
	 * Accepts plain data props (not coupled to PlaybackController).
	 */

	import type { StatusDisplayProps } from '$lib/types/visualization';

	interface Props extends StatusDisplayProps {}

	let { metrics, currentStep, totalSteps }: Props = $props();

	const progress = $derived(((currentStep / totalSteps) * 100).toFixed(1));
</script>

<div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-3">
	<!-- Progress indicator -->
	<div class="space-y-1">
		<div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
			<span>Step {currentStep + 1} of {totalSteps}</span>
			<span>{progress}%</span>
		</div>
		<div class="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
			<div
				class="bg-blue-500 h-full transition-all duration-200 ease-out"
				style="width: {progress}%"
			></div>
		</div>
	</div>

	<!-- Metrics display -->
	<div class="text-sm">
		<p class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Metrics:</p>
		<div class="grid grid-cols-1 gap-2">
			{#each Object.entries(metrics) as [key, value]}
				<div class="flex justify-between items-center gap-2">
					<span class="text-gray-600 dark:text-gray-400 text-left">{key}:</span>
					<span class="font-mono text-gray-800 dark:text-gray-200 text-right font-semibold">
						{value}
					</span>
				</div>
			{/each}
		</div>
	</div>
</div>

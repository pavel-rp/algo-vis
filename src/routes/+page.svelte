<script lang="ts">
	import { PlaybackController } from '$lib/core/PlaybackController.svelte';
	import GridRenderer from '$lib/renderers/GridRenderer.svelte';
	import PlaybackControls from '$lib/components/PlaybackControls.svelte';
	import SpeedControl from '$lib/components/SpeedControl.svelte';
	import StatusPanel from '$lib/components/StatusPanel.svelte';
	import { trappingRainWater2Plugin } from '$lib/plugins/trappingRainWater2';
	import { uniquePathsWithObstaclesPlugin } from '$lib/plugins/uniquePathsWithObstacles';

	const algorithms = [trappingRainWater2Plugin, uniquePathsWithObstaclesPlugin];

	const controller = new PlaybackController();
	let selectedAlgorithmIndex = $state(0);
	let selectedPresetIndex = $state(0);

	let currentAlgorithm = $derived(algorithms[selectedAlgorithmIndex]);
	let currentPreset = $derived(currentAlgorithm.presets[selectedPresetIndex]);
	let gridMode = $derived(
		currentAlgorithm.id === 'unique-paths-with-obstacles'
			? ('obstacle' as const)
			: ('height' as const)
	);

	// Load trace when algorithm or preset changes
	$effect(() => {
		const algorithm = algorithms[selectedAlgorithmIndex];
		const preset = algorithm.presets[selectedPresetIndex];
		const validation = algorithm.validateInput(preset.data);

		if (validation.valid) {
			const trace = algorithm.trace(preset.data);
			controller.loadTrace(trace);
		}
	});

	function handleAlgorithmChange(index: number) {
		selectedAlgorithmIndex = index;
		selectedPresetIndex = 0; // Reset to first preset when changing algorithms
	}

	function handlePresetChange(index: number) {
		selectedPresetIndex = index;
	}
</script>

<svelte:head>
	<title>Algorithm Visualizer - {currentAlgorithm.name}</title>
</svelte:head>

<div class="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-24">
	<div class="max-w-7xl mx-auto space-y-6 p-8">
		<!-- Header -->
		<header class="space-y-2">
			<h1 class="text-4xl font-bold">Algorithm Visualizer</h1>
			<p class="text-gray-600 dark:text-gray-400">
				Interactive step-by-step visualization of computer science algorithms
			</p>
		</header>

		<!-- Algorithm selector -->
		<div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
			<div class="block text-sm font-semibold mb-2">Select Algorithm:</div>
			<div class="flex gap-2 flex-wrap">
				{#each algorithms as algorithm, index}
					<button
						onclick={() => handleAlgorithmChange(index)}
						class="px-4 py-2 rounded transition-colors {selectedAlgorithmIndex === index
							? 'bg-purple-500 text-white'
							: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}"
					>
						{algorithm.name}
					</button>
				{/each}
			</div>
			<div class="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded">
				<p class="text-sm font-semibold text-gray-700 dark:text-gray-300">
					{currentAlgorithm.name}
				</p>
				<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
					{currentAlgorithm.description}
				</p>
				<span
					class="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
				>
					{currentAlgorithm.category}
				</span>
			</div>
		</div>

		<!-- Preset selector -->
		<div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
			<div class="block text-sm font-semibold mb-2">Select Preset:</div>
			<div class="flex gap-2 flex-wrap">
				{#each currentAlgorithm.presets as preset, index}
					<button
						onclick={() => handlePresetChange(index)}
						class="px-4 py-2 rounded transition-colors {selectedPresetIndex === index
							? 'bg-blue-500 text-white'
							: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}"
					>
						{preset.name}
					</button>
				{/each}
			</div>
			{#if currentPreset.description}
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
					{currentPreset.description}
				</p>
			{/if}
		</div>

		<!-- Main content -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Visualization -->
			<div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
				<GridRenderer frame={controller.currentFrame} heightMap={currentPreset.data} mode={gridMode} />
			</div>

			<!-- Status Panel -->
			<div class="space-y-4">
				<StatusPanel {controller} />
			</div>
		</div>

	</div>

	<!-- Controls - Sticky Footer -->
	<div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
		<div class="max-w-7xl mx-auto p-4">
			<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
				<PlaybackControls {controller} />
				<SpeedControl {controller} />
			</div>
		</div>
	</div>
</div>

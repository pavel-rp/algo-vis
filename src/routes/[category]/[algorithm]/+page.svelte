<script lang="ts">
	/**
	 * Algorithm Visualization Page
	 *
	 * Dynamic route for displaying algorithm visualizations.
	 * Loads algorithm plugin based on URL parameters and renders visualization.
	 *
	 * Feature: 003-move-the-navigation
	 * Date: 2025-10-06
	 */

	import type { PageData } from './$types';
	import { PlaybackController } from '$lib/core/PlaybackController.svelte';
	import GridRenderer from '$lib/renderers/GridRenderer.svelte';
	import PlaybackControls from '$lib/components/PlaybackControls.svelte';
	import SpeedControl from '$lib/components/SpeedControl.svelte';
	import StatusPanel from '$lib/components/StatusPanel.svelte';
	import { trappingRainWater2Plugin } from '$lib/plugins/trappingRainWater2';
	import { uniquePathsWithObstaclesPlugin } from '$lib/plugins/uniquePathsWithObstacles';

	// Props from load function
	let { data }: { data: PageData } = $props();

	// Map plugin IDs to plugin instances
	const pluginMap = {
		'trapping-rain-water-2': trappingRainWater2Plugin,
		'unique-paths-with-obstacles': uniquePathsWithObstaclesPlugin
	} as const;

	// Get algorithm plugin based on pluginId from route
	const algorithm = $derived(pluginMap[data.pluginId as keyof typeof pluginMap]);

	// Playback controller
	const controller = new PlaybackController();

	// Preset selection state
	let selectedPresetIndex = $state(0);
	let currentPreset = $derived(algorithm.presets[selectedPresetIndex]);

	// Grid mode based on algorithm
	let gridMode = $derived(
		algorithm.id === 'unique-paths-with-obstacles' ? ('obstacle' as const) : ('height' as const)
	);

	// Load trace when algorithm or preset changes
	$effect(() => {
		const preset = algorithm.presets[selectedPresetIndex];
		const validation = algorithm.validateInput(preset.data);

		if (validation.valid) {
			const trace = algorithm.trace(preset.data);
			controller.loadTrace(trace);
		}
	});

	function handlePresetChange(index: number) {
		selectedPresetIndex = index;
	}
</script>

<svelte:head>
	<title>{data.algorithmLabel} - Algorithm Visualizer</title>
</svelte:head>

<div class="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-24">
	<div class="max-w-7xl mx-auto space-y-6 p-8">
		<!-- Header -->
		<header class="space-y-2">
			<h1 class="text-4xl font-bold">{data.algorithmLabel}</h1>
			<p class="text-gray-600 dark:text-gray-400">
				{algorithm.description}
			</p>
			<div class="flex gap-2">
				<span
					class="inline-block px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
				>
					{algorithm.category}
				</span>
			</div>
		</header>

		<!-- Preset selector -->
		<div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
			<label for="preset-select" class="block text-sm font-semibold mb-2">Select Preset:</label>
			<div class="flex gap-2 flex-wrap">
				{#each algorithm.presets as preset, index}
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
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
				<StatusPanel {controller} />
			</div>
		</div>

	</div>

	<!-- Controls - Sticky Footer -->
	<div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40">
		<div class="max-w-7xl mx-auto p-4">
			<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
				<PlaybackControls {controller} />
				<SpeedControl {controller} />
			</div>
		</div>
	</div>
</div>

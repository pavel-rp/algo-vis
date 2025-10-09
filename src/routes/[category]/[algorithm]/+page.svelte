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
        import PhaseContainer from '$lib/components/visualization/PhaseContainer.svelte';
        import PlaybackControls from '$lib/components/PlaybackControls.svelte';
        import SpeedControl from '$lib/components/SpeedControl.svelte';
        import StatusPanel from '$lib/components/StatusPanel.svelte';
        import LegendPanel from '$lib/components/panels/LegendPanel.svelte';
        import PriorityQueueDisplay from '$lib/components/visualization/PriorityQueueDisplay.svelte';
        import { trappingRainWater2Plugin } from '$lib/plugins/trappingRainWater2';
        import { uniquePathsWithObstaclesPlugin } from '$lib/plugins/uniquePathsWithObstacles';
        import { swimInWaterPlugin } from '$lib/plugins/swimInWater';
        import { findGCDPlugin } from '$lib/plugins/findGCD';
        import { minTimeToBrewPotionsPlugin } from '$lib/plugins/minTimeToBrewPotions';
        import type { HighlightRole, Trace } from '$lib/types';
        import { HIGHLIGHT_ROLES } from '$lib/types';

	// Props from load function
	let { data }: { data: PageData } = $props();

	// Map plugin IDs to plugin instances
        const pluginMap = {
                'trapping-rain-water-2': trappingRainWater2Plugin,
                'unique-paths-with-obstacles': uniquePathsWithObstaclesPlugin,
                'swim-in-water': swimInWaterPlugin,
                'find-gcd-array': findGCDPlugin,
                'min-time-to-brew-potions': minTimeToBrewPotionsPlugin
        } as const;

	// Get algorithm plugin based on pluginId from route
	const algorithm = $derived(pluginMap[data.pluginId as keyof typeof pluginMap]);

        // Playback controller
        const controller = new PlaybackController();

	// Preset selection state
	let selectedPresetIndex = $state(0);
	let currentPreset = $derived(algorithm.presets[selectedPresetIndex]);

	// Grid mode based on algorithm
        let gridMode = $derived(() => {
                if (algorithm.id === 'unique-paths-with-obstacles') {
                        return 'obstacle' as const;
                }
                if (algorithm.id === 'min-time-to-brew-potions') {
                        return 'dp' as const;
                }
                return 'height' as const;
        }); // swim-in-water and trapping-rain-water-2 use 'height' mode

	// Extract grid data based on algorithm
        let gridData = $derived.by(() => {
                const frameGrid = controller.currentFrame?.state?.grid;
                if (Array.isArray(frameGrid) && frameGrid.length > 0) {
                        return frameGrid;
                }

                const data = currentPreset.data as unknown;
                if (data && typeof data === 'object' && 'grid' in (data as Record<string, unknown>)) {
                        const presetGrid = (data as { grid?: unknown }).grid;
                        if (Array.isArray(presetGrid)) {
                                return presetGrid as number[][];
                        }
                }

                if (Array.isArray(data) && data.every((row) => Array.isArray(row))) {
                        return data as number[][];
                }

                return [] as number[][];
        });

	// Format priority queue data for display
        let queueData = $derived.by(() => {
                const frame = controller.currentFrame;
                if (!frame || !frame.state.heap) return null;

                const heap = frame.state.heap;
                if (!Array.isArray(heap) || heap.length === 0) return null;

                const normalizeQueueItem = (item: any) => {
                        const prioritySources = ['priority', 'elevation', 'height', 'value'];
                        let priority: number | null = null;
                        for (const key of prioritySources) {
                                const candidate = item?.[key];
                                if (typeof candidate === 'number' && Number.isFinite(candidate)) {
                                        priority = candidate;
                                        break;
                                }
                        }

                        if (priority === null) {
                                return null;
                        }

                        const row = typeof item?.row === 'number' ? item.row : item?.position?.row;
                        const col = typeof item?.col === 'number' ? item.col : item?.position?.col;
                        const label = row !== undefined && col !== undefined ? `(${row},${col})` : `${priority}`;

                        return {
                                priority,
                                label,
                                data: item
                        };
                };

                const normalized = [...heap]
                        .map((item) => normalizeQueueItem(item))
                        .filter((item): item is NonNullable<ReturnType<typeof normalizeQueueItem>> => Boolean(item));

                if (normalized.length === 0) {
                        return null;
                }

                const sorted = normalized.sort((a, b) => a.priority - b.priority);
                const topItems = sorted.slice(0, 5);

                return {
                        items: topItems,
                        remainingCount: Math.max(0, sorted.length - topItems.length)
                };
        });

	// Check if algorithm uses multi-phase visualization
	let usesPhases = $derived(algorithm.phases !== undefined && algorithm.phases.length > 0);

	// Check if algorithm uses priority queue
	let usesPriorityQueue = $derived(
		algorithm.id === 'swim-in-water' || algorithm.id === 'trapping-rain-water-2'
	);

        // Derived legend groups (allow plugins to append extra entries)
        let legendGroups = $derived(algorithm.legend ?? []);

        // Track which highlight roles appear in the active trace
        let activeLegendRoles = $state<HighlightRole[]>([...HIGHLIGHT_ROLES]);

        function extractLegendRoles(trace: Trace<any>): HighlightRole[] {
                const roles = new Set<HighlightRole>();

                for (const frame of trace.frames) {
                        for (const marker of frame.focus ?? []) {
                                roles.add(marker.role);
                        }
                        for (const marker of frame.neighbors ?? []) {
                                roles.add(marker.role);
                        }
                        for (const highlight of frame.globalHighlights ?? []) {
                                roles.add(highlight.role);
                        }
                }

                return [...roles];
        }

        // Load trace when algorithm or preset changes
        $effect(() => {
		const preset = algorithm.presets[selectedPresetIndex];
		const validation = algorithm.validateInput(preset.data);

                if (validation.valid) {
                        const trace = algorithm.trace(preset.data);
                        controller.loadTrace(trace);
                        activeLegendRoles = extractLegendRoles(trace);
                } else {
                        activeLegendRoles = [];
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
                        <div class="lg:col-span-2 space-y-4">
				{#if usesPhases}
					<!-- Multi-phase visualization (GCD, etc.) -->
					{#if controller.currentFrame}
						<PhaseContainer
							phases={algorithm.phases}
							currentStep={controller.currentFrame}
						/>
					{:else}
						<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<p class="text-gray-500">Loading visualization...</p>
						</div>
					{/if}
				{:else}
					<!-- Grid-based visualization (default) -->
	                                <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        	                                <GridRenderer frame={controller.currentFrame} heightMap={gridData} mode={gridMode} />
                	                </div>

	                                <!-- Legend -->
        	                        <LegendPanel extraGroups={legendGroups} activeRoles={activeLegendRoles} />
				{/if}
                        </div>

                        <!-- Right sidebar -->
                        <div class="space-y-6">
                                <!-- Status Panel -->
                                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                        <StatusPanel {controller} />
                                </div>

                                <!-- Priority Queue Display (conditionally) -->
				{#if usesPriorityQueue && queueData}
					<PriorityQueueDisplay items={queueData.items} remainingCount={queueData.remainingCount} />
				{/if}
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

<script lang="ts">
	import type { PlaybackController } from '$lib/core/PlaybackController.svelte';

	interface Props {
		controller: PlaybackController;
	}

	let { controller }: Props = $props();

	const speeds = [
		{ label: '0.5x', ms: 700 },
		{ label: '1x', ms: 350 },
		{ label: '2x', ms: 175 },
		{ label: '4x', ms: 87 }
	];

	function handleSpeedChange(ms: number) {
		controller.setSpeed(ms);
	}
</script>

<div class="flex items-center gap-2">
	<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Speed:</span>
	<div class="flex gap-1">
		{#each speeds as { label, ms }}
			<button
				onclick={() => handleSpeedChange(ms)}
				class="px-2 py-1 text-xs rounded transition-colors {controller.speed === ms
					? 'bg-blue-500 text-white'
					: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}"
			>
				{label}
			</button>
		{/each}
	</div>
</div>

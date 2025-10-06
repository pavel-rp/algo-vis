<script lang="ts">
	import type { PlaybackController } from '$lib/core/PlaybackController.svelte';

	interface Props {
		controller: PlaybackController;
	}

	let { controller }: Props = $props();
</script>

<div class="flex items-center gap-2">
	<button
		onclick={() => controller.reset()}
		class="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
		title="Reset to start"
	>
		⏮️
	</button>

	<button
		onclick={() => controller.stepBack()}
		disabled={controller.currentIndex === 0}
		class="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		title="Step back"
	>
		⏪
	</button>

	<button
		onclick={() => (controller.isPlaying ? controller.pause() : controller.play())}
		class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors font-semibold"
		title={controller.isPlaying ? 'Pause' : 'Play'}
	>
		{controller.isPlaying ? '⏸️' : '▶️'}
	</button>

	<button
		onclick={() => controller.stepForward()}
		disabled={controller.currentIndex >= controller.totalSteps - 1}
		class="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		title="Step forward"
	>
		⏩
	</button>
</div>

<script lang="ts">
        /**
         * Home Page (Welcome)
         *
         * Simplified landing page. Algorithm selection now happens via sidebar navigation.
         *
         * Feature: 003-move-the-navigation
         * Date: 2025-10-06
         */

        import LegendPanel from '$lib/components/panels/LegendPanel.svelte';
</script>

<svelte:head>
	<title>Algorithm Visualizer</title>
</svelte:head>

<div class="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
	<div class="max-w-4xl mx-auto py-16 px-8">
		<!-- Header -->
		<header class="space-y-4 text-center mb-12">
			<h1 class="text-5xl font-bold">Algorithm Visualizer</h1>
			<p class="text-xl text-gray-600 dark:text-gray-400">
				Interactive step-by-step visualization of computer science algorithms
			</p>
		</header>

		<!-- Welcome Content -->
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
			<h2 class="text-2xl font-semibold">Welcome!</h2>

			<p class="text-gray-700 dark:text-gray-300">
				Explore algorithm visualizations using the sidebar navigation. Select an algorithm category
				and then choose a specific algorithm to visualize its execution step-by-step.
			</p>

			<div class="space-y-4">
				<h3 class="text-lg font-medium">Available Categories:</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
						<h4 class="font-semibold text-blue-600 dark:text-blue-400">Dynamic Programming</h4>
						<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
							Algorithms that solve problems by breaking them down into overlapping subproblems
						</p>
					</div>
					<div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
						<h4 class="font-semibold text-green-600 dark:text-green-400">Graphs</h4>
						<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
							Algorithms for traversing and analyzing graph structures
						</p>
					</div>
				</div>
			</div>

			<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
				<p class="text-sm text-blue-800 dark:text-blue-200">
					<strong>Getting Started:</strong> Use the sidebar on the left (or tap the menu icon on mobile)
					to navigate through algorithm categories and select a visualization.
				</p>
			</div>
		</div>

                <!-- Features -->
                <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="text-center space-y-2">
                                <div class="text-4xl">🎯</div>
                                <h3 class="font-semibold">Step-by-Step</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400">
                                        Visualize each step of algorithm execution
                                </p>
                        </div>
			<div class="text-center space-y-2">
				<div class="text-4xl">⚡</div>
				<h3 class="font-semibold">Interactive</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					Control playback speed and step through manually
				</p>
			</div>
			<div class="text-center space-y-2">
				<div class="text-4xl">📊</div>
				<h3 class="font-semibold">Multiple Presets</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					Try different inputs to see how algorithms adapt
                                </p>
                        </div>
                </div>

                <!-- Legend preview -->
                <section class="mt-12 space-y-4">
                        <div class="space-y-2">
                                <h2 class="text-2xl font-semibold">Highlight legend</h2>
                                <p class="text-gray-600 dark:text-gray-400">
                                        Every visualization keeps this legend in sync so colors always communicate the same
                                        roles.
                                </p>
                        </div>
                        <LegendPanel />
                </section>
        </div>
</div>

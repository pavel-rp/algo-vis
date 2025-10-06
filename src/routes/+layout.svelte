<script lang="ts">
	/**
	 * Root Layout
	 *
	 * Wraps all routes with persistent sidebar navigation.
	 * Manages NavigationState and syncs with URL for active algorithm.
	 *
	 * Feature: 003-move-the-navigation
	 * Date: 2025-10-06
	 */

	import '../app.css';
	import { page } from '$app/stores';
	import Sidebar from '$lib/components/navigation/Sidebar.svelte';
	import { NavigationState } from '$lib/core/NavigationState.svelte';
	import { navigationTree } from '$lib/data/navigation-tree';
	import { getAncestorIds } from '$lib/utils/navigation-queries';

	// Create NavigationState instance (persists across navigation)
	const navState = new NavigationState();

	// Track previous pathname to avoid infinite loops
	let previousPathname = $state('');

	// Sync active algorithm from URL pathname
	$effect(() => {
		const pathname = $page.url.pathname;

		// Only update if pathname actually changed
		if (pathname === previousPathname) return;
		previousPathname = pathname;

		// Extract algorithm ID from URL (format: /category/algorithm)
		const pathParts = pathname.split('/').filter(Boolean);

		if (pathParts.length === 2) {
			const algorithmId = pathParts[1];

			// Set active algorithm
			navState.setActive(algorithmId);

			// Auto-expand path to show active algorithm (FR-013: Deep Linking)
			const ancestorIds = getAncestorIds(navigationTree, algorithmId);
			if (ancestorIds.length > 0) {
				navState.expandPath(ancestorIds);
			}
		} else {
			// Clear active state on home page
			navState.clearActive();
		}
	});
</script>

<!-- Sidebar (persistent across routes) -->
<Sidebar state={navState} tree={navigationTree} />

<!-- Main content area -->
<main class="min-h-screen">
	<slot />
</main>


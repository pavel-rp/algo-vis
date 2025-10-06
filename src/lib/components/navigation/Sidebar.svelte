<script lang="ts">
	/**
	 * Sidebar Component
	 *
	 * Main sidebar container with navigation tree and toggle button.
	 * Implements responsive behavior: drawer on mobile, fixed sidebar on desktop.
	 *
	 * Feature: 003-move-the-navigation
	 * Date: 2025-10-06
	 */

	import type { NavigationTree as NavigationTreeType } from '$lib/types/navigation';
	import type { NavigationState } from '$lib/core/NavigationState.svelte';
	import NavigationTree from './NavigationTree.svelte';
	import SidebarToggle from './SidebarToggle.svelte';

	interface SidebarProps {
		state: NavigationState;
		tree: NavigationTreeType;
	}

	let { state, tree }: SidebarProps = $props();

	function handleToggle(): void {
		state.toggleSidebar();
	}

	function handleBackdropClick(): void {
		// Close sidebar when clicking backdrop (mobile only)
		if (state.sidebarOpen) {
			state.toggleSidebar();
		}
	}
</script>

<!-- Backdrop (mobile only, visible when sidebar open) -->
{#if state.sidebarOpen}
	<div
		class="sidebar-backdrop md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
		onclick={handleBackdropClick}
		role="presentation"
	></div>
{/if}

<!-- Sidebar Container -->
<aside
	class="sidebar fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 transition-transform duration-200 ease-out w-[280px] md:w-[220px] lg:w-[280px]"
	style="transform: translateX({state.sidebarOpen ? '0' : '-100%'});"
	aria-hidden={!state.sidebarOpen}
>
	<!-- Sidebar Header -->
	<div class="flex items-center justify-between p-4 border-b border-gray-200">
		<h2 class="text-lg font-semibold text-gray-800">Algorithms</h2>

		<!-- Toggle Button (integrated into sidebar on desktop, separate on mobile) -->
		<div class="hidden md:block">
			<SidebarToggle isOpen={state.sidebarOpen} onToggle={handleToggle} />
		</div>
	</div>

	<!-- Navigation Tree -->
	<div class="overflow-y-auto h-[calc(100vh-65px)]">
		<NavigationTree {tree} {state} />
	</div>
</aside>

<!-- Toggle Button (outside sidebar, always visible) -->
<div class="fixed top-4 left-4 z-[60]" class:hidden={state.sidebarOpen}>
	<button
		type="button"
		class="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
		aria-label="Open sidebar"
		onclick={handleToggle}
	>
		<svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
		</svg>
	</button>
</div>

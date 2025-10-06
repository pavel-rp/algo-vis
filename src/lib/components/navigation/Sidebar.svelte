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

<!-- Toggle Button (outside sidebar, visible when closed) -->
<div class="fixed top-4 left-4 z-[60] bg-white dark:bg-gray-800 rounded-lg shadow-lg" class:hidden={state.sidebarOpen}>
	<SidebarToggle isOpen={state.sidebarOpen} onToggle={handleToggle} />
</div>

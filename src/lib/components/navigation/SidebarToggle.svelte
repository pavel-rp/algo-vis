<script lang="ts">
	/**
	 * SidebarToggle Component
	 *
	 * Toggle button for opening/closing the sidebar.
	 * Shows different icons for desktop (chevron) vs mobile (hamburger).
	 *
	 * Feature: 003-move-the-navigation
	 * Date: 2025-10-06
	 */

	interface SidebarToggleProps {
		isOpen: boolean;
		onToggle: () => void;
	}

	let { isOpen, onToggle }: SidebarToggleProps = $props();
</script>

<button
	type="button"
	class="sidebar-toggle p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
	aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
	aria-expanded={isOpen}
	onclick={onToggle}
>
	<!-- Desktop: Chevron Icon -->
	<svg
		class="hidden md:block w-5 h-5 text-gray-600 transition-transform {isOpen
			? ''
			: 'rotate-180'}"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
	</svg>

	<!-- Mobile: Hamburger/Close Icon -->
	{#if isOpen}
		<!-- Close (X) Icon -->
		<svg
			class="md:hidden w-6 h-6 text-gray-600"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
		</svg>
	{:else}
		<!-- Hamburger Icon -->
		<svg
			class="md:hidden w-6 h-6 text-gray-600"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 6h16M4 12h16M4 18h16"
			/>
		</svg>
	{/if}
</button>

<style>
	.sidebar-toggle {
		/* Mobile: Fixed top-left corner */
		@media (max-width: 767px) {
			position: fixed;
			top: 1rem;
			left: 1rem;
			z-index: 60;
			background-color: white;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		}
	}
</style>

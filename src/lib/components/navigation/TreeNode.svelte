<script lang="ts">
	/**
	 * TreeNode Component
	 *
	 * Recursive component for rendering navigation tree nodes.
	 * Handles both category nodes (with expand/collapse) and algorithm nodes (with links).
	 *
	 * Feature: 003-move-the-navigation
	 * Date: 2025-10-06
	 */

	import type { NavigationNode } from '$lib/types/navigation';
	import type { NavigationState } from '$lib/core/NavigationState.svelte';
	import { isCategoryNode, isAlgorithmNode } from '$lib/types/navigation';
	import TreeNodeRecursive from './TreeNode.svelte';

	interface TreeNodeProps {
		node: NavigationNode;
		level?: number;
		state: NavigationState;
		onToggle: (nodeId: string) => void;
		onSelect: (algorithmId: string) => void;
	}

	let {
		node,
		level = 0,
		state,
		onToggle,
		onSelect
	}: TreeNodeProps = $props();

	const isExpanded = $derived(state.isExpanded(node.id));
	const isActive = $derived(state.isActive(node.id));

	const indentPx = level * 16;
</script>

{#if isCategoryNode(node)}
	<!-- Category Node: Expandable button with children -->
	<div role="treeitem" aria-expanded={isExpanded} aria-selected={isActive}>
		<button
			type="button"
			class="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
			style="padding-left: {indentPx + 12}px"
			onclick={() => onToggle(node.id)}
		>
			<!-- Expand/Collapse Icon -->
			<svg
				class="w-4 h-4 transition-transform {isExpanded ? 'rotate-90' : ''}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>

			<span class="font-medium">{node.label}</span>
		</button>

		{#if isExpanded}
			<!-- Recursive children -->
			<div role="group">
				{#each node.children as childNode (childNode.id)}
					<TreeNodeRecursive
						node={childNode}
						level={level + 1}
						{state}
						{onToggle}
						{onSelect}
					/>
				{/each}
			</div>
		{/if}
	</div>
{:else if isAlgorithmNode(node)}
	<!-- Algorithm Node: Link to algorithm page -->
	<a
		href={node.path}
		role="treeitem"
		aria-selected={isActive}
		class="block px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors {isActive
			? 'bg-blue-50 text-blue-600 font-medium border-l-4 border-blue-600'
			: ''}"
		style="padding-left: {indentPx + 12}px"
		onclick={() => onSelect(node.id)}
	>
		{node.label}
	</a>
{/if}

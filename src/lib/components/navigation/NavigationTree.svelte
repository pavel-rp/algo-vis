<script lang="ts">
	/**
	 * NavigationTree Component
	 *
	 * Root container for the hierarchical tree navigation.
	 * Maps root nodes to TreeNode components and manages state delegation.
	 *
	 * Feature: 003-move-the-navigation
	 * Date: 2025-10-06
	 */

	import type { NavigationTree } from '$lib/types/navigation';
	import type { NavigationState } from '$lib/core/NavigationState.svelte';
	import TreeNode from './TreeNode.svelte';

	interface NavigationTreeProps {
		tree: NavigationTree;
		state: NavigationState;
	}

	let { tree, state }: NavigationTreeProps = $props();

	function handleToggle(nodeId: string): void {
		state.toggle(nodeId);
	}

	function handleSelect(algorithmId: string): void {
		state.setActive(algorithmId);
	}
</script>

<nav aria-label="Algorithm categories" class="overflow-y-auto">
	<div role="tree">
		{#each tree.rootNodes as node (node.id)}
			<TreeNode
				{node}
				level={0}
				{state}
				onToggle={handleToggle}
				onSelect={handleSelect}
			/>
		{/each}
	</div>
</nav>

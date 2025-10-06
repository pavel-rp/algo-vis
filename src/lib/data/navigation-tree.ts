/**
 * Navigation Tree Data Structure
 *
 * Defines the hierarchical navigation tree for algorithm categories and problems.
 * This structure is used to render the sidebar navigation.
 *
 * Structure:
 * - Dynamic Programming
 *   - 2D Array
 *     - Trapping Rain Water II
 * - Graphs
 *   - Path Finding
 *     - Unique Paths with Obstacles
 *
 * Feature: 003-move-the-navigation
 * Date: 2025-10-06
 */

import type { NavigationTree } from '$lib/types/navigation';

export const navigationTree: NavigationTree = {
	rootNodes: [
		{
			type: 'category',
			id: 'dynamic-programming',
			label: 'Dynamic Programming',
			children: [
				{
					type: 'category',
					id: 'dp-2d-array',
					label: '2D Array',
					children: [
						{
							type: 'algorithm',
							id: 'trapping-rain-water-2',
							label: 'Trapping Rain Water II',
							pluginId: 'trapping-rain-water-2',
							path: '/dynamic-programming/trapping-rain-water-2'
						}
					]
				}
			]
		},
		{
			type: 'category',
			id: 'graphs',
			label: 'Graphs',
			children: [
				{
					type: 'category',
					id: 'graphs-path-finding',
					label: 'Path Finding',
					children: [
						{
							type: 'algorithm',
							id: 'unique-paths-with-obstacles',
							label: 'Unique Paths with Obstacles',
							pluginId: 'unique-paths-with-obstacles',
							path: '/graphs/unique-paths-with-obstacles'
						}
					]
				}
			]
		}
	]
};

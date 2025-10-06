/**
 * Algorithm Route Load Function
 *
 * Loads algorithm data based on route parameters.
 * Validates that the algorithm exists in the navigation tree and returns plugin reference.
 *
 * Feature: 003-move-the-navigation
 * Date: 2025-10-06
 */

import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { findNodeById } from '$lib/utils/navigation-queries';
import { navigationTree } from '$lib/data/navigation-tree';
import { isAlgorithmNode } from '$lib/types/navigation';

export const load: PageLoad = ({ params }) => {
	const { category, algorithm } = params;

	// Find the algorithm node in the navigation tree
	const node = findNodeById(navigationTree, algorithm);

	// Validate node exists and is an algorithm (not a category)
	if (!node || !isAlgorithmNode(node)) {
		throw error(404, {
			message: `Algorithm "${algorithm}" not found in category "${category}"`
		});
	}

	// Validate that the path matches the expected category
	const expectedPath = `/${category}/${algorithm}`;
	if (node.path !== expectedPath) {
		throw error(404, {
			message: `Algorithm path mismatch: expected "${expectedPath}", got "${node.path}"`
		});
	}

	// Return algorithm data for page component
	return {
		algorithmId: node.id,
		algorithmLabel: node.label,
		pluginId: node.pluginId,
		category
	};
};

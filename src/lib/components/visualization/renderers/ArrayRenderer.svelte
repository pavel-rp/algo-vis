<script lang="ts">
	/**
	 * ArrayRenderer - Algorithm-Agnostic Array Visualization
	 *
	 * Renders 1D arrays with configurable highlighting following visual-encoding.md standards.
	 * Supports horizontal/vertical layouts, multiple highlight roles, and accessibility features.
	 *
	 * Constitutional Alignment: Principle II (Reusability), Principle I (Visualization-First)
	 * Visual Standards: specs/master/visual-encoding.md (state palette, contrast, accessibility)
	 *
	 * @component
	 */

	import type { ArrayRendererConfig } from '$lib/types/phase';

	interface Props {
		/** Array renderer configuration */
		config: ArrayRendererConfig;
		/** Current step number for ARIA labels */
		stepNumber: number;
	}

	let { config, stepNumber }: Props = $props();

	/**
	 * Visual-encoding.md compliant highlight role color mapping
	 * Ensures ≥4.5:1 contrast for text, ≥3:1 for graphics
	 */
	const highlightColors = {
		focus: {
			light: 'ring-2 ring-sky-500/90 bg-white',
			dark: 'ring-2 ring-sky-300/90 dark:bg-slate-900'
		},
		min: {
			light: 'bg-cyan-100 border-cyan-200',
			dark: 'dark:bg-cyan-500/40 dark:border-cyan-400/70'
		},
		max: {
			light: 'bg-amber-100 border-amber-200',
			dark: 'dark:bg-amber-600/50 dark:border-amber-400/70'
		},
		result: {
			light: 'bg-emerald-400 border-emerald-500',
			dark: 'dark:bg-emerald-500/70 dark:border-emerald-400/80'
		}
	};

	/**
	 * Check if an index should be highlighted
	 */
	function isHighlighted(index: number): boolean {
		return config.highlight?.indices.includes(index) || false;
	}

	/**
	 * Get Tailwind classes for a cell based on highlight status
	 */
	function getCellClasses(index: number): string {
		const baseClasses =
			'flex items-center justify-center border-2 rounded-md font-mono text-lg transition-all';
		const sizeClasses =
			config.layout?.cellSize !== undefined
				? `w-[${config.layout.cellSize}px] h-[${config.layout.cellSize}px]`
				: 'w-12 h-12';

		if (isHighlighted(index) && config.highlight) {
			const role = config.highlight.role;
			const colors = highlightColors[role];
			return `${baseClasses} ${sizeClasses} ${colors.light} ${colors.dark}`;
		}

		// Default styling: neutral background with border
		return `${baseClasses} ${sizeClasses} bg-slate-50 border-slate-300 text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100`;
	}

	/**
	 * Generate ARIA label for array element
	 * Per visual-encoding.md: All elements must have ARIA labels
	 */
	function getAriaLabel(index: number, value: number): string {
		const baseLabel = `Array element at index ${index}, value ${value}`;
		if (isHighlighted(index) && config.highlight) {
			return `${baseLabel}, highlighted as ${config.highlight.role}`;
		}
		return baseLabel;
	}

	/**
	 * Determine container layout classes
	 */
	const containerClasses = $derived(() => {
		const orientation = config.layout?.orientation || 'horizontal';
		const flexDirection = orientation === 'vertical' ? 'flex-col' : 'flex-row';
		return `flex ${flexDirection} gap-2 flex-wrap items-start`;
	});
</script>

<!--
  Accessibility:
  - role="list" marks this as a list of items
  - aria-label describes the array
  - Each cell has descriptive aria-label
  - aria-live="polite" announces changes without interrupting
-->
<div
	role="list"
	aria-label="Array with {config.data.length} elements, step {stepNumber}"
	aria-live="polite"
	class="array-renderer"
>
	<div class={containerClasses()}>
		{#each config.data as value, index}
			<div
				role="listitem"
				aria-label={getAriaLabel(index, value)}
				class={getCellClasses(index)}
				data-index={index}
				data-value={value}
			>
				<span class="cell-value">{value}</span>
			</div>
		{/each}
	</div>

	<!-- Index labels (optional, shown below horizontal arrays) -->
	{#if (config.layout?.orientation || 'horizontal') === 'horizontal'}
		<div class="index-labels flex flex-row gap-2 mt-1" aria-hidden="true">
			{#each config.data as _, index}
				<div class="index-label w-12 text-center text-xs text-slate-500 dark:text-slate-400">
					{index}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	/**
	 * Visual-encoding.md compliance:
	 * - Contrast ratios: Text ≥4.5:1, Graphics ≥3:1
	 * - Opacity rules: Light mode full opacity, dark mode 80% for fills
	 * - Reduced motion support
	 */

	.array-renderer {
		width: 100%;
	}

	.cell-value {
		/* Ensure text is always readable */
		user-select: none;
	}

	/**
	 * Accessibility: Respect user motion preferences
	 * Disable transitions if user prefers reduced motion
	 */
	@media (prefers-reduced-motion: reduce) {
		.array-renderer [role='listitem'] {
			transition: none;
		}
	}

	/**
	 * Smooth highlight transitions (when not reduced-motion)
	 */
	@media (prefers-reduced-motion: no-preference) {
		.array-renderer [role='listitem'] {
			transition: all 200ms ease-in-out;
		}
	}

	/**
	 * Focus visible styles for keyboard navigation
	 * Per WCAG 2.1 success criterion 2.4.7
	 */
	.array-renderer [role='listitem']:focus-visible {
		outline: 2px solid #0284c7;
		outline-offset: 2px;
	}

	@media (prefers-color-scheme: dark) {
		.array-renderer [role='listitem']:focus-visible {
			outline-color: #38bdf8;
		}
	}
</style>

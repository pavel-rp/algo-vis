<script lang="ts">
	/**
	 * ScalarPairRenderer - Two-Value Display Renderer
	 *
	 * Algorithm-agnostic renderer for algorithms tracking two related values.
	 * Primary use case: Euclidean algorithm (m, n) visualization.
	 * Also supports: binary search bounds, two-pointer techniques, etc.
	 *
	 * Constitutional Alignment: Principle II (Reusability), Principle I (Visualization-First)
	 * Visual Standards: specs/master/visual-encoding.md (contrast, accessibility)
	 *
	 * @component
	 */

	import type { ScalarPairRendererConfig } from '$lib/types/phase';

	interface Props {
		/** Scalar pair renderer configuration */
		config: ScalarPairRendererConfig;
		/** Current step number for ARIA labels */
		stepNumber: number;
	}

	let { config, stepNumber }: Props = $props();

	/**
	 * Default labels when not provided
	 */
	const labelM = $derived(config.labels?.m || 'M');
	const labelN = $derived(config.labels?.n || 'N');

	/**
	 * Generate comprehensive ARIA label for screen readers
	 * Per visual-encoding.md: All interactive elements must have ARIA labels
	 */
	const ariaLabel = $derived(() => {
		const baseLabel = `${labelM}: ${config.data.m}, ${labelN}: ${config.data.n}`;
		if (config.data.operation) {
			return `${baseLabel}, Operation: ${config.data.operation}`;
		}
		return baseLabel;
	});

	/**
	 * Determine if a value is zero (special styling for GCD termination)
	 */
	function isZero(value: number): boolean {
		return value === 0;
	}
</script>

<!--
  Accessibility:
  - role="group" groups the two values semantically
  - aria-label provides comprehensive description
  - aria-live="polite" announces value changes
-->
<div
	role="group"
	aria-label={ariaLabel()}
	aria-live="polite"
	class="scalar-pair-renderer"
	data-step={stepNumber}
>
	<!-- Value Cards -->
	<div class="value-cards flex flex-row gap-6 justify-center items-stretch">
		<!-- M Value Card -->
		<div
			class="value-card"
			class:zero={isZero(config.data.m)}
			aria-label="{labelM} value: {config.data.m}"
		>
			<div class="value-label text-sm font-medium text-slate-600 dark:text-slate-300">
				{labelM}
			</div>
			<div class="value-display text-4xl font-bold text-slate-900 dark:text-slate-100">
				{config.data.m}
			</div>
		</div>

		<!-- Visual Separator -->
		<div class="separator flex items-center" aria-hidden="true">
			<div class="separator-line w-px h-16 bg-slate-300 dark:bg-slate-600"></div>
		</div>

		<!-- N Value Card -->
		<div
			class="value-card"
			class:zero={isZero(config.data.n)}
			aria-label="{labelN} value: {config.data.n}"
		>
			<div class="value-label text-sm font-medium text-slate-600 dark:text-slate-300">
				{labelN}
			</div>
			<div class="value-display text-4xl font-bold text-slate-900 dark:text-slate-100">
				{config.data.n}
			</div>
		</div>
	</div>

	<!-- Operation String (if provided) -->
	{#if config.data.operation}
		<div class="operation-display mt-6" role="status" aria-label="Operation: {config.data.operation}">
			<p
				class="operation-text text-lg font-mono text-center text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 py-3 px-6 rounded-md border border-slate-200 dark:border-slate-700"
			>
				{config.data.operation}
			</p>
		</div>
	{/if}
</div>

<style>
	/**
	 * Visual-encoding.md compliance:
	 * - Text contrast ≥4.5:1 (WCAG AA)
	 * - Neutral color palette (bg-gray-100) for non-highlighted values
	 * - Dark mode with /80 opacity rule
	 * - Reduced motion support
	 */

	.scalar-pair-renderer {
		width: 100%;
		max-width: 42rem;
		margin-left: auto;
		margin-right: auto;
	}

	.value-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-width: 140px;
		padding: 1.5rem;
		border-radius: 0.5rem;
		border-width: 2px;
		background-color: #f1f5f9;
		border-color: #cbd5e1;
		transition: all 200ms ease-in-out;
	}

	@media (prefers-color-scheme: dark) {
		.value-card {
			background-color: #1e293b;
			border-color: #475569;
		}
	}

	/**
	 * Special styling for zero values (GCD algorithm termination)
	 * Uses emerald color to indicate completion
	 */
	.value-card.zero {
		background-color: #d1fae5;
		border-color: #34d399;
	}

	@media (prefers-color-scheme: dark) {
		.value-card.zero {
			background-color: rgba(16, 185, 129, 0.4);
			border-color: rgba(52, 211, 153, 0.7);
		}
	}

	.value-label {
		margin-bottom: 0.5rem;
	}

	.value-display {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	}

	/**
	 * Accessibility: Respect user motion preferences
	 * Disable transitions if user prefers reduced motion
	 */
	@media (prefers-reduced-motion: reduce) {
		.value-card {
			transition: none;
		}
	}

	/**
	 * Smooth value update animations (when not reduced-motion)
	 * Values pulse briefly on change
	 */
	@media (prefers-reduced-motion: no-preference) {
		.value-display {
			transition: all 150ms ease-in-out;
		}

		/* Subtle scale animation on value update */
		.value-card:has(.value-display:active) {
			transform: scale(1.02);
		}
	}

	/**
	 * Focus visible styles for keyboard navigation
	 * Per WCAG 2.1 success criterion 2.4.7
	 */
	.value-card:focus-visible {
		outline: 2px solid #0284c7;
		outline-offset: 2px;
	}

	@media (prefers-color-scheme: dark) {
		.value-card:focus-visible {
			outline-color: #38bdf8;
		}
	}
</style>

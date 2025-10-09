<script lang="ts">
	/**
	 * PhaseContainer - Multi-Phase Visualization Container
	 *
	 * Algorithm-agnostic container that renders the appropriate phase based on current frame.
	 * Dynamically instantiates renderer components based on declarative configuration.
	 *
	 * Constitutional Alignment: Principle II (Framework Reusability), Principle I (Visualization-First)
	 * Visual Standards: specs/master/visual-encoding.md (contrast, accessibility)
	 *
	 * @component
	 */

	import type { Frame } from '$lib/types/plugin';
	import type { Phase, RendererConfig, ArrayRendererConfig, ScalarPairRendererConfig } from '$lib/types/phase';
	import ArrayRenderer from './renderers/ArrayRenderer.svelte';
	import ScalarPairRenderer from './renderers/ScalarPairRenderer.svelte';
	import StatusRenderer from './renderers/StatusRenderer.svelte';

	interface Props {
		/** Array of phase definitions from plugin */
		phases: Phase[];
		/** Current execution frame determining active phase */
		currentStep: Frame<unknown>;
		/** Optional CSS class for styling */
		class?: string;
	}

	let { phases, currentStep, class: className = '' }: Props = $props();

	/**
	 * Track the active phase based on currentStep.phaseId
	 * Falls back to first phase if phaseId is undefined (backward compatibility)
	 */
	let activePhase = $state<Phase | undefined>(undefined);

	/**
	 * Active renderer configs derived from the current phase & frame state
	 */
	let activeRendererConfigs = $state<RendererConfig[]>([]);

	$effect(() => {
		const phaseId = currentStep?.phaseId;

		if (!phaseId) {
			activePhase = phases[0];
		} else {
			activePhase =
				phases.find((p) => p.id === phaseId) ||
				phases[0];
		}
	});

	$effect(() => {
		const phase = activePhase;
		if (!phase || !Array.isArray(phase.rendererConfigs)) {
			activeRendererConfigs = [];
			return;
		}

		const state = (currentStep?.state ?? {}) as any;

		activeRendererConfigs = phase.rendererConfigs.map((config): RendererConfig => {
			if (config.type === 'array') {
				// For array renderer, use data from frame state if available
				// Otherwise fall back to config data (useful for testing)
				const arrayConfig = config as ArrayRendererConfig;
				return {
					...arrayConfig,
					data: state.array || state.nums || arrayConfig.data,
					highlight: state.currentIndex !== undefined
						? {
							indices: [state.currentIndex],
							role: 'focus' as const
						}
						: arrayConfig.highlight
				};
			} else if (config.type === 'scalarPair') {
				// For scalar pair, use m/n from frame state
				const pairConfig = config as ScalarPairRendererConfig;
				return {
					...pairConfig,
					data: {
						m: state.m ?? pairConfig.data.m,
						n: state.n ?? pairConfig.data.n,
						operation: state.operation ?? pairConfig.data.operation
					}
				};
			} else {
				// Status renderer: pass through as-is
				return config;
			}
		});
	});

	/**
	 * Emit phase change event when phaseId changes
	 * (For analytics, logging, or parent component notifications)
	 */
	let previousPhaseId = $state<string | undefined>(undefined);
	$effect(() => {
		const currentPhaseId = currentStep?.phaseId;
		if (previousPhaseId !== undefined && currentPhaseId !== previousPhaseId) {
			// Phase transition occurred
			console.log(`Phase transition: ${previousPhaseId} -> ${currentPhaseId}`);
		}
		previousPhaseId = currentPhaseId;
	});
</script>

<!--
  Accessibility:
  - role="region" marks this as a landmark for screen readers
  - aria-label announces the current phase
  - aria-live="polite" announces phase changes without interrupting
-->
<div
	role="region"
	aria-label="Algorithm visualization phase: {activePhase?.label || 'Loading'}"
	aria-live="polite"
	class="phase-container {className}"
>
	{#if activePhase}
		<!-- Phase Header -->
		<header class="phase-header">
			<h2 class="phase-label text-lg font-semibold text-slate-900 dark:text-slate-100">
				{activePhase.label}
			</h2>
			{#if activePhase.description}
				<p class="phase-description text-sm text-slate-600 dark:text-slate-300">
					{activePhase.description}
				</p>
			{/if}
		</header>

		<!-- Renderer Stack -->
		<div class="renderer-stack space-y-4">
			{#each activeRendererConfigs as config}
				{#if config.type === 'array'}
					<ArrayRenderer config={config} stepNumber={currentStep.step} />
				{:else if config.type === 'scalarPair'}
					<ScalarPairRenderer config={config} stepNumber={currentStep.step} />
				{:else if config.type === 'status'}
					<StatusRenderer config={config} />
				{/if}
			{/each}
		</div>

		<!-- Frame Description (FR-011: Descriptive text for each step) -->
		<footer class="frame-description mt-4">
			<p
				class="text-sm text-slate-700 dark:text-slate-200"
				aria-label="Step {currentStep.step} description"
			>
				<strong>Step {currentStep.step}:</strong>
				{currentStep.description}
			</p>
		</footer>
	{:else}
		<!-- Fallback: No phases defined -->
		<div class="no-phases-fallback" role="alert">
			<p class="text-slate-600 dark:text-slate-400">No visualization phases configured.</p>
		</div>
	{/if}
</div>

<style>
	/**
	 * Visual-encoding.md compliance:
	 * - Text contrast ≥4.5:1 (WCAG AA)
	 * - Consistent spacing using Tailwind utilities
	 * - Dark mode support with /80 opacity rule
	 * - Reduced motion support
	 */

	.phase-container {
		border-radius: 0.5rem;
		border: 1px solid #e2e8f0;
		background-color: white;
		padding: 1.5rem;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	}

	@media (prefers-color-scheme: dark) {
		.phase-container {
			border-color: #334155;
			background-color: #0f172a;
		}
	}

	.phase-header {
		margin-bottom: 1.5rem;
		border-bottom: 1px solid #e2e8f0;
		padding-bottom: 1rem;
	}

	@media (prefers-color-scheme: dark) {
		.phase-header {
			border-color: #334155;
		}
	}

	.phase-label {
		margin-bottom: 0.5rem;
	}

	.phase-description {
		font-style: italic;
	}

	.frame-description {
		border-top: 1px solid #e2e8f0;
		padding-top: 1rem;
	}

	@media (prefers-color-scheme: dark) {
		.frame-description {
			border-color: #334155;
		}
	}

	.no-phases-fallback {
		display: flex;
		min-height: 200px;
		align-items: center;
		justify-content: center;
	}

	/**
	 * Accessibility: Respect user motion preferences
	 * Per visual-encoding.md requirements
	 */
	@media (prefers-reduced-motion: reduce) {
		.phase-container {
			transition: none;
		}
	}

	/**
	 * Smooth phase transitions (when not reduced-motion)
	 */
	@media (prefers-reduced-motion: no-preference) {
		.phase-container {
			transition: opacity 200ms ease-in-out;
		}
	}
</style>


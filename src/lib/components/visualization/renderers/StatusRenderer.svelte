<script lang="ts">
	/**
	 * StatusRenderer - Status Message Display Renderer
	 *
	 * Algorithm-agnostic renderer for displaying status messages, notifications,
	 * and algorithm state updates with appropriate visual severity levels.
	 *
	 * Constitutional Alignment: Principle II (Reusability), Principle I (Visualization-First)
	 * Visual Standards: specs/master/visual-encoding.md (contrast, accessibility)
	 *
	 * @component
	 */

	import type { StatusRendererConfig } from '$lib/types/phase';

	interface Props {
		/** Status renderer configuration */
		config: StatusRendererConfig;
	}

	let { config }: Props = $props();

	/**
	 * Visual-encoding.md compliant level color mapping
	 * Ensures ≥4.5:1 contrast for text, ≥3:1 for graphics
	 */
	const levelStyles = {
		info: {
			container: 'bg-sky-100 border-sky-300 dark:bg-sky-500/40 dark:border-sky-400/70',
			icon: 'text-sky-700 dark:text-sky-200',
			text: 'text-sky-900 dark:text-sky-50'
		},
		success: {
			container: 'bg-emerald-100 border-emerald-300 dark:bg-emerald-500/40 dark:border-emerald-400/70',
			icon: 'text-emerald-700 dark:text-emerald-200',
			text: 'text-emerald-900 dark:text-emerald-50'
		},
		warning: {
			container: 'bg-amber-100 border-amber-300 dark:bg-amber-600/50 dark:border-amber-400/70',
			icon: 'text-amber-700 dark:text-amber-200',
			text: 'text-amber-900 dark:text-amber-50'
		}
	};

	/**
	 * Icon mapping for severity levels
	 */
	const levelIcons = {
		info: 'ℹ️',
		success: '✓',
		warning: '⚠'
	};

	/**
	 * Get ARIA role based on severity level
	 * 'status' for info/success, 'alert' for warning
	 */
	const ariaRole = $derived(config.data.level === 'warning' ? 'alert' : 'status');

	/**
	 * Get styles for current level
	 */
	const styles = $derived(levelStyles[config.data.level]);
	const icon = $derived(levelIcons[config.data.level]);
</script>

<!--
  Accessibility:
  - role="status" or "alert" based on severity
  - aria-live="polite" for status, "assertive" for warning
  - Clear text contrast per WCAG AA
-->
<div
	role={ariaRole}
	aria-live={config.data.level === 'warning' ? 'assertive' : 'polite'}
	class="status-renderer-container {styles.container}"
	data-level={config.data.level}
>
	<div class="status-content-wrapper">
		<!-- Icon -->
		<div class="status-icon-display {styles.icon}" aria-hidden="true">
			{icon}
		</div>

		<!-- Message Text -->
		<p class="status-message-text {styles.text}">
			{config.data.message}
		</p>
	</div>
</div>

<style>
	/**
	 * Visual-encoding.md compliance:
	 * - Text contrast ≥4.5:1 (WCAG AA)
	 * - Level-based color coding from palette
	 * - Dark mode with /40-/50 opacity for fills
	 * - Reduced motion support
	 */

	.status-renderer-container {
		width: 100%;
		border-radius: 0.375rem;
		border-width: 2px;
		padding-left: 1rem;
		padding-right: 1rem;
		padding-top: 0.75rem;
		padding-bottom: 0.75rem;
		transition: all 200ms ease-in-out;
	}

	.status-content-wrapper {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.status-icon-display {
		font-size: 1.5rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	.status-message-text {
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1.625;
	}

	/**
	 * Accessibility: Respect user motion preferences
	 * Disable transitions if user prefers reduced motion
	 */
	@media (prefers-reduced-motion: reduce) {
		.status-renderer-container {
			transition: none;
		}
	}

	/**
	 * Smooth appearance/update animations (when not reduced-motion)
	 */
	@media (prefers-reduced-motion: no-preference) {
		.status-renderer-container {
			animation: fade-in 200ms ease-out;
		}
	}

	/**
	 * Fade-in animation for status messages
	 */
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/**
	 * Focus visible styles for keyboard navigation
	 * Per WCAG 2.1 success criterion 2.4.7
	 */
	.status-renderer-container:focus-visible {
		outline: 2px solid #0284c7;
		outline-offset: 2px;
	}

	@media (prefers-color-scheme: dark) {
		.status-renderer-container:focus-visible {
			outline-color: #38bdf8;
		}
	}
</style>

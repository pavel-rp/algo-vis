<script lang="ts">
        import type { HighlightRole, LegendGroup } from '$lib/types';
        import { createLegendGroups, type LegendDisplayGroup } from './legendConfig';

        interface Props {
                extraGroups?: LegendGroup[];
                activeRoles?: HighlightRole[];
        }

        let { extraGroups = [], activeRoles }: Props = $props();
        let groups: LegendDisplayGroup[] = $derived.by(() =>
                createLegendGroups({ extraGroups, activeRoles })
        );
        let isCollapsed = $state(false);

        function toggleCollapse() {
                isCollapsed = !isCollapsed;
        }
</script>

<section class="bg-white dark:bg-gray-900 rounded-md border border-slate-200/70 dark:border-slate-700/70 shadow-sm">
        <header class="flex items-start justify-between gap-3 px-4 py-3">
                <div>
                        <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-100">Legend</h2>
                        <p class="text-xs text-slate-600 dark:text-slate-400">
                                Color key for highlights applied to the visualization.
                        </p>
                </div>
                <button
                        type="button"
                        class="inline-flex items-center gap-1 rounded-md border border-transparent bg-slate-100/60 dark:bg-slate-800/60 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                        aria-expanded={!isCollapsed}
                        on:click={toggleCollapse}
                >
                        <span>{isCollapsed ? 'Show' : 'Hide'}</span>
                        <svg
                                class={`h-3 w-3 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                        >
                                <path
                                        fill-rule="evenodd"
                                        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.084l3.71-3.854a.75.75 0 1 1 1.08 1.04l-4.24 4.4a.75.75 0 0 1-1.08 0l-4.24-4.4a.75.75 0 0 1 .02-1.06Z"
                                        clip-rule="evenodd"
                                />
                        </svg>
                </button>
        </header>

        {#if !isCollapsed}
                <div class="px-4 pb-4 space-y-4">
                        {#each groups as group (group.title)}
                                <section class="space-y-2">
                                        <h3 class="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                {group.title}
                                        </h3>
                                        <ul class="grid gap-3 sm:grid-cols-2">
                                                {#each group.items as item (item.role)}
                                                        <li class="flex items-center gap-2" data-testid={`legend-item-${item.role}`}>
                                                                <span
                                                                        class={`h-5 w-5 shrink-0 rounded-md border border-slate-300/80 dark:border-slate-600/80 ring-1 ring-inset ring-slate-900/5 dark:ring-white/10 ${item.tokens.fill} ${item.tokens.border}`}
                                                                        aria-hidden="true"
                                                                        data-testid={`legend-swatch-${item.role}`}
                                                                ></span>
                                                                <div class="min-w-0 space-y-0.5">
                                                                        <p
                                                                                class="text-xs font-medium leading-snug text-slate-700 dark:text-slate-200"
                                                                                data-testid={`legend-label-${item.role}`}
                                                                        >
                                                                                {item.label}
                                                                        </p>
                                                                        {#if item.description}
                                                                                <p class="text-[0.68rem] leading-tight text-slate-600 dark:text-slate-400">
                                                                                        {item.description}
                                                                                </p>
                                                                        {/if}
                                                                </div>
                                                        </li>
                                                {/each}
                                        </ul>
                                </section>
                        {/each}
                </div>
        {/if}
</section>

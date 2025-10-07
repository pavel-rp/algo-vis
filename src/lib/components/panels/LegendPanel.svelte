<script lang="ts">
        import type { LegendGroup } from '$lib/types';
        import { createLegendGroups, type LegendDisplayGroup } from './legendConfig';

        interface Props {
                extraGroups?: LegendGroup[];
        }

        let { extraGroups = [] }: Props = $props();
        let groups: LegendDisplayGroup[] = $derived.by(() => createLegendGroups(extraGroups));
</script>

<div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700/80">
        <div class="px-5 py-4 border-b border-slate-200/80 dark:border-slate-700/80">
                <h2 class="text-base font-semibold text-slate-800 dark:text-slate-100">Legend</h2>
                <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Color key for highlights applied to the visualization.
                </p>
        </div>
        <div class="px-5 py-4 space-y-6">
                {#each groups as group (group.title)}
                        <section class="space-y-3">
                                <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                        {group.title}
                                </h3>
                                <ul class="space-y-3">
                                        {#each group.items as item (item.role)}
                                                <li class="flex items-start gap-3" data-testid={`legend-item-${item.role}`}>
                                                        <span
                                                                class={`mt-0.5 h-8 w-8 shrink-0 rounded-md border border-slate-300/80 dark:border-slate-600/80 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ${item.tokens.fill} ${item.tokens.border}`}
                                                                aria-hidden="true"
                                                                data-testid={`legend-swatch-${item.role}`}
                                                        ></span>
                                                        <div class="min-w-0 space-y-1">
                                                                <p
                                                                        class={`text-sm font-medium leading-tight ${item.tokens.text}`}
                                                                        data-testid={`legend-label-${item.role}`}
                                                                >
                                                                        {item.label}
                                                                </p>
                                                                {#if item.description}
                                                                        <p class="text-xs text-slate-600 dark:text-slate-400 leading-snug">
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
</div>

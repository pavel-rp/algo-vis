<script lang="ts">
        import type { Frame, HighlightRole } from '$lib/types';
        import type { GridState } from '$lib/types/state';
        import { HIGHLIGHT_COLOR_TOKENS } from '$lib/theme/colorTokens';

        type HighlightTokens = (typeof HIGHLIGHT_COLOR_TOKENS)[HighlightRole];

        interface GlobalHighlightBadge {
                role: HighlightRole;
                isPrimary: boolean;
                weight?: {
                        value: number;
                        label?: string;
                        unit?: string;
                };
        }

        interface Props {
                frame: Frame<GridState> | null;
                heightMap: number[][];
                mode?: 'height' | 'obstacle' | 'dp'; // Display mode
        }

        let { frame, heightMap, mode = 'height' }: Props = $props();

        const cellHighlightTokens = $derived(() => {
                const map = new Map<string, HighlightTokens>();
                if (!frame) return map;

                const registerMarker = (marker: NonNullable<Frame['focus']>[number]) => {
                        if (!map.has(marker.id)) {
                                map.set(marker.id, HIGHLIGHT_COLOR_TOKENS[marker.role]);
                        }
                };

                frame.neighbors?.forEach(registerMarker);

                frame.focus?.forEach((marker) => {
                        map.set(marker.id, HIGHLIGHT_COLOR_TOKENS[marker.role]);
                });

                return map;
        });

        const globalHighlightBadges = $derived(() => {
                const map = new Map<string, GlobalHighlightBadge[]>();
                if (!frame?.globalHighlights) return map;

                frame.globalHighlights.forEach((highlight) => {
                        highlight.nodes.forEach((nodeId, index) => {
                                const badges = map.get(nodeId) ?? [];
                                badges.push({
                                        role: highlight.role,
                                        isPrimary: index === 0,
                                        weight: highlight.weight
                                });
                                map.set(nodeId, badges);
                        });
                });

                return map;
        });

        const highlightRingBase =
                'border border-transparent ring-2 ring-offset-1 ring-offset-gray-100 dark:ring-offset-gray-800 shadow-sm';
        const defaultCellClasses = 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600';
        const inactiveCellClasses = 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';

        function getCellHighlightTokens(rowIdx: number, colIdx: number): HighlightTokens | null {
                if (!frame) return null;
                const cellId = `${rowIdx},${colIdx}`;

                const direct = cellHighlightTokens.get(cellId);
                if (direct) return direct;

                const global = globalHighlightBadges.get(cellId);
                if (global && global.length > 0) {
                        return HIGHLIGHT_COLOR_TOKENS[global[0].role];
                }

                if (frame.state.visited?.[rowIdx]?.[colIdx]) {
                        return HIGHLIGHT_COLOR_TOKENS.visited;
                }

                return null;
        }

        // Compute cell styling based on focus/neighbors
        function getCellClasses(rowIdx: number, colIdx: number): string {
                if (!frame) return inactiveCellClasses;

                const isObstacle = mode === 'obstacle' && heightMap[rowIdx][colIdx] === 1;
                if (isObstacle) {
                        const obstacleTokens = HIGHLIGHT_COLOR_TOKENS.obstacle;
                        return `${obstacleTokens.fill} ${highlightRingBase} ${obstacleTokens.border}`;
                }

                const tokens = getCellHighlightTokens(rowIdx, colIdx);
                if (tokens) {
                        return `${tokens.fill} ${highlightRingBase} ${tokens.border}`;
                }

                return defaultCellClasses;
        }

        function getWaterHeight(rowIdx: number, colIdx: number): number {
                return frame?.state.water?.[rowIdx]?.[colIdx] ?? 0;
        }

	function getDPValue(rowIdx: number, colIdx: number): number | null {
		return frame?.state.dp?.[rowIdx]?.[colIdx] ?? null;
	}

        function getCellDisplay(rowIdx: number, colIdx: number): string {
                const isObstacle = heightMap[rowIdx][colIdx] === 1;

                if (mode === 'obstacle') {
                        const dpVal = getDPValue(rowIdx, colIdx);
			if (isObstacle) {
				return '🚫';
			}
			// Show DP value if computed, otherwise empty
			return dpVal !== null && dpVal !== undefined ? String(dpVal) : '';
		} else if (mode === 'dp') {
			const dpVal = getDPValue(rowIdx, colIdx);
			return dpVal !== null ? String(dpVal) : '';
                }
                return String(heightMap[rowIdx][colIdx]);
        }

        function getCellTextClass(rowIdx: number, colIdx: number, isObstacle: boolean): string {
                const tokens = getCellHighlightTokens(rowIdx, colIdx);
                if (tokens) {
                        return tokens.text;
                }
                if (isObstacle) {
                        return HIGHLIGHT_COLOR_TOKENS.obstacle.text;
                }
                return 'text-gray-900 dark:text-white';
        }

        function getGlobalBadges(rowIdx: number, colIdx: number): GlobalHighlightBadge[] {
                if (!frame) return [];
                const cellId = `${rowIdx},${colIdx}`;
                return globalHighlightBadges.get(cellId) ?? [];
        }

        function getBadgeClasses(role: HighlightRole): string {
                const tokens = HIGHLIGHT_COLOR_TOKENS[role];
                return `${tokens.fill} ${tokens.text} ring-1 ${tokens.border} shadow-sm`;
        }

        function formatBadgeLabel(badge: GlobalHighlightBadge): string {
                if (badge.isPrimary && badge.weight) {
                        const prefix = badge.weight.label ? `${badge.weight.label}: ` : '';
                        const unit = badge.weight.unit ? ` ${badge.weight.unit}` : '';
                        return `${prefix}${badge.weight.value}${unit}`;
                }

                return '•';
        }
</script>

<div class="grid-container overflow-auto p-4">
	{#if heightMap.length === 0}
		<div class="text-gray-500 text-center py-8">No grid data available</div>
	{:else}
		<div
			class="grid gap-0.5 w-fit mx-auto"
			style="grid-template-columns: repeat({heightMap[0].length}, 40px);"
		>
			{#each heightMap as row, rowIdx}
				{#each row as height, colIdx}
					{@const water = getWaterHeight(rowIdx, colIdx)}
					{@const cellDisplay = getCellDisplay(rowIdx, colIdx)}
					{@const isObstacle = mode === 'obstacle' && height === 1}
                                        {@const badges = getGlobalBadges(rowIdx, colIdx)}
                                        <div
                                                class="relative w-10 h-10 flex flex-col items-center justify-center rounded transition-colors {getCellClasses(
                                                        rowIdx,
                                                        colIdx
                                                )}"
                                        >
                                                <!-- Cell value (height, obstacle marker, or DP value) -->
                                                <span
                                                        class={`text-[11px] font-semibold z-10 ${getCellTextClass(rowIdx, colIdx, isObstacle)}`}
                                                >
                                                        {cellDisplay}
                                                </span>

                                                <!-- Water overlay (for water algorithms) -->
						{#if mode === 'height' && water > 0}
							<div
								class="absolute inset-0 bg-[var(--cell-water)] opacity-40 rounded flex items-end justify-center pb-0.5"
							>
                                                                <span class="text-[10px] font-bold text-cyan-900">💧{water}</span>
                                                        </div>
                                                {/if}

                                                {#if badges.length > 0}
                                                        <div class="pointer-events-none absolute inset-0 z-20 flex flex-wrap items-start justify-end gap-0.5 p-0.5">
                                                                {#each badges as badge, badgeIdx}
                                                                        <span
                                                                                class={`inline-flex min-w-[16px] items-center justify-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap ${getBadgeClasses(
                                                                                        badge.role
                                                                                )}`}
                                                                                aria-hidden="true"
                                                                        >
                                                                                {formatBadgeLabel(badge)}
                                                                        </span>
                                                                {/each}
                                                        </div>
                                                {/if}
                                        </div>
                                {/each}
                        {/each}
                </div>
        {/if}
</div>

<style>
	.grid-container {
		max-width: 100%;
		max-height: 600px;
	}
</style>

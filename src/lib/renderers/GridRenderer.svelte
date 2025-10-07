<script lang="ts">
        import type { Frame, HighlightRole } from '$lib/types';
        import type { GridState } from '$lib/types/state';
        import { HIGHLIGHT_COLOR_TOKENS, type HighlightTokens } from '$lib/theme/colorTokens';

        interface Props {
                frame: Frame<GridState> | null;
                heightMap: number[][];
                mode?: 'height' | 'obstacle' | 'dp'; // Display mode
        }

        let { frame, heightMap, mode = 'height' }: Props = $props();

        let cellHighlightTokens = $state(new Map<string, HighlightTokens>());
        $effect(() => {
                const map = new Map<string, HighlightTokens>();
                if (frame) {
                        const registerMarker = (marker: NonNullable<Frame['focus']>[number]) => {
                                if (!map.has(marker.id)) {
                                        map.set(marker.id, HIGHLIGHT_COLOR_TOKENS[marker.role]);
                                }
                        };

                        frame.neighbors?.forEach(registerMarker);
                        frame.focus?.forEach((marker) => {
                                map.set(marker.id, HIGHLIGHT_COLOR_TOKENS[marker.role]);
                        });
                }

                cellHighlightTokens = map;
        });

        let globalHighlightRoles = $state(new Map<string, HighlightRole>());
        $effect(() => {
                const roleMap = new Map<string, HighlightRole>();

                if (frame?.globalHighlights) {
                        frame.globalHighlights.forEach((highlight) => {
                                highlight.nodes.forEach((nodeId) => {
                                        roleMap.set(nodeId, highlight.role);
                                });
                        });
                }

                globalHighlightRoles = roleMap;
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

                const globalRole = globalHighlightRoles.get(cellId);
                if (globalRole) {
                        return HIGHLIGHT_COLOR_TOKENS[globalRole];
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

</script>

<div class="grid-container overflow-auto p-4">
	{#if heightMap.length === 0}
		<div class="text-gray-500 text-center py-8">No grid data available</div>
	{:else}
                <div
                        class="grid gap-1 w-fit mx-auto"
                        style:grid-template-columns={`repeat(${heightMap[0].length}, 40px)`}
                >
                        {#each heightMap as row, rowIdx}
                                {#each row as height, colIdx}
                                        {@const cellDisplay = getCellDisplay(rowIdx, colIdx)}
                                        {@const isObstacle = mode === 'obstacle' && height === 1}
                                        <div
                                                class={`relative w-10 h-10 flex flex-col items-center justify-center rounded transition-colors ${getCellClasses(
                                                        rowIdx,
                                                        colIdx
                                                )}`}
                                        >
                                                <!-- Cell value (height, obstacle marker, or DP value) -->
                                                <span
                                                        class={`text-[11px] font-semibold z-10 ${getCellTextClass(rowIdx, colIdx, isObstacle)}`}
                                                >
                                                        {cellDisplay}
                                                </span>
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

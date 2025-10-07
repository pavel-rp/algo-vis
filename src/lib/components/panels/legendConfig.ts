import { HIGHLIGHT_COLOR_TOKENS, type HighlightTokens } from '$lib/theme/colorTokens';
import type { HighlightRole, LegendGroup, LegendItem } from '$lib/types';

const ROLE_LABELS: Record<HighlightRole, LegendItem> = {
        start: { role: 'start', label: 'Start node' },
        goal: { role: 'goal', label: 'Goal node' },
        current: { role: 'current', label: 'Current focus' },
        frontier: { role: 'frontier', label: 'Frontier candidate' },
        queued: { role: 'queued', label: 'Queued for expansion' },
        visited: { role: 'visited', label: 'Visited / closed' },
        'path-active': {
                role: 'path-active',
                label: 'Shortest path (exploring)',
                description: 'Edges or cells under evaluation'
        },
        'path-final': {
                role: 'path-final',
                label: 'Shortest path (confirmed)',
                description: 'Final answer or committed route'
        },
        obstacle: { role: 'obstacle', label: 'Obstacle / wall' },
        'weight-peek': {
                role: 'weight-peek',
                label: 'Weight peek',
                description: 'Temporary cost or heuristic comparison'
        },
        auxiliary: {
                role: 'auxiliary',
                label: 'Auxiliary marker',
                description: 'Helper overlay supplied by the plugin'
        }
};

export const BASE_LEGEND_GROUPS: LegendGroup[] = [
        {
                title: 'Local states',
                items: [
                        ROLE_LABELS.current,
                        ROLE_LABELS.frontier,
                        ROLE_LABELS.queued,
                        ROLE_LABELS.visited
                ]
        },
        {
                title: 'Global overlays',
                items: [
                        ROLE_LABELS.start,
                        ROLE_LABELS.goal,
                        ROLE_LABELS['path-active'],
                        ROLE_LABELS['path-final'],
                        ROLE_LABELS.obstacle
                ]
        },
        {
                title: 'Supplementary overlays',
                items: [ROLE_LABELS['weight-peek'], ROLE_LABELS.auxiliary]
        }
];

export interface LegendDisplayItem extends LegendItem {
        tokens: HighlightTokens;
}

export interface LegendDisplayGroup {
        title: string;
        items: LegendDisplayItem[];
}

function attachTokens(items: LegendItem[]): LegendDisplayItem[] {
        return items
                .map((item) => {
                        const tokens = HIGHLIGHT_COLOR_TOKENS[item.role];
                        if (!tokens) return null;

                        return {
                                ...item,
                                tokens
                        } satisfies LegendDisplayItem;
                })
                .filter((entry): entry is LegendDisplayItem => Boolean(entry));
}

export function createLegendGroups(extraGroups: LegendGroup[] = []): LegendDisplayGroup[] {
        const sanitizedExtraGroups = extraGroups.map((group) => ({
                title: group.title,
                items: attachTokens(group.items)
        }));

        return [
                ...BASE_LEGEND_GROUPS.map((group) => ({
                        title: group.title,
                        items: attachTokens(group.items)
                })),
                ...sanitizedExtraGroups
        ];
}

import { HIGHLIGHT_COLOR_TOKENS, type HighlightTokens } from '$lib/theme/colorTokens';
import { HIGHLIGHT_ROLES, type HighlightRole, type LegendGroup, type LegendItem } from '$lib/types';

const ROLE_LABELS: Record<HighlightRole, LegendItem> = {
        start: {
                role: 'start',
                label: 'Start node',
                description: 'Entry point or initial state for the visualization.'
        },
        goal: {
                role: 'goal',
                label: 'Goal node',
                description: 'Target state that terminates the search when reached.'
        },
        current: {
                role: 'current',
                label: 'Current focus',
                description: 'Element actively processed on this step.'
        },
        frontier: {
                role: 'frontier',
                label: 'Frontier candidate',
                description: 'Discovered but not yet expanded.'
        },
        queued: {
                role: 'queued',
                label: 'Queued for expansion',
                description: 'Scheduled in a queue, heap, or stack for future processing.'
        },
        visited: {
                role: 'visited',
                label: 'Visited / closed',
                description: 'Explored and removed from the active frontier.'
        },
        'path-active': {
                role: 'path-active',
                label: 'Shortest path (exploring)',
                description: 'Edges or cells currently evaluated as part of a candidate path.'
        },
        'path-final': {
                role: 'path-final',
                label: 'Shortest path (confirmed)',
                description: 'Final answer or committed route.'
        },
        obstacle: {
                role: 'obstacle',
                label: 'Obstacle / wall',
                description: 'Impassable cell or constraint that blocks traversal.'
        },
        'weight-peek': {
                role: 'weight-peek',
                label: 'Weight peek',
                description: 'Temporary cost or heuristic comparison.'
        },
        auxiliary: {
                role: 'auxiliary',
                label: 'Auxiliary marker',
                description: 'Helper overlay supplied by the plugin.'
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

export interface CreateLegendGroupOptions {
        extraGroups?: LegendGroup[];
        activeRoles?: Iterable<HighlightRole>;
}

function normalizeRoleFilter(activeRoles?: Iterable<HighlightRole>): Set<HighlightRole> | null {
        if (!activeRoles) {
                return null;
        }

        const validRoles = new Set(HIGHLIGHT_ROLES);
        const selected = new Set<HighlightRole>();
        for (const role of activeRoles) {
                if (validRoles.has(role)) {
                        selected.add(role);
                }
        }

        return selected.size > 0 ? selected : null;
}

function attachTokens(items: LegendItem[], roleFilter: Set<HighlightRole> | null): LegendDisplayItem[] {
        return items
                .filter((item) => Boolean(item.description?.trim()))
                .filter((item) => (roleFilter ? roleFilter.has(item.role) : true))
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

export function createLegendGroups({
        extraGroups = [],
        activeRoles
}: CreateLegendGroupOptions = {}): LegendDisplayGroup[] {
        const roleFilter = normalizeRoleFilter(activeRoles);

        const sanitizedExtraGroups = extraGroups.map((group) => ({
                title: group.title,
                items: attachTokens(group.items, roleFilter)
        }));

        return [
                ...BASE_LEGEND_GROUPS.map((group) => ({
                        title: group.title,
                        items: attachTokens(group.items, roleFilter)
                })),
                ...sanitizedExtraGroups
        ].filter((group) => group.items.length > 0);
}

export { ROLE_LABELS };

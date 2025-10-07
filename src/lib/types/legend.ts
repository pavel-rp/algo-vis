import type { HighlightRole } from './plugin';

export interface LegendItem {
        role: HighlightRole;
        label: string;
        description?: string;
}

export interface LegendGroup {
        title: string;
        items: LegendItem[];
}

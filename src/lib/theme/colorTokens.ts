import { HIGHLIGHT_ROLES, type HighlightRole } from '$lib/types';

export type HighlightTokens = {
        fill: string;
        border: string;
        text: string;
};

const createTokens = (role: HighlightRole): HighlightTokens => ({
        fill: `bg-[var(--highlight-${role}-fill)]`,
        border: `ring-[var(--highlight-${role}-border)]`,
        text: `text-[var(--highlight-${role}-text)]`
});

export const HIGHLIGHT_COLOR_TOKENS: Record<HighlightRole, HighlightTokens> = Object.fromEntries(
        HIGHLIGHT_ROLES.map((role) => [role, createTokens(role)])
) as Record<HighlightRole, HighlightTokens>;

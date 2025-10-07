import { describe, expect, it } from 'vitest';
import { createLegendGroups } from '$lib/components/panels/legendConfig';
import { HIGHLIGHT_COLOR_TOKENS } from '$lib/theme/colorTokens';
import type { HighlightRole } from '$lib/types';

const splitClasses = (value: string) => value.split(/\s+/).filter(Boolean);

describe('LegendPanel', () => {
        it('renders every highlight role with the expected classes', () => {
                const groups = createLegendGroups();

                const roles = Object.keys(HIGHLIGHT_COLOR_TOKENS) as HighlightRole[];
                for (const role of roles) {
                        const displayItem = groups
                                .flatMap((group) => group.items)
                                .find((item) => item.role === role);

                        expect(displayItem, `Expected legend item for role "${role}"`).toBeDefined();

                        const tokens = HIGHLIGHT_COLOR_TOKENS[role];
                        for (const className of splitClasses(tokens.fill)) {
                                expect(splitClasses(displayItem!.tokens.fill).includes(className)).toBe(true);
                        }
                        for (const className of splitClasses(tokens.border)) {
                                expect(splitClasses(displayItem!.tokens.border).includes(className)).toBe(true);
                        }
                        for (const className of splitClasses(tokens.text)) {
                                expect(splitClasses(displayItem!.tokens.text).includes(className)).toBe(true);
                        }
                }
        });
});

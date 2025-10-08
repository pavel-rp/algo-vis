import { describe, expect, it } from 'vitest';
import { createLegendGroups } from '$lib/components/panels/legendConfig';
import { HIGHLIGHT_COLOR_TOKENS } from '$lib/theme/colorTokens';
import type { HighlightRole, LegendGroup } from '$lib/types';

const splitClasses = (value: string) => value.split(/\s+/).filter(Boolean);

describe('LegendPanel', () => {
        it('renders every highlight role with the expected classes when no filter is provided', () => {
                const groups = createLegendGroups();

                const roles = Object.keys(HIGHLIGHT_COLOR_TOKENS) as HighlightRole[];
                const renderedRoles = groups.flatMap((group) => group.items.map((item) => item.role));

                expect(new Set(renderedRoles)).toEqual(new Set(roles));

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

        it('filters legend entries to the provided active roles', () => {
                const activeRoles: HighlightRole[] = ['current', 'goal', 'visited'];
                const groups = createLegendGroups({ activeRoles });

                const renderedRoles = groups.flatMap((group) => group.items.map((item) => item.role));

                expect(new Set(renderedRoles)).toEqual(new Set(activeRoles));
        });

        it('filters extra legend groups by active roles and removes empty groups', () => {
                const extraGroups: LegendGroup[] = [
                        {
                                title: 'Custom overlays',
                                items: [
                                        {
                                                role: 'auxiliary',
                                                label: 'Auxiliary marker',
                                                description: 'Helper overlay supplied by the plugin.'
                                        },
                                        {
                                                role: 'queued',
                                                label: 'Queued for expansion',
                                                description: 'Scheduled in a queue, heap, or stack for future processing.'
                                        }
                                ]
                        }
                ];

                const groups = createLegendGroups({ activeRoles: ['auxiliary'], extraGroups });

                expect(groups.every((group) => group.items.length > 0)).toBe(true);
                const renderedRoles = groups.flatMap((group) => group.items.map((item) => item.role));
                expect(new Set(renderedRoles)).toEqual(new Set(['auxiliary']));
                expect(renderedRoles.filter((role) => role === 'queued').length).toBe(0);
        });
});

/**
 * Minimum Time to Brew Potions Plugin
 *
 * Visualization for LeetCode 3494 "Find the Minimum Amount of Time to Brew Potions".
 * Models the brewing line as a wizard × potion timeline grid and highlights
 * synchronized hand-offs per project constitution requirements.
 */

import type { AlgorithmPlugin, Trace, Frame, ValidationResult, InputPreset } from '$lib/types';
import type { GridState } from '$lib/types/state';

/** Input contract for brewing visualization */
export interface BrewingInput {
        skill: number[];
        mana: number[];
        /**
         * Optional helper grid for renderer sizing. The visualization overwrites
         * the values with duration (skill × mana) pairs so viewers see the base
         * processing cost rather than placeholder zeroes.
         */
        grid?: number[][];
}

/** Extended grid state containing timing metadata */
export interface BrewingState extends GridState {
        /** Finish times displayed in DP mode */
        dp: (number | null)[][];
        /** Cell start times */
        startTimes: (number | null)[][];
        /** Cell finish times */
        finishTimes: (number | null)[][];
        /** Wait because wizard was still busy with previous potion */
        waitForWizard: (number | null)[][];
        /** Wait because potion was still travelling from previous wizard */
        waitForPotion: (number | null)[][];
        /** Active indices for context */
        currentWizard?: number;
        currentPotion?: number;
        /** Current availability of each wizard after this frame */
        wizardAvailability: number[];
        /** Running makespan */
        makespan: number;
        /** Immutable copies of input arrays for legend/status panels */
        skillProfile: number[];
        manaProfile: number[];
}

const MAX_DIMENSION = 12; // per spec clarification (≤ 12 wizards/potions)
const MAX_CELLS = 144; // keep traces performant and legible

function isPositiveInteger(value: unknown): value is number {
        return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function cloneMatrix<T>(matrix: T[][]): T[][] {
        return matrix.map((row) => [...row]);
}

function buildDurationGrid(skill: number[], mana: number[]): number[][] {
        return Array.from({ length: skill.length }, (_, wizardIndex) =>
                Array.from({ length: mana.length }, (_, potionIndex) => skill[wizardIndex] * mana[potionIndex])
        );
}

function validateInput(input: BrewingInput): ValidationResult {
        const errors: string[] = [];

        if (!input || !Array.isArray(input.skill) || !Array.isArray(input.mana)) {
                return {
                        valid: false,
                        errors: ['Input must include both skill and mana arrays']
                };
        }

        const { skill, mana } = input;

        if (skill.length === 0) {
                errors.push('Skill array must contain at least one wizard');
        }
        if (mana.length === 0) {
                errors.push('Mana array must contain at least one potion');
        }

        if (skill.length > MAX_DIMENSION) {
                errors.push(`Visualization supports at most ${MAX_DIMENSION} wizards to preserve clarity`);
        }
        if (mana.length > MAX_DIMENSION) {
                errors.push(`Visualization supports at most ${MAX_DIMENSION} potions to preserve clarity`);
        }

        if (skill.length * mana.length > MAX_CELLS) {
                errors.push(`Total wizard × potion combinations must not exceed ${MAX_CELLS}`);
        }

        skill.forEach((value, index) => {
                if (!isPositiveInteger(value)) {
                        errors.push(`Skill[${index}] must be a positive integer`);
                }
        });

        mana.forEach((value, index) => {
                if (!isPositiveInteger(value)) {
                        errors.push(`Mana[${index}] must be a positive integer`);
                }
        });

        return {
                valid: errors.length === 0,
                errors: errors.length > 0 ? errors : undefined
        };
}

function buildHighlights(startId: string, goalId: string, extra?: { pathFinal?: string[] }): NonNullable<Frame<BrewingState>['globalHighlights']> {
        const highlights: NonNullable<Frame<BrewingState>['globalHighlights']> = [
                { role: 'start', nodes: [startId] },
                { role: 'goal', nodes: [goalId] }
        ];

        if (extra?.pathFinal && extra.pathFinal.length > 0) {
                highlights.push({ role: 'path-final', nodes: extra.pathFinal });
        }

        return highlights;
}

function trace(input: BrewingInput): Trace<BrewingState> {
        const validation = validateInput(input);
        if (!validation.valid) {
                return {
                        frames: [
                                {
                                        step: 0,
                                        state: {
                                                grid: [],
                                                visited: [],
                                                dp: [],
                                                startTimes: [],
                                                finishTimes: [],
                                                waitForWizard: [],
                                                waitForPotion: [],
                                                wizardAvailability: [],
                                                makespan: 0,
                                                skillProfile: input.skill ?? [],
                                                manaProfile: input.mana ?? []
                                        },
                                        description: validation.errors?.join('\n') ?? 'Invalid input'
                                }
                        ],
                        totalSteps: 1,
                        completed: false,
                        metadata: { valid: false, errors: validation.errors }
                };
        }

        const skill = [...input.skill];
        const mana = [...input.mana];
        const n = skill.length;
        const m = mana.length;

        const durations = buildDurationGrid(skill, mana);
        const grid = buildDurationGrid(skill, mana);
        const visited = Array.from({ length: n }, () => Array(m).fill(false));
        const dpMatrix = Array.from({ length: n }, () => Array<(number | null)>(m).fill(null));
        const startTimes = Array.from({ length: n }, () => Array<(number | null)>(m).fill(null));
        const finishTimes = Array.from({ length: n }, () => Array<(number | null)>(m).fill(null));
        const waitForWizard = Array.from({ length: n }, () => Array<(number | null)>(m).fill(null));
        const waitForPotion = Array.from({ length: n }, () => Array<(number | null)>(m).fill(null));

        const frames: Frame<BrewingState>[] = [];
        const wizardAvailability = new Array<number>(n).fill(0);
        const startNodeId = '0,0';
        const goalNodeId = `${n - 1},${m - 1}`;
        let step = 0;

        const pushFrame = (options: {
                state: Partial<BrewingState>;
                description: string;
                focus?: Frame<BrewingState>['focus'];
                neighbors?: Frame<BrewingState>['neighbors'];
                highlightsExtra?: { pathFinal?: string[] };
                metrics?: Frame<BrewingState>['metrics'];
        }) => {
                frames.push({
                        step: step++,
                        state: {
                                grid: cloneMatrix(grid),
                                visited: cloneMatrix(visited),
                                dp: cloneMatrix(dpMatrix),
                                startTimes: cloneMatrix(startTimes),
                                finishTimes: cloneMatrix(finishTimes),
                                waitForWizard: cloneMatrix(waitForWizard),
                                waitForPotion: cloneMatrix(waitForPotion),
                                wizardAvailability: [...wizardAvailability],
                                makespan: wizardAvailability[n - 1] ?? 0,
                                skillProfile: [...skill],
                                manaProfile: [...mana],
                                ...options.state
                        },
                        focus: options.focus,
                        neighbors: options.neighbors,
                        globalHighlights: buildHighlights(startNodeId, goalNodeId, options.highlightsExtra),
                        description: options.description,
                        metrics: options.metrics
                });
        };

        pushFrame({
                state: {},
                description: `Initialized brewing line with ${n} wizard${n === 1 ? '' : 's'} and ${m} potion${m === 1 ? '' : 's'}. Duration per cell = skill × mana.`,
                metrics: {
                        Wizards: n,
                        Potions: m,
                        'Max Cells Supported': MAX_CELLS
                }
        });

        for (let potionIndex = 0; potionIndex < m; potionIndex++) {
                const provisionalStarts = new Array<number>(n);
                const provisionalFinishes = new Array<number>(n);
                const alignedStarts = new Array<number>(n);
                const alignedFinishes = new Array<number>(n);
                const wizardReadySnapshot = new Array<number>(n);
                let currentFlowTime = 0;

                for (let wizardIndex = 0; wizardIndex < n; wizardIndex++) {
                        const wizardReadyAt = wizardAvailability[wizardIndex];
                        wizardReadySnapshot[wizardIndex] = wizardReadyAt;
                        const start = Math.max(currentFlowTime, wizardReadyAt);
                        const finish = start + durations[wizardIndex][potionIndex];
                        provisionalStarts[wizardIndex] = start;
                        provisionalFinishes[wizardIndex] = finish;
                        currentFlowTime = finish;
                }

                alignedFinishes[n - 1] = provisionalFinishes[n - 1];
                alignedStarts[n - 1] = alignedFinishes[n - 1] - durations[n - 1][potionIndex];
                for (let wizardIndex = n - 2; wizardIndex >= 0; wizardIndex--) {
                        const requiredFinish = alignedStarts[wizardIndex + 1];
                        const finish = Math.max(provisionalFinishes[wizardIndex], requiredFinish);
                        alignedFinishes[wizardIndex] = finish;
                        alignedStarts[wizardIndex] = finish - durations[wizardIndex][potionIndex];
                }

                const availabilityAfterPotion = alignedFinishes.map((value) => value);

                for (let wizardIndex = 0; wizardIndex < n; wizardIndex++) {
                        const arrivalTime = wizardIndex === 0 ? alignedStarts[0] : alignedFinishes[wizardIndex - 1];
                        const wizardReadyAt = wizardReadySnapshot[wizardIndex];
                        const waitWizard = Math.max(0, wizardReadyAt - arrivalTime);
                        const waitPotionValue = Math.max(0, alignedStarts[wizardIndex] - wizardReadyAt);
                        const duration = durations[wizardIndex][potionIndex];

                        visited[wizardIndex][potionIndex] = true;
                        dpMatrix[wizardIndex][potionIndex] = alignedFinishes[wizardIndex];
                        startTimes[wizardIndex][potionIndex] = alignedStarts[wizardIndex];
                        finishTimes[wizardIndex][potionIndex] = alignedFinishes[wizardIndex];
                        waitForWizard[wizardIndex][potionIndex] = waitWizard;
                        waitForPotion[wizardIndex][potionIndex] = waitPotionValue;

                        const focus = [
                                { type: 'grid-cell' as const, id: `${wizardIndex},${potionIndex}`, role: 'current' }
                        ];
                        const neighbors = [];
                        if (wizardIndex > 0) {
                                neighbors.push({
                                        type: 'grid-cell' as const,
                                        id: `${wizardIndex - 1},${potionIndex}`,
                                        role: 'path-active'
                                });
                        }
                        if (potionIndex > 0) {
                                neighbors.push({
                                        type: 'grid-cell' as const,
                                        id: `${wizardIndex},${potionIndex - 1}`,
                                        role: 'path-active'
                                });
                        }

                        const metrics = {
                                Wizard: wizardIndex,
                                Potion: potionIndex,
                                'Skill Multiplier': skill[wizardIndex],
                                'Mana Capacity': mana[potionIndex],
                                Duration: duration,
                                'Arrival Time': arrivalTime,
                                'Start Time': alignedStarts[wizardIndex],
                                'Finish Time': alignedFinishes[wizardIndex],
                                'Wait for Wizard': waitWizard,
                                'Wait for Potion': waitPotionValue,
                                'Current Makespan': availabilityAfterPotion[n - 1]
                        } satisfies Record<string, number>;

                        const waitMessages: string[] = [];
                        if (waitWizard > 0) {
                                waitMessages.push(
                                        `Potion queued ${waitWizard} unit${waitWizard === 1 ? '' : 's'} until wizard became free.`
                                );
                        }
                        if (waitPotionValue > 0) {
                                waitMessages.push(
                                        `Wizard idle ${waitPotionValue} unit${waitPotionValue === 1 ? '' : 's'} awaiting potion flow.`
                                );
                        }

                        pushFrame({
                                state: {
                                        currentWizard: wizardIndex,
                                        currentPotion: potionIndex,
                                        wizardAvailability: wizardAvailability.map((value, idx) =>
                                                idx <= wizardIndex ? availabilityAfterPotion[idx] : value
                                        ),
                                        makespan: availabilityAfterPotion[n - 1]
                                },
                                focus,
                                neighbors: neighbors.length > 0 ? neighbors : undefined,
                                description:
                                        `Wizard ${wizardIndex} brewing potion ${potionIndex}: start at ${alignedStarts[wizardIndex]} (wizard ready at ${wizardReadyAt}, potion arrival ${arrivalTime}), duration ${duration}, finish at ${alignedFinishes[wizardIndex]}.` +
                                        (waitMessages.length > 0 ? ` ${waitMessages.join(' ')}` : ' No waiting required.'),
                                metrics
                        });
                }

                for (let wizardIndex = 0; wizardIndex < n; wizardIndex++) {
                        wizardAvailability[wizardIndex] = availabilityAfterPotion[wizardIndex];
                }
        }

        const totalTime = finishTimes[n - 1][m - 1] ?? wizardAvailability[n - 1] ?? 0;

        pushFrame({
                state: {
                        makespan: totalTime
                },
                description: `All potions brewed. Minimum synchronized completion time = ${totalTime}.`,
                highlightsExtra: {
                        pathFinal: Array.from({ length: n * m }, (_, index) => {
                                const row = Math.floor(index / m);
                                const col = index % m;
                                return `${row},${col}`;
                        })
                },
                metrics: {
                        Wizards: n,
                        Potions: m,
                        'Total Time': totalTime
                }
        });

        return {
                frames,
                totalSteps: frames.length,
                completed: true,
                metadata: {
                        wizards: n,
                        potions: m,
                        totalTime,
                        skill,
                        mana
                }
        };
}

const presets: InputPreset<BrewingInput>[] = [
        {
                name: 'LeetCode Sample',
                description: 'Example from the problem statement (answer = 110).',
                data: {
                        skill: [1, 5, 2, 4],
                        mana: [5, 1, 4, 2],
                        grid: Array.from({ length: 4 }, () => Array(4).fill(0))
                }
        },
        {
                name: 'Balanced Lab',
                description: 'Three wizards brewing three potions with moderate load.',
                data: {
                        skill: [2, 3, 4],
                        mana: [3, 2, 5],
                        grid: Array.from({ length: 3 }, () => Array(3).fill(0))
                }
        },
        {
                name: 'Bottleneck Wizard',
                description: 'Slow middle wizard illustrates queueing delays.',
                data: {
                        skill: [2, 8, 3],
                        mana: [4, 3, 6, 2],
                        grid: Array.from({ length: 3 }, () => Array(4).fill(0))
                }
        }
];

export const minTimeToBrewPotionsPlugin: AlgorithmPlugin<BrewingInput, BrewingState> = {
        id: 'min-time-to-brew-potions',
        name: 'Minimum Time to Brew Potions',
        description:
                'Simulates potion batches flowing through wizards with different skills. Highlights synchronized hand-offs, waits, and the overall makespan.',
        category: 'Dynamic Programming',
        subcategory: 'Scheduling & Pipelines',
        visualizationType: 'grid',
        presets,
        trace,
        validateInput
};

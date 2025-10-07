import type { AlgorithmPlugin, Trace, Frame, ValidationResult } from '$lib/types';
import type { GridState } from '$lib/types/state';

interface DPState extends GridState {
	grid: number[][]; // obstacleGrid (0=empty, 1=obstacle)
	dp: number[][]; // current dp table state
	prevRow: number[]; // previous row values
	curRow: number[]; // current row being computed
	currentCell?: { row: number; col: number }; // cell being processed
}

function uniquePathsWithObstacles(obstacleGrid: number[][]): Trace<DPState> {
	const frames: Frame<DPState>[] = [];
        const m = obstacleGrid.length;
        const n = obstacleGrid[0].length;
        let step = 0;

        // Initialize DP table for visualization
        const dp: number[][] = Array.from({ length: m }, () => Array(n).fill(0));
        const visited: boolean[][] = Array.from({ length: m }, () => Array(n).fill(false));
        const visitedNodeIds: string[] = [];

        const obstacleNodes = obstacleGrid
                .map((row, i) => row.map((value, j) => (value === 1 ? `${i},${j}` : null)))
                .flat()
                .filter((id): id is string => Boolean(id));

        let prevRow = new Array(n).fill(0);
        prevRow[0] = 1;

        const snapshotHighlights = (options?: { pathNodes?: string[]; totalPaths?: number }) => {
                const highlights: NonNullable<Frame<DPState>['globalHighlights']> = [];

                if (obstacleNodes.length > 0) {
                        highlights.push({ role: 'obstacle', nodes: obstacleNodes });
                }

                if (visitedNodeIds.length > 0) {
                        highlights.push({ role: 'visited', nodes: [...visitedNodeIds] });
                }

                if (options?.pathNodes && options.pathNodes.length > 0) {
                        highlights.push({
                                role: options.totalPaths !== undefined ? 'path-final' : 'path-active',
                                nodes: options.pathNodes
                        });
                }

                if (typeof options?.totalPaths === 'number') {
                        highlights.push({
                                role: 'weight-peek',
                                nodes: [`${m - 1},${n - 1}`],
                                weight: { label: 'Paths', value: options.totalPaths }
                        });
                }

                return highlights.length > 0 ? highlights : undefined;
        };

	// Frame 0: Initial state
        frames.push({
                step: step++,
                state: {
                        grid: obstacleGrid.map((row) => [...row]),
                        visited: visited.map((row) => [...row]),
                        dp: dp.map((row) => [...row]),
                        prevRow: [...prevRow],
                        curRow: []
                },
                globalHighlights: snapshotHighlights(),
                description: `Starting Unique Paths with Obstacles. Grid size: ${m}×${n}. Using dynamic programming with space optimization (2 rows).`,
                metrics: { 'Grid Size': `${m}×${n}`, Paths: 0 }
        });

	// Initialize first cell
	dp[0][0] = obstacleGrid[0][0] === 1 ? 0 : 1;
        frames.push({
                step: step++,
                state: {
                        grid: obstacleGrid.map((row) => [...row]),
                        visited: visited.map((row) => [...row]),
                        dp: dp.map((row) => [...row]),
                        prevRow: [...prevRow],
                        curRow: []
                },
                focus: [
                        {
                                type: 'grid-cell',
                                id: '0,0',
                                role: obstacleGrid[0][0] === 1 ? 'obstacle' : 'start'
                        }
                ],
                globalHighlights: snapshotHighlights(),
                description: `Initialize: prevRow[0] = ${prevRow[0]} (starting position${
                        obstacleGrid[0][0] === 1 ? ' is blocked!' : ''
                }). *Set starting paths to ${dp[0][0]}*`,
                metrics: { Row: 0, Column: 0, 'Prev Row': prevRow.join(', ') }
        });

	// Process each row
	for (let i = 0; i < m; i++) {
		const curRow = new Array(n);

                frames.push({
                        step: step++,
                        state: {
                                grid: obstacleGrid.map((row) => [...row]),
                                visited: visited.map((row) => [...row]),
                                dp: dp.map((row) => [...row]),
                                prevRow: [...prevRow],
                                curRow: []
                        },
                        focus: Array.from({ length: n }, (_, j) => ({
                                type: 'grid-cell' as const,
                                id: `${i},${j}`,
                                role: 'auxiliary'
                        })),
                        globalHighlights: snapshotHighlights(),
                        description: `Processing row ${i}. Will compute paths for each cell.`,
                        metrics: { Row: i, 'Prev Row': prevRow.join(', ') }
                });

		// Process each column
		for (let j = 0; j < n; j++) {
                        const cellId = `${i},${j}`;
                        if (!visited[i][j]) {
                                visited[i][j] = true;
                                visitedNodeIds.push(cellId);
                        }

			if (obstacleGrid[i][j] === 1) {
				curRow[j] = 0;
				dp[i][j] = 0;

                                frames.push({
                                        step: step++,
                                        state: {
                                                grid: obstacleGrid.map((row) => [...row]),
                                                visited: visited.map((row) => [...row]),
                                                dp: dp.map((row) => [...row]),
                                                prevRow: [...prevRow],
                                                curRow: [...curRow],
                                                currentCell: { row: i, col: j }
                                        },
                                        focus: [{ type: 'grid-cell', id: cellId, role: 'obstacle' }],
                                        globalHighlights: snapshotHighlights(),
                                        description: `Cell [${i},${j}] is blocked (obstacle). Set paths = 0. *Attempted path update blocked ⇒ paths remain 0*`,
                                        metrics: {
                                                Row: i,
                                                Column: j,
                                                'Cell Value': 0,
						'Cur Row': curRow.filter((v) => v !== undefined).join(', ') || '[]'
					}
				});
			} else {
				const fromTop = prevRow[j];
				const fromLeft = j > 0 ? curRow[j - 1] : 0;
				curRow[j] = fromTop + fromLeft;
				dp[i][j] = curRow[j];

                                const neighbors = [];
                                if (i > 0)
                                        neighbors.push({ type: 'grid-cell' as const, id: `${i - 1},${j}`, role: 'path-active' }); // top
                                if (j > 0)
                                        neighbors.push({ type: 'grid-cell' as const, id: `${i},${j - 1}`, role: 'path-active' }); // left

                                frames.push({
                                        step: step++,
                                        state: {
                                                grid: obstacleGrid.map((row) => [...row]),
                                                visited: visited.map((row) => [...row]),
                                                dp: dp.map((row) => [...row]),
						prevRow: [...prevRow],
						curRow: [...curRow],
						currentCell: { row: i, col: j }
					},
                                        focus: [{ type: 'grid-cell', id: cellId, role: 'current' }],
                                        neighbors: neighbors.length > 0 ? neighbors : undefined,
                                        globalHighlights: snapshotHighlights(),
                                        description: `Cell [${i},${j}]: paths = from_top(${fromTop}) + from_left(${fromLeft}) = ${curRow[j]}. *Updated total paths for cell to ${curRow[j]}*`,
					metrics: {
						Row: i,
						Column: j,
						'From Top': fromTop,
						'From Left': fromLeft,
						'Total Paths': curRow[j],
						'Cur Row': curRow.filter((v) => v !== undefined).join(', ') || '[]'
					}
				});
			}
		}

		prevRow = curRow;

                frames.push({
                        step: step++,
                        state: {
                                grid: obstacleGrid.map((row) => [...row]),
                                visited: visited.map((row) => [...row]),
                                dp: dp.map((row) => [...row]),
                                prevRow: [...prevRow],
                                curRow: []
                        },
                        globalHighlights: snapshotHighlights(),
                        description: `Row ${i} complete. Updated prevRow = [${prevRow.join(', ')}].`,
                        metrics: { Row: i, 'Prev Row': prevRow.join(', ') }
                });
	}

        const buildRepresentativePath = (): string[] => {
                if (dp[m - 1][n - 1] === 0) return [];

                const path: string[] = [];
                let row = m - 1;
                let col = n - 1;

                while (row >= 0 && col >= 0) {
                        path.unshift(`${row},${col}`);
                        if (row === 0 && col === 0) {
                                break;
                        }

                        const leftValue = col > 0 ? dp[row][col - 1] : 0;
                        const upValue = row > 0 ? dp[row - 1][col] : 0;

                        if (leftValue > 0 && upValue > 0) {
                                if (leftValue >= upValue) {
                                        col -= 1;
                                } else {
                                        row -= 1;
                                }
                        } else if (leftValue > 0) {
                                col -= 1;
                        } else if (upValue > 0) {
                                row -= 1;
                        } else if (col > 0) {
                                col -= 1;
                        } else if (row > 0) {
                                row -= 1;
                        } else {
                                break;
                        }
                }

                return path;
        };

        // Final result
        const result = prevRow[n - 1];
        const representativePath = buildRepresentativePath();
        frames.push({
                step: step++,
                state: {
                        grid: obstacleGrid.map((row) => [...row]),
                        visited: visited.map((row) => [...row]),
                        dp: dp.map((row) => [...row]),
                        prevRow: [...prevRow],
                        curRow: []
                },
                focus: [{ type: 'grid-cell', id: `${m - 1},${n - 1}`, role: 'goal' }],
                globalHighlights: snapshotHighlights({ pathNodes: representativePath, totalPaths: result }),
                description: `Algorithm complete! Total unique paths from top-left to bottom-right: ${result}. *Final total paths = ${result}*`,
                metrics: { 'Total Paths': result }
        });

	return {
		frames,
		totalSteps: frames.length,
		completed: true,
		metadata: { algorithm: 'Unique Paths with Obstacles', totalPaths: result }
	};
}

export const uniquePathsWithObstaclesPlugin: AlgorithmPlugin<number[][], DPState> = {
	id: 'unique-paths-with-obstacles',
	name: 'Unique Paths with Obstacles',
	description:
		'Given an m×n grid with obstacles, find the number of unique paths from the top-left to bottom-right corner. You can only move right or down. Uses dynamic programming with space optimization.',
	category: 'Graphs',
	subcategory: 'Path Finding',
	visualizationType: 'grid',
	presets: [
		{
			name: 'Simple 3×3',
			description: '3×3 grid with one obstacle',
			data: [
				[0, 0, 0],
				[0, 1, 0],
				[0, 0, 0]
			]
		},
		{
			name: 'Classic Example',
			description: '3×3 grid with obstacle in middle',
			data: [
				[0, 0, 0],
				[0, 1, 0],
				[0, 0, 0]
			]
		},
		{
			name: 'Complex Path',
			description: '4×4 grid with multiple obstacles',
			data: [
				[0, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 0]
			]
		},
		{
			name: 'Blocked Path',
			description: '3×3 with starting position blocked',
			data: [
				[1, 0, 0],
				[0, 0, 0],
				[0, 0, 0]
			]
		},
		{
			name: 'Large Grid',
			description: '5×5 grid with scattered obstacles',
			data: [
				[0, 0, 0, 0, 0],
				[0, 1, 1, 0, 0],
				[0, 0, 0, 1, 0],
				[0, 0, 1, 0, 0],
				[0, 0, 0, 0, 0]
			]
		}
	],
	trace: uniquePathsWithObstacles,
	validateInput: (input: number[][]): ValidationResult => {
		if (!Array.isArray(input) || input.length === 0) {
			return { valid: false, errors: ['Input must be a non-empty 2D array'] };
		}

		const rowLength = input[0].length;
		if (rowLength === 0) {
			return { valid: false, errors: ['Grid rows must not be empty'] };
		}

		for (let i = 0; i < input.length; i++) {
			if (!Array.isArray(input[i]) || input[i].length !== rowLength) {
				return { valid: false, errors: [`Row ${i} has inconsistent length`] };
			}
			for (let j = 0; j < input[i].length; j++) {
				if (input[i][j] !== 0 && input[i][j] !== 1) {
					return {
						valid: false,
						errors: [`Invalid value at [${i}][${j}]: must be 0 (empty) or 1 (obstacle)`]
					};
				}
			}
		}

		return { valid: true };
	}
};

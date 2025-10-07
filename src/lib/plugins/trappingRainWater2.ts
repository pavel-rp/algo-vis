import type { AlgorithmPlugin, Trace, Frame, ValidationResult } from '$lib/types';
import type { GridState } from '$lib/types/state';

interface MinHeapNode {
	row: number;
	col: number;
	height: number;
}

class MinHeap {
	private heap: MinHeapNode[] = [];

	push(node: MinHeapNode) {
		this.heap.push(node);
		this.bubbleUp(this.heap.length - 1);
	}

	pop(): MinHeapNode | undefined {
		if (this.heap.length === 0) return undefined;
		if (this.heap.length === 1) return this.heap.pop();

		const min = this.heap[0];
		this.heap[0] = this.heap.pop()!;
		this.bubbleDown(0);
		return min;
	}

	private bubbleUp(index: number) {
		while (index > 0) {
			const parentIndex = Math.floor((index - 1) / 2);
			if (this.heap[index].height >= this.heap[parentIndex].height) break;
			[this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
			index = parentIndex;
		}
	}

	private bubbleDown(index: number) {
		while (true) {
			let smallest = index;
			const left = 2 * index + 1;
			const right = 2 * index + 2;

			if (left < this.heap.length && this.heap[left].height < this.heap[smallest].height) {
				smallest = left;
			}
			if (right < this.heap.length && this.heap[right].height < this.heap[smallest].height) {
				smallest = right;
			}
			if (smallest === index) break;

			[this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
			index = smallest;
		}
	}

	isEmpty(): boolean {
		return this.heap.length === 0;
	}

	toArray(): MinHeapNode[] {
		return [...this.heap];
	}
}

function trapRainWater2(heightMap: number[][]): Trace<GridState> {
	const frames: Frame<GridState>[] = [];
	const m = heightMap.length;
	const n = heightMap[0].length;

	const visited: boolean[][] = Array.from({ length: m }, () => Array(n).fill(false));
	const water: number[][] = Array.from({ length: m }, () => Array(n).fill(0));

        const heap = new MinHeap();
        let totalWater = 0;
        let step = 0;

        const snapshotHighlights = () => {
                const highlights: NonNullable<Frame<GridState>['globalHighlights']> = [];

                const visitedNodes = visited
                        .map((row, i) => row.map((isVisited, j) => (isVisited ? `${i},${j}` : null)))
                        .flat()
                        .filter((id): id is string => Boolean(id));
                const heapNodes = heap.toArray().map((node) => `${node.row},${node.col}`);
                const waterNodes = water
                        .map((row, i) => row.map((amount, j) => (amount > 0 ? `${i},${j}` : null)))
                        .flat()
                        .filter((id): id is string => Boolean(id));

                if (visitedNodes.length > 0) {
                        highlights.push({ role: 'visited', nodes: visitedNodes });
                }
                if (heapNodes.length > 0) {
                        highlights.push({ role: 'queued', nodes: heapNodes });
                }
                if (waterNodes.length > 0) {
                        highlights.push({
                                role: 'weight-peek',
                                nodes: waterNodes,
                                weight: { label: 'Total Water', value: totalWater, unit: 'units' }
                        });
                }

                return highlights.length > 0 ? highlights : undefined;
        };

	// Frame 0: Initial state
	frames.push({
		step: step++,
		state: {
			grid: heightMap.map((row) => [...row]),
			visited: visited.map((row) => [...row]),
			water: water.map((row) => [...row]),
			heap: []
		},
		description: 'Initial grid. Starting Trapping Rain Water II algorithm.',
		metrics: { 'Total Water': 0 }
	});

	// Add all border cells to heap
	for (let i = 0; i < m; i++) {
		for (let j = 0; j < n; j++) {
			if (i === 0 || i === m - 1 || j === 0 || j === n - 1) {
				heap.push({ row: i, col: j, height: heightMap[i][j] });
				visited[i][j] = true;
			}
		}
	}

        frames.push({
                step: step++,
                state: {
                        grid: heightMap.map((row) => [...row]),
                        visited: visited.map((row) => [...row]),
                        water: water.map((row) => [...row]),
                        heap: heap.toArray()
                },
                focus: Array.from({ length: m }, (_, i) =>
                        Array.from({ length: n }, (_, j) =>
                                i === 0 || i === m - 1 || j === 0 || j === n - 1
                                        ? { type: 'grid-cell' as const, id: `${i},${j}`, role: 'frontier' }
                                        : null
                        )
                )
                        .flat()
                        .filter((marker): marker is NonNullable<typeof marker> => Boolean(marker)),
                globalHighlights: snapshotHighlights(),
                description: 'Added all border cells to min-heap. These form the initial boundary.',
                metrics: { 'Heap Size': heap.toArray().length, 'Total Water': 0 }
        });

	const directions = [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1]
	];

	// Process cells from min-heap
        while (!heap.isEmpty()) {
                const cell = heap.pop()!;
                const { row, col, height } = cell;

                const neighbors = [];
                const aggregateNotes: string[] = [];
                const neighborCells: { row: number; col: number; elev: number }[] = [];

                for (const [dr, dc] of directions) {
                        const newRow = row + dr;
                        const newCol = col + dc;

                        if (
                                newRow >= 0 &&
				newRow < m &&
				newCol >= 0 &&
				newCol < n &&
				!visited[newRow][newCol]
			) {
                                visited[newRow][newCol] = true;
                                const neighborHeight = heightMap[newRow][newCol];
                                const trappedCandidate = height - neighborHeight;
                                const trapped = Math.max(0, trappedCandidate);
                                const previousTotal = totalWater;
                                const updatedTotal = previousTotal + trapped;
                                water[newRow][newCol] = trapped;
                                totalWater = updatedTotal;

                                const aggregateMessage =
                                        trapped > 0
                                                ? `*Added max(0, ${height} - ${neighborHeight}) = ${trapped} water ⇒ ${previousTotal} → ${updatedTotal}*`
                                                : `*Checked max(0, ${height} - ${neighborHeight}) = 0 ⇒ total stays ${updatedTotal}*`;
                                aggregateNotes.push(aggregateMessage);

                                heap.push({
                                        row: newRow,
                                        col: newCol,
                                        height: Math.max(height, neighborHeight)
                                });

                                neighbors.push({ type: 'grid-cell' as const, id: `${newRow},${newCol}`, role: 'frontier' });
                                neighborCells.push({ row: newRow, col: newCol, elev: neighborHeight });
                        }
                }

                let desc = `Processing cell (${row},${col}) with height ${heightMap[row][col]}. `;
                if (neighbors.length > 0) {
                        desc += `Found ${neighbors.length} unvisited neighbor(s): `;
                        desc += neighborCells.map((c) => `(${c.row},${c.col})→${c.elev}`).join(', ');
                } else {
                        desc += 'No new neighbors to explore.';
                }

                if (aggregateNotes.length > 0) {
                        desc += ` ${aggregateNotes.join(' ')}`;
                }

                frames.push({
                        step: step++,
                        state: {
                                grid: heightMap.map((row) => [...row]),
                                visited: visited.map((row) => [...row]),
                                water: water.map((row) => [...row]),
				heap: heap.toArray()
			},
                        focus: [{ type: 'grid-cell', id: `${row},${col}`, role: 'current' }],
                        neighbors: neighbors.length > 0 ? neighbors : undefined,
                        globalHighlights: snapshotHighlights(),
                        description: desc,
                        metrics: {
                                'Current Height': height,
                                'Heap Size': heap.toArray().length,
                                'Total Water': totalWater
                        }
		});
	}

	// Final frame
        frames.push({
                step: step++,
                state: {
                        grid: heightMap.map((row) => [...row]),
                        visited: visited.map((row) => [...row]),
                        water: water.map((row) => [...row]),
                        heap: []
                },
                globalHighlights: snapshotHighlights(),
                description: `Algorithm complete! Total water trapped: ${totalWater} units. *Final total water = ${totalWater}*`,
                metrics: { 'Total Water': totalWater }
        });

	return {
		frames,
		totalSteps: frames.length,
		completed: true,
		metadata: { algorithm: 'Trapping Rain Water II', totalWater }
	};
}

export const trappingRainWater2Plugin: AlgorithmPlugin<number[][], GridState> = {
	id: 'trapping-rain-water-2',
	name: 'Trapping Rain Water II',
	description:
		'Given an m x n matrix of non-negative integers representing the height of each unit cell, compute how much water can be trapped after raining.',
	category: 'Dynamic Programming',
	subcategory: '2D Array',
	visualizationType: 'grid',
	presets: [
		{
			name: 'Small Example',
			description: '3x6 grid with valleys',
			data: [
				[1, 4, 3, 1, 3, 2],
				[3, 2, 1, 3, 2, 4],
				[2, 3, 3, 2, 3, 1]
			]
		},
		{
			name: 'Medium Example',
			description: '5x5 grid with central depression',
			data: [
				[12, 13, 1, 12, 13],
				[13, 4, 13, 12, 13],
				[13, 8, 10, 12, 12],
				[12, 13, 12, 12, 12],
				[13, 13, 13, 13, 13]
			]
		},
		{
			name: 'Large Example',
			description: '6x8 grid complex terrain',
			data: [
				[5, 5, 5, 5, 5, 5, 5, 5],
				[5, 1, 1, 1, 1, 1, 1, 5],
				[5, 1, 3, 3, 3, 3, 1, 5],
				[5, 1, 3, 1, 1, 3, 1, 5],
				[5, 1, 3, 3, 3, 3, 1, 5],
				[5, 5, 5, 5, 5, 5, 5, 5]
			]
		}
	],
	trace: trapRainWater2,
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
				if (typeof input[i][j] !== 'number' || input[i][j] < 0) {
					return {
						valid: false,
						errors: [`Invalid value at [${i}][${j}]: must be non-negative number`]
					};
				}
			}
		}

		if (input.length < 3 || rowLength < 3) {
			return {
				valid: false,
				errors: ['Grid must be at least 3x3 to trap water']
			};
		}

		return { valid: true };
	}
};

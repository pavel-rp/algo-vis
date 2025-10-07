# Algorithm Visualizer

[![CI](https://github.com/YOUR_USERNAME/algo-vis/workflows/CI/badge.svg)](https://github.com/YOUR_USERNAME/algo-vis/actions)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/algo-vis/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/algo-vis)

An interactive algorithm visualization framework built with Svelte 5, allowing developers to create animated, step-by-step visualizations of computer science algorithms.

## Features

- ✅ **Frame-based playback** with play, pause, step forward/back controls
- ✅ **Speed control** (0.5x to 4x)
- ✅ **Plugin architecture** for easy algorithm addition
- ✅ **Type-safe validation** with Zod schemas
- ✅ **Grid visualization** with focus and neighbor highlighting
- ✅ **2 algorithms included**: Trapping Rain Water II, Unique Paths with Obstacles

## Demo Algorithms

### 1. Trapping Rain Water II
Min-heap based algorithm that calculates water volume trapped in a 2D grid after raining.

### 2. Unique Paths with Obstacles
Dynamic programming algorithm that counts unique paths from top-left to bottom-right in a grid with obstacles.

## Tech Stack

- **Svelte 5** (runes mode) - Reactive UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **Zod** - Runtime validation
- **Vitest** - Testing framework

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Build for production
pnpm build
```

## Project Structure

```
src/
├── lib/
│   ├── core/               # Core framework
│   │   └── PlaybackController.svelte.ts
│   ├── types/              # TypeScript types
│   │   ├── plugin.ts
│   │   ├── state.ts
│   │   └── validation.ts
│   ├── plugins/            # Algorithm implementations
│   │   ├── trappingRainWater2.ts
│   │   └── uniquePathsWithObstacles.ts
│   ├── renderers/          # Visualization components
│   │   └── GridRenderer.svelte
│   └── components/         # UI components
│       ├── PlaybackControls.svelte
│       ├── SpeedControl.svelte
│       └── StatusPanel.svelte
└── routes/
    └── +page.svelte        # Main app page
```

## Test Coverage

- **84 passing tests**, 4 skipped
- **PlaybackController**: 81.81% coverage
- **Validation**: 100% coverage
- **Plugins**: 100% coverage

See [TESTING.md](./TESTING.md) for detailed testing information.

## Adding New Algorithms

Create a new plugin following the `AlgorithmPlugin` interface and the [visual encoding palette](./specs/master/visual-encoding.md) when assigning state colors:

```typescript
export const myAlgorithmPlugin: AlgorithmPlugin<InputType, StateType> = {
  id: 'my-algorithm',
  name: 'My Algorithm',
  description: 'Algorithm description...',
  category: 'Category Name',
  visualizationType: 'grid',

  presets: [
    {
      name: 'Example 1',
      description: 'Description...',
      data: [[1, 2, 3], [4, 5, 6]]
    }
  ],

  trace: (input: InputType): Trace<StateType> => {
    const frames: Frame<StateType>[] = [];
    // Generate frames...
    return {
      frames,
      totalSteps: frames.length,
      completed: true
    };
  },

  validateInput: (input: any): ValidationResult => {
    // Validate input...
    return { valid: true };
  }
};
```

## CI/CD

GitHub Actions workflow runs on every push and PR:
- ✅ Runs tests
- ✅ Generates coverage reports
- ✅ Validates production build
- ✅ Uploads coverage to Codecov (optional)

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a pull request

---

Built with ❤️ using Svelte 5

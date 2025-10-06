import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: {
		include: ['**/*.{test,spec}.{ts,svelte.ts}'],
		environment: 'happy-dom',
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			include: ['src/lib/**/*.{ts,svelte}'],
			exclude: ['src/lib/**/*.test.ts', 'src/lib/**/*.spec.ts', 'src/lib/types/**'],
			thresholds: {
				// Critical components: 80%
				'src/lib/core/PlaybackController.svelte.ts': {
					lines: 80,
					functions: 80,
					branches: 80,
					statements: 80
				}
				// Note: validation.ts, renderers, components thresholds will be added
				// as tests are written for them (T009-T012)
			}
		}
	},
	resolve: {
		alias: {
			$lib: '/src/lib'
		}
	}
});

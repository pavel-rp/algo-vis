import type { Trace, Frame } from '$lib/types';

/**
 * PlaybackController - Manages visualization playback state using Svelte 5 runes
 *
 * Uses:
 * - $state for mutable reactive values
 * - $state.raw() for trace (prevents deep reactivity on large arrays)
 * - $derived for computed values
 * - $effect for play interval management
 */

export class PlaybackController<TState = any> {
	// Mutable state
	currentIndex = $state(0);
	isPlaying = $state(false);
	speed = $state(350); // ms per frame

	// Trace stored without deep reactivity
	#trace = $state.raw<Trace<TState> | null>(null);

	// Computed values
	get currentFrame(): Frame<TState> | null {
		if (!this.#trace || this.currentIndex >= this.#trace.frames.length) {
			return null;
		}
		return this.#trace.frames[this.currentIndex];
	}

	get totalSteps(): number {
		return this.#trace?.totalSteps ?? 0;
	}

	get progress(): number {
		if (this.totalSteps === 0) return 0;
		return (this.currentIndex / (this.totalSteps - 1)) * 100;
	}

	get trace(): Trace<TState> | null {
		return this.#trace;
	}

	// Play interval management
	#intervalId: ReturnType<typeof setInterval> | null = null;

	constructor() {
		// Effect to manage play interval
		$effect(() => {
			if (this.isPlaying) {
				this.#intervalId = setInterval(() => {
					if (this.currentIndex >= this.totalSteps - 1) {
						this.pause();
					} else {
						this.stepForward();
					}
				}, this.speed);

				return () => {
					if (this.#intervalId) {
						clearInterval(this.#intervalId);
					}
				};
			}
		});
	}

	/** Step forward one frame */
	stepForward() {
		if (this.currentIndex < this.totalSteps - 1) {
			this.currentIndex++;
		}
	}

	/** Step back one frame */
	stepBack() {
		if (this.currentIndex > 0) {
			this.currentIndex--;
		}
	}

	/** Start automatic playback */
	play() {
		if (this.currentIndex >= this.totalSteps - 1) {
			this.currentIndex = 0;
		}
		this.isPlaying = true;
	}

	/** Pause playback */
	pause() {
		this.isPlaying = false;
		if (this.#intervalId) {
			clearInterval(this.#intervalId);
			this.#intervalId = null;
		}
	}

	/** Reset to first frame */
	reset() {
		this.pause();
		this.currentIndex = 0;
	}

	/** Update playback speed */
	setSpeed(ms: number) {
		this.speed = Math.max(50, Math.min(2000, ms));
	}

	/** Load new trace */
	loadTrace(trace: Trace<TState>) {
		this.pause();
		this.#trace = trace;
		this.currentIndex = 0;
	}
}

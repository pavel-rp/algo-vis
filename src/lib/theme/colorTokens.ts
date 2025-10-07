import type { HighlightRole } from '$lib/types';

export type HighlightTokens = {
        fill: string;
        border: string;
        text: string;
};

export const HIGHLIGHT_COLOR_TOKENS: Record<HighlightRole, HighlightTokens> = {
        start: {
                fill: 'bg-emerald-500/90 dark:bg-emerald-400/90',
                border: 'ring-emerald-600 dark:ring-emerald-300',
                text: 'text-white'
        },
        goal: {
                fill: 'bg-rose-500/90 dark:bg-rose-400/90',
                border: 'ring-rose-600 dark:ring-rose-300',
                text: 'text-white'
        },
        current: {
                fill: 'bg-amber-300/90 dark:bg-amber-400/90',
                border: 'ring-amber-500 dark:ring-amber-300',
                text: 'text-slate-900'
        },
        frontier: {
                fill: 'bg-sky-300/90 dark:bg-sky-400/90',
                border: 'ring-sky-500 dark:ring-sky-300',
                text: 'text-slate-900'
        },
        queued: {
                fill: 'bg-indigo-400/80 dark:bg-indigo-500/80',
                border: 'ring-indigo-500 dark:ring-indigo-300',
                text: 'text-white'
        },
        visited: {
                fill: 'bg-blue-500/60 dark:bg-blue-400/60',
                border: 'ring-blue-600 dark:ring-blue-300',
                text: 'text-white'
        },
        'path-active': {
                fill: 'bg-emerald-300/70 dark:bg-emerald-300/80',
                border: 'ring-emerald-500 dark:ring-emerald-200',
                text: 'text-slate-900'
        },
        'path-final': {
                fill: 'bg-lime-300/80 dark:bg-lime-300/85',
                border: 'ring-lime-500 dark:ring-lime-200',
                text: 'text-slate-900'
        },
        obstacle: {
                fill: 'bg-slate-700/80 dark:bg-slate-800/80',
                border: 'ring-slate-800 dark:ring-slate-600',
                text: 'text-white'
        },
        'weight-peek': {
                fill: 'bg-fuchsia-500/80 dark:bg-fuchsia-500/80',
                border: 'ring-fuchsia-600 dark:ring-fuchsia-300',
                text: 'text-white'
        },
        auxiliary: {
                fill: 'bg-zinc-400/70 dark:bg-zinc-500/70',
                border: 'ring-zinc-500 dark:ring-zinc-400',
                text: 'text-slate-900 dark:text-slate-50'
        }
};

import type { HighlightRole } from '$lib/types';

type HighlightTokens = {
        fill: string;
        border: string;
        text: string;
};

export const HIGHLIGHT_COLOR_TOKENS: Record<HighlightRole, HighlightTokens> = {
        start: {
                fill: 'bg-emerald-500/90',
                border: 'ring-emerald-600',
                text: 'text-white'
        },
        goal: {
                fill: 'bg-rose-500/90',
                border: 'ring-rose-600',
                text: 'text-white'
        },
        current: {
                fill: 'bg-amber-400/90',
                border: 'ring-amber-500',
                text: 'text-slate-900'
        },
        frontier: {
                fill: 'bg-sky-400/80',
                border: 'ring-sky-500',
                text: 'text-slate-900'
        },
        queued: {
                fill: 'bg-indigo-400/80',
                border: 'ring-indigo-500',
                text: 'text-white'
        },
        visited: {
                fill: 'bg-blue-500/60',
                border: 'ring-blue-600',
                text: 'text-white'
        },
        'path-active': {
                fill: 'bg-emerald-400/70',
                border: 'ring-emerald-500',
                text: 'text-slate-900'
        },
        'path-final': {
                fill: 'bg-lime-400/80',
                border: 'ring-lime-500',
                text: 'text-slate-900'
        },
        obstacle: {
                fill: 'bg-slate-700/80',
                border: 'ring-slate-800',
                text: 'text-white'
        },
        'weight-peek': {
                fill: 'bg-fuchsia-500/80',
                border: 'ring-fuchsia-600',
                text: 'text-white'
        },
        auxiliary: {
                fill: 'bg-zinc-400/70',
                border: 'ring-zinc-500',
                text: 'text-slate-900'
        }
};

import { writable } from 'svelte/store';

export const visibleCards = writable<HTMLElement[]>([]);

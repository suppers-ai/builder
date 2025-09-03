import { vi } from 'vitest';
import { readable } from 'svelte/store';
import type { Navigation, Page } from '@sveltejs/kit';

export const getStores = () => {
	const navigating = readable<Navigation | null>(null);
	const page = readable<Page>({
		url: new URL('http://localhost'),
		params: {},
		route: {
			id: '/'
		},
		status: 200,
		error: null,
		data: {},
		form: undefined
	});
	const updated = { 
		subscribe: readable(false).subscribe, 
		check: vi.fn() 
	};

	return { navigating, page, updated };
};

export const page = {
	subscribe: vi.fn()
};

export const navigating = {
	subscribe: vi.fn()
};

export const updated = {
	subscribe: vi.fn(),
	check: vi.fn()
};
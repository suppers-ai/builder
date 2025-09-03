import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { readable } from 'svelte/store';
import type { Navigation, Page } from '@sveltejs/kit';

// Mock SvelteKit modules
vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidate: vi.fn(),
	invalidateAll: vi.fn(),
	prefetch: vi.fn(),
	prefetchRoutes: vi.fn(),
	beforeNavigate: vi.fn(),
	afterNavigate: vi.fn()
}));

vi.mock('$app/stores', () => {
	const getStores = () => {
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
		const updated = { subscribe: readable(false).subscribe, check: vi.fn() };

		return { navigating, page, updated };
	};

	const page = {
		subscribe: vi.fn()
	};

	const navigating = {
		subscribe: vi.fn()
	};

	const updated = {
		subscribe: vi.fn(),
		check: vi.fn()
	};

	return {
		getStores,
		page,
		navigating,
		updated
	};
});

vi.mock('$app/environment', () => ({
	browser: true,
	dev: true,
	building: false,
	version: 'test'
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation(query => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

// Mock IntersectionObserver
class IntersectionObserverMock {
	observe = vi.fn();
	disconnect = vi.fn();
	unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
	writable: true,
	value: IntersectionObserverMock
});

// Mock ResizeObserver
class ResizeObserverMock {
	observe = vi.fn();
	disconnect = vi.fn();
	unobserve = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
	writable: true,
	value: ResizeObserverMock
});

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
	writable: true,
	value: localStorageMock
});

// Mock fetch
global.fetch = vi.fn();

// Mock WebSocket
class WebSocketMock {
	constructor(public url: string) {}
	send = vi.fn();
	close = vi.fn();
	addEventListener = vi.fn();
	removeEventListener = vi.fn();
}

Object.defineProperty(window, 'WebSocket', {
	writable: true,
	value: WebSocketMock
});

// Mock navigator
Object.defineProperty(navigator, 'onLine', {
	writable: true,
	value: true
});

Object.defineProperty(navigator, 'vibrate', {
	writable: true,
	value: vi.fn()
});

// Mock Service Worker
Object.defineProperty(navigator, 'serviceWorker', {
	writable: true,
	value: {
		register: vi.fn(() => Promise.resolve({
			installing: null,
			waiting: null,
			active: null,
			addEventListener: vi.fn()
		})),
		ready: Promise.resolve({
			pushManager: {
				subscribe: vi.fn(),
				getSubscription: vi.fn()
			}
		})
	}
});

// Mock Notification API
Object.defineProperty(window, 'Notification', {
	writable: true,
	value: {
		permission: 'default',
		requestPermission: vi.fn(() => Promise.resolve('granted'))
	}
});
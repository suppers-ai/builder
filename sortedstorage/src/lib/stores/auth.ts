import { writable, derived } from 'svelte/store';
import { api } from '$lib/services/api';
import { apiClient } from '$lib/api/client';
import { goto } from '$app/navigation';
import type { User } from '$lib/types/storage';

interface AuthState {
	user: User | null;
	loading: boolean;
	error: string | null;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		loading: false,
		error: null
	});

	return {
		subscribe,
		
		async login(email: string, password: string) {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				// Solobase auth login endpoint
				const response = await api.post<{ user: User, token: string }>('/api/auth/login', {
					email,
					password
				});
				
				api.setToken(response.token);
				apiClient.setToken(response.token);
				localStorage.setItem('token', response.token);
				token$.set(response.token);
				
				set({ user: response.user, loading: false, error: null });
				goto('/');
			} catch (error) {
				update(state => ({
					...state,
					loading: false,
					error: error instanceof Error ? error.message : 'Login failed'
				}));
			}
		},

		async register(email: string, password: string, name: string) {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				// Solobase auth register endpoint
				const response = await api.post<{ user: User, token: string }>('/api/auth/register', {
					email,
					password,
					name
				});
				
				api.setToken(response.token);
				apiClient.setToken(response.token);
				localStorage.setItem('token', response.token);
				token$.set(response.token);
				
				set({ user: response.user, loading: false, error: null });
				goto('/');
			} catch (error) {
				update(state => ({
					...state,
					loading: false,
					error: error instanceof Error ? error.message : 'Registration failed'
				}));
			}
		},

		async logout() {
			try {
				// Solobase auth logout endpoint
				await api.post('/api/auth/logout');
			} catch {
				// Ignore logout errors
			}
			
			api.setToken(null);
			apiClient.setToken(null);
			localStorage.removeItem('token');
			token$.set(null);
			// Clear auth cookie
			document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
			set({ user: null, loading: false, error: null });
			goto('/auth/login');
		},

		async checkAuth() {
			const token = localStorage.getItem('token');
			if (!token) {
				set({ user: null, loading: false, error: null });
				return;
			}

			api.setToken(token);
			apiClient.setToken(token);
			update(state => ({ ...state, loading: true }));

			try {
				// Solobase auth me endpoint
				const user = await api.get<User>('/api/auth/me');
				set({ user, loading: false, error: null });
				token$.set(token);
			} catch {
				api.setToken(null);
				apiClient.setToken(null);
				localStorage.removeItem('token');
				token$.set(null);
				set({ user: null, loading: false, error: null });
			}
		},

		setToken(token: string | null) {
			if (token) {
				api.setToken(token);
				apiClient.setToken(token);
				localStorage.setItem('token', token);
				token$.set(token);
			} else {
				api.setToken(null);
				apiClient.setToken(null);
				localStorage.removeItem('token');
				token$.set(null);
			}
		},

		async updateProfile(updates: Partial<User>) {
			update(state => ({ ...state, loading: true, error: null }));
			
			try {
				// Solobase auth profile endpoint
				const user = await api.put<User>('/api/auth/profile', updates);
				set({ user, loading: false, error: null });
			} catch (error) {
				update(state => ({
					...state,
					loading: false,
					error: error instanceof Error ? error.message : 'Update failed'
				}));
			}
		}
	};
}

export const auth = createAuthStore();
export const isAuthenticated = derived(auth, $auth => !!$auth.user);

// Add a derived store for the token
let currentToken: string | null = null;
if (typeof window !== 'undefined') {
	currentToken = localStorage.getItem('token');
}
export const token$ = writable(currentToken);
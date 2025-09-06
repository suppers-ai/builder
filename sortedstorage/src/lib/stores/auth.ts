import { writable, derived } from 'svelte/store';
import { api } from '$lib/services/api';
import { apiClient } from '$lib/api/client';
import { goto } from '$app/navigation';
import type { User } from '$lib/types/storage';
import { authConfig } from '$lib/config/auth';

// Initialize token store first to avoid hoisting issues
let currentToken: string | null = null;
if (typeof window !== 'undefined') {
	// Use 'auth_token' as the consistent key (matching Solobase)
	currentToken = localStorage.getItem('auth_token');
}
export const token$ = writable(currentToken);

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
				const response = await api.post<{ user: any, token: string }>('/api/auth/login', {
					email,
					password
				});
				
				api.setToken(response.token);
				apiClient.setToken(response.token);
				localStorage.setItem('auth_token', response.token);
				token$.set(response.token);
				
				// Map Solobase user to SortedStorage User type
				const user: User = {
					id: response.user.id,
					email: response.user.email,
					name: response.user.name || response.user.email.split('@')[0],
					role: response.user.role as 'user' | 'admin',
					subscription: {
						id: 'free',
						name: 'free',
						storageLimit: 5 * 1024 * 1024 * 1024, // 5GB
						bandwidthLimit: 10 * 1024 * 1024 * 1024, // 10GB
						features: ['Basic storage', 'File sharing'],
						price: 0,
						interval: 'monthly',
						status: 'active'
					},
					createdAt: new Date(response.user.created_at || Date.now())
				};
				
				set({ user, loading: false, error: null });
				// Don't redirect here, let the login page handle it
				// goto('/');
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
				const response = await api.post<{ user: any, token: string }>('/api/auth/register', {
					email,
					password,
					name
				});
				
				api.setToken(response.token);
				apiClient.setToken(response.token);
				localStorage.setItem('auth_token', response.token);
				token$.set(response.token);
				
				// Map Solobase user to SortedStorage User type
				const user: User = {
					id: response.user.id,
					email: response.user.email,
					name: response.user.name || response.user.email.split('@')[0],
					role: response.user.role as 'user' | 'admin',
					subscription: {
						id: 'free',
						name: 'free',
						storageLimit: 5 * 1024 * 1024 * 1024,
						bandwidthLimit: 10 * 1024 * 1024 * 1024,
						features: ['Basic storage', 'File sharing'],
						price: 0,
						interval: 'monthly',
						status: 'active'
					},
					createdAt: new Date(response.user.created_at || Date.now())
				};
				
				set({ user: response.user, loading: false, error: null });
				// Don't redirect here, let the register page handle it
				// goto('/');
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
			localStorage.removeItem('auth_token');
			token$.set(null);
			// Clear auth cookie
			document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
			set({ user: null, loading: false, error: null });
			// Redirect to Solobase logout
			window.location.href = authConfig.logoutUrl();
		},

		async checkAuth() {
			// Use 'token' as the consistent key
			const token = localStorage.getItem('auth_token');
			console.log('[Auth] Checking auth, token exists:', !!token);
			
			if (!token) {
				set({ user: null, loading: false, error: null });
				return;
			}
			api.setToken(token);
			apiClient.setToken(token);
			// Also ensure the token is loaded from storage
			apiClient.loadTokenFromStorage();
			update(state => ({ ...state, loading: true }));

			try {
				// Solobase auth me endpoint
				const solobaseUser = await api.get<any>('/api/auth/me');
				console.log('[Auth] User loaded:', solobaseUser);
				
				// Map Solobase user to SortedStorage User type
				const user: User = {
					id: solobaseUser.id,
					email: solobaseUser.email,
					name: solobaseUser.name || solobaseUser.email.split('@')[0], // Use email prefix as name if not provided
					role: solobaseUser.role as 'user' | 'admin',
					subscription: {
						id: 'free',
						name: 'free',
						storageLimit: 5 * 1024 * 1024 * 1024, // 5GB
						bandwidthLimit: 10 * 1024 * 1024 * 1024, // 10GB
						features: ['Basic storage', 'File sharing'],
						price: 0,
						interval: 'monthly',
						status: 'active'
					},
					createdAt: new Date(solobaseUser.created_at || Date.now())
				};
				
				set({ user, loading: false, error: null });
				token$.set(token);
			} catch {
				api.setToken(null);
				apiClient.setToken(null);
				localStorage.removeItem('auth_token');
				token$.set(null);
				set({ user: null, loading: false, error: null });
			}
		},

		setToken(token: string | null) {
			if (token) {
				api.setToken(token);
				apiClient.setToken(token);
				localStorage.setItem('auth_token', token);
				token$.set(token);
			} else {
				api.setToken(null);
				apiClient.setToken(null);
				localStorage.removeItem('auth_token');
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
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
			// In sortedstorage, we don't handle login directly
			// Redirect to solobase login page
			window.location.href = getAuthLoginUrl('/');
		},

		async register(email: string, password: string, name: string) {
			// In sortedstorage, we don't handle registration directly
			// Redirect to solobase register page
			window.location.href = authConfig.registerUrl();
		},

		async logout() {
			// Clear local storage and tokens
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

			// Since we have a token, assume user is authenticated
			// In production, user info would come from solobase session
			// For now, create a simple user object
			const user: User = {
				id: 'user-1',
				email: 'user@example.com',
				name: 'User',
				role: 'user',
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
				createdAt: new Date()
			};
			
			set({ user, loading: false, error: null });
			token$.set(token);
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
			// Profile updates should be handled in solobase
			// Redirect to profile page
			window.location.href = authConfig.profileUrl();
		}
	};
}

export const auth = createAuthStore();
export const isAuthenticated = derived(auth, $auth => !!$auth.user);
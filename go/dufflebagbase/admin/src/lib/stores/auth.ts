import { writable, derived } from 'svelte/store';
import type { User } from '$lib/types';
import { api } from '$lib/api';

interface AuthState {
	user: User | null;
	loading: boolean;
	error: string | null;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		loading: true,
		error: null
	});

	return {
		subscribe,
		async login(email: string, password: string) {
			update(state => ({ ...state, loading: true, error: null }));
			
			const response = await api.login({ email, password });
			
			if (response.error) {
				update(state => ({ ...state, loading: false, error: response.error! }));
				return false;
			}

			update(state => ({ 
				...state, 
				user: response.data!.user, 
				loading: false, 
				error: null 
			}));
			return true;
		},
		async logout() {
			await api.logout();
			set({ user: null, loading: false, error: null });
		},
		async checkAuth() {
			update(state => ({ ...state, loading: true }));
			
			const response = await api.getCurrentUser();
			
			if (response.error) {
				set({ user: null, loading: false, error: null });
				return false;
			}

			update(state => ({ 
				...state, 
				user: response.data!, 
				loading: false, 
				error: null 
			}));
			return true;
		},
		setUser(user: User | null) {
			update(state => ({ ...state, user }));
		}
	};
}

export const auth = createAuthStore();
export const isAuthenticated = derived(auth, $auth => !!$auth.user);
export const currentUser = derived(auth, $auth => $auth.user);
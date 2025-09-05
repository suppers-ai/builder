/**
 * Authentication configuration
 */

import { config } from './env';

// In production with a single binary, auth will be on the same origin
// In development with Vite proxy, auth is also on the same origin
export const authConfig = {
	// Empty baseUrl for relative URLs - works with Vite proxy in dev and single binary in prod
	baseUrl: '',
	
	// Auth endpoints - all relative paths
	loginUrl: () => `/auth/login`,
	logoutUrl: () => `/auth/logout`,
	registerUrl: () => `/auth/register`,
	profileUrl: () => `/profile`,
	adminUrl: () => `/admin`,
	
	// Redirect URL after successful login
	loginRedirectUrl: '/files'
};

// Helper function to build auth URL with redirect
export function getAuthLoginUrl(redirectTo: string = '/files'): string {
	const loginUrl = authConfig.loginUrl();
	// With proxy, everything is same-origin, so use relative paths
	const params = new URLSearchParams();
	params.set('redirect', redirectTo);
	return `${loginUrl}?${params.toString()}`;
}
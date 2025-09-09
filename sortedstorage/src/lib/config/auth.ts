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
	loginRedirectUrl: '/'
};

// Helper function to build auth URL with redirect
export function getAuthLoginUrl(redirectTo: string = '/'): string {
	const loginUrl = authConfig.loginUrl();
	// Need to pass the full URL for SortedStorage so redirect goes back to the right app
	const params = new URLSearchParams();
	// In development, use the full URL with the dev server port
	// In production, this would be handled differently
	const fullRedirectUrl = typeof window !== 'undefined' 
		? `${window.location.origin}${redirectTo}`
		: redirectTo;
	params.set('redirect', fullRedirectUrl);
	return `${loginUrl}?${params.toString()}`;
}
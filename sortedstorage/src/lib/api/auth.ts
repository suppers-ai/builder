/**
 * Authentication API service
 */

import apiClient from './client';

export interface LoginCredentials {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export interface RegisterData {
	email: string;
	password: string;
	name: string;
	acceptTerms: boolean;
}

export interface User {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	role: 'user' | 'admin' | 'manager';
	verified: boolean;
	createdAt: Date;
	lastLoginAt?: Date;
	subscription?: {
		plan: string;
		status: 'active' | 'cancelled' | 'expired';
		expiresAt: Date;
	};
	quota?: {
		used: number;
		total: number;
	};
	preferences?: {
		theme?: 'light' | 'dark' | 'system';
		language?: string;
		notifications?: {
			email?: boolean;
			push?: boolean;
			desktop?: boolean;
		};
	};
}

export interface AuthResponse {
	user: User;
	token: string;
	refreshToken?: string;
	expiresIn: number;
}

export interface PasswordResetRequest {
	email: string;
}

export interface PasswordResetConfirm {
	token: string;
	password: string;
}

export interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
}

export interface OAuthProvider {
	id: string;
	name: string;
	icon: string;
	authUrl: string;
}

class AuthAPI {
	private basePath = '/api/auth';

	/**
	 * Login with email and password
	 */
	async login(credentials: LoginCredentials): Promise<AuthResponse> {
		const response = await apiClient.post<AuthResponse>(
			`${this.basePath}/login`,
			credentials
		);

		// Store token
		if (response.token) {
			apiClient.setAuthToken(response.token);
		}

		return response;
	}

	/**
	 * Register new account
	 */
	async register(data: RegisterData): Promise<AuthResponse> {
		const response = await apiClient.post<AuthResponse>(
			`${this.basePath}/register`,
			data
		);

		// Store token
		if (response.token) {
			apiClient.setAuthToken(response.token);
		}

		return response;
	}

	/**
	 * Logout
	 */
	async logout(): Promise<void> {
		try {
			await apiClient.post(`${this.basePath}/logout`);
		} finally {
			// Clear token even if logout fails
			apiClient.setAuthToken(null);
		}
	}

	/**
	 * Get current user
	 */
	async getCurrentUser(): Promise<User> {
		return apiClient.get(`${this.basePath}/me`);
	}

	/**
	 * Update user profile
	 */
	async updateProfile(updates: Partial<{
		name: string;
		avatar: string;
		preferences: User['preferences'];
	}>): Promise<User> {
		return apiClient.patch(`${this.basePath}/me`, updates);
	}

	/**
	 * Upload avatar
	 */
	async uploadAvatar(file: File): Promise<{ url: string }> {
		const response = await apiClient.upload(
			`${this.basePath}/me/avatar`,
			file
		);
		return response;
	}

	/**
	 * Change password
	 */
	async changePassword(request: ChangePasswordRequest): Promise<void> {
		await apiClient.post(`${this.basePath}/me/password`, request);
	}

	/**
	 * Request password reset
	 */
	async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
		await apiClient.post(`${this.basePath}/password/reset`, request);
	}

	/**
	 * Confirm password reset
	 */
	async confirmPasswordReset(request: PasswordResetConfirm): Promise<void> {
		await apiClient.post(`${this.basePath}/password/confirm`, request);
	}

	/**
	 * Verify email
	 */
	async verifyEmail(token: string): Promise<void> {
		await apiClient.post(`${this.basePath}/verify`, { token });
	}

	/**
	 * Resend verification email
	 */
	async resendVerification(email: string): Promise<void> {
		await apiClient.post(`${this.basePath}/verify/resend`, { email });
	}

	/**
	 * Refresh authentication token
	 */
	async refreshToken(): Promise<AuthResponse> {
		const response = await apiClient.post<AuthResponse>(
			`${this.basePath}/refresh`
		);

		// Update token
		if (response.token) {
			apiClient.setAuthToken(response.token);
		}

		return response;
	}

	/**
	 * Get available OAuth providers
	 */
	async getOAuthProviders(): Promise<OAuthProvider[]> {
		return apiClient.get(`${this.basePath}/oauth/providers`);
	}

	/**
	 * Initiate OAuth login
	 */
	getOAuthLoginUrl(provider: string, redirectUri?: string): string {
		const params = new URLSearchParams({
			provider,
			redirect_uri: redirectUri || window.location.origin + '/auth/callback'
		});
		
		const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
		return `${baseURL}${this.basePath}/oauth/login?${params.toString()}`;
	}

	/**
	 * Complete OAuth login
	 */
	async completeOAuthLogin(
		provider: string,
		code: string,
		state?: string
	): Promise<AuthResponse> {
		const response = await apiClient.post<AuthResponse>(
			`${this.basePath}/oauth/callback`,
			{
				provider,
				code,
				state
			}
		);

		// Store token
		if (response.token) {
			apiClient.setAuthToken(response.token);
		}

		return response;
	}

	/**
	 * Link OAuth account
	 */
	async linkOAuthAccount(
		provider: string,
		code: string
	): Promise<void> {
		await apiClient.post(`${this.basePath}/oauth/link`, {
			provider,
			code
		});
	}

	/**
	 * Unlink OAuth account
	 */
	async unlinkOAuthAccount(provider: string): Promise<void> {
		await apiClient.delete(`${this.basePath}/oauth/link/${provider}`);
	}

	/**
	 * Get linked OAuth accounts
	 */
	async getLinkedAccounts(): Promise<{
		provider: string;
		email: string;
		linkedAt: Date;
	}[]> {
		return apiClient.get(`${this.basePath}/oauth/linked`);
	}

	/**
	 * Enable two-factor authentication
	 */
	async enable2FA(): Promise<{
		secret: string;
		qrCode: string;
		backupCodes: string[];
	}> {
		return apiClient.post(`${this.basePath}/2fa/enable`);
	}

	/**
	 * Confirm 2FA setup
	 */
	async confirm2FA(code: string): Promise<void> {
		await apiClient.post(`${this.basePath}/2fa/confirm`, { code });
	}

	/**
	 * Disable two-factor authentication
	 */
	async disable2FA(password: string): Promise<void> {
		await apiClient.post(`${this.basePath}/2fa/disable`, { password });
	}

	/**
	 * Verify 2FA code
	 */
	async verify2FA(code: string): Promise<AuthResponse> {
		const response = await apiClient.post<AuthResponse>(
			`${this.basePath}/2fa/verify`,
			{ code }
		);

		// Store token
		if (response.token) {
			apiClient.setAuthToken(response.token);
		}

		return response;
	}

	/**
	 * Generate new backup codes
	 */
	async generateBackupCodes(password: string): Promise<string[]> {
		return apiClient.post(`${this.basePath}/2fa/backup-codes`, { password });
	}

	/**
	 * Get active sessions
	 */
	async getSessions(): Promise<{
		id: string;
		device: string;
		browser: string;
		ip: string;
		location?: string;
		lastActivity: Date;
		current: boolean;
	}[]> {
		return apiClient.get(`${this.basePath}/sessions`);
	}

	/**
	 * Revoke session
	 */
	async revokeSession(sessionId: string): Promise<void> {
		await apiClient.delete(`${this.basePath}/sessions/${sessionId}`);
	}

	/**
	 * Revoke all other sessions
	 */
	async revokeOtherSessions(password: string): Promise<void> {
		await apiClient.post(`${this.basePath}/sessions/revoke-others`, { password });
	}

	/**
	 * Delete account
	 */
	async deleteAccount(password: string, reason?: string): Promise<void> {
		await apiClient.delete(`${this.basePath}/me`, {
			body: { password, reason }
		});
	}

	/**
	 * Check if email is available
	 */
	async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
		return apiClient.get(`${this.basePath}/check/email`, { email });
	}

	/**
	 * Get security events
	 */
	async getSecurityEvents(options?: {
		page?: number;
		pageSize?: number;
	}): Promise<{
		events: {
			id: string;
			type: string;
			description: string;
			ip: string;
			device?: string;
			timestamp: Date;
			success: boolean;
		}[];
		total: number;
	}> {
		return apiClient.get(`${this.basePath}/security/events`, options);
	}
}

// Create singleton instance
export const authAPI = new AuthAPI();

// Re-export for convenience
export default authAPI;
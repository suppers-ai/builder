/**
 * SortedStorage JavaScript SDK
 * Official SDK for interacting with the SortedStorage API
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import FormData from 'form-data';

// Types
export interface SortedStorageConfig {
	apiKey?: string;
	accessToken?: string;
	baseUrl?: string;
	timeout?: number;
	maxRetries?: number;
	onTokenRefresh?: (token: string) => void;
}

export interface AuthCredentials {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export interface User {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	role: string;
	createdAt: Date;
}

export interface FileItem {
	id: string;
	name: string;
	type: 'file';
	mimeType: string;
	size: number;
	path: string;
	url?: string;
	thumbnail?: string;
	createdAt: Date;
	modifiedAt: Date;
	owner?: User;
	permissions?: string[];
}

export interface FolderItem {
	id: string;
	name: string;
	type: 'folder';
	path: string;
	itemCount: number;
	size: number;
	createdAt: Date;
	modifiedAt: Date;
	owner?: User;
	permissions?: string[];
}

export type StorageItem = FileItem | FolderItem;

export interface UploadOptions {
	path?: string;
	parentId?: string;
	onProgress?: (progress: number) => void;
	metadata?: Record<string, any>;
}

export interface ShareOptions {
	expiresIn?: string;
	password?: string;
	maxDownloads?: number;
	allowUpload?: boolean;
}

export interface ShareLink {
	shareId: string;
	url: string;
	shortUrl?: string;
	qrCode?: string;
	expiresAt?: Date;
	password: boolean;
}

export interface StorageQuota {
	used: number;
	total: number;
	percentage: number;
	fileCount: number;
}

export interface PaginationOptions {
	page?: number;
	limit?: number;
	sort?: string;
	order?: 'asc' | 'desc';
}

// Main SDK Class
export class SortedStorageClient {
	private client: AxiosInstance;
	private config: SortedStorageConfig;
	private accessToken?: string;
	private refreshToken?: string;

	constructor(config: SortedStorageConfig = {}) {
		this.config = {
			baseUrl: config.baseUrl || 'https://api.sortedstorage.com',
			timeout: config.timeout || 30000,
			maxRetries: config.maxRetries || 3,
			...config
		};

		this.accessToken = config.accessToken;

		this.client = axios.create({
			baseURL: this.config.baseUrl,
			timeout: this.config.timeout,
			headers: {
				'Content-Type': 'application/json'
			}
		});

		this.setupInterceptors();
		
		// Initialize sub-modules
		this.auth = new AuthModule(this);
		this.storage = new StorageModule(this);
		this.sharing = new SharingModule(this);
		this.users = new UsersModule(this);
	}

	// Sub-modules
	public auth: AuthModule;
	public storage: StorageModule;
	public sharing: SharingModule;
	public users: UsersModule;

	// Setup request/response interceptors
	private setupInterceptors(): void {
		// Request interceptor
		this.client.interceptors.request.use(
			(config) => {
				if (this.accessToken) {
					config.headers.Authorization = `Bearer ${this.accessToken}`;
				} else if (this.config.apiKey) {
					config.headers['X-API-Key'] = this.config.apiKey;
				}
				return config;
			},
			(error) => Promise.reject(error)
		);

		// Response interceptor with retry logic
		this.client.interceptors.response.use(
			(response) => response,
			async (error) => {
				const originalRequest = error.config;

				// Retry on 401 with token refresh
				if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken) {
					originalRequest._retry = true;
					
					try {
						const response = await this.refreshAccessToken();
						this.accessToken = response.data.token;
						
						if (this.config.onTokenRefresh) {
							this.config.onTokenRefresh(response.data.token);
						}
						
						originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
						return this.client(originalRequest);
					} catch (refreshError) {
						// Refresh failed, need to re-authenticate
						this.accessToken = undefined;
						this.refreshToken = undefined;
						throw refreshError;
					}
				}

				// Retry on network errors
				if (!error.response && originalRequest._retryCount < this.config.maxRetries!) {
					originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
					await this.delay(1000 * originalRequest._retryCount);
					return this.client(originalRequest);
				}

				return Promise.reject(error);
			}
		);
	}

	// Helper methods
	private async refreshAccessToken(): Promise<AxiosResponse> {
		return this.client.post('/api/auth/refresh', {
			refreshToken: this.refreshToken
		});
	}

	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	// Internal request method
	public async request<T = any>(config: AxiosRequestConfig): Promise<T> {
		const response = await this.client.request<T>(config);
		return response.data;
	}

	// Set authentication tokens
	public setTokens(accessToken: string, refreshToken?: string): void {
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}

	// Clear authentication
	public clearAuth(): void {
		this.accessToken = undefined;
		this.refreshToken = undefined;
	}
}

// Authentication Module
class AuthModule {
	constructor(private client: SortedStorageClient) {}

	async login(credentials: AuthCredentials): Promise<{ user: User; token: string }> {
		const response = await this.client.request<{ user: User; token: string; refreshToken: string }>({
			method: 'POST',
			url: '/api/auth/login',
			data: credentials
		});

		this.client.setTokens(response.token, response.refreshToken);
		return { user: response.user, token: response.token };
	}

	async logout(): Promise<void> {
		await this.client.request({
			method: 'POST',
			url: '/api/auth/logout'
		});
		this.client.clearAuth();
	}

	async register(data: { email: string; password: string; name: string }): Promise<User> {
		return this.client.request<User>({
			method: 'POST',
			url: '/api/auth/register',
			data
		});
	}

	async forgotPassword(email: string): Promise<void> {
		await this.client.request({
			method: 'POST',
			url: '/api/auth/forgot-password',
			data: { email }
		});
	}

	async resetPassword(token: string, password: string): Promise<void> {
		await this.client.request({
			method: 'POST',
			url: '/api/auth/reset-password',
			data: { token, password }
		});
	}

	async verifyEmail(token: string): Promise<void> {
		await this.client.request({
			method: 'POST',
			url: '/api/auth/verify-email',
			data: { token }
		});
	}

	async getSession(): Promise<User> {
		return this.client.request<User>({
			method: 'GET',
			url: '/api/auth/session'
		});
	}
}

// Storage Module
class StorageModule {
	constructor(private client: SortedStorageClient) {}

	async listFiles(path: string = '/', options: PaginationOptions = {}): Promise<{
		items: StorageItem[];
		pagination: any;
	}> {
		return this.client.request({
			method: 'GET',
			url: '/api/storage/items',
			params: { path, ...options }
		});
	}

	async uploadFile(
		file: File | Buffer | Stream,
		options: UploadOptions = {}
	): Promise<FileItem> {
		const formData = new FormData();
		formData.append('file', file);
		
		if (options.path) formData.append('path', options.path);
		if (options.parentId) formData.append('parentId', options.parentId);
		if (options.metadata) {
			formData.append('metadata', JSON.stringify(options.metadata));
		}

		return this.client.request<FileItem>({
			method: 'POST',
			url: '/api/storage/upload',
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			onUploadProgress: (progressEvent) => {
				if (options.onProgress && progressEvent.total) {
					const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
					options.onProgress(progress);
				}
			}
		});
	}

	async downloadFile(fileId: string): Promise<Blob> {
		const response = await this.client.request<ArrayBuffer>({
			method: 'GET',
			url: `/api/storage/download/${fileId}`,
			responseType: 'arraybuffer'
		});
		return new Blob([response]);
	}

	async deleteFile(fileId: string): Promise<void> {
		await this.client.request({
			method: 'DELETE',
			url: `/api/storage/items`,
			data: { ids: [fileId] }
		});
	}

	async deleteMultiple(fileIds: string[]): Promise<void> {
		await this.client.request({
			method: 'DELETE',
			url: `/api/storage/items`,
			data: { ids: fileIds }
		});
	}

	async createFolder(name: string, path: string = '/'): Promise<FolderItem> {
		return this.client.request<FolderItem>({
			method: 'POST',
			url: '/api/storage/folders',
			data: { name, path }
		});
	}

	async rename(itemId: string, newName: string): Promise<StorageItem> {
		return this.client.request<StorageItem>({
			method: 'PUT',
			url: `/api/storage/items/${itemId}/rename`,
			data: { name: newName }
		});
	}

	async move(itemIds: string[], targetPath: string): Promise<void> {
		await this.client.request({
			method: 'POST',
			url: '/api/storage/move',
			data: { ids: itemIds, targetPath }
		});
	}

	async copy(itemIds: string[], targetPath: string): Promise<StorageItem[]> {
		return this.client.request<StorageItem[]>({
			method: 'POST',
			url: '/api/storage/copy',
			data: { ids: itemIds, targetPath }
		});
	}

	async getQuota(): Promise<StorageQuota> {
		return this.client.request<StorageQuota>({
			method: 'GET',
			url: '/api/storage/quota'
		});
	}

	async search(query: string, filters: Record<string, any> = {}): Promise<StorageItem[]> {
		return this.client.request<StorageItem[]>({
			method: 'GET',
			url: '/api/search',
			params: { q: query, ...filters }
		});
	}
}

// Sharing Module
class SharingModule {
	constructor(private client: SortedStorageClient) {}

	async createShareLink(itemId: string, options: ShareOptions = {}): Promise<ShareLink> {
		return this.client.request<ShareLink>({
			method: 'POST',
			url: '/api/sharing/links',
			data: { itemId, ...options }
		});
	}

	async getShareLink(shareId: string): Promise<ShareLink> {
		return this.client.request<ShareLink>({
			method: 'GET',
			url: `/api/sharing/links/${shareId}`
		});
	}

	async updateShareLink(shareId: string, updates: Partial<ShareOptions>): Promise<ShareLink> {
		return this.client.request<ShareLink>({
			method: 'PUT',
			url: `/api/sharing/links/${shareId}`,
			data: updates
		});
	}

	async revokeShareLink(shareId: string): Promise<void> {
		await this.client.request({
			method: 'DELETE',
			url: `/api/sharing/links/${shareId}`
		});
	}

	async shareWithUsers(
		itemId: string,
		users: string[],
		permissions: string[] = ['view']
	): Promise<void> {
		await this.client.request({
			method: 'POST',
			url: '/api/sharing/users',
			data: { itemId, users, permissions }
		});
	}

	async getShareStats(shareId: string): Promise<any> {
		return this.client.request({
			method: 'GET',
			url: `/api/sharing/links/${shareId}/stats`
		});
	}
}

// Users Module
class UsersModule {
	constructor(private client: SortedStorageClient) {}

	async getProfile(): Promise<User> {
		return this.client.request<User>({
			method: 'GET',
			url: '/api/users/profile'
		});
	}

	async updateProfile(updates: Partial<User>): Promise<User> {
		return this.client.request<User>({
			method: 'PUT',
			url: '/api/users/profile',
			data: updates
		});
	}

	async changePassword(currentPassword: string, newPassword: string): Promise<void> {
		await this.client.request({
			method: 'POST',
			url: '/api/users/change-password',
			data: { currentPassword, newPassword }
		});
	}

	async enable2FA(): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
		return this.client.request({
			method: 'POST',
			url: '/api/users/2fa/enable'
		});
	}

	async verify2FA(code: string): Promise<void> {
		await this.client.request({
			method: 'POST',
			url: '/api/users/2fa/verify',
			data: { code }
		});
	}

	async disable2FA(code: string): Promise<void> {
		await this.client.request({
			method: 'POST',
			url: '/api/users/2fa/disable',
			data: { code }
		});
	}
}

// Export default client factory
export default function createClient(config: SortedStorageConfig): SortedStorageClient {
	return new SortedStorageClient(config);
}
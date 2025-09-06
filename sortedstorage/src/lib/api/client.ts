/**
 * API client for Solobase backend integration
 */

import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { getAuthLoginUrl } from '$lib/config/auth';
import { config } from '$lib/config/env';

export interface ApiConfig {
	baseURL: string;
	timeout?: number;
	headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
	data?: T;
	error?: string;
	status: number;
	success: boolean;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	hasMore: boolean;
}

export class ApiError extends Error {
	status: number;
	code?: string;
	details?: any;

	constructor(message: string, status: number, code?: string, details?: any) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.code = code;
		this.details = details;
	}
}

class ApiClient {
	private config: ApiConfig;
	private authToken: string | null = null;
	private refreshPromise: Promise<boolean> | null = null;

	constructor(apiConfig?: Partial<ApiConfig>) {
		// In development, use relative URLs to leverage Vite proxy
		const isDev = import.meta.env.MODE === 'development';
		const defaultBaseURL = isDev ? '' : (config.apiUrl || 'http://localhost:8091');
		
		this.config = {
			baseURL: apiConfig?.baseURL || defaultBaseURL,
			timeout: apiConfig?.timeout || 30000,
			headers: {
				'Content-Type': 'application/json',
				...apiConfig?.headers
			}
		};

		// Load token from localStorage if available
		// We'll try immediately, but also provide a method to reload it later
		this.loadTokenFromStorage();
	}

	/**
	 * Set authorization token
	 */
	setToken(token: string | null) {
		this.authToken = token;
	}

	/**
	 * Load token from localStorage if available
	 */
	loadTokenFromStorage() {
		if (browser && typeof localStorage !== 'undefined') {
			const storedToken = localStorage.getItem('auth_token');
			if (storedToken) {
				this.authToken = storedToken;
				return true;
			}
		}
		return false;
	}

	/**
	 * Build full URL
	 */
	private buildURL(endpoint: string): string {
		if (endpoint.startsWith('http')) {
			return endpoint;
		}
		return `${this.config.baseURL}${endpoint}`;
	}

	/**
	 * Build headers
	 */
	private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
		const headers: Record<string, string> = {
			...this.config.headers,
			...customHeaders
		};

		if (this.authToken) {
			headers['Authorization'] = `Bearer ${this.authToken}`;
		}

		return headers;
	}

	/**
	 * Handle API errors
	 */
	private async handleError(response: Response): Promise<ApiError> {
		let errorMessage = 'An error occurred';
		let errorCode: string | undefined;
		let errorDetails: any;

		try {
			const errorData = await response.json();
			errorMessage = errorData.message || errorData.error || errorMessage;
			errorCode = errorData.code;
			errorDetails = errorData.details;
			console.error('API Error JSON:', errorData);
		} catch {
			// If response is not JSON, try to get text
			try {
				const text = await response.text();
				console.error('API Error Text:', text);
				errorMessage = text || response.statusText || errorMessage;
			} catch {
				errorMessage = response.statusText || errorMessage;
			}
		}

		// Handle specific status codes
		switch (response.status) {
			case 401:
				// Unauthorized - try to refresh token
				if (this.authToken && !this.refreshPromise) {
					this.refreshPromise = this.refreshToken();
					const refreshed = await this.refreshPromise;
					this.refreshPromise = null;
					
					if (refreshed) {
						// Token refreshed, caller should retry
						throw new ApiError('Token refreshed, retry request', 401, 'TOKEN_REFRESHED');
					}
				}
				
				// Clear auth and redirect to Solobase login if not authenticated
				if (browser) {
					this.authToken = null;
					localStorage.removeItem('auth_token');
					// Redirect to login with files page as the return URL
					window.location.href = getAuthLoginUrl('/files');
				}
				break;

			case 403:
				errorMessage = 'You do not have permission to perform this action';
				break;

			case 404:
				errorMessage = 'The requested resource was not found';
				break;

			case 429:
				errorMessage = 'Too many requests. Please try again later';
				break;

			case 500:
			case 502:
			case 503:
				errorMessage = 'Server error. Please try again later';
				break;
		}

		return new ApiError(errorMessage, response.status, errorCode, errorDetails);
	}

	/**
	 * Refresh authentication token
	 */
	private async refreshToken(): Promise<boolean> {
		try {
			const response = await fetch(this.buildURL('/api/auth/refresh'), {
				method: 'POST',
				credentials: 'include',
				headers: this.buildHeaders()
			});

			if (response.ok) {
				const data = await response.json();
				if (data.token) {
					this.setToken(data.token);
					localStorage.setItem('auth_token', data.token);
					return true;
				}
			}
		} catch (error) {
			console.error('Token refresh failed:', error);
		}

		return false;
	}

	/**
	 * Make HTTP request
	 */
	private async request<T = any>(
		method: string,
		endpoint: string,
		options?: {
			body?: any;
			headers?: Record<string, string>;
			params?: Record<string, any>;
			timeout?: number;
			retry?: number;
		}
	): Promise<ApiResponse<T>> {
		const urlString = this.buildURL(endpoint);
		// For relative URLs, use the current origin (or a default in SSR)
		const baseUrl = typeof window !== 'undefined' 
			? window.location.origin 
			: 'http://localhost:3000';
		const url = urlString.startsWith('http') 
			? new URL(urlString)
			: new URL(urlString, baseUrl);
		
		// Add query parameters
		if (options?.params) {
			Object.entries(options.params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					url.searchParams.append(key, String(value));
				}
			});
		}

		// Create abort controller for timeout
		const controller = new AbortController();
		const timeout = setTimeout(
			() => controller.abort(),
			options?.timeout || this.config.timeout!
		);

		try {
			const response = await fetch(url.toString(), {
				method,
				headers: this.buildHeaders(options?.headers),
				body: options?.body ? JSON.stringify(options.body) : undefined,
				signal: controller.signal,
				credentials: 'include'
			});

			clearTimeout(timeout);

			if (!response.ok) {
				const error = await this.handleError(response);
				
				// Retry if token was refreshed
				if (error.code === 'TOKEN_REFRESHED' && (!options?.retry || options.retry < 1)) {
					return this.request<T>(method, endpoint, {
						...options,
						retry: (options?.retry || 0) + 1
					});
				}

				throw error;
			}

			// Handle empty responses
			const contentType = response.headers.get('content-type');
			let data: T | undefined;
			
			if (contentType?.includes('application/json')) {
				data = await response.json();
			} else if (response.status !== 204) {
				// Non-JSON response with content
				data = await response.text() as any;
			}

			return {
				data,
				status: response.status,
				success: true
			};
		} catch (error: any) {
			clearTimeout(timeout);

			// Handle abort/timeout
			if (error.name === 'AbortError') {
				throw new ApiError('Request timeout', 408, 'TIMEOUT');
			}

			// Handle network errors
			if (!window.navigator.onLine) {
				throw new ApiError('No internet connection', 0, 'OFFLINE');
			}

			// Re-throw API errors
			if (error instanceof ApiError) {
				throw error;
			}

			// Handle other errors
			throw new ApiError(
				error.message || 'An unexpected error occurred',
				0,
				'UNKNOWN',
				error
			);
		}
	}

	/**
	 * GET request
	 */
	async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
		const response = await this.request<T>('GET', endpoint, { params });
		return response.data!;
	}

	/**
	 * POST request
	 */
	async post<T = any>(endpoint: string, body?: any, options?: any): Promise<T> {
		const response = await this.request<T>('POST', endpoint, { body, ...options });
		return response.data!;
	}

	/**
	 * PUT request
	 */
	async put<T = any>(endpoint: string, body?: any, options?: any): Promise<T> {
		const response = await this.request<T>('PUT', endpoint, { body, ...options });
		return response.data!;
	}

	/**
	 * PATCH request
	 */
	async patch<T = any>(endpoint: string, body?: any, options?: any): Promise<T> {
		console.log('PATCH request to:', endpoint, 'with body:', body);
		console.log('Auth token:', this.authToken ? this.authToken.substring(0, 20) + '...' : 'none');
		const response = await this.request<T>('PATCH', endpoint, { body, ...options });
		return response.data!;
	}

	/**
	 * DELETE request
	 */
	async delete<T = any>(endpoint: string, options?: any): Promise<T> {
		const response = await this.request<T>('DELETE', endpoint, options);
		return response.data!;
	}

	/**
	 * Upload file with progress tracking
	 */
	async upload(
		endpoint: string,
		file: File,
		options?: {
			onProgress?: (progress: number) => void;
			additionalData?: Record<string, any>;
		}
	): Promise<any> {
		const formData = new FormData();
		formData.append('file', file);

		// Add additional data
		if (options?.additionalData) {
			Object.entries(options.additionalData).forEach(([key, value]) => {
				formData.append(key, String(value));
			});
		}

		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			// Track upload progress
			if (options?.onProgress) {
				xhr.upload.addEventListener('progress', (event) => {
					if (event.lengthComputable) {
						const progress = (event.loaded / event.total) * 100;
						options.onProgress!(progress);
					}
				});
			}

			// Handle completion
			xhr.addEventListener('load', () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					try {
						const response = JSON.parse(xhr.responseText);
						resolve(response);
					} catch {
						resolve(xhr.responseText);
					}
				} else {
					reject(new ApiError(
						'Upload failed',
						xhr.status,
						'UPLOAD_ERROR'
					));
				}
			});

			// Handle errors
			xhr.addEventListener('error', () => {
				reject(new ApiError('Upload failed', 0, 'NETWORK_ERROR'));
			});

			xhr.addEventListener('abort', () => {
				reject(new ApiError('Upload cancelled', 0, 'ABORTED'));
			});

			// Open and send request
			const url = this.buildURL(endpoint);
			console.log('Upload URL:', url);
			console.log('Auth token present:', !!this.authToken);
			
			xhr.open('POST', url);
			
			// Set auth header
			if (this.authToken) {
				xhr.setRequestHeader('Authorization', `Bearer ${this.authToken}`);
			} else {
				console.warn('No auth token available for upload');
			}

			xhr.send(formData);
		});
	}

	/**
	 * Upload FormData with progress tracking
	 */
	async uploadFormData<T = any>(
		endpoint: string,
		formData: FormData,
		options?: {
			onProgress?: (progress: number) => void;
		}
	): Promise<T> {
		console.log('uploadFormData called for endpoint:', endpoint);
		console.log('FormData entries:');
		for (const [key, value] of formData.entries()) {
			console.log(`  ${key}:`, value);
		}
		
		return new Promise((resolve, reject) => {
			try {
				const xhr = new XMLHttpRequest();

			// Track upload progress
			if (options?.onProgress) {
				xhr.upload.addEventListener('progress', (event) => {
					if (event.lengthComputable) {
						const progress = (event.loaded / event.total) * 100;
						options.onProgress!(progress);
					}
				});
			}

			// Handle completion
			xhr.addEventListener('load', () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					try {
						const response = JSON.parse(xhr.responseText);
						resolve(response);
					} catch {
						resolve(xhr.responseText as any);
					}
				} else {
					let errorMessage = 'Upload failed';
					try {
						const errorData = JSON.parse(xhr.responseText);
						errorMessage = errorData.error || errorData.message || errorMessage;
					} catch {
						errorMessage = xhr.responseText || errorMessage;
					}
					console.error('Upload error:', xhr.status, errorMessage);
					reject(new ApiError(
						errorMessage,
						xhr.status,
						'UPLOAD_ERROR'
					));
				}
			});

			// Handle errors
			xhr.addEventListener('error', () => {
				reject(new ApiError('Upload failed', 0, 'NETWORK_ERROR'));
			});

			xhr.addEventListener('abort', () => {
				reject(new ApiError('Upload cancelled', 0, 'ABORTED'));
			});

			// Open and send request
			const url = this.buildURL(endpoint);
			console.log('Upload URL:', url);
			console.log('Auth token present:', !!this.authToken);
			
			xhr.open('POST', url);
			
			// Set auth header
			if (this.authToken) {
				xhr.setRequestHeader('Authorization', `Bearer ${this.authToken}`);
			} else {
				console.warn('No auth token available for upload');
			}

			xhr.send(formData);
			console.log('XHR request sent');
			} catch (error) {
				console.error('Error creating/sending XHR request:', error);
				reject(error);
			}
		});
	}

	/**
	 * Download file with progress tracking
	 */
	async download(
		endpoint: string,
		options?: {
			onProgress?: (progress: number) => void;
			filename?: string;
		}
	): Promise<Blob> {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.responseType = 'blob';

			// Track download progress
			if (options?.onProgress) {
				xhr.addEventListener('progress', (event) => {
					if (event.lengthComputable) {
						const progress = (event.loaded / event.total) * 100;
						options.onProgress!(progress);
					}
				});
			}

			// Handle completion
			xhr.addEventListener('load', () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					const blob = xhr.response;
					
					// Auto-download if filename provided
					if (options?.filename && browser) {
						const url = URL.createObjectURL(blob);
						const a = document.createElement('a');
						a.href = url;
						a.download = options.filename;
						a.click();
						URL.revokeObjectURL(url);
					}

					resolve(blob);
				} else {
					reject(new ApiError(
						'Download failed',
						xhr.status,
						'DOWNLOAD_ERROR'
					));
				}
			});

			// Handle errors
			xhr.addEventListener('error', () => {
				reject(new ApiError('Download failed', 0, 'NETWORK_ERROR'));
			});

			xhr.addEventListener('abort', () => {
				reject(new ApiError('Download cancelled', 0, 'ABORTED'));
			});

			// Open and send request
			xhr.open('GET', this.buildURL(endpoint));
			
			// Set auth header
			if (this.authToken) {
				xhr.setRequestHeader('Authorization', `Bearer ${this.authToken}`);
			}

			xhr.send();
		});
	}
}

// Create singleton instance
export const apiClient = new ApiClient();

// Re-export for convenience
export default apiClient;
import type { 
	User, LoginRequest, LoginResponse, SignupRequest,
	DatabaseTable, DatabaseColumn, QueryResult,
	StorageObject, StorageBucket,
	Collection, CollectionSchema,
	AppSettings, DashboardStats,
	ApiResponse, PaginatedResponse
} from './types';

const API_BASE = '/api';

class ApiClient {
	private token: string | null = null;

	constructor() {
		// Try to restore token from localStorage
		if (typeof window !== 'undefined') {
			this.token = localStorage.getItem('auth_token') || 'mock-token-for-testing';
		}
	}

	setToken(token: string) {
		this.token = token;
		if (typeof window !== 'undefined') {
			localStorage.setItem('auth_token', token);
		}
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<ApiResponse<T>> {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...options.headers
		};

		if (this.token) {
			headers['Authorization'] = `Bearer ${this.token}`;
		}

		try {
			const response = await fetch(`${API_BASE}${endpoint}`, {
				...options,
				headers,
				credentials: 'include'
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || `HTTP ${response.status}`);
			}

			return { data: data as T };
		} catch (error) {
			return { 
				error: error instanceof Error ? error.message : 'An error occurred' 
			};
		}
	}

	// Auth methods
	async login(request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
		const response = await this.request<LoginResponse>('/auth/login', {
			method: 'POST',
			body: JSON.stringify(request)
		});

		if (response.data?.token) {
			this.token = response.data.token;
			if (typeof window !== 'undefined') {
				localStorage.setItem('auth_token', this.token);
			}
		}

		return response;
	}

	async logout(): Promise<ApiResponse<void>> {
		const response = await this.request<void>('/auth/logout', {
			method: 'POST'
		});

		this.token = null;
		if (typeof window !== 'undefined') {
			localStorage.removeItem('auth_token');
		}

		return response;
	}

	async signup(request: SignupRequest): Promise<ApiResponse<User>> {
		return this.request<User>('/auth/signup', {
			method: 'POST',
			body: JSON.stringify(request)
		});
	}

	async getCurrentUser(): Promise<ApiResponse<User>> {
		return this.request<User>('/auth/me');
	}

	// Users methods
	async getUsers(page = 1, pageSize = 20): Promise<ApiResponse<PaginatedResponse<User>>> {
		return this.request<PaginatedResponse<User>>(`/users?page=${page}&page_size=${pageSize}`);
	}

	async getUser(id: string): Promise<ApiResponse<User>> {
		return this.request<User>(`/users/${id}`);
	}

	async updateUser(id: string, updates: Partial<User>): Promise<ApiResponse<User>> {
		return this.request<User>(`/users/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(updates)
		});
	}

	async deleteUser(id: string): Promise<ApiResponse<void>> {
		return this.request<void>(`/users/${id}`, {
			method: 'DELETE'
		});
	}

	// Database methods
	async getDatabaseTables(): Promise<ApiResponse<DatabaseTable[]>> {
		return this.request<DatabaseTable[]>('/database/tables');
	}

	async getTableColumns(table: string): Promise<ApiResponse<DatabaseColumn[]>> {
		return this.request<DatabaseColumn[]>(`/database/tables/${table}/columns`);
	}

	async executeQuery(query: string): Promise<ApiResponse<QueryResult>> {
		return this.request<QueryResult>('/database/query', {
			method: 'POST',
			body: JSON.stringify({ query })
		});
	}

	// Storage methods
	async getStorageBuckets(): Promise<ApiResponse<StorageBucket[]>> {
		return this.request<StorageBucket[]>('/storage/buckets');
	}

	async getBucketObjects(bucket: string): Promise<ApiResponse<StorageObject[]>> {
		return this.request<StorageObject[]>(`/storage/buckets/${bucket}/objects`);
	}

	async uploadFile(bucket: string, file: File): Promise<ApiResponse<StorageObject>> {
		const formData = new FormData();
		formData.append('file', file);

		const response = await fetch(`${API_BASE}/storage/buckets/${bucket}/upload`, {
			method: 'POST',
			headers: {
				'Authorization': this.token ? `Bearer ${this.token}` : ''
			},
			body: formData,
			credentials: 'include'
		});

		const data = await response.json();

		if (!response.ok) {
			return { error: data.error || `HTTP ${response.status}` };
		}

		return { data: data as StorageObject };
	}

	async deleteObject(bucket: string, objectId: string): Promise<ApiResponse<void>> {
		return this.request<void>(`/storage/buckets/${bucket}/objects/${objectId}`, {
			method: 'DELETE'
		});
	}

	// Collections methods
	async getCollections(): Promise<ApiResponse<Collection[]>> {
		return this.request<Collection[]>('/collections');
	}

	async getCollection(id: string): Promise<ApiResponse<Collection>> {
		return this.request<Collection>(`/collections/${id}`);
	}

	async createCollection(name: string, schema: CollectionSchema): Promise<ApiResponse<Collection>> {
		return this.request<Collection>('/collections', {
			method: 'POST',
			body: JSON.stringify({ name, schema })
		});
	}

	async updateCollection(id: string, updates: Partial<Collection>): Promise<ApiResponse<Collection>> {
		return this.request<Collection>(`/collections/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(updates)
		});
	}

	async deleteCollection(id: string): Promise<ApiResponse<void>> {
		return this.request<void>(`/collections/${id}`, {
			method: 'DELETE'
		});
	}

	// Settings methods
	async getSettings(): Promise<ApiResponse<AppSettings>> {
		return this.request<AppSettings>('/settings');
	}

	async updateSettings(settings: Partial<AppSettings>): Promise<ApiResponse<AppSettings>> {
		return this.request<AppSettings>('/settings', {
			method: 'PATCH',
			body: JSON.stringify(settings)
		});
	}

	// Dashboard methods
	async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
		return this.request<DashboardStats>('/dashboard/stats');
	}
}

export const api = new ApiClient();
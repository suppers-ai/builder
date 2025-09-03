class APIService {
	private baseURL: string;
	private token: string | null = null;

	constructor() {
		// Use PUBLIC_API_URL from environment or fallback to same-origin
		this.baseURL = import.meta.env.PUBLIC_API_URL || '';
	}

	setToken(token: string | null) {
		this.token = token;
	}

	async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...options.headers
		};

		if (this.token) {
			headers['Authorization'] = `Bearer ${this.token}`;
		}

		const response = await fetch(`${this.baseURL}${endpoint}`, {
			...options,
			headers
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: response.statusText }));
			throw new Error(error.message || `HTTP error! status: ${response.status}`);
		}

		return response.json();
	}

	async get<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint);
	}

	async post<T>(endpoint: string, data?: any): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined
		});
	}

	async put<T>(endpoint: string, data?: any): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined
		});
	}

	async delete<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'DELETE'
		});
	}

	async upload(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<any> {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const formData = new FormData();
			formData.append('file', file);

			if (onProgress) {
				xhr.upload.addEventListener('progress', (e) => {
					if (e.lengthComputable) {
						const progress = (e.loaded / e.total) * 100;
						onProgress(progress);
					}
				});
			}

			xhr.addEventListener('load', () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					try {
						resolve(JSON.parse(xhr.responseText));
					} catch {
						resolve(xhr.responseText);
					}
				} else {
					reject(new Error(`Upload failed: ${xhr.statusText}`));
				}
			});

			xhr.addEventListener('error', () => {
				reject(new Error('Upload failed'));
			});

			xhr.open('POST', `${this.baseURL}${endpoint}`);
			if (this.token) {
				xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
			}
			xhr.send(formData);
		});
	}
}

export const api = new APIService();
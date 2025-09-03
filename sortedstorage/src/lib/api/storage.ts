/**
 * Storage API service for file operations
 */

import apiClient, { type ApiError, type PaginatedResponse } from './client';
import type { FileItem, FolderItem, StorageQuota } from '$lib/types/storage';

export interface UploadOptions {
	path?: string;
	parentId?: string;
	onProgress?: (progress: number) => void;
	metadata?: Record<string, any>;
}

export interface ListFilesOptions {
	path?: string;
	parentId?: string;
	search?: string;
	type?: 'all' | 'file' | 'folder';
	sortBy?: 'name' | 'size' | 'date' | 'type';
	sortOrder?: 'asc' | 'desc';
	page?: number;
	pageSize?: number;
}

export interface ShareOptions {
	expiresIn?: number; // milliseconds
	password?: string;
	permissions?: string[];
	maxDownloads?: number;
}

export interface MoveOptions {
	targetPath: string;
	targetParentId?: string;
	overwrite?: boolean;
}

export interface StorageStats {
	totalSize: number;
	fileCount: number;
	folderCount: number;
	sharedCount: number;
	trashedCount: number;
}

class StorageAPI {
	private basePath = '/api/storage';

	/**
	 * List files and folders
	 */
	async listFiles(options: ListFilesOptions = {}): Promise<PaginatedResponse<FileItem | FolderItem>> {
		return apiClient.get(`${this.basePath}/files`, options);
	}

	/**
	 * Get file/folder details
	 */
	async getItem(id: string): Promise<FileItem | FolderItem> {
		return apiClient.get(`${this.basePath}/files/${id}`);
	}

	/**
	 * Upload single file
	 */
	async uploadFile(file: File, options: UploadOptions = {}): Promise<FileItem> {
		const response = await apiClient.upload(
			`${this.basePath}/upload`,
			file,
			{
				onProgress: options.onProgress,
				additionalData: {
					path: options.path || '/',
					parentId: options.parentId,
					...options.metadata
				}
			}
		);

		return response;
	}

	/**
	 * Upload multiple files
	 */
	async uploadFiles(
		files: File[],
		options: UploadOptions = {}
	): Promise<FileItem[]> {
		const uploads = files.map(file => this.uploadFile(file, options));
		return Promise.all(uploads);
	}

	/**
	 * Download file
	 */
	async downloadFile(
		id: string,
		options?: {
			onProgress?: (progress: number) => void;
		}
	): Promise<Blob> {
		return apiClient.download(
			`${this.basePath}/files/${id}/download`,
			options
		);
	}

	/**
	 * Download multiple files as ZIP
	 */
	async downloadMultiple(
		ids: string[],
		options?: {
			onProgress?: (progress: number) => void;
		}
	): Promise<Blob> {
		// First create the archive
		const { archiveId } = await apiClient.post(`${this.basePath}/archive`, {
			fileIds: ids
		});

		// Then download it
		return apiClient.download(
			`${this.basePath}/archive/${archiveId}/download`,
			options
		);
	}

	/**
	 * Delete file/folder
	 */
	async deleteItem(id: string, permanent = false): Promise<void> {
		await apiClient.delete(`${this.basePath}/files/${id}`, {
			params: { permanent }
		});
	}

	/**
	 * Delete multiple items
	 */
	async deleteMultiple(ids: string[], permanent = false): Promise<void> {
		await apiClient.post(`${this.basePath}/files/batch/delete`, {
			ids,
			permanent
		});
	}

	/**
	 * Rename file/folder
	 */
	async rename(id: string, newName: string): Promise<FileItem | FolderItem> {
		return apiClient.patch(`${this.basePath}/files/${id}`, {
			name: newName
		});
	}

	/**
	 * Move file/folder
	 */
	async move(id: string, options: MoveOptions): Promise<FileItem | FolderItem> {
		return apiClient.post(`${this.basePath}/files/${id}/move`, options);
	}

	/**
	 * Move multiple items
	 */
	async moveMultiple(
		ids: string[],
		options: MoveOptions
	): Promise<(FileItem | FolderItem)[]> {
		return apiClient.post(`${this.basePath}/files/batch/move`, {
			ids,
			...options
		});
	}

	/**
	 * Copy file/folder
	 */
	async copy(id: string, options: MoveOptions): Promise<FileItem | FolderItem> {
		return apiClient.post(`${this.basePath}/files/${id}/copy`, options);
	}

	/**
	 * Copy multiple items
	 */
	async copyMultiple(
		ids: string[],
		options: MoveOptions
	): Promise<(FileItem | FolderItem)[]> {
		return apiClient.post(`${this.basePath}/files/batch/copy`, {
			ids,
			...options
		});
	}

	/**
	 * Create folder
	 */
	async createFolder(
		name: string,
		parentPath = '/',
		parentId?: string
	): Promise<FolderItem> {
		return apiClient.post(`${this.basePath}/folders`, {
			name,
			path: parentPath,
			parentId
		});
	}

	/**
	 * Get file preview URL
	 */
	getPreviewUrl(id: string, options?: { width?: number; height?: number }): string {
		const params = new URLSearchParams();
		if (options?.width) params.append('w', String(options.width));
		if (options?.height) params.append('h', String(options.height));
		
		const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
		const queryString = params.toString();
		return `${baseURL}${this.basePath}/files/${id}/preview${queryString ? `?${queryString}` : ''}`;
	}

	/**
	 * Get file thumbnail URL
	 */
	getThumbnailUrl(id: string, size: 'sm' | 'md' | 'lg' = 'md'): string {
		const sizes = {
			sm: 64,
			md: 128,
			lg: 256
		};
		
		return this.getPreviewUrl(id, {
			width: sizes[size],
			height: sizes[size]
		});
	}

	/**
	 * Search files
	 */
	async search(
		query: string,
		options?: {
			type?: string;
			path?: string;
			dateFrom?: Date;
			dateTo?: Date;
			sizeMin?: number;
			sizeMax?: number;
			owner?: string;
			shared?: boolean;
			page?: number;
			pageSize?: number;
		}
	): Promise<PaginatedResponse<FileItem | FolderItem>> {
		const params: any = {
			q: query,
			...options
		};

		// Convert dates to ISO strings
		if (options?.dateFrom) {
			params.dateFrom = options.dateFrom.toISOString();
		}
		if (options?.dateTo) {
			params.dateTo = options.dateTo.toISOString();
		}

		return apiClient.get(`${this.basePath}/search`, params);
	}

	/**
	 * Get storage quota
	 */
	async getQuota(): Promise<StorageQuota> {
		return apiClient.get(`${this.basePath}/quota`);
	}

	/**
	 * Get storage statistics
	 */
	async getStats(): Promise<StorageStats> {
		return apiClient.get(`${this.basePath}/stats`);
	}

	/**
	 * Get trash items
	 */
	async getTrash(options?: ListFilesOptions): Promise<PaginatedResponse<FileItem | FolderItem>> {
		return apiClient.get(`${this.basePath}/trash`, options);
	}

	/**
	 * Restore from trash
	 */
	async restore(id: string): Promise<FileItem | FolderItem> {
		return apiClient.post(`${this.basePath}/trash/${id}/restore`);
	}

	/**
	 * Empty trash
	 */
	async emptyTrash(): Promise<void> {
		await apiClient.delete(`${this.basePath}/trash`);
	}

	/**
	 * Lock file
	 */
	async lockFile(id: string): Promise<void> {
		await apiClient.post(`${this.basePath}/files/${id}/lock`);
	}

	/**
	 * Unlock file
	 */
	async unlockFile(id: string): Promise<void> {
		await apiClient.delete(`${this.basePath}/files/${id}/lock`);
	}

	/**
	 * Get file versions
	 */
	async getVersions(id: string): Promise<any[]> {
		return apiClient.get(`${this.basePath}/files/${id}/versions`);
	}

	/**
	 * Restore file version
	 */
	async restoreVersion(id: string, versionId: string): Promise<FileItem> {
		return apiClient.post(`${this.basePath}/files/${id}/versions/${versionId}/restore`);
	}

	/**
	 * Get file activity log
	 */
	async getActivity(
		id: string,
		options?: {
			page?: number;
			pageSize?: number;
		}
	): Promise<PaginatedResponse<any>> {
		return apiClient.get(`${this.basePath}/files/${id}/activity`, options);
	}

	/**
	 * Update file metadata
	 */
	async updateMetadata(
		id: string,
		metadata: Record<string, any>
	): Promise<FileItem | FolderItem> {
		return apiClient.patch(`${this.basePath}/files/${id}/metadata`, metadata);
	}

	/**
	 * Add tags to file
	 */
	async addTags(id: string, tags: string[]): Promise<void> {
		await apiClient.post(`${this.basePath}/files/${id}/tags`, { tags });
	}

	/**
	 * Remove tags from file
	 */
	async removeTags(id: string, tags: string[]): Promise<void> {
		await apiClient.delete(`${this.basePath}/files/${id}/tags`, {
			body: { tags }
		});
	}

	/**
	 * Get popular tags
	 */
	async getPopularTags(limit = 20): Promise<{ tag: string; count: number }[]> {
		return apiClient.get(`${this.basePath}/tags/popular`, { limit });
	}

	/**
	 * Convert file format (e.g., image resize, document conversion)
	 */
	async convertFile(
		id: string,
		options: {
			format: string;
			width?: number;
			height?: number;
			quality?: number;
		}
	): Promise<FileItem> {
		return apiClient.post(`${this.basePath}/files/${id}/convert`, options);
	}

	/**
	 * Extract file (for archives)
	 */
	async extractArchive(
		id: string,
		targetPath?: string
	): Promise<FolderItem> {
		return apiClient.post(`${this.basePath}/files/${id}/extract`, {
			targetPath
		});
	}

	/**
	 * Create archive from files
	 */
	async createArchive(
		fileIds: string[],
		options?: {
			name?: string;
			format?: 'zip' | 'tar' | 'tar.gz';
			password?: string;
		}
	): Promise<FileItem> {
		return apiClient.post(`${this.basePath}/archive`, {
			fileIds,
			...options
		});
	}

	/**
	 * Scan file for viruses
	 */
	async scanFile(id: string): Promise<{
		clean: boolean;
		threats?: string[];
		scannedAt: Date;
	}> {
		return apiClient.post(`${this.basePath}/files/${id}/scan`);
	}
}

// Create singleton instance
export const storageAPI = new StorageAPI();

// Re-export for convenience
export default storageAPI;
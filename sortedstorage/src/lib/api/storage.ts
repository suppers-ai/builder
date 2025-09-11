/**
 * Storage API service - wrapper around Solobase SDK
 */

import { createSolobaseClient, type StorageObject, type StorageObjectMetadata } from '@solobase/sdk';
import { config } from '$lib/config/env';
import { browser } from '$app/environment';

// Get token from localStorage if in browser
function getAuthToken(): string | null {
	if (browser && typeof window !== 'undefined') {
		return localStorage.getItem('auth_token');
	}
	return null;
}

// Create Solobase client
const apiUrl = browser ? '' : config.apiUrl;
const client = createSolobaseClient(apiUrl || 'http://localhost:8095');

// Set auth token if available
if (browser) {
	const token = getAuthToken();
	if (token) {
		client.storage.setAuthToken(token);
	}
}

// Default bucket name for internal storage
const STORAGE_BUCKET = 'int_storage';

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
	targetId?: string;  // ID of the target parent folder
	targetParentId?: string;  // Deprecated, use targetId
	overwrite?: boolean;
	order?: number;  // Sort order within the target folder
}

export interface StorageStats {
	totalSize: number;
	fileCount: number;
	folderCount: number;
	sharedCount: number;
	trashedCount: number;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	hasMore: boolean;
}

export interface StorageQuota {
	used: number;
	total: number;
	percentage: number;
}

class StorageAPI {
	private bucket = STORAGE_BUCKET;

	/**
	 * Ensure the auth token is current
	 */
	private ensureToken() {
		const token = getAuthToken();
		if (token) {
			client.storage.setAuthToken(token);
		}
	}

	/**
	 * List files and folders
	 */
	async listFiles(options: ListFilesOptions = {}): Promise<PaginatedResponse<StorageObject>> {
		try {
			this.ensureToken();
			
			const items = await client.storage.listObjects(this.bucket, {
				parent_folder_id: options.parentId,
				search: options.search,
				type: options.type === 'all' ? undefined : options.type,
				sort: options.sortBy as any,
				order: options.sortOrder,
				page: options.page,
				limit: options.pageSize,
			});
			
			return {
				items: items || [],
				total: items.length,
				page: options.page || 1,
				pageSize: options.pageSize || 100,
				hasMore: false
			};
		} catch (error) {
			console.error('Failed to list files:', error);
			return {
				items: [],
				total: 0,
				page: 1,
				pageSize: 100,
				hasMore: false
			};
		}
	}

	/**
	 * Get file/folder details
	 */
	async getItem(id: string): Promise<StorageObject | null> {
		try {
			this.ensureToken();
			return await client.storage.getObject(this.bucket, id);
		} catch (error) {
			console.error('Failed to get item:', error);
			return null;
		}
	}

	/**
	 * List items in a specific folder by folder ID
	 */
	async listItemsInFolder(folderId: string): Promise<StorageObject[]> {
		try {
			this.ensureToken();
			return await client.storage.listObjects(this.bucket, {
				parent_folder_id: folderId
			});
		} catch (error) {
			console.error('Failed to list items in folder:', error);
			return [];
		}
	}

	/**
	 * Get folder hierarchy (for breadcrumbs)
	 */
	async getFolderHierarchy(folderId: string): Promise<StorageObject[]> {
		const hierarchy: StorageObject[] = [];
		let currentId: string | null = folderId;
		
		while (currentId) {
			const item = await this.getItem(currentId);
			if (!item || item.content_type !== 'application/x-directory') break;
			
			hierarchy.unshift(item);
			currentId = item.parent_folder_id || null;
		}
		
		return hierarchy;
	}

	/**
	 * Upload single file
	 */
	async uploadFile(file: File, options: UploadOptions = {}): Promise<StorageObject> {
		this.ensureToken();
		console.log('uploadFile called:', { fileName: file.name, size: file.size, path: options.path, parentId: options.parentId });
		
		return client.storage.uploadFile(this.bucket, file, {
			path: options.path,
			parent_folder_id: options.parentId,
			metadata: options.metadata,
			onProgress: options.onProgress,
		});
	}

	/**
	 * Upload multiple files
	 */
	async uploadFiles(files: File[], options: UploadOptions = {}): Promise<StorageObject[]> {
		// Upload files one by one for now
		const results: StorageObject[] = [];
		for (const file of files) {
			try {
				const result = await this.uploadFile(file, options);
				results.push(result);
			} catch (error) {
				console.error(`Failed to upload ${file.name}:`, error);
			}
		}
		return results;
	}

	/**
	 * Create folder
	 */
	async createFolder(name: string, path?: string, parentId?: string): Promise<StorageObject> {
		this.ensureToken();
		console.log('createFolder called:', { name, path, parentId });
		
		return client.storage.createFolder(this.bucket, name, path, parentId);
	}

	/**
	 * Download file
	 */
	async downloadFile(fileId: string): Promise<void> {
		this.ensureToken();
		const url = client.storage.getDownloadUrl(this.bucket, fileId);
		
		// Add auth token to URL
		const token = getAuthToken();
		const finalUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;
		
		// Create a temporary link and click it
		const a = document.createElement('a');
		a.href = finalUrl;
		a.download = '';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	/**
	 * Delete file or folder
	 */
	async deleteItem(itemId: string): Promise<void> {
		this.ensureToken();
		await client.storage.deleteObject(this.bucket, itemId);
	}

	/**
	 * Delete multiple items
	 */
	async deleteItems(itemIds: string[]): Promise<void> {
		this.ensureToken();
		await client.storage.deleteObjects(this.bucket, itemIds);
	}

	/**
	 * Rename file or folder (only changes the object_name)
	 */
	async rename(itemId: string, newName: string): Promise<StorageObject> {
		this.ensureToken();
		return client.storage.renameObject(this.bucket, itemId, newName);
	}

	/**
	 * Update metadata (all fields except name)
	 */
	async updateMetadata(id: string, metadata: Record<string, any>): Promise<StorageObject> {
		this.ensureToken();
		return client.storage.updateMetadata(this.bucket, id, metadata);
	}

	/**
	 * Get metadata for an object
	 */
	async getMetadata(id: string): Promise<Record<string, any> | null> {
		const item = await this.getItem(id);
		if (!item || !item.metadata) return null;
		
		try {
			return typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata;
		} catch (e) {
			console.error('Failed to parse metadata:', e);
			return null;
		}
	}

	/**
	 * Move file or folder (updates parent_folder_id and optionally order in metadata)
	 */
	async move(itemId: string, options: MoveOptions): Promise<StorageObject> {
		this.ensureToken();
		
		// Get current metadata
		const currentMetadata = await this.getMetadata(itemId) || {};
		
		// Update order in metadata if provided
		if (options.order !== undefined) {
			currentMetadata.order = options.order;
			await this.updateMetadata(itemId, currentMetadata);
		}
		
		// Move to new parent folder
		return client.storage.moveObject(this.bucket, itemId, {
			parent_folder_id: options.targetId || options.targetParentId,
			overwrite: options.overwrite
		});
	}

	/**
	 * Share file or folder
	 */
	async shareItem(itemId: string, options: ShareOptions = {}): Promise<{ url: string; expiresAt?: Date }> {
		this.ensureToken();
		
		// Convert milliseconds to seconds for API
		const shareOptions = options.expiresIn ? {
			expires_in: Math.floor(options.expiresIn / 1000),
			password: options.password,
			permissions: options.permissions,
			max_downloads: options.maxDownloads,
		} : {};
		
		const response = await client.storage.shareObject(this.bucket, itemId, shareOptions);
		
		// Convert expires_at to expiresAt for consistency
		return {
			url: response.url,
			expiresAt: response.expires_at
		};
	}

	/**
	 * Get storage quota
	 */
	async getQuota(): Promise<StorageQuota> {
		this.ensureToken();
		return client.storage.getQuota();
	}

	/**
	 * Get storage statistics
	 */
	async getStats(): Promise<StorageStats> {
		this.ensureToken();
		return client.storage.getStats();
	}

	/**
	 * Search files and folders
	 */
	async search(query: string, options: { type?: 'file' | 'folder' | 'all' } = {}): Promise<StorageObject[]> {
		this.ensureToken();
		return client.storage.search(query, options);
	}

	/**
	 * Get recent files
	 */
	async getRecentFiles(limit: number = 10): Promise<StorageObject[]> {
		this.ensureToken();
		return client.storage.getRecentFiles(limit);
	}

	/**
	 * Get shared files
	 */
	async getSharedFiles(): Promise<StorageObject[]> {
		this.ensureToken();
		return client.storage.getSharedFiles();
	}

	/**
	 * Get trashed files
	 */
	async getTrashedFiles(): Promise<StorageObject[]> {
		this.ensureToken();
		return client.storage.getTrashedFiles();
	}

	/**
	 * Restore file from trash
	 */
	async restoreFromTrash(itemId: string): Promise<void> {
		this.ensureToken();
		await client.storage.restoreFromTrash(itemId);
	}

	/**
	 * Empty trash
	 */
	async emptyTrash(): Promise<void> {
		this.ensureToken();
		await client.storage.emptyTrash();
	}
}

// Create singleton instance
const storageAPI = new StorageAPI();

export default storageAPI;
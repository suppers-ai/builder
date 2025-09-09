/**
 * Storage API service for file operations - integrated with Solobase
 */

import apiClient, { type ApiError, type PaginatedResponse } from './client';
import type { FileItem, FolderItem, StorageQuota } from '$lib/types/storage';
import { config } from '$lib/config/env';
import { browser } from '$app/environment';

// Default bucket name for internal storage
const STORAGE_BUCKET = 'int_storage';

// Ensure the API client has the current token from localStorage
function ensureToken() {
	apiClient.loadTokenFromStorage();
}

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

// Convert Solobase object format to FileItem/FolderItem
function convertSolobaseObject(obj: any): FileItem | FolderItem {
	// Check if it's a folder based on Solobase response
	// Handle both list format (isFolder, type) and raw database format (content_type, size)
	const isFolder = obj.isFolder || obj.type === 'folder' || 
		(obj.fullPath && obj.fullPath.endsWith('/')) ||
		obj.content_type === 'application/x-directory' ||
		(obj.object_path !== undefined && obj.object_name && !obj.size); // Raw format: folders have no size
	
	// Get the name - handle both list format and raw database format
	const name = obj.object_name || obj.name || obj.key || obj.fullPath?.split('/').filter(Boolean).pop() || 'unknown';
	
	// Get parent ID - handle both formats (parent_folder_id is the raw format field)
	const parentId = obj.parent_folder_id || obj.parent_id || null;
	
	if (isFolder) {
		return {
			id: obj.id || obj.ID || obj.fullPath || name,
			name: name,
			type: 'folder' as const,
			path: obj.object_path || obj.path || '/',
			parentId: parentId,
			createdAt: new Date(obj.created_at || obj.modified || Date.now()),
			modifiedAt: new Date(obj.updated_at || obj.modified || Date.now()),
			owner: obj.user_id || obj.owner || 'user',
			permissions: ['read', 'write'],
			shared: obj.public || false,
			itemCount: 0
		} as FolderItem;
	}
	
	return {
		id: obj.id || obj.ID || obj.key || name,
		name: name,
		type: 'file',
		path: obj.object_path || obj.path || '/',
		parentId: parentId,
		size: obj.size_bytes || obj.size || 0,
		mimeType: obj.content_type || 'application/octet-stream',
		extension: name.split('.').pop() || '',
		createdAt: new Date(obj.created_at || obj.modified || Date.now()),
		modifiedAt: new Date(obj.updated_at || obj.modified || Date.now()),
		owner: obj.user_id || obj.owner || 'user',
		permissions: ['read', 'write'],
		shared: obj.public || false,
		thumbnail: null,
		downloadUrl: `/api/storage/buckets/${STORAGE_BUCKET}/objects/${obj.id || obj.ID || name}/download`
	} as FileItem;
}

class StorageAPI {
	private basePath = '/api/storage';
	private bucket = STORAGE_BUCKET;

	/**
	 * List files and folders
	 */
	async listFiles(options: ListFilesOptions = {}): Promise<PaginatedResponse<FileItem | FolderItem>> {
		ensureToken(); // Ensure token is set before making request
		console.log('listFiles called with path:', options.path, 'parentId:', options.parentId);
		try {
			// Get objects from Solobase bucket
			// Use parent_folder_id for subfolder filtering, path for root
			const params: any = {};
			if (options.parentId) {
				// If we have a parentId, use it to filter
				params.parent_folder_id = options.parentId;
			} else if (options.path !== undefined) {
				// Otherwise use path (for root, send empty string)
				params.path = options.path;
			}
			console.log('Sending request with params:', params);
			const response = await apiClient.get(
				`${this.basePath}/buckets/${this.bucket}/objects`,
				params
			);
			
			console.log('Got response with', response?.length || 0, 'items');
			// Convert Solobase format to our format
			const items = (response || []).map((obj: any) => convertSolobaseObject(obj));
			console.log('Converted to', items.length, 'items:', items.map(i => ({ name: i.name, type: i.type, path: i.path, parentId: i.parentId })));
			
			return {
				items,
				total: items.length,
				page: options.page || 1,
				pageSize: options.pageSize || 100,
				hasMore: false
			};
		} catch (error) {
			console.error('Failed to list files:', error);
			// Return empty list on error
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
	async getItem(id: string): Promise<FileItem | FolderItem | null> {
		try {
			ensureToken();
			const response = await apiClient.get(
				`${this.basePath}/buckets/${this.bucket}/objects/${id}`
			);
			return convertSolobaseObject(response);
		} catch (error) {
			console.error('Failed to get item:', error);
			return null;
		}
	}

	/**
	 * List items in a specific folder by folder ID
	 */
	async listItemsInFolder(folderId: string): Promise<(FileItem | FolderItem)[]> {
		try {
			ensureToken();
			// List items with parent_folder_id matching this folder
			const response = await apiClient.get(
				`${this.basePath}/buckets/${this.bucket}/objects?parent_folder_id=${folderId}`
			);
			
			// Convert response items
			const items = response.map((item: any) => convertSolobaseObject(item));
			return items.filter((item): item is FileItem | FolderItem => item !== null);
		} catch (error) {
			console.error('Failed to list items in folder:', error);
			return [];
		}
	}

	/**
	 * Get folder hierarchy (for breadcrumbs)
	 */
	async getFolderHierarchy(folderId: string): Promise<FolderItem[]> {
		const hierarchy: FolderItem[] = [];
		let currentId: string | null = folderId;
		
		while (currentId) {
			const item = await this.getItem(currentId);
			if (!item || item.type !== 'folder') break;
			
			hierarchy.unshift(item as FolderItem);
			currentId = item.parentId;
		}
		
		return hierarchy;
	}

	/**
	 * Upload single file
	 */
	async uploadFile(file: File, options: UploadOptions = {}): Promise<FileItem> {
		ensureToken(); // Ensure token is set before making request
		console.log('uploadFile called:', { fileName: file.name, size: file.size, path: options.path, parentId: options.parentId });
		
		const formData = new FormData();
		formData.append('file', file);
		if (options.path) {
			formData.append('path', options.path);
		}
		// Add parent_folder_id if provided
		if (options.parentId) {
			formData.append('parent_folder_id', options.parentId);
		}
		
		const uploadUrl = `${this.basePath}/buckets/${this.bucket}/upload`;
		console.log('Upload URL:', uploadUrl);
		
		try {
			const response = await apiClient.uploadFormData(
				uploadUrl,
				formData,
				{
					onProgress: options.onProgress
				}
			);
			console.log('Upload response:', response);
			return convertSolobaseObject(response) as FileItem;
		} catch (error) {
			console.error('Upload failed:', error);
			throw error;
		}
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
			`${this.basePath}/buckets/${this.bucket}/objects/${id}/download`,
			options
		);
	}

	/**
	 * Download multiple files as archive
	 */
	async downloadMultiple(
		ids: string[],
		options?: {
			onProgress?: (progress: number) => void;
		}
	): Promise<Blob> {
		// Create an archive first
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
		await apiClient.delete(
			`${this.basePath}/buckets/${this.bucket}/objects/${id}`
		);
	}

	/**
	 * Delete multiple items
	 */
	async deleteMultiple(ids: string[], permanent = false): Promise<void> {
		// Delete one by one since Solobase doesn't have batch delete
		await Promise.all(ids.map(id => this.deleteItem(id, permanent)));
	}

	/**
	 * Rename file/folder
	 */
	async rename(id: string, newName: string): Promise<FileItem | FolderItem> {
		try {
			const response = await apiClient.patch(
				`${this.basePath}/buckets/${this.bucket}/objects/${id}/rename`,
				{ newName }
			);
			return convertSolobaseObject(response);
		} catch (error: any) {
			console.error('Rename failed:', error);
			if (error.status === 500) {
				throw new Error('Failed to rename. The file may not exist or you may need to re-login.');
			}
			throw error;
		}
	}

	/**
	 * Move file/folder
	 */
	async move(id: string, options: MoveOptions): Promise<FileItem | FolderItem> {
		// Solobase doesn't have a move endpoint, so we'll rename with path
		const newPath = options.targetPath.endsWith('/') 
			? options.targetPath 
			: options.targetPath + '/';
		
		const response = await apiClient.patch(
			`${this.basePath}/buckets/${this.bucket}/objects/${id}/rename`,
			{ newName: newPath + id }
		);
		return convertSolobaseObject(response);
	}

	/**
	 * Move multiple items
	 */
	async moveMultiple(
		ids: string[],
		options: MoveOptions
	): Promise<(FileItem | FolderItem)[]> {
		const moves = ids.map(id => this.move(id, options));
		return Promise.all(moves);
	}

	/**
	 * Copy file/folder
	 */
	async copy(id: string, options: MoveOptions): Promise<FileItem | FolderItem> {
		// Implement copy by downloading and re-uploading
		const blob = await this.downloadFile(id);
		const file = new File([blob], id, { type: blob.type });
		return this.uploadFile(file, { path: options.targetPath });
	}

	/**
	 * Copy multiple items
	 */
	async copyMultiple(
		ids: string[],
		options: MoveOptions
	): Promise<(FileItem | FolderItem)[]> {
		const copies = ids.map(id => this.copy(id, options));
		return Promise.all(copies);
	}

	/**
	 * Create folder
	 */
	async createFolder(
		name: string,
		parentPath = '/',
		parentId?: string
	): Promise<FolderItem> {
		ensureToken(); // Ensure token is set before making request
		const body: any = {
			name,
			path: parentPath
		};
		// Add parent_folder_id if provided
		if (parentId) {
			body.parent_folder_id = parentId;
		}
		const response = await apiClient.post(
			`${this.basePath}/buckets/${this.bucket}/folders`,
			body
		);
		
		// Convert response to FolderItem using the new response structure
		return {
			id: response.id || response.folder || name,
			name: response.name || name,
			type: 'folder',
			path: response.object_path || parentPath,
			parentId: response.parent_folder_id || parentId || null,
			createdAt: response.created_at ? new Date(response.created_at) : new Date(),
			modifiedAt: response.created_at ? new Date(response.created_at) : new Date(),
			owner: 'user',
			permissions: ['read', 'write'],
			shared: false,
			itemCount: 0
		};
	}

	/**
	 * Get file download URL
	 */
	getDownloadUrl(id: string): string {
		const baseURL = config.apiUrl || 'http://localhost:8091';
		return `${baseURL}${this.basePath}/buckets/${this.bucket}/objects/${id}/download`;
	}

	/**
	 * Get file thumbnail URL (same as download for now)
	 */
	getThumbnailUrl(id: string): string {
		return this.getDownloadUrl(id);
	}

	/**
	 * Create share link
	 */
	async createShareLink(
		id: string,
		options: ShareOptions = {}
	): Promise<{ url: string; shareId: string; expiresAt?: Date }> {
		// This would need to be implemented in Solobase
		return {
			url: `${window.location.origin}/share/${id}`,
			shareId: id,
			expiresAt: options.expiresIn ? new Date(Date.now() + options.expiresIn) : undefined
		};
	}

	/**
	 * Revoke share link
	 */
	async revokeShareLink(shareId: string): Promise<void> {
		// This would need to be implemented in Solobase
		console.log('Revoking share link:', shareId);
	}

	/**
	 * Get storage quota
	 */
	async getQuota(): Promise<StorageQuota> {
		try {
			const response = await apiClient.get(`${this.basePath}/quota`);
			return {
				used: response.used || response.storage_used || 0,
				total: response.total || response.storage_limit || (5 * 1024 * 1024 * 1024),
				percentage: response.percentage || 0
			};
		} catch (error) {
			console.error('Failed to get quota:', error);
			// Return default values if API fails
			return {
				used: 0,
				total: 5 * 1024 * 1024 * 1024, // 5 GB
				percentage: 0
			};
		}
	}

	/**
	 * Get storage statistics
	 */
	async getStats(): Promise<StorageStats> {
		try {
			const response = await apiClient.get(`${this.basePath}/stats`);
			return {
				totalSize: response.totalSize || 0,
				fileCount: response.fileCount || response.totalFiles || 0,
				folderCount: response.folderCount || response.totalFolders || 0,
				sharedCount: response.sharedCount || 0,
				trashedCount: response.trashedCount || 0
			};
		} catch (error) {
			console.error('Failed to get stats:', error);
			// Return zeros if API fails
			return {
				totalSize: 0,
				fileCount: 0,
				folderCount: 0,
				sharedCount: 0,
				trashedCount: 0
			};
		}
	}

	/**
	 * Search files
	 */
	async search(
		query: string,
		options?: {
			type?: 'all' | 'file' | 'folder';
			path?: string;
		}
	): Promise<(FileItem | FolderItem)[]> {
		// Get all files and filter client-side for now
		const response = await this.listFiles({ path: options?.path });
		
		return response.items.filter(item => {
			const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
			const matchesType = !options?.type || 
				options.type === 'all' || 
				item.type === options.type;
			
			return matchesQuery && matchesType;
		});
	}

	/**
	 * Empty trash
	 */
	async emptyTrash(): Promise<void> {
		// This would need to be implemented in Solobase
		console.log('Emptying trash');
	}

	/**
	 * Restore from trash
	 */
	async restoreFromTrash(ids: string[]): Promise<void> {
		// This would need to be implemented in Solobase
		console.log('Restoring from trash:', ids);
	}

	/**
	 * Create a share for a file or folder
	 */
	async createShare(shareData: {
		object_id: string;
		shared_with_email?: string;
		is_public?: boolean;
		permission_level: 'view' | 'edit' | 'admin';
		inherit_to_children?: boolean;
		expires_at?: Date | null;
	}): Promise<any> {
		ensureToken();
		return apiClient.post('/api/shares', shareData);
	}

	/**
	 * Get all shares created by the current user
	 */
	async getShares(): Promise<any[]> {
		ensureToken();
		return apiClient.get('/api/shares');
	}

	/**
	 * Remove a share
	 */
	async removeShare(shareId: string): Promise<void> {
		ensureToken();
		return apiClient.delete(`/api/shares/${shareId}`);
	}

	/**
	 * Get shared items (items shared with the current user)
	 */
	async getSharedWithMe(): Promise<any[]> {
		ensureToken();
		// For now, return empty array as we don't have this endpoint yet
		return [];
	}

	/**
	 * Get items shared by the current user
	 */
	async getMyShares(): Promise<any[]> {
		ensureToken();
		// Use the same endpoint as getShares
		return apiClient.get('/api/shares');
	}
}

// Create and export singleton instance
export const storageAPI = new StorageAPI();

// Also export the class for testing
export default StorageAPI;
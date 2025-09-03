import { api } from './api';
import type { FileItem, FolderItem, Share, StorageUsage } from '$lib/types/storage';

export class StorageService {
	async listFiles(path: string = '/'): Promise<{ files: FileItem[], folders: FolderItem[] }> {
		// Solobase CloudStorage API endpoint
		return api.get(`/api/storage/objects?path=${encodeURIComponent(path)}`);
	}

	async uploadFile(file: File, path: string = '/', onProgress?: (progress: number) => void): Promise<FileItem> {
		// Solobase CloudStorage upload endpoint
		return api.upload(`/api/storage/upload?path=${encodeURIComponent(path)}`, file, onProgress);
	}

	async downloadFile(fileId: string): Promise<Blob> {
		const response = await fetch(`${api['baseURL']}/api/storage/download/${fileId}`, {
			headers: {
				'Authorization': `Bearer ${api['token']}`
			}
		});
		
		if (!response.ok) {
			throw new Error('Download failed');
		}
		
		return response.blob();
	}

	async deleteFile(fileId: string): Promise<void> {
		// Solobase CloudStorage delete endpoint
		return api.delete(`/api/storage/objects/${fileId}`);
	}

	async deleteFiles(fileIds: string[]): Promise<void> {
		// Batch delete endpoint
		return api.post('/api/storage/batch/delete', { ids: fileIds });
	}

	async createFolder(name: string, path: string = '/'): Promise<FolderItem> {
		// Create folder in Solobase
		return api.post('/api/storage/folders', { name, path });
	}

	async renameItem(itemId: string, newName: string): Promise<void> {
		// Rename item in Solobase
		return api.put(`/api/storage/objects/${itemId}`, { name: newName });
	}

	async moveItems(itemIds: string[], destinationPath: string): Promise<void> {
		// Move items in Solobase
		return api.post('/api/storage/batch/move', { ids: itemIds, destination: destinationPath });
	}

	async copyItems(itemIds: string[], destinationPath: string): Promise<void> {
		// Copy items in Solobase
		return api.post('/api/storage/batch/copy', { ids: itemIds, destination: destinationPath });
	}

	async getStorageUsage(): Promise<StorageUsage> {
		// Get storage quota from Solobase
		return api.get('/api/storage/quota');
	}

	async searchFiles(query: string): Promise<FileItem[]> {
		// Search files in Solobase
		return api.get(`/api/storage/search?q=${encodeURIComponent(query)}`);
	}

	async getFilePreview(fileId: string): Promise<string> {
		// Get file preview from Solobase
		return api.get(`/api/storage/preview/${fileId}`);
	}

	// Sharing - using Solobase CloudStorage sharing endpoints
	async createShare(itemId: string, options: {
		type: 'public' | 'user';
		permissions?: string[];
		expiresAt?: Date;
		password?: string;
		email?: string;
	}): Promise<Share> {
		return api.post(`/api/storage/shares`, { itemId, ...options });
	}

	async getShares(): Promise<Share[]> {
		// Get all shares created by the user
		return api.get('/api/storage/shares');
	}

	async revokeShare(shareId: string): Promise<void> {
		// Revoke a share
		return api.delete(`/api/storage/shares/${shareId}`);
	}

	async getSharedWithMe(): Promise<{ files: FileItem[], folders: FolderItem[] }> {
		// Get items shared with the current user
		return api.get('/api/storage/shared-with-me');
	}
}

export const storageService = new StorageService();
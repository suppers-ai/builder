/**
 * Storage store with full API integration
 */

import { writable, derived, get } from 'svelte/store';
import { storageAPI as apiClient } from '$lib/api/storage';
import { sharingAPI } from '$lib/api/sharing';
import { notifications } from './notifications';
import { recentFiles } from './recent';
import type { FileItem, FolderItem, StorageQuota } from '$lib/types/storage';

interface StorageState {
	files: FileItem[];
	folders: FolderItem[];
	currentPath: string;
	selectedItems: string[];
	searchQuery: string;
	sortBy: 'name' | 'size' | 'date' | 'type';
	sortOrder: 'asc' | 'desc';
	viewMode: 'grid' | 'list';
	filters: {
		type?: 'all' | 'file' | 'folder' | 'image' | 'document' | 'video' | 'audio';
		dateRange?: { from?: Date; to?: Date };
		sizeRange?: { min?: number; max?: number };
	};
	quota: StorageQuota | null;
	uploadQueue: UploadQueueItem[];
	loading: boolean;
	error: string | null;
}

interface UploadQueueItem {
	id: string;
	file: File;
	path: string;
	parentId?: string; // Add parentId field
	progress: number;
	status: 'pending' | 'uploading' | 'completed' | 'error';
	error?: string;
	uploadedFile?: FileItem;
	cancelToken?: () => void;
}

class StorageStoreAPI {
	private store = writable<StorageState>({
		files: [],
		folders: [],
		currentPath: '',
		selectedItems: [],
		searchQuery: '',
		sortBy: 'name',
		sortOrder: 'asc',
		viewMode: 'grid',
		filters: {},
		quota: null,
		uploadQueue: [],
		loading: false,
		error: null
	});

	// Public store subscription
	subscribe = this.store.subscribe;

	// Derived stores
	files$ = derived(this.store, $store => $store.files);
	folders$ = derived(this.store, $store => $store.folders);
	currentPath$ = derived(this.store, $store => $store.currentPath);
	selectedItems$ = derived(this.store, $store => $store.selectedItems);
	uploadQueue$ = derived(this.store, $store => $store.uploadQueue);
	quota$ = derived(this.store, $store => $store.quota);
	loading$ = derived(this.store, $store => $store.loading);
	viewMode$ = derived(this.store, $store => $store.viewMode);

	// Filtered and sorted files
	filteredFiles$ = derived(this.store, $store => {
		let items = [...$store.files, ...$store.folders];

		// Apply search
		if ($store.searchQuery) {
			const query = $store.searchQuery.toLowerCase();
			items = items.filter(item => 
				item.name.toLowerCase().includes(query)
			);
		}

		// Apply filters
		if ($store.filters.type && $store.filters.type !== 'all') {
			items = items.filter(item => {
				if ($store.filters.type === 'folder') return item.type === 'folder';
				if ($store.filters.type === 'file') return item.type === 'file';
				if (item.type === 'file') {
					const mimeType = (item as FileItem).mimeType;
					switch ($store.filters.type) {
						case 'image': return mimeType.startsWith('image/');
						case 'document': return mimeType.includes('document') || mimeType.includes('pdf');
						case 'video': return mimeType.startsWith('video/');
						case 'audio': return mimeType.startsWith('audio/');
					}
				}
				return false;
			});
		}

		// Apply date filter
		if ($store.filters.dateRange) {
			const { from, to } = $store.filters.dateRange;
			items = items.filter(item => {
				const date = item.modifiedAt;
				if (from && date < from) return false;
				if (to && date > to) return false;
				return true;
			});
		}

		// Apply size filter
		if ($store.filters.sizeRange) {
			const { min, max } = $store.filters.sizeRange;
			items = items.filter(item => {
				if (item.type !== 'file') return true;
				const size = (item as FileItem).size;
				if (min && size < min) return false;
				if (max && size > max) return false;
				return true;
			});
		}

		// Sort items
		items.sort((a, b) => {
			let comparison = 0;

			switch ($store.sortBy) {
				case 'name':
					comparison = a.name.localeCompare(b.name);
					break;
				case 'size':
					const sizeA = a.type === 'file' ? (a as FileItem).size : 0;
					const sizeB = b.type === 'file' ? (b as FileItem).size : 0;
					comparison = sizeA - sizeB;
					break;
				case 'date':
					comparison = a.modifiedAt.getTime() - b.modifiedAt.getTime();
					break;
				case 'type':
					if (a.type !== b.type) {
						comparison = a.type === 'folder' ? -1 : 1;
					} else if (a.type === 'file') {
						comparison = (a as FileItem).mimeType.localeCompare((b as FileItem).mimeType);
					}
					break;
			}

			return $store.sortOrder === 'asc' ? comparison : -comparison;
		});

		return items;
	});

	/**
	 * Load files for current path or folder
	 */
	async loadFiles(pathOrId?: string): Promise<void> {
		const targetPath = pathOrId || get(this.store).currentPath;
		
		this.store.update(state => ({
			...state,
			loading: true,
			error: null,
			currentPath: targetPath
		}));

		try {
			// Check if pathOrId is a folder ID (UUIDs have specific format)
			const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetPath);
			
			const response = await apiClient.listFiles({
				// If it's a UUID, use parentId, otherwise use path
				...(isUUID ? { parentId: targetPath } : { path: targetPath }),
				sortBy: get(this.store).sortBy,
				sortOrder: get(this.store).sortOrder
			});

			const files = response.items.filter(item => item.type === 'file') as FileItem[];
			const folders = response.items.filter(item => item.type === 'folder') as FolderItem[];

			this.store.update(state => ({
				...state,
				files,
				folders,
				loading: false
			}));
		} catch (error: any) {
			this.store.update(state => ({
				...state,
				loading: false,
				error: error.message
			}));
			notifications.error('Failed to load files', error.message);
		}
	}

	/**
	 * Upload files - matches the signature of the base StorageAPI
	 */
	async uploadFiles(files: File[], options: { parentId?: string } = {}): Promise<void> {
		const currentPath = get(this.store).currentPath;
		console.log('[storage-api.ts] uploadFiles called with options:', options, 'currentPath:', currentPath);

		// Add files to upload queue
		const queueItems: UploadQueueItem[] = files.map(file => ({
			id: Math.random().toString(36).substr(2, 9),
			file,
			path: currentPath,
			parentId: options.parentId, // Extract parentId from options
			progress: 0,
			status: 'pending' as const
		}));

		this.store.update(state => ({
			...state,
			uploadQueue: [...state.uploadQueue, ...queueItems]
		}));

		// Process uploads
		for (const item of queueItems) {
			await this.processUpload(item);
		}

		// Reload files after upload
		await this.loadFiles();
	}

	private async processUpload(item: UploadQueueItem): Promise<void> {
		try {
			// Update status to uploading
			this.updateUploadItem(item.id, {
				status: 'uploading',
				progress: 0
			});

			// Upload file
			const uploadedFile = await apiClient.uploadFile(item.file, {
				path: item.path,
				parentId: item.parentId, // Pass parentId to API
				onProgress: (progress) => {
					this.updateUploadItem(item.id, { progress });
				}
			});

			// Update status to completed
			this.updateUploadItem(item.id, {
				status: 'completed',
				progress: 100,
				uploadedFile
			});

			// Track in recent files
			recentFiles.trackAccess(uploadedFile, 'edit');

			notifications.success(`Uploaded ${item.file.name}`);
		} catch (error: any) {
			this.updateUploadItem(item.id, {
				status: 'error',
				error: error.message
			});
			notifications.error(`Failed to upload ${item.file.name}`, error.message);
		}
	}

	private updateUploadItem(id: string, updates: Partial<UploadQueueItem>): void {
		this.store.update(state => ({
			...state,
			uploadQueue: state.uploadQueue.map(item =>
				item.id === id ? { ...item, ...updates } : item
			)
		}));
	}

	/**
	 * Delete items
	 */
	async deleteItem(id: string): Promise<boolean> {
		try {
			await apiClient.deleteItem(id);
			
			this.store.update(state => ({
				...state,
				files: state.files.filter(f => f.id !== id),
				folders: state.folders.filter(f => f.id !== id),
				selectedItems: state.selectedItems.filter(i => i !== id)
			}));

			notifications.success('Item deleted');
			return true;
		} catch (error: any) {
			notifications.error('Failed to delete item', error.message);
			return false;
		}
	}

	async deleteItems(ids: string[]): Promise<boolean> {
		try {
			await apiClient.deleteMultiple(ids);
			
			this.store.update(state => ({
				...state,
				files: state.files.filter(f => !ids.includes(f.id)),
				folders: state.folders.filter(f => !ids.includes(f.id)),
				selectedItems: []
			}));

			notifications.success(`${ids.length} items deleted`);
			return true;
		} catch (error: any) {
			notifications.error('Failed to delete items', error.message);
			return false;
		}
	}

	/**
	 * Create folder
	 */
	async createFolder(name: string, path?: string, parentId?: string): Promise<boolean> {
		const targetPath = path || get(this.store).currentPath;

		try {
			const folder = await apiClient.createFolder(name, targetPath, parentId);
			
			this.store.update(state => ({
				...state,
				folders: [...state.folders, folder]
			}));

			notifications.success(`Folder "${name}" created`);
			return true;
		} catch (error: any) {
			notifications.error('Failed to create folder', error.message);
			return false;
		}
	}

	/**
	 * Update item (currently only supports renaming)
	 */
	async updateItem(id: string, updates: any): Promise<boolean> {
		// For now, we only support name updates
		if (updates.name) {
			return this.renameItem(id, updates.name);
		}
		return false;
	}

	/**
	 * Rename item (also available as 'rename' for compatibility)
	 */
	async renameItem(id: string, newName: string): Promise<boolean> {
		try {
			const updated = await apiClient.rename(id, newName);
			
			this.store.update(state => {
				if (updated.type === 'file') {
					return {
						...state,
						files: state.files.map(f => 
							f.id === id ? updated as FileItem : f
						)
					};
				} else {
					return {
						...state,
						folders: state.folders.map(f => 
							f.id === id ? updated as FolderItem : f
						)
					};
				}
			});

			notifications.success('Renamed successfully');
			return true;
		} catch (error: any) {
			notifications.error('Failed to rename', error.message);
			return false;
		}
	}

	/**
	 * Rename item (alias for compatibility with StorageAPI)
	 */
	async rename(id: string, newName: string): Promise<boolean> {
		return this.renameItem(id, newName);
	}

	/**
	 * Move items
	 */
	async moveItems(ids: string[], targetPath: string): Promise<boolean> {
		try {
			await apiClient.moveMultiple(ids, { targetPath });
			
			// Remove items from current view
			this.store.update(state => ({
				...state,
				files: state.files.filter(f => !ids.includes(f.id)),
				folders: state.folders.filter(f => !ids.includes(f.id)),
				selectedItems: []
			}));

			notifications.success(`${ids.length} items moved`);
			return true;
		} catch (error: any) {
			notifications.error('Failed to move items', error.message);
			return false;
		}
	}

	/**
	 * Copy items
	 */
	async copyItems(ids: string[], targetPath: string): Promise<boolean> {
		try {
			const copied = await apiClient.copyMultiple(ids, { targetPath });
			
			// If copying to current path, add to view
			if (targetPath === get(this.store).currentPath) {
				const copiedFiles = copied.filter(i => i.type === 'file') as FileItem[];
				const copiedFolders = copied.filter(i => i.type === 'folder') as FolderItem[];
				
				this.store.update(state => ({
					...state,
					files: [...state.files, ...copiedFiles],
					folders: [...state.folders, ...copiedFolders]
				}));
			}

			notifications.success(`${ids.length} items copied`);
			return true;
		} catch (error: any) {
			notifications.error('Failed to copy items', error.message);
			return false;
		}
	}

	/**
	 * Download file
	 */
	async downloadFile(id: string): Promise<{ success: boolean; blob?: Blob; filename?: string; error?: string }> {
		try {
			const item = get(this.store).files.find(f => f.id === id);
			if (!item) throw new Error('File not found');

			const blob = await apiClient.downloadFile(id, {
				onProgress: (progress) => {
					// Could show progress in UI
				}
			});

			// Track access
			recentFiles.trackAccess(item, 'download');

			return {
				success: true,
				blob,
				filename: item.name
			};
		} catch (error: any) {
			return {
				success: false,
				error: error.message
			};
		}
	}

	/**
	 * Download multiple files
	 */
	async downloadFiles(ids: string[]): Promise<{ success: boolean; blob?: Blob; filename?: string; error?: string }> {
		try {
			const blob = await apiClient.downloadMultiple(ids, {
				onProgress: (progress) => {
					// Could show progress in UI
				}
			});

			return {
				success: true,
				blob,
				filename: `download-${Date.now()}.zip`
			};
		} catch (error: any) {
			return {
				success: false,
				error: error.message
			};
		}
	}

	/**
	 * Create share
	 */
	async createShare(id: string, options: any): Promise<{ success: boolean; url?: string; shareId?: string; error?: string }> {
		try {
			const share = await sharingAPI.createShareLink({
				itemId: id,
				...options
			});

			return {
				success: true,
				url: share.url,
				shareId: share.shareId
			};
		} catch (error: any) {
			return {
				success: false,
				error: error.message
			};
		}
	}

	/**
	 * Share with users
	 */
	async shareWithUsers(id: string, users: string[], permissions: string[]): Promise<boolean> {
		try {
			await sharingAPI.shareWithUsers({
				itemId: id,
				users,
				permissions,
				sendEmail: true
			});

			notifications.success(`Shared with ${users.length} users`);
			return true;
		} catch (error: any) {
			notifications.error('Failed to share', error.message);
			return false;
		}
	}

	/**
	 * Load storage quota
	 */
	async loadQuota(): Promise<void> {
		try {
			const quota = await apiClient.getQuota();
			this.store.update(state => ({ ...state, quota }));
		} catch (error: any) {
			console.error('Failed to load quota:', error);
		}
	}

	// UI state management
	setCurrentPath(path: string): void {
		this.loadFiles(path);
	}

	setSearchQuery(query: string): void {
		this.store.update(state => ({ ...state, searchQuery: query }));
	}

	setSortBy(sortBy: StorageState['sortBy']): void {
		this.store.update(state => ({ ...state, sortBy }));
	}

	setSortOrder(order: StorageState['sortOrder']): void {
		this.store.update(state => ({ ...state, sortOrder: order }));
	}

	setViewMode(mode: StorageState['viewMode']): void {
		this.store.update(state => ({ ...state, viewMode: mode }));
	}

	selectItems(ids: string[]): void {
		this.store.update(state => ({ ...state, selectedItems: ids }));
	}

	toggleSelection(id: string): void {
		this.store.update(state => ({
			...state,
			selectedItems: state.selectedItems.includes(id)
				? state.selectedItems.filter(i => i !== id)
				: [...state.selectedItems, id]
		}));
	}

	clearSelection(): void {
		this.store.update(state => ({ ...state, selectedItems: [] }));
	}

	addToUploadQueue(files: File[]): void {
		this.uploadFiles(files);
	}

	removeFromUploadQueue(id: string): void {
		this.store.update(state => ({
			...state,
			uploadQueue: state.uploadQueue.filter(item => item.id !== id)
		}));
	}

	clearUploadQueue(): void {
		this.store.update(state => ({ ...state, uploadQueue: [] }));
	}

	// Stub methods for compatibility
	lockItems(ids: string[]): Promise<void> {
		// TODO: Implement when API is ready
		return Promise.resolve();
	}

	unlockItems(ids: string[]): Promise<void> {
		// TODO: Implement when API is ready
		return Promise.resolve();
	}

	validateFile(file: File): { valid: boolean; error?: string } {
		const maxSize = 100 * 1024 * 1024; // 100MB
		if (file.size > maxSize) {
			return { valid: false, error: 'File exceeds maximum size of 100MB' };
		}
		return { valid: true };
	}
}

// Create singleton instance
export const storageAPI = new StorageStoreAPI();

// Re-export for convenience
export const storage = storageAPI;
import { writable, derived, get } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { storageAPI as storageApi } from './storage-api';
import { notifications } from './notifications';

export interface UploadItem {
	id: string;
	file: File;
	name: string;
	size: number;
	type: string;
	progress: number;
	status: 'pending' | 'uploading' | 'completed' | 'error';
	error?: string;
	uploadedUrl?: string;
	cancelToken?: AbortController;
}

export interface StorageState {
	currentPath: string;
	files: any[];
	folders: any[];
	loading: boolean;
	error: string | null;
	selectedItems: string[];
	sortBy: 'name' | 'size' | 'modified' | 'type';
	sortOrder: 'asc' | 'desc';
	view: 'grid' | 'list';
	searchQuery: string;
	filters: {
		type: string;
		dateRange: { start: Date | null; end: Date | null };
		sizeRange: { min: number | null; max: number | null };
	};
	clipboard: {
		items: any[];
		operation: 'copy' | 'cut' | null;
	};
}

// Upload queue store
export const uploadQueue: Writable<UploadItem[]> = writable([]);

// Main storage store
function createStorageStore() {
	const { subscribe, set, update } = writable<StorageState>({
		currentPath: '/',
		files: [],
		folders: [],
		loading: false,
		error: null,
		selectedItems: [],
		sortBy: 'name',
		sortOrder: 'asc',
		view: 'grid',
		searchQuery: '',
		filters: {
			type: '',
			dateRange: { start: null, end: null },
			sizeRange: { min: null, max: null }
		},
		clipboard: {
			items: [],
			operation: null
		}
	});

	return {
		subscribe,
		
		async loadFiles(path: string = '/') {
			update(state => ({ ...state, loading: true, error: null, currentPath: path }));
			
			try {
				const response = await storageApi.listFiles(path);
				update(state => ({
					...state,
					files: response.files || [],
					folders: response.folders || [],
					loading: false
				}));
			} catch (error: any) {
				update(state => ({
					...state,
					loading: false,
					error: error.message || 'Failed to load files'
				}));
				notifications.error('Failed to load files');
			}
		},

		async uploadFile(file: File, path: string = '/') {
			const uploadItem: UploadItem = {
				id: Math.random().toString(36).substr(2, 9),
				file,
				name: file.name,
				size: file.size,
				type: file.type,
				progress: 0,
				status: 'pending',
				cancelToken: new AbortController()
			};

			uploadQueue.update(queue => [...queue, uploadItem]);

			try {
				// Update status to uploading
				uploadQueue.update(queue => 
					queue.map(item => 
						item.id === uploadItem.id 
							? { ...item, status: 'uploading' as const }
							: item
					)
				);

				const response = await storageApi.uploadFile(
					file, 
					path,
					(progress) => {
						uploadQueue.update(queue => 
							queue.map(item => 
								item.id === uploadItem.id 
									? { ...item, progress }
									: item
							)
						);
					},
					uploadItem.cancelToken.signal
				);

				// Update status to completed
				uploadQueue.update(queue => 
					queue.map(item => 
						item.id === uploadItem.id 
							? { 
								...item, 
								status: 'completed' as const, 
								progress: 100,
								uploadedUrl: response.url 
							}
							: item
					)
				);

				// Reload files
				await this.loadFiles(path);
				
				notifications.success(`${file.name} uploaded successfully`);
			} catch (error: any) {
				uploadQueue.update(queue => 
					queue.map(item => 
						item.id === uploadItem.id 
							? { 
								...item, 
								status: 'error' as const,
								error: error.message 
							}
							: item
					)
				);
				
				notifications.error(`Failed to upload ${file.name}`);
			}
		},

		async createFolder(name: string, path: string = '/') {
			try {
				await storageApi.createFolder(name, path);
				await this.loadFiles(path);
				notifications.success(`Folder "${name}" created`);
			} catch (error: any) {
				notifications.error(`Failed to create folder: ${error.message}`);
			}
		},

		async deleteItems(itemIds: string[]) {
			try {
				await Promise.all(itemIds.map(id => storageApi.deleteFile(id)));
				const currentPath = get(this).currentPath;
				await this.loadFiles(currentPath);
				notifications.success(`${itemIds.length} item(s) deleted`);
			} catch (error: any) {
				notifications.error(`Failed to delete items: ${error.message}`);
			}
		},

		async moveItems(itemIds: string[], targetPath: string) {
			try {
				await Promise.all(itemIds.map(id => storageApi.moveFile(id, targetPath)));
				const currentPath = get(this).currentPath;
				await this.loadFiles(currentPath);
				notifications.success(`${itemIds.length} item(s) moved`);
			} catch (error: any) {
				notifications.error(`Failed to move items: ${error.message}`);
			}
		},

		async copyItems(itemIds: string[], targetPath: string) {
			try {
				await Promise.all(itemIds.map(id => storageApi.copyFile(id, targetPath)));
				await this.loadFiles(targetPath);
				notifications.success(`${itemIds.length} item(s) copied`);
			} catch (error: any) {
				notifications.error(`Failed to copy items: ${error.message}`);
			}
		},

		async renameItem(itemId: string, newName: string) {
			try {
				await storageApi.renameFile(itemId, newName);
				const currentPath = get(this).currentPath;
				await this.loadFiles(currentPath);
				notifications.success('Item renamed');
			} catch (error: any) {
				notifications.error(`Failed to rename item: ${error.message}`);
			}
		},

		selectItem(itemId: string) {
			update(state => ({
				...state,
				selectedItems: [...state.selectedItems, itemId]
			}));
		},

		deselectItem(itemId: string) {
			update(state => ({
				...state,
				selectedItems: state.selectedItems.filter(id => id !== itemId)
			}));
		},

		toggleItemSelection(itemId: string) {
			update(state => ({
				...state,
				selectedItems: state.selectedItems.includes(itemId)
					? state.selectedItems.filter(id => id !== itemId)
					: [...state.selectedItems, itemId]
			}));
		},

		selectAll() {
			update(state => ({
				...state,
				selectedItems: [
					...state.files.map(f => f.id),
					...state.folders.map(f => f.id)
				]
			}));
		},

		clearSelection() {
			update(state => ({
				...state,
				selectedItems: []
			}));
		},

		setView(view: 'grid' | 'list') {
			update(state => ({ ...state, view }));
		},

		setSortBy(sortBy: 'name' | 'size' | 'modified' | 'type') {
			update(state => ({ ...state, sortBy }));
		},

		setSortOrder(sortOrder: 'asc' | 'desc') {
			update(state => ({ ...state, sortOrder }));
		},

		setSearchQuery(query: string) {
			update(state => ({ ...state, searchQuery: query }));
		},

		setFilters(filters: Partial<StorageState['filters']>) {
			update(state => ({
				...state,
				filters: { ...state.filters, ...filters }
			}));
		},

		copyToClipboard(items: any[]) {
			update(state => ({
				...state,
				clipboard: {
					items,
					operation: 'copy'
				}
			}));
			notifications.info(`${items.length} item(s) copied to clipboard`);
		},

		cutToClipboard(items: any[]) {
			update(state => ({
				...state,
				clipboard: {
					items,
					operation: 'cut'
				}
			}));
			notifications.info(`${items.length} item(s) cut to clipboard`);
		},

		async pasteFromClipboard(targetPath: string) {
			const state = get(this);
			if (!state.clipboard.items.length || !state.clipboard.operation) {
				return;
			}

			const itemIds = state.clipboard.items.map(item => item.id);
			
			if (state.clipboard.operation === 'copy') {
				await this.copyItems(itemIds, targetPath);
			} else if (state.clipboard.operation === 'cut') {
				await this.moveItems(itemIds, targetPath);
				// Clear clipboard after cut
				update(state => ({
					...state,
					clipboard: {
						items: [],
						operation: null
					}
				}));
			}
		},

		clearClipboard() {
			update(state => ({
				...state,
				clipboard: {
					items: [],
					operation: null
				}
			}));
		},

		cancelUpload(uploadId: string) {
			const queue = get(uploadQueue);
			const upload = queue.find(item => item.id === uploadId);
			if (upload?.cancelToken) {
				upload.cancelToken.abort();
			}
			uploadQueue.update(queue => queue.filter(item => item.id !== uploadId));
		},

		clearCompletedUploads() {
			uploadQueue.update(queue => 
				queue.filter(item => item.status !== 'completed')
			);
		},

		clearAllUploads() {
			const queue = get(uploadQueue);
			queue.forEach(upload => {
				if (upload.cancelToken) {
					upload.cancelToken.abort();
				}
			});
			uploadQueue.set([]);
		}
	};
}

export const storage = createStorageStore();

// Derived stores
export const sortedFiles = derived(
	storage,
	$storage => {
		const items = [...$storage.files, ...$storage.folders];
		
		// Apply search filter
		let filtered = items;
		if ($storage.searchQuery) {
			filtered = items.filter(item =>
				item.name.toLowerCase().includes($storage.searchQuery.toLowerCase())
			);
		}

		// Apply type filter
		if ($storage.filters.type) {
			filtered = filtered.filter(item => 
				item.type === $storage.filters.type || 
				(item.isFolder && $storage.filters.type === 'folder')
			);
		}

		// Apply date range filter
		if ($storage.filters.dateRange.start || $storage.filters.dateRange.end) {
			filtered = filtered.filter(item => {
				const itemDate = new Date(item.modified);
				if ($storage.filters.dateRange.start && itemDate < $storage.filters.dateRange.start) {
					return false;
				}
				if ($storage.filters.dateRange.end && itemDate > $storage.filters.dateRange.end) {
					return false;
				}
				return true;
			});
		}

		// Apply size range filter
		if ($storage.filters.sizeRange.min !== null || $storage.filters.sizeRange.max !== null) {
			filtered = filtered.filter(item => {
				if (item.isFolder) return true; // Don't filter folders by size
				if ($storage.filters.sizeRange.min !== null && item.size < $storage.filters.sizeRange.min) {
					return false;
				}
				if ($storage.filters.sizeRange.max !== null && item.size > $storage.filters.sizeRange.max) {
					return false;
				}
				return true;
			});
		}

		// Sort items
		const sorted = [...filtered].sort((a, b) => {
			let comparison = 0;
			
			// Folders first
			if (a.isFolder && !b.isFolder) return -1;
			if (!a.isFolder && b.isFolder) return 1;
			
			switch ($storage.sortBy) {
				case 'name':
					comparison = a.name.localeCompare(b.name);
					break;
				case 'size':
					comparison = (a.size || 0) - (b.size || 0);
					break;
				case 'modified':
					comparison = new Date(a.modified).getTime() - new Date(b.modified).getTime();
					break;
				case 'type':
					comparison = (a.type || '').localeCompare(b.type || '');
					break;
			}
			
			return $storage.sortOrder === 'asc' ? comparison : -comparison;
		});

		return sorted;
	}
);

export const uploadProgress = derived(
	uploadQueue,
	$queue => {
		if ($queue.length === 0) return 0;
		const total = $queue.reduce((sum, item) => sum + item.progress, 0);
		return Math.round(total / $queue.length);
	}
);

export const activeUploads = derived(
	uploadQueue,
	$queue => $queue.filter(item => item.status === 'uploading').length
);

export const hasActiveUploads = derived(
	activeUploads,
	$active => $active > 0
);
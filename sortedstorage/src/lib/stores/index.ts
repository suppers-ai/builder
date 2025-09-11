/**
 * Centralized store exports
 * This file provides a single import point for all stores
 */

// Use the API-integrated storage store as the main storage store
export { storageStoreAPI as storage } from './storage-api';
export type { FileItem, FolderItem, StorageQuota } from '$lib/types/storage';

// Authentication store
export { auth } from './auth';

// Notification stores
export { notifications, toasts } from './notifications';

// Feature stores
export { searchStore as search } from './search';
export { recentFiles } from './recent';
export { collaboration } from './collaboration';

// Create derived stores from storage API
import { storageStoreAPI } from './storage-api';

// Export derived stores with more intuitive names
export const currentFiles = storageStoreAPI.files$;
export const currentFolders = storageStoreAPI.folders$;
export const isLoading = storageStoreAPI.loading$;
export const uploadQueue = storageStoreAPI.uploadQueue$;
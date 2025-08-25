/**
 * Storage API service layer for sorted-storage application
 * Provides CRUD operations for files and folders with hierarchy support
 * Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 8.1, 8.3
 */

import { getAuthClient, getCurrentUserId } from "./auth.ts";
import {
  cacheInvalidation,
  cacheKeys,
  folderStructureCache,
  storageObjectsCache,
} from "./cache-manager.ts";
import type {
  BreadcrumbItem,
  FileUploadOptions,
  FolderStructure,
  SearchOptions,
  SearchResult,
  StorageMetadata,
  StorageObject,
  UploadProgress,
} from "../types/storage.ts";
import type { NetworkError, StorageError, UploadError, ValidationError } from "../types/errors.ts";
import config from "../../../config.ts";

// API base URL configuration
const API_BASE_URL = config.apiUrl ? `${config.apiUrl}/api/v1` : "http://localhost:54321/functions/v1/api/v1";
const APPLICATION_SLUG = "sorted-storage";

/**
 * Base API client for making authenticated requests
 */
class StorageApiClient {
  private baseUrl: string;
  private applicationSlug: string;

  constructor(baseUrl: string = API_BASE_URL, applicationSlug: string = APPLICATION_SLUG) {
    this.baseUrl = baseUrl;
    this.applicationSlug = applicationSlug;
  }

  /**
   * Get authentication headers for API requests
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const authClient = getAuthClient();
    const accessToken = await authClient.getAccessToken();
    const userId = getCurrentUserId();
    
    if (!accessToken || !userId) {
      throw new Error("User not authenticated");
    }

    return {
      "Authorization": `Bearer ${accessToken}`,
      "X-User-ID": userId,
      "Content-Type": "application/json",
    };
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw this.createError(response.status, errorData.error || response.statusText);
    }

    return response;
  }

  /**
   * Create appropriate error based on status code and message
   */
  private createError(status: number, message: string): StorageError {
    const timestamp = new Date().toISOString();

    switch (status) {
      case 401:
      case 403:
        return {
          type: "permission",
          message,
          recoverable: false,
          timestamp,
        };
      case 404:
        return {
          type: "file_not_found",
          message,
          recoverable: false,
          timestamp,
        };
      case 413:
        return {
          type: "storage_quota",
          message,
          recoverable: false,
          timestamp,
        };
      case 429:
        return {
          type: "rate_limit",
          message,
          recoverable: true,
          timestamp,
        };
      case 500:
      case 502:
      case 503:
        return {
          type: "server_error",
          message,
          recoverable: true,
          timestamp,
        };
      default:
        return {
          type: "network",
          message,
          recoverable: true,
          timestamp,
        };
    }
  }

  /**
   * Get storage objects with optional folder filtering and caching
   */
  async getStorageObjects(folderId?: string, useCache: boolean = true): Promise<StorageObject[]> {
    const cacheKey = cacheKeys.storageObjects(folderId);

    // Try cache first
    if (useCache) {
      const cached = storageObjectsCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const endpoint = `/storage/${this.applicationSlug}/`;
    const response = await this.makeRequest(endpoint);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch storage objects");
    }

    // Convert API response to StorageObject format
    const objects: StorageObject[] = data.data.files.map((file: any) => ({
      id: file.id,
      user_id: getCurrentUserId()!,
      name: file.name,
      file_path: file.path,
      file_size: file.size,
      mime_type: file.contentType,
      object_type: file.object_type || "file",
      parent_folder_id: file.parent_folder_id || null,
      thumbnail_url: file.metadata?.thumbnail_url || null,
      metadata: file.metadata || {},
      created_at: file.createdAt,
      updated_at: file.lastModified,
      application_id: null,
    }));

    // Filter by folder if specified
    let filteredObjects = objects;
    if (folderId !== undefined) {
      filteredObjects = objects.filter((obj) => obj.parent_folder_id === folderId);
    }

    // Cache the results
    if (useCache) {
      storageObjectsCache.set(cacheKey, filteredObjects);
    }

    return filteredObjects;
  }

  /**
   * Get paginated storage objects
   */
  async getPaginatedStorageObjects(
    folderId?: string,
    page: number = 1,
    pageSize: number = 20,
    useCache: boolean = true,
  ): Promise<{ items: StorageObject[]; totalCount: number; hasMore: boolean }> {
    const allObjects = await this.getStorageObjects(folderId, useCache);

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = allObjects.slice(startIndex, endIndex);

    return {
      items,
      totalCount: allObjects.length,
      hasMore: endIndex < allObjects.length,
    };
  }

  /**
   * Get a specific storage object by ID
   */
  async getStorageObject(id: string): Promise<StorageObject | null> {
    const objects = await this.getStorageObjects();
    return objects.find((obj) => obj.id === id) || null;
  }

  /**
   * Create a new folder
   */
  async createFolder(
    name: string,
    parentId?: string,
    metadata: Partial<StorageMetadata> = {},
  ): Promise<StorageObject> {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Validate folder name
    if (!name || name.trim().length === 0) {
      const error: ValidationError = {
        type: "validation",
        message: "Folder name cannot be empty",
        field: "name",
        validationRule: "required",
        providedValue: name,
        recoverable: true,
        timestamp: new Date().toISOString(),
      };
      throw error;
    }

    // Create folder metadata (no longer storing parent_id here)
    const folderMetadata: StorageMetadata = {
      ...metadata,
    };

    // Create a virtual file path for the folder
    const folderPath = `${userId}/${this.applicationSlug}/folders/${crypto.randomUUID()}`;

    const folderData = {
      name: name.trim(),
      path: folderPath,
      contentType: "application/x-folder",
      object_type: "folder",
      parent_folder_id: parentId || null,
      metadata: folderMetadata,
    };

    const endpoint = `/storage/${this.applicationSlug}/${folderPath}`;
    const response = await this.makeRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(folderData),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to create folder");
    }

    // Invalidate relevant caches
    cacheInvalidation.invalidateFolder(parentId);

    // Return the created folder as StorageObject
    return {
      id: data.data.id,
      user_id: userId,
      name: name.trim(),
      file_path: folderPath,
      file_size: 0,
      mime_type: "application/x-folder",
      object_type: "folder",
      parent_folder_id: parentId || null,
      thumbnail_url: null,
      metadata: folderMetadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      application_id: null,
    };
  }

  /**
   * Upload a file to storage
   */
  async uploadFile(
    file: File,
    options: FileUploadOptions = {},
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<StorageObject> {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Validate file
    if (options.maxFileSize && file.size > options.maxFileSize) {
      const error: UploadError = {
        type: "upload",
        message: `File size ${file.size} exceeds maximum allowed size ${options.maxFileSize}`,
        fileName: file.name,
        fileSize: file.size,
        recoverable: false,
        timestamp: new Date().toISOString(),
      };
      throw error;
    }

    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      const error: UploadError = {
        type: "upload",
        message: `File type ${file.type} is not allowed`,
        fileName: file.name,
        recoverable: false,
        timestamp: new Date().toISOString(),
      };
      throw error;
    }

    const fileId = crypto.randomUUID();
    const filePath = `${userId}/${this.applicationSlug}/${fileId}-${file.name}`;

    // Create file metadata (no longer storing parent_id here)
    const fileMetadata: StorageMetadata = {
      original_name: file.name,
    };

    // Report initial progress
    if (onProgress) {
      onProgress({
        fileId,
        fileName: file.name,
        progress: 0,
        status: "pending",
      });
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("metadata", JSON.stringify(fileMetadata));
      formData.append("object_type", "file");
      if (options.currentFolderId) {
        formData.append("parent_folder_id", options.currentFolderId);
      }

      const endpoint = `/storage/${this.applicationSlug}/${filePath}`;

      // Report upload start
      if (onProgress) {
        onProgress({
          fileId,
          fileName: file.name,
          progress: 10,
          status: "uploading",
        });
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: await this.getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createError(response.status, errorData.error || response.statusText);
      }

      const data = await response.json();

      // Report completion
      if (onProgress) {
        onProgress({
          fileId,
          fileName: file.name,
          progress: 100,
          status: "completed",
        });
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to upload file");
      }

      // Invalidate relevant caches
      cacheInvalidation.invalidateFolder(options.currentFolderId);

      // Return the uploaded file as StorageObject
      return {
        id: data.data.id,
        user_id: userId,
        name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        object_type: "file",
        parent_folder_id: options.currentFolderId || null,
        thumbnail_url: data.data.thumbnailUrl || null,
        metadata: fileMetadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        application_id: null,
      };
    } catch (error) {
      // Report error
      if (onProgress) {
        onProgress({
          fileId,
          fileName: file.name,
          progress: 0,
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
      throw error;
    }
  }

  /**
   * Update storage object metadata
   */
  async updateStorageObject(
    id: string,
    updates: Partial<Pick<StorageObject, "name" | "metadata">>,
  ): Promise<StorageObject> {
    const object = await this.getStorageObject(id);
    if (!object) {
      throw new Error("Storage object not found");
    }

    // Make PATCH request to update the storage object
    const endpoint = `/storage/${this.applicationSlug}/objects/${id}`;
    const response = await this.makeRequest(endpoint, {
      method: "PATCH",
      body: JSON.stringify({
        name: updates.name !== undefined ? updates.name : object.name,
        metadata: updates.metadata !== undefined ? {
          ...object.metadata,
          ...updates.metadata
        } : object.metadata
      }),
    });

    const updatedObject = await response.json();
    
    // Invalidate cache for the parent folder
    cacheInvalidation.invalidateFolder(object.parent_folder_id);
    
    return updatedObject;
  }

  /**
   * Delete a storage object
   */
  async deleteStorageObject(id: string): Promise<void> {
    const object = await this.getStorageObject(id);
    if (!object) {
      throw new Error("Storage object not found");
    }

    const endpoint = `/storage/${this.applicationSlug}/${object.file_path}`;
    await this.makeRequest(endpoint, {
      method: "DELETE",
    });

    // Invalidate relevant caches
    cacheInvalidation.invalidateFolder(object.parent_folder_id);
  }

  /**
   * Get folder structure with children
   */
  async getFolderStructure(folderId?: string): Promise<FolderStructure | null> {
    const objects = await this.getStorageObjects();

    if (folderId && folderId !== "root") {
      const folder = objects.find((obj) => obj.id === folderId && obj.object_type === "folder");
      if (!folder) {
        return null;
      }

      const children = objects.filter((obj) => obj.parent_folder_id === folderId);
      const totalSize = children.reduce((sum, child) => sum + child.file_size, 0);
      const lastModified = children.reduce((latest, child) => {
        return child.updated_at > latest ? child.updated_at : latest;
      }, folder.updated_at);

      return {
        folder,
        children,
        totalSize,
        itemCount: children.length,
        lastModified,
      };
    }

    // Return root folder structure
    const rootChildren = objects.filter((obj) => obj.parent_folder_id === null);
    const totalSize = rootChildren.reduce((sum, child) => sum + child.file_size, 0);
    const lastModified = rootChildren.reduce((latest, child) => {
      return child.updated_at > latest ? child.updated_at : latest;
    }, new Date().toISOString());

    // Create virtual root folder
    const rootFolder: StorageObject = {
      id: "root",
      user_id: getCurrentUserId()!,
      name: "Root",
      file_path: "",
      file_size: 0,
      mime_type: "application/x-folder",
      object_type: "folder",
      parent_folder_id: null,
      thumbnail_url: null,
      metadata: {
        custom_name: "Home",
        emoji: "🏠",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      application_id: null,
    };

    return {
      folder: rootFolder,
      children: rootChildren,
      totalSize,
      itemCount: rootChildren.length,
      lastModified,
    };
  }

  /**
   * Get breadcrumb path for a folder
   */
  async getBreadcrumbPath(folderId?: string): Promise<BreadcrumbItem[]> {
    if (!folderId || folderId === "root") {
      return [{ id: "root", name: "Home", path: "/" }];
    }

    const objects = await this.getStorageObjects();
    const breadcrumbs: BreadcrumbItem[] = [];
    let currentId: string | null = folderId;

    // Build breadcrumb path by traversing up the hierarchy
    while (currentId && currentId !== "root") {
      const folder = objects.find((obj) => obj.id === currentId && obj.object_type === "folder");
      if (!folder) break;

      breadcrumbs.unshift({
        id: folder.id,
        name: folder.metadata.custom_name || folder.name,
        path: `/folder/${folder.id}`,
      });

      currentId = folder.parent_folder_id;
    }

    // Add root at the beginning
    breadcrumbs.unshift({ id: "root", name: "Home", path: "/" });

    return breadcrumbs;
  }

  /**
   * Get folder hierarchy for navigation
   */
  async getFolderHierarchy(folderId?: string): Promise<StorageObject[]> {
    const objects = await this.getStorageObjects();

    if (!folderId || folderId === "root") {
      return objects.filter((obj) => obj.object_type === "folder" && obj.parent_folder_id === null);
    }

    return objects.filter((obj) => obj.object_type === "folder" && obj.parent_folder_id === folderId);
  }

  /**
   * Search storage objects
   */
  async searchStorageObjects(options: SearchOptions): Promise<SearchResult> {
    const objects = await this.getStorageObjects();

    let filteredObjects = objects;

    // Apply query filter
    if (options.query) {
      const query = options.query.toLowerCase();
      filteredObjects = filteredObjects.filter((obj) =>
        obj.name.toLowerCase().includes(query) ||
        (obj.metadata.description && obj.metadata.description.toLowerCase().includes(query))
      );
    }

    // Apply file type filter
    if (options.fileTypes && options.fileTypes.length > 0) {
      filteredObjects = filteredObjects.filter((obj) =>
        options.fileTypes!.some((type) => obj.mime_type.startsWith(type))
      );
    }

    // Apply date range filter
    if (options.dateRange) {
      const startDate = new Date(options.dateRange.start);
      const endDate = new Date(options.dateRange.end);
      filteredObjects = filteredObjects.filter((obj) => {
        const objDate = new Date(obj.created_at);
        return objDate >= startDate && objDate <= endDate;
      });
    }

    // Apply size range filter
    if (options.sizeRange) {
      filteredObjects = filteredObjects.filter((obj) =>
        obj.file_size >= options.sizeRange!.min &&
        obj.file_size <= options.sizeRange!.max
      );
    }

    // Apply tags filter
    if (options.tags && options.tags.length > 0) {
      filteredObjects = filteredObjects.filter((obj) =>
        obj.metadata.tags &&
        options.tags!.some((tag) => obj.metadata.tags!.includes(tag))
      );
    }

    return {
      items: filteredObjects,
      totalCount: filteredObjects.length,
      hasMore: false, // For now, we return all results
    };
  }

  /**
   * Share a storage object with specific permissions
   */
  async shareStorageObject(
    objectId: string,
    shareOptions: {
      sharedWithUserId?: string;
      sharedWithEmail?: string;
      permissionLevel?: "view" | "edit" | "admin";
      inheritToChildren?: boolean;
      expiresAt?: string;
      isPublic?: boolean;
    },
  ): Promise<ShareInfo> {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // If making public, generate a share token
    let shareToken: string | undefined;
    if (shareOptions.isPublic) {
      shareToken = crypto.randomUUID();
    }

    const shareData = {
      object_id: objectId,
      shared_with_user_id: shareOptions.sharedWithUserId,
      shared_with_email: shareOptions.sharedWithEmail,
      permission_level: shareOptions.permissionLevel || "view",
      inherit_to_children: shareOptions.inheritToChildren !== false,
      share_token: shareToken,
      is_public: shareOptions.isPublic || false,
      expires_at: shareOptions.expiresAt,
      created_by: userId,
    };

    const endpoint = `/storage/${this.applicationSlug}/share`;
    const response = await this.makeRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(shareData),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to share object");
    }

    // Return share info
    return {
      token: shareToken || "",
      url: shareToken ? `${window.location.origin}/share/${shareToken}` : "",
      expiresAt: shareOptions.expiresAt,
      createdAt: new Date().toISOString(),
      accessCount: 0,
      options: {
        expiresAt: shareOptions.expiresAt,
        allowDownload: shareOptions.permissionLevel !== "view",
        requirePassword: false,
      },
    };
  }

  /**
   * Get shares for a storage object
   */
  async getObjectShares(objectId: string): Promise<any[]> {
    const endpoint = `/storage/${this.applicationSlug}/shares/${objectId}`;
    const response = await this.makeRequest(endpoint);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch shares");
    }

    return data.data || [];
  }

  /**
   * Update a share
   */
  async updateShare(
    shareId: string,
    updates: {
      permissionLevel?: "view" | "edit" | "admin";
      expiresAt?: string;
      inheritToChildren?: boolean;
    },
  ): Promise<void> {
    const endpoint = `/storage/${this.applicationSlug}/share/${shareId}`;
    const response = await this.makeRequest(endpoint, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to update share");
    }
  }

  /**
   * Remove a share
   */
  async removeShare(shareId: string): Promise<void> {
    const endpoint = `/storage/${this.applicationSlug}/share/${shareId}`;
    const response = await this.makeRequest(endpoint, {
      method: "DELETE",
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to remove share");
    }
  }

  /**
   * Generate a public share link
   */
  async generatePublicLink(
    objectId: string,
    options?: {
      expiresAt?: string;
      permissionLevel?: "view" | "edit";
    },
  ): Promise<string> {
    const shareInfo = await this.shareStorageObject(objectId, {
      isPublic: true,
      permissionLevel: options?.permissionLevel || "view",
      expiresAt: options?.expiresAt,
    });

    return shareInfo.url;
  }

  /**
   * Check if user has permission to access an object
   */
  async checkPermission(
    objectId: string,
    requiredLevel: "view" | "edit" | "admin" = "view",
  ): Promise<boolean> {
    const endpoint = `/storage/${this.applicationSlug}/permission/${objectId}?level=${requiredLevel}`;
    const response = await this.makeRequest(endpoint);
    const data = await response.json();

    return data.success && data.data?.hasPermission;
  }
}

// Export singleton instance
export const storageApi = new StorageApiClient();

// Export individual functions for convenience
export const {
  getStorageObjects,
  getStorageObject,
  createFolder,
  uploadFile,
  updateStorageObject,
  deleteStorageObject,
  getFolderStructure,
  getBreadcrumbPath,
  getFolderHierarchy,
  searchStorageObjects,
  shareStorageObject,
  getObjectShares,
  updateShare,
  removeShare,
  generatePublicLink,
  checkPermission,
} = storageApi;

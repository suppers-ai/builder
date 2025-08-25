/**
 * Core data models and types for sorted-storage application
 * Based on requirements 3.1, 3.2, 4.1, 5.1, 5.2, 5.3, 5.4, 5.5
 */

// Base storage object interface extending the database schema
export interface StorageObject {
  id: string;
  user_id: string;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  object_type: "file" | "folder";
  parent_folder_id: string | null;
  thumbnail_url: string | null;
  metadata: StorageMetadata;
  created_at: string;
  updated_at: string;
  application_id?: string | null;
  path_segments?: string[];
}

// Custom metadata interface for personalization (Requirement 5.1, 5.2, 5.3, 5.4, 5.5)
export interface StorageMetadata {
  description?: string;
  emoji?: string;
  custom_name?: string;
  folder_color?: string;
  tags?: string[];
  last_accessed?: string;
  display_date?: string;
  [key: string]: unknown;
}

// Folder structure interface for hierarchical organization (Requirement 3.1, 3.2)
export interface FolderStructure {
  folder: StorageObject;
  children: StorageObject[];
  totalSize: number;
  itemCount: number;
  lastModified: string;
}

// Layout system types (Requirement 2.1, 2.2, 2.3, 2.4, 2.5)
export type LayoutType = "default" | "timeline";

export interface LayoutOptions {
  sortBy: "name" | "date" | "size" | "type";
  sortOrder: "asc" | "desc";
  showThumbnails: boolean;
  itemSize: "small" | "medium" | "large";
}

export interface LayoutRenderer {
  name: string;
  displayName: string;
  render: (items: StorageObject[], options: LayoutOptions) => import("preact").ComponentChildren;
}

// File upload types (Requirement 4.1, 4.2, 4.3, 4.4)
export interface FileUploadOptions {
  currentFolderId?: string;
  allowedTypes?: string[];
  maxFileSize?: number;
  generateThumbnail?: boolean;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "processing" | "completed" | "error";
  error?: string;
}

// Sharing types (Requirement 6.1, 6.2, 6.3, 6.4, 6.5)
export interface ShareOptions {
  expiresAt?: string;
  allowDownload?: boolean;
  requirePassword?: boolean;
  password?: string;
}

export interface ShareInfo {
  token: string;
  url: string;
  expiresAt?: string;
  createdAt: string;
  accessCount: number;
  options: ShareOptions;
}

// Navigation and breadcrumb types (Requirement 3.3, 3.4)
export interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}

export interface NavigationState {
  currentFolderId: string | null;
  breadcrumbs: BreadcrumbItem[];
  canGoBack: boolean;
  canGoForward: boolean;
}

// Selection and interaction types
export interface SelectionState {
  selectedItems: Set<string>;
  lastSelectedId: string | null;
  selectionMode: "none" | "single" | "multiple";
}

export interface ItemAction {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  handler: (items: StorageObject[]) => void | Promise<void>;
}

// View state and preferences
export interface ViewPreferences {
  layout: LayoutType;
  layoutOptions: LayoutOptions;
  showHiddenFiles: boolean;
  compactMode: boolean;
  sidebarVisible: boolean;
}

// Search and filtering types
export interface SearchOptions {
  query: string;
  fileTypes?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  includeSubfolders?: boolean;
}

export interface SearchResult {
  items: StorageObject[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

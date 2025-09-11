/**
 * Storage types - Re-exported from @solobase/sdk
 */

// Import types from SDK
export type { 
  StorageObject,
  StorageObjectMetadata,
  PaginatedResponse 
} from '@solobase/sdk';

// Import helper functions from SDK
export { 
  isFolder,
  isFile,
  parseMetadata,
  getDisplayName,
  getFileExtension
} from '@solobase/sdk';

// Legacy type aliases for backward compatibility (to be removed later)
import type { StorageObject } from '@solobase/sdk';
export type StorageItem = StorageObject;
export type FileItem = StorageObject;
export type FolderItem = StorageObject;

// Application-specific types that aren't in the SDK
export interface User {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	role: 'user' | 'admin';
	subscription: SubscriptionPlan;
	createdAt: Date;
}

export interface Share {
	id: string;
	itemId: string;
	itemType: 'file' | 'folder';
	shareType: 'public' | 'user';
	permissions: SharePermission[];
	expiresAt?: Date;
	password?: boolean;
	accessCount: number;
	maxAccess?: number;
	createdAt: Date;
}

export interface SubscriptionPlan {
	id: string;
	name: 'free' | 'pro' | 'business';
	storageLimit: number;
	bandwidthLimit: number;
	features: string[];
	price: number;
	interval: 'monthly' | 'yearly';
	status: 'active' | 'cancelled' | 'past_due';
}

export interface StorageUsage {
	used: number;
	total: number;
	breakdown: {
		images: number;
		documents: number;
		videos: number;
		other: number;
	};
}

export enum Permission {
	READ = 'read',
	WRITE = 'write',
	DELETE = 'delete',
	SHARE = 'share',
	ADMIN = 'admin'
}

export interface SharePermission {
	type: Permission;
	granted: boolean;
}

export interface UploadProgress {
	fileId: string;
	fileName: string;
	progress: number;
	status: 'pending' | 'uploading' | 'completed' | 'error';
	error?: string;
}

export interface StorageQuota {
	used: number;
	total: number;
	percentage: number;
}
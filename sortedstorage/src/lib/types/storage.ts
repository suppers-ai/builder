export interface User {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	role: 'user' | 'admin';
	subscription: SubscriptionPlan;
	createdAt: Date;
}

export interface FileItem {
	id: string;
	name: string;
	path: string;
	size: number;
	mimeType: string;
	thumbnailUrl?: string;
	isShared: boolean;
	permissions: Permission[];
	createdAt: Date;
	modifiedAt: Date;
	owner?: {
		id: string;
		name: string;
	};
}

export interface FolderItem {
	id: string;
	name: string;
	path: string;
	itemCount: number;
	size: number;
	isShared: boolean;
	permissions: Permission[];
	createdAt: Date;
	modifiedAt: Date;
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
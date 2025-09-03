/**
 * Sharing API service for file sharing operations
 */

import apiClient, { type PaginatedResponse } from './client';
import type { FileItem, FolderItem } from '$lib/types/storage';

export interface ShareLink {
	id: string;
	shareId: string;
	url: string;
	itemId: string;
	item?: FileItem | FolderItem;
	permissions: string[];
	password?: boolean;
	expiresAt?: Date;
	maxDownloads?: number;
	downloadCount: number;
	viewCount: number;
	createdAt: Date;
	createdBy: {
		id: string;
		name: string;
		email: string;
	};
	lastAccessedAt?: Date;
	isActive: boolean;
}

export interface ShareUser {
	id: string;
	userId: string;
	user: {
		id: string;
		name: string;
		email: string;
		avatar?: string;
	};
	itemId: string;
	item?: FileItem | FolderItem;
	permissions: string[];
	message?: string;
	acceptedAt?: Date;
	createdAt: Date;
	createdBy: {
		id: string;
		name: string;
	};
}

export interface CreateShareLinkOptions {
	itemId: string;
	permissions?: string[];
	password?: string;
	expiresIn?: number; // milliseconds
	maxDownloads?: number;
	message?: string;
}

export interface ShareWithUsersOptions {
	itemId: string;
	users: string[]; // email addresses or user IDs
	permissions?: string[];
	message?: string;
	sendEmail?: boolean;
}

export interface ShareAccessLog {
	id: string;
	shareId: string;
	action: 'view' | 'download' | 'upload' | 'delete';
	ipAddress: string;
	userAgent: string;
	timestamp: Date;
	user?: {
		id: string;
		name: string;
		email: string;
	};
}

class SharingAPI {
	private basePath = '/api/sharing';

	/**
	 * Create public share link
	 */
	async createShareLink(options: CreateShareLinkOptions): Promise<ShareLink> {
		return apiClient.post(`${this.basePath}/links`, options);
	}

	/**
	 * Get share link details
	 */
	async getShareLink(shareId: string): Promise<ShareLink> {
		return apiClient.get(`${this.basePath}/links/${shareId}`);
	}

	/**
	 * List all share links
	 */
	async listShareLinks(options?: {
		itemId?: string;
		active?: boolean;
		page?: number;
		pageSize?: number;
	}): Promise<PaginatedResponse<ShareLink>> {
		return apiClient.get(`${this.basePath}/links`, options);
	}

	/**
	 * Update share link
	 */
	async updateShareLink(
		shareId: string,
		updates: Partial<{
			permissions: string[];
			password: string | null;
			expiresAt: Date | null;
			maxDownloads: number | null;
			isActive: boolean;
		}>
	): Promise<ShareLink> {
		return apiClient.patch(`${this.basePath}/links/${shareId}`, updates);
	}

	/**
	 * Revoke share link
	 */
	async revokeShareLink(shareId: string): Promise<void> {
		await apiClient.delete(`${this.basePath}/links/${shareId}`);
	}

	/**
	 * Share with specific users
	 */
	async shareWithUsers(options: ShareWithUsersOptions): Promise<ShareUser[]> {
		return apiClient.post(`${this.basePath}/users`, options);
	}

	/**
	 * Get user share details
	 */
	async getUserShare(shareId: string): Promise<ShareUser> {
		return apiClient.get(`${this.basePath}/users/${shareId}`);
	}

	/**
	 * List user shares
	 */
	async listUserShares(options?: {
		itemId?: string;
		userId?: string;
		sharedBy?: string;
		sharedWith?: string;
		page?: number;
		pageSize?: number;
	}): Promise<PaginatedResponse<ShareUser>> {
		return apiClient.get(`${this.basePath}/users`, options);
	}

	/**
	 * Update user share permissions
	 */
	async updateUserShare(
		shareId: string,
		permissions: string[]
	): Promise<ShareUser> {
		return apiClient.patch(`${this.basePath}/users/${shareId}`, {
			permissions
		});
	}

	/**
	 * Remove user share
	 */
	async removeUserShare(shareId: string): Promise<void> {
		await apiClient.delete(`${this.basePath}/users/${shareId}`);
	}

	/**
	 * Get items shared with me
	 */
	async getSharedWithMe(options?: {
		type?: 'file' | 'folder';
		sortBy?: 'name' | 'date' | 'size';
		sortOrder?: 'asc' | 'desc';
		page?: number;
		pageSize?: number;
	}): Promise<PaginatedResponse<FileItem | FolderItem>> {
		return apiClient.get(`${this.basePath}/with-me`, options);
	}

	/**
	 * Get items I've shared
	 */
	async getMyShares(options?: {
		type?: 'file' | 'folder';
		shareType?: 'link' | 'user';
		page?: number;
		pageSize?: number;
	}): Promise<PaginatedResponse<{
		item: FileItem | FolderItem;
		shares: (ShareLink | ShareUser)[];
	}>> {
		return apiClient.get(`${this.basePath}/my-shares`, options);
	}

	/**
	 * Accept share invitation
	 */
	async acceptShare(shareId: string): Promise<void> {
		await apiClient.post(`${this.basePath}/users/${shareId}/accept`);
	}

	/**
	 * Decline share invitation
	 */
	async declineShare(shareId: string): Promise<void> {
		await apiClient.post(`${this.basePath}/users/${shareId}/decline`);
	}

	/**
	 * Get share access logs
	 */
	async getAccessLogs(
		shareId: string,
		options?: {
			page?: number;
			pageSize?: number;
		}
	): Promise<PaginatedResponse<ShareAccessLog>> {
		return apiClient.get(`${this.basePath}/logs/${shareId}`, options);
	}

	/**
	 * Verify share password
	 */
	async verifyPassword(
		shareId: string,
		password: string
	): Promise<{ valid: boolean; token?: string }> {
		return apiClient.post(`${this.basePath}/links/${shareId}/verify`, {
			password
		});
	}

	/**
	 * Access shared item (for public links)
	 */
	async accessSharedItem(
		shareId: string,
		password?: string
	): Promise<{
		item: FileItem | FolderItem;
		permissions: string[];
		expiresAt?: Date;
	}> {
		return apiClient.post(`${this.basePath}/links/${shareId}/access`, {
			password
		});
	}

	/**
	 * Download shared file
	 */
	async downloadSharedFile(
		shareId: string,
		options?: {
			password?: string;
			onProgress?: (progress: number) => void;
		}
	): Promise<Blob> {
		// First verify access
		if (options?.password) {
			await this.verifyPassword(shareId, options.password);
		}

		// Then download
		return apiClient.download(
			`${this.basePath}/links/${shareId}/download`,
			{
				onProgress: options?.onProgress
			}
		);
	}

	/**
	 * Upload to shared folder
	 */
	async uploadToSharedFolder(
		shareId: string,
		file: File,
		options?: {
			password?: string;
			onProgress?: (progress: number) => void;
		}
	): Promise<FileItem> {
		// First verify access
		if (options?.password) {
			await this.verifyPassword(shareId, options.password);
		}

		// Then upload
		return apiClient.upload(
			`${this.basePath}/links/${shareId}/upload`,
			file,
			{
				onProgress: options?.onProgress
			}
		);
	}

	/**
	 * Get share statistics
	 */
	async getShareStats(shareId: string): Promise<{
		totalViews: number;
		totalDownloads: number;
		uniqueVisitors: number;
		recentActivity: {
			date: Date;
			views: number;
			downloads: number;
		}[];
		topCountries?: string[];
		topDevices?: string[];
	}> {
		return apiClient.get(`${this.basePath}/links/${shareId}/stats`);
	}

	/**
	 * Send share notification
	 */
	async sendNotification(
		shareId: string,
		options: {
			recipients: string[];
			message?: string;
			includeLink?: boolean;
		}
	): Promise<void> {
		await apiClient.post(`${this.basePath}/notify`, {
			shareId,
			...options
		});
	}

	/**
	 * Generate embed code for shared item
	 */
	getEmbedCode(shareId: string, options?: {
		width?: number;
		height?: number;
		theme?: 'light' | 'dark';
		showDownload?: boolean;
	}): string {
		const params = new URLSearchParams();
		if (options?.width) params.append('width', String(options.width));
		if (options?.height) params.append('height', String(options.height));
		if (options?.theme) params.append('theme', options.theme);
		if (options?.showDownload !== undefined) {
			params.append('download', String(options.showDownload));
		}

		const baseURL = import.meta.env.VITE_APP_URL || window.location.origin;
		const embedUrl = `${baseURL}/embed/${shareId}?${params.toString()}`;
		
		return `<iframe src="${embedUrl}" width="${options?.width || 640}" height="${options?.height || 480}" frameborder="0" allowfullscreen></iframe>`;
	}

	/**
	 * Get QR code for share link
	 */
	getQRCodeUrl(shareId: string, size = 256): string {
		const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
		return `${baseURL}${this.basePath}/links/${shareId}/qr?size=${size}`;
	}

	/**
	 * Transfer ownership of shared item
	 */
	async transferOwnership(
		shareId: string,
		newOwnerId: string
	): Promise<void> {
		await apiClient.post(`${this.basePath}/users/${shareId}/transfer`, {
			newOwnerId
		});
	}

	/**
	 * Bulk share operations
	 */
	async bulkShare(
		itemIds: string[],
		options: ShareWithUsersOptions | CreateShareLinkOptions
	): Promise<(ShareUser | ShareLink)[]> {
		return apiClient.post(`${this.basePath}/bulk`, {
			itemIds,
			...options
		});
	}
}

// Create singleton instance
export const sharingAPI = new SharingAPI();

// Re-export for convenience
export default sharingAPI;
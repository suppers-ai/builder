/**
 * Formatting utilities for file sizes, dates, and other display values
 */

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 B';
	
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	const k = 1024;
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	const size = bytes / Math.pow(k, i);
	
	return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
	const now = new Date();
	const then = typeof date === 'string' ? new Date(date) : date;
	const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
	
	if (seconds < 60) return 'just now';
	
	const intervals = [
		{ label: 'year', seconds: 31536000 },
		{ label: 'month', seconds: 2592000 },
		{ label: 'week', seconds: 604800 },
		{ label: 'day', seconds: 86400 },
		{ label: 'hour', seconds: 3600 },
		{ label: 'minute', seconds: 60 }
	];
	
	for (const interval of intervals) {
		const count = Math.floor(seconds / interval.seconds);
		if (count >= 1) {
			return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
		}
	}
	
	return 'just now';
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString(undefined, options || {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

/**
 * Format duration in milliseconds to human-readable
 */
export function formatDuration(ms: number): string {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	
	if (days > 0) return `${days}d ${hours % 24}h`;
	if (hours > 0) return `${hours}h ${minutes % 60}m`;
	if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
	return `${seconds}s`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 0): string {
	return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
	return num.toLocaleString();
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength - 3) + '...';
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
	const parts = filename.split('.');
	if (parts.length < 2) return '';
	return parts[parts.length - 1].toLowerCase();
}

/**
 * Get file name without extension
 */
export function getFileNameWithoutExtension(filename: string): string {
	const parts = filename.split('.');
	if (parts.length < 2) return filename;
	parts.pop();
	return parts.join('.');
}

/**
 * Format MIME type to readable format
 */
export function formatMimeType(mimeType: string): string {
	const typeMap: Record<string, string> = {
		'application/pdf': 'PDF',
		'application/zip': 'ZIP Archive',
		'application/x-rar': 'RAR Archive',
		'application/json': 'JSON',
		'application/xml': 'XML',
		'application/msword': 'Word Document',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
		'application/vnd.ms-excel': 'Excel Spreadsheet',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
		'application/vnd.ms-powerpoint': 'PowerPoint',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
		'text/plain': 'Text File',
		'text/html': 'HTML',
		'text/css': 'CSS',
		'text/javascript': 'JavaScript',
		'text/csv': 'CSV',
		'image/jpeg': 'JPEG Image',
		'image/png': 'PNG Image',
		'image/gif': 'GIF Image',
		'image/svg+xml': 'SVG Image',
		'image/webp': 'WebP Image',
		'video/mp4': 'MP4 Video',
		'video/mpeg': 'MPEG Video',
		'video/quicktime': 'QuickTime Video',
		'video/webm': 'WebM Video',
		'audio/mpeg': 'MP3 Audio',
		'audio/wav': 'WAV Audio',
		'audio/ogg': 'OGG Audio',
		'audio/webm': 'WebM Audio'
	};
	
	return typeMap[mimeType] || mimeType.split('/')[1]?.toUpperCase() || 'File';
}

/**
 * Pluralize word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
	if (count === 1) return `${count} ${singular}`;
	return `${count} ${plural || singular + 's'}`;
}

/**
 * Format storage quota
 */
export function formatStorageQuota(used: number, total: number): string {
	const percent = (used / total) * 100;
	return `${formatFileSize(used)} of ${formatFileSize(total)} (${percent.toFixed(1)}%)`;
}

/**
 * Get color class based on storage usage percentage
 */
export function getStorageColorClass(percent: number): string {
	if (percent >= 90) return 'text-error';
	if (percent >= 75) return 'text-warning';
	return 'text-success';
}

/**
 * Format sharing permissions
 */
export function formatPermissions(permissions: string[]): string {
	const permMap: Record<string, string> = {
		'read': 'Can view',
		'write': 'Can edit',
		'delete': 'Can delete',
		'share': 'Can share'
	};
	
	return permissions.map(p => permMap[p] || p).join(', ');
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/);
	if (parts.length === 0) return '';
	if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format bandwidth speed
 */
export function formatBandwidth(bytesPerSecond: number): string {
	return `${formatFileSize(bytesPerSecond)}/s`;
}

/**
 * Estimate transfer time
 */
export function estimateTransferTime(bytes: number, bytesPerSecond: number): string {
	if (bytesPerSecond === 0) return '∞';
	const seconds = bytes / bytesPerSecond;
	return formatDuration(seconds * 1000);
}
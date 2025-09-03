import { writable, derived } from 'svelte/store';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
	id: string;
	type: NotificationType;
	title: string;
	message?: string;
	duration?: number;
	dismissible?: boolean;
	action?: {
		label: string;
		callback: () => void;
	};
	progress?: {
		value: number;
		total: number;
	};
	timestamp: Date;
}

interface NotificationOptions {
	type?: NotificationType;
	title: string;
	message?: string;
	duration?: number;
	dismissible?: boolean;
	action?: {
		label: string;
		callback: () => void;
	};
	progress?: {
		value: number;
		total: number;
	};
}

class NotificationStore {
	private notifications = writable<Notification[]>([]);
	private maxNotifications = 5;
	private defaultDuration = 5000;
	
	// Public store
	public subscribe = this.notifications.subscribe;
	
	// Derived stores
	public all$ = derived(this.notifications, $notifications => $notifications);
	public latest$ = derived(this.notifications, $notifications => 
		$notifications.slice(0, this.maxNotifications)
	);
	
	// Get active notifications (non-dismissed)
	public active$ = derived(this.notifications, $notifications =>
		$notifications.filter(n => n.dismissible !== false || !n.progress)
	);
	
	// Get progress notifications
	public progress$ = derived(this.notifications, $notifications =>
		$notifications.filter(n => n.progress !== undefined)
	);
	
	/**
	 * Show a notification
	 */
	private show(options: NotificationOptions): string {
		const id = crypto.randomUUID();
		const notification: Notification = {
			id,
			type: options.type || 'info',
			title: options.title,
			message: options.message,
			duration: options.duration ?? this.defaultDuration,
			dismissible: options.dismissible ?? true,
			action: options.action,
			progress: options.progress,
			timestamp: new Date()
		};
		
		this.notifications.update(notifications => {
			const updated = [notification, ...notifications];
			// Keep only max notifications (except progress ones)
			const nonProgress = updated.filter(n => !n.progress);
			const progress = updated.filter(n => n.progress);
			if (nonProgress.length > this.maxNotifications) {
				return [...nonProgress.slice(0, this.maxNotifications), ...progress];
			}
			return updated;
		});
		
		// Auto-dismiss after duration
		if (notification.duration && notification.duration > 0 && !notification.progress) {
			setTimeout(() => this.dismiss(id), notification.duration);
		}
		
		return id;
	}
	
	/**
	 * Success notification
	 */
	success(title: string, message?: string, duration?: number): string {
		return this.show({ type: 'success', title, message, duration });
	}
	
	/**
	 * Error notification
	 */
	error(title: string, message?: string, duration?: number): string {
		return this.show({ type: 'error', title, message, duration: duration ?? 10000 });
	}
	
	/**
	 * Warning notification
	 */
	warning(title: string, message?: string, duration?: number): string {
		return this.show({ type: 'warning', title, message, duration });
	}
	
	/**
	 * Info notification
	 */
	info(title: string, message?: string, duration?: number): string {
		return this.show({ type: 'info', title, message, duration });
	}
	
	/**
	 * Show progress notification
	 */
	progress(title: string, value: number, total: number, message?: string): string {
		const existingId = this.findProgressNotification(title);
		
		if (existingId) {
			// Update existing progress
			this.updateProgress(existingId, value, total, message);
			return existingId;
		}
		
		// Create new progress notification
		return this.show({
			type: 'info',
			title,
			message,
			duration: 0, // Don't auto-dismiss
			dismissible: false,
			progress: { value, total }
		});
	}
	
	/**
	 * Update progress notification
	 */
	updateProgress(id: string, value: number, total: number, message?: string): void {
		this.notifications.update(notifications =>
			notifications.map(n => {
				if (n.id === id && n.progress) {
					return {
						...n,
						message: message ?? n.message,
						progress: { value, total }
					};
				}
				return n;
			})
		);
		
		// Auto-dismiss when complete
		if (value >= total) {
			setTimeout(() => {
				this.notifications.update(notifications =>
					notifications.map(n => {
						if (n.id === id) {
							return { ...n, type: 'success' as NotificationType, dismissible: true };
						}
						return n;
					})
				);
				setTimeout(() => this.dismiss(id), 2000);
			}, 500);
		}
	}
	
	/**
	 * Show notification with action
	 */
	action(title: string, message: string, actionLabel: string, callback: () => void): string {
		return this.show({
			type: 'info',
			title,
			message,
			duration: 0, // Don't auto-dismiss
			action: { label: actionLabel, callback }
		});
	}
	
	/**
	 * Dismiss notification
	 */
	dismiss(id: string): void {
		this.notifications.update(notifications =>
			notifications.filter(n => n.id !== id)
		);
	}
	
	/**
	 * Dismiss all notifications
	 */
	dismissAll(): void {
		this.notifications.set([]);
	}
	
	/**
	 * Find progress notification by title
	 */
	private findProgressNotification(title: string): string | null {
		let found: string | null = null;
		this.notifications.subscribe(notifications => {
			const notification = notifications.find(n => n.title === title && n.progress);
			found = notification?.id || null;
		})();
		return found;
	}
}

// Create singleton instance
export const notifications = new NotificationStore();

// Convenience exports for toast-like usage
export const toasts = {
	success: (message: string, title?: string) => notifications.success(title || 'Success', message),
	error: (message: string, title?: string) => notifications.error(title || 'Error', message),
	warning: (message: string, title?: string) => notifications.warning(title || 'Warning', message),
	info: (message: string, title?: string) => notifications.info(title || 'Info', message)
};
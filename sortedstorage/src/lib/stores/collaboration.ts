import { writable, derived, get } from 'svelte/store';
import { websocket, type WebSocketMessage, type WebSocketEventType } from '$lib/services/websocket';
import { notifications } from './notifications';

export interface ActiveUser {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	currentPath: string;
	lastActivity: Date;
	status: 'active' | 'idle' | 'away';
}

export interface FileActivity {
	fileId: string;
	fileName: string;
	type: 'view' | 'edit' | 'upload' | 'download';
	userId: string;
	userName: string;
	timestamp: Date;
}

export interface CollaborationState {
	activeUsers: Map<string, ActiveUser>;
	fileActivities: FileActivity[];
	lockedFiles: Set<string>;
	typingUsers: Map<string, string>; // userId -> fileName
}

class CollaborationStore {
	private state = writable<CollaborationState>({
		activeUsers: new Map(),
		fileActivities: [],
		lockedFiles: new Set(),
		typingUsers: new Map()
	});
	
	// Public subscription for the state
	public subscribe = this.state.subscribe;
	
	// Derived stores
	public activeUsers$ = derived(this.state, $state => 
		Array.from($state.activeUsers.values())
	);
	
	public activeUsersInPath$ = (path: string) => 
		derived(this.state, $state => 
			Array.from($state.activeUsers.values()).filter(user => 
				user.currentPath === path
			)
		);
	
	public fileActivities$ = derived(this.state, $state => 
		$state.fileActivities
	);
	
	public recentActivities$ = derived(this.state, $state => 
		$state.fileActivities.slice(-10).reverse()
	);
	
	public lockedFiles$ = derived(this.state, $state => 
		$state.lockedFiles
	);
	
	public isFileLocked$ = (fileId: string) => 
		derived(this.state, $state => 
			$state.lockedFiles.has(fileId)
		);
	
	constructor() {
		// Defer setup to avoid SSR issues
		if (typeof window !== 'undefined') {
			// Use setTimeout to ensure websocket is initialized
			setTimeout(() => {
				this.setupWebSocketListeners();
				this.startPresenceUpdates();
			}, 0);
		}
	}
	
	private setupWebSocketListeners() {
		// Listen for WebSocket messages
		if (typeof window !== 'undefined') {
			window.addEventListener('ws:message', (event: CustomEvent<WebSocketMessage>) => {
				this.handleWebSocketMessage(event.detail);
			});
			
			// Subscribe to WebSocket connection changes only in browser
			if (websocket && websocket.connected) {
				websocket.connected.subscribe(connected => {
					if (connected) {
						this.announcePresence();
					} else {
						// Clear active users when disconnected
						this.state.update(state => ({
							...state,
							activeUsers: new Map()
						}));
					}
				});
			}
		}
	}
	
	private handleWebSocketMessage(message: WebSocketMessage) {
		switch (message.type) {
			case 'user_joined':
				this.handleUserJoined(message.data);
				break;
				
			case 'user_left':
				this.handleUserLeft(message.data);
				break;
				
			case 'file_added':
			case 'file_updated':
			case 'file_deleted':
				this.handleFileActivity(message);
				break;
				
			case 'notification':
				this.handleNotification(message.data);
				break;
				
			default:
				// Handle other message types if needed
				break;
		}
	}
	
	private handleUserJoined(userData: any) {
		const user: ActiveUser = {
			id: userData.id,
			name: userData.name,
			email: userData.email,
			avatar: userData.avatar,
			currentPath: userData.currentPath || '/',
			lastActivity: new Date(),
			status: 'active'
		};
		
		this.state.update(state => {
			const activeUsers = new Map(state.activeUsers);
			activeUsers.set(user.id, user);
			
			// Show notification if it's a different user
			const currentUserId = localStorage.getItem('userId');
			if (user.id !== currentUserId) {
				notifications.info(`${user.name} joined`, 'Now collaborating on this folder');
			}
			
			return { ...state, activeUsers };
		});
	}
	
	private handleUserLeft(userData: any) {
		this.state.update(state => {
			const activeUsers = new Map(state.activeUsers);
			const user = activeUsers.get(userData.id);
			
			if (user) {
				activeUsers.delete(userData.id);
				
				// Show notification
				const currentUserId = localStorage.getItem('userId');
				if (userData.id !== currentUserId) {
					notifications.info(`${user.name} left`, 'No longer in this folder');
				}
			}
			
			return { ...state, activeUsers };
		});
	}
	
	private handleFileActivity(message: WebSocketMessage) {
		const activity: FileActivity = {
			fileId: message.data.fileId,
			fileName: message.data.fileName,
			type: this.getActivityType(message.type),
			userId: message.userId || 'unknown',
			userName: message.data.userName || 'Someone',
			timestamp: new Date(message.timestamp)
		};
		
		this.state.update(state => {
			const fileActivities = [...state.fileActivities, activity];
			
			// Keep only last 100 activities
			if (fileActivities.length > 100) {
				fileActivities.shift();
			}
			
			return { ...state, fileActivities };
		});
		
		// Show notification for other users' activities
		const currentUserId = localStorage.getItem('userId');
		if (activity.userId !== currentUserId) {
			const actionText = this.getActionText(activity.type);
			notifications.info(
				`${activity.userName} ${actionText}`,
				activity.fileName
			);
		}
	}
	
	private handleNotification(data: any) {
		// Handle custom notifications from server
		notifications.add({
			type: data.type || 'info',
			title: data.title,
			message: data.message,
			duration: data.duration
		});
	}
	
	private getActivityType(messageType: WebSocketEventType): FileActivity['type'] {
		switch (messageType) {
			case 'file_added':
				return 'upload';
			case 'file_updated':
				return 'edit';
			default:
				return 'view';
		}
	}
	
	private getActionText(type: FileActivity['type']): string {
		switch (type) {
			case 'upload':
				return 'uploaded';
			case 'edit':
				return 'edited';
			case 'download':
				return 'downloaded';
			case 'view':
				return 'viewed';
			default:
				return 'interacted with';
		}
	}
	
	// Public methods
	
	announcePresence(path: string = '/') {
		const userId = localStorage.getItem('userId');
		const userName = localStorage.getItem('userName');
		const userEmail = localStorage.getItem('userEmail');
		
		if (!userId) return;
		
		websocket.send('user_joined', {
			id: userId,
			name: userName || 'Anonymous',
			email: userEmail,
			currentPath: path
		});
	}
	
	updatePath(path: string) {
		const userId = localStorage.getItem('userId');
		if (!userId) return;
		
		// Update local state
		this.state.update(state => {
			const activeUsers = new Map(state.activeUsers);
			const user = activeUsers.get(userId);
			
			if (user) {
				user.currentPath = path;
				user.lastActivity = new Date();
				activeUsers.set(userId, user);
			}
			
			return { ...state, activeUsers };
		});
		
		// Notify server
		websocket.send('user_joined', {
			id: userId,
			currentPath: path
		});
	}
	
	lockFile(fileId: string) {
		this.state.update(state => {
			const lockedFiles = new Set(state.lockedFiles);
			lockedFiles.add(fileId);
			return { ...state, lockedFiles };
		});
		
		// Notify server
		websocket.send('file_locked', { fileId });
	}
	
	unlockFile(fileId: string) {
		this.state.update(state => {
			const lockedFiles = new Set(state.lockedFiles);
			lockedFiles.delete(fileId);
			return { ...state, lockedFiles };
		});
		
		// Notify server
		websocket.send('file_unlocked', { fileId });
	}
	
	startTyping(fileId: string, fileName: string) {
		const userId = localStorage.getItem('userId');
		if (!userId) return;
		
		this.state.update(state => {
			const typingUsers = new Map(state.typingUsers);
			typingUsers.set(userId, fileName);
			return { ...state, typingUsers };
		});
		
		// Notify server
		websocket.send('user_typing', { fileId, fileName });
	}
	
	stopTyping() {
		const userId = localStorage.getItem('userId');
		if (!userId) return;
		
		this.state.update(state => {
			const typingUsers = new Map(state.typingUsers);
			typingUsers.delete(userId);
			return { ...state, typingUsers };
		});
		
		// Notify server
		websocket.send('user_stopped_typing', {});
	}
	
	private startPresenceUpdates() {
		// Send presence update every 30 seconds
		setInterval(() => {
			const connected = get(websocket.connected);
			if (connected) {
				const userId = localStorage.getItem('userId');
				if (userId) {
					websocket.send('presence_update', {
						id: userId,
						timestamp: new Date()
					});
				}
			}
		}, 30000);
	}
	
	// Clean up inactive users
	private cleanupInactiveUsers() {
		const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
		const now = new Date();
		
		this.state.update(state => {
			const activeUsers = new Map(state.activeUsers);
			
			for (const [userId, user] of activeUsers) {
				const timeSinceActivity = now.getTime() - user.lastActivity.getTime();
				
				if (timeSinceActivity > inactiveThreshold) {
					activeUsers.delete(userId);
				} else if (timeSinceActivity > 60000) {
					// Mark as idle after 1 minute
					user.status = 'idle';
				}
			}
			
			return { ...state, activeUsers };
		});
	}
}

// Export singleton instance
export const collaboration = new CollaborationStore();
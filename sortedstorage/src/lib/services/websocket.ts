import { writable } from 'svelte/store';

export type WebSocketEventType = 
	| 'file_added' 
	| 'file_deleted' 
	| 'file_updated' 
	| 'file_moved'
	| 'file_copied'
	| 'folder_created'
	| 'folder_deleted'
	| 'share_created' 
	| 'share_removed' 
	| 'share_updated'
	| 'quota_updated'
	| 'upload_progress'
	| 'upload_complete'
	| 'upload_failed'
	| 'user_joined'
	| 'user_left'
	| 'notification';

export interface WebSocketMessage {
	type: WebSocketEventType;
	data: any;
	timestamp: Date;
	userId?: string;
	path?: string;
}

class WebSocketService {
	private ws: WebSocket | null = null;
	private reconnectTimeout: NodeJS.Timeout | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000;
	
	public connected = writable(false);
	public messages = writable<WebSocketMessage[]>([]);
	
	constructor() {
		// Auto-connect when service is created
		if (typeof window !== 'undefined') {
			// Temporarily disable auto-connect until WebSocket server is implemented
			// this.connect();
		}
	}
	
	connect() {
		const wsUrl = import.meta.env.PUBLIC_WS_URL || 'ws://localhost:8090/ws';
		const token = localStorage.getItem('token');
		
		if (!token) {
			console.warn('No auth token found, skipping WebSocket connection');
			return;
		}
		
		try {
			this.ws = new WebSocket(`${wsUrl}?token=${token}`);
			
			this.ws.onopen = () => {
				console.log('WebSocket connected');
				this.connected.set(true);
				this.reconnectAttempts = 0;
				this.sendHeartbeat();
			};
			
			this.ws.onmessage = (event) => {
				try {
					const message: WebSocketMessage = JSON.parse(event.data);
					message.timestamp = new Date();
					
					this.messages.update(messages => {
						// Keep only last 100 messages
						const updated = [...messages, message];
						if (updated.length > 100) {
							updated.shift();
						}
						return updated;
					});
					
					// Dispatch custom event for specific handlers (only in browser)
					if (typeof window !== 'undefined') {
						window.dispatchEvent(new CustomEvent('ws:message', { 
							detail: message 
						}));
					}
				} catch (error) {
					console.error('Failed to parse WebSocket message:', error);
				}
			};
			
			this.ws.onerror = (error) => {
				console.error('WebSocket error:', error);
			};
			
			this.ws.onclose = () => {
				console.log('WebSocket disconnected');
				this.connected.set(false);
				this.ws = null;
				this.attemptReconnect();
			};
		} catch (error) {
			console.error('Failed to create WebSocket connection:', error);
			this.attemptReconnect();
		}
	}
	
	private attemptReconnect() {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error('Max reconnection attempts reached');
			return;
		}
		
		this.reconnectAttempts++;
		const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
		
		console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
		
		this.reconnectTimeout = setTimeout(() => {
			this.connect();
		}, delay);
	}
	
	send(type: WebSocketEventType, data: any) {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			console.warn('WebSocket is not connected');
			return false;
		}
		
		try {
			this.ws.send(JSON.stringify({ type, data, timestamp: new Date() }));
			return true;
		} catch (error) {
			console.error('Failed to send WebSocket message:', error);
			return false;
		}
	}
	
	private sendHeartbeat() {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify({ type: 'ping' }));
			setTimeout(() => this.sendHeartbeat(), 30000); // Send heartbeat every 30 seconds
		}
	}
	
	disconnect() {
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}
		
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
		
		this.connected.set(false);
		this.reconnectAttempts = 0;
	}
	
	// Subscribe to specific message types
	subscribe(type: WebSocketMessage['type'], callback: (data: any) => void) {
		// Check if we're in browser environment
		if (typeof window === 'undefined') {
			// Return no-op unsubscribe function for SSR
			return () => {};
		}
		
		const handler = (event: CustomEvent) => {
			if (event.detail.type === type) {
				callback(event.detail.data);
			}
		};
		
		window.addEventListener('ws:message', handler as EventListener);
		
		// Return unsubscribe function
		return () => {
			window.removeEventListener('ws:message', handler as EventListener);
		};
	}
}

export const websocket = new WebSocketService();
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { collaboration } from './collaboration';
import { websocket } from '$lib/services/websocket';
import type { WebSocketEvent } from '$lib/services/websocket';

// Mock WebSocket service
vi.mock('$lib/services/websocket', () => ({
	websocket: {
		send: vi.fn(),
		on: vi.fn(),
		off: vi.fn(),
		connect: vi.fn(),
		disconnect: vi.fn(),
		isConnected: vi.fn(() => true)
	}
}));

describe('Collaboration Store', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		// Reset store
		collaboration.reset();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Presence Management', () => {
		it('announces user presence', () => {
			collaboration.announcePresence('/documents');
			
			expect(websocket.send).toHaveBeenCalledWith({
				type: 'presence',
				data: {
					action: 'join',
					path: '/documents',
					user: expect.objectContaining({
						id: expect.any(String),
						name: expect.any(String)
					})
				}
			});
		});

		it('updates user path', () => {
			collaboration.updatePath('/files/images');
			
			expect(websocket.send).toHaveBeenCalledWith({
				type: 'presence',
				data: {
					action: 'update',
					path: '/files/images'
				}
			});
		});

		it('announces user leaving', () => {
			collaboration.leave();
			
			expect(websocket.send).toHaveBeenCalledWith({
				type: 'presence',
				data: {
					action: 'leave'
				}
			});
		});

		it('tracks active users', () => {
			const mockUser = {
				id: 'user2',
				name: 'Jane Doe',
				path: '/documents',
				status: 'online' as const,
				lastSeen: new Date()
			};

			// Simulate user joining
			collaboration.addUser(mockUser);
			
			const users = get(collaboration.activeUsers$);
			expect(users).toHaveLength(1);
			expect(users[0]).toEqual(mockUser);
		});

		it('removes inactive users', () => {
			const mockUser = {
				id: 'user2',
				name: 'Jane Doe',
				path: '/documents',
				status: 'online' as const,
				lastSeen: new Date(Date.now() - 6 * 60 * 1000) // 6 minutes ago
			};

			collaboration.addUser(mockUser);
			
			// Fast-forward time to trigger cleanup
			vi.advanceTimersByTime(5 * 60 * 1000); // 5 minutes
			
			const users = get(collaboration.activeUsers$);
			expect(users).toHaveLength(0);
		});

		it('updates user status', () => {
			const mockUser = {
				id: 'user2',
				name: 'Jane Doe',
				path: '/documents',
				status: 'online' as const,
				lastSeen: new Date()
			};

			collaboration.addUser(mockUser);
			collaboration.updateUserStatus('user2', 'away');
			
			const users = get(collaboration.activeUsers$);
			expect(users[0].status).toBe('away');
		});
	});

	describe('File Locking', () => {
		it('locks a file', () => {
			collaboration.lockFile('file123');
			
			expect(websocket.send).toHaveBeenCalledWith({
				type: 'file_lock',
				data: {
					action: 'lock',
					fileId: 'file123'
				}
			});

			const locks = get(collaboration.fileLocks$);
			expect(locks['file123']).toBeDefined();
		});

		it('unlocks a file', () => {
			collaboration.lockFile('file123');
			collaboration.unlockFile('file123');
			
			expect(websocket.send).toHaveBeenCalledWith({
				type: 'file_lock',
				data: {
					action: 'unlock',
					fileId: 'file123'
				}
			});

			const locks = get(collaboration.fileLocks$);
			expect(locks['file123']).toBeUndefined();
		});

		it('checks if file is locked', () => {
			collaboration.lockFile('file123');
			
			expect(collaboration.isFileLocked('file123')).toBe(true);
			expect(collaboration.isFileLocked('file456')).toBe(false);
		});

		it('handles remote file lock', () => {
			const lockEvent = {
				userId: 'user2',
				userName: 'Jane Doe',
				fileId: 'file789',
				fileName: 'document.pdf',
				timestamp: new Date()
			};

			collaboration.handleRemoteLock(lockEvent);
			
			const locks = get(collaboration.fileLocks$);
			expect(locks['file789']).toEqual(lockEvent);
			expect(collaboration.isFileLocked('file789')).toBe(true);
		});

		it('handles remote file unlock', () => {
			// First lock the file
			const lockEvent = {
				userId: 'user2',
				userName: 'Jane Doe',
				fileId: 'file789',
				fileName: 'document.pdf',
				timestamp: new Date()
			};
			collaboration.handleRemoteLock(lockEvent);
			
			// Then unlock it
			collaboration.handleRemoteUnlock('file789');
			
			const locks = get(collaboration.fileLocks$);
			expect(locks['file789']).toBeUndefined();
			expect(collaboration.isFileLocked('file789')).toBe(false);
		});
	});

	describe('Typing Indicators', () => {
		it('starts typing indicator', () => {
			collaboration.startTyping('file123', 'document.txt');
			
			expect(websocket.send).toHaveBeenCalledWith({
				type: 'typing',
				data: {
					action: 'start',
					fileId: 'file123',
					fileName: 'document.txt'
				}
			});

			const indicators = get(collaboration.typingIndicators$);
			expect(indicators['file123']).toBeDefined();
		});

		it('stops typing indicator', () => {
			collaboration.startTyping('file123', 'document.txt');
			collaboration.stopTyping('file123');
			
			expect(websocket.send).toHaveBeenCalledWith({
				type: 'typing',
				data: {
					action: 'stop',
					fileId: 'file123'
				}
			});

			const indicators = get(collaboration.typingIndicators$);
			expect(indicators['file123']).toBeUndefined();
		});

		it('auto-stops typing after timeout', () => {
			collaboration.startTyping('file123', 'document.txt');
			
			// Fast-forward past the typing timeout (3 seconds)
			vi.advanceTimersByTime(3500);
			
			const indicators = get(collaboration.typingIndicators$);
			expect(indicators['file123']).toBeUndefined();
		});

		it('handles remote typing indicator', () => {
			const typingEvent = {
				userId: 'user2',
				userName: 'Jane Doe',
				fileId: 'file456',
				fileName: 'notes.md',
				timestamp: new Date()
			};

			collaboration.handleRemoteTyping(typingEvent);
			
			const indicators = get(collaboration.typingIndicators$);
			expect(indicators['file456']).toEqual(typingEvent);
		});
	});

	describe('Cursor Tracking', () => {
		it('updates cursor position', () => {
			collaboration.updateCursor('file123', { line: 10, column: 5 });
			
			expect(websocket.send).toHaveBeenCalledWith({
				type: 'cursor',
				data: {
					fileId: 'file123',
					position: { line: 10, column: 5 }
				}
			});
		});

		it('tracks remote cursors', () => {
			const cursorEvent = {
				userId: 'user2',
				userName: 'Jane Doe',
				fileId: 'file123',
				position: { line: 15, column: 20 },
				timestamp: new Date()
			};

			collaboration.handleRemoteCursor(cursorEvent);
			
			const cursors = get(collaboration.cursors$);
			expect(cursors['user2']).toEqual(cursorEvent);
		});

		it('clears cursor on file close', () => {
			const cursorEvent = {
				userId: 'user2',
				userName: 'Jane Doe',
				fileId: 'file123',
				position: { line: 15, column: 20 },
				timestamp: new Date()
			};

			collaboration.handleRemoteCursor(cursorEvent);
			collaboration.clearCursorsForFile('file123');
			
			const cursors = get(collaboration.cursors$);
			expect(cursors['user2']).toBeUndefined();
		});
	});

	describe('Selection Tracking', () => {
		it('broadcasts selection change', () => {
			collaboration.updateSelection(['file1', 'file2', 'file3']);
			
			expect(websocket.send).toHaveBeenCalledWith({
				type: 'selection',
				data: {
					selectedItems: ['file1', 'file2', 'file3']
				}
			});
		});

		it('tracks remote selections', () => {
			const selectionEvent = {
				userId: 'user2',
				userName: 'Jane Doe',
				selectedItems: ['file4', 'file5'],
				timestamp: new Date()
			};

			collaboration.handleRemoteSelection(selectionEvent);
			
			const selections = get(collaboration.selections$);
			expect(selections['user2']).toEqual(selectionEvent);
		});
	});

	describe('Activity Feed', () => {
		it('adds activity to feed', () => {
			const activity = {
				id: '1',
				userId: 'user1',
				userName: 'John Doe',
				action: 'upload' as const,
				target: 'document.pdf',
				timestamp: new Date()
			};

			collaboration.addActivity(activity);
			
			const activities = get(collaboration.activities$);
			expect(activities).toContain(activity);
		});

		it('limits activity feed size', () => {
			// Add many activities
			for (let i = 0; i < 150; i++) {
				collaboration.addActivity({
					id: `activity${i}`,
					userId: 'user1',
					userName: 'John Doe',
					action: 'upload',
					target: `file${i}.txt`,
					timestamp: new Date()
				});
			}
			
			const activities = get(collaboration.activities$);
			expect(activities.length).toBeLessThanOrEqual(100);
		});

		it('sorts activities by timestamp', () => {
			const older = {
				id: '1',
				userId: 'user1',
				userName: 'John Doe',
				action: 'upload' as const,
				target: 'old.pdf',
				timestamp: new Date('2024-01-01')
			};

			const newer = {
				id: '2',
				userId: 'user1',
				userName: 'John Doe',
				action: 'delete' as const,
				target: 'new.pdf',
				timestamp: new Date('2024-01-02')
			};

			collaboration.addActivity(older);
			collaboration.addActivity(newer);
			
			const activities = get(collaboration.activities$);
			expect(activities[0]).toEqual(newer);
			expect(activities[1]).toEqual(older);
		});
	});

	describe('WebSocket Event Handling', () => {
		it('handles user joined event', () => {
			const event: WebSocketEvent = {
				type: 'user_joined',
				data: {
					user: {
						id: 'user3',
						name: 'Bob Smith',
						path: '/',
						status: 'online',
						lastSeen: new Date()
					}
				}
			};

			collaboration.handleWebSocketEvent(event);
			
			const users = get(collaboration.activeUsers$);
			expect(users).toContainEqual(event.data.user);
		});

		it('handles user left event', () => {
			// First add a user
			const user = {
				id: 'user3',
				name: 'Bob Smith',
				path: '/',
				status: 'online' as const,
				lastSeen: new Date()
			};
			collaboration.addUser(user);

			// Then handle leave event
			const event: WebSocketEvent = {
				type: 'user_left',
				data: { userId: 'user3' }
			};

			collaboration.handleWebSocketEvent(event);
			
			const users = get(collaboration.activeUsers$);
			expect(users).not.toContainEqual(user);
		});

		it('handles file activity events', () => {
			const event: WebSocketEvent = {
				type: 'file_added',
				data: {
					file: {
						id: 'file123',
						name: 'new-document.pdf'
					},
					user: {
						id: 'user2',
						name: 'Jane Doe'
					}
				}
			};

			collaboration.handleWebSocketEvent(event);
			
			const activities = get(collaboration.activities$);
			expect(activities[0]).toMatchObject({
				userId: 'user2',
				userName: 'Jane Doe',
				action: 'upload',
				target: 'new-document.pdf'
			});
		});
	});

	describe('Connection State', () => {
		it('handles connection loss', () => {
			collaboration.handleDisconnect();
			
			const users = get(collaboration.activeUsers$);
			const locks = get(collaboration.fileLocks$);
			const indicators = get(collaboration.typingIndicators$);
			
			expect(users).toHaveLength(0);
			expect(Object.keys(locks)).toHaveLength(0);
			expect(Object.keys(indicators)).toHaveLength(0);
		});

		it('re-announces presence on reconnect', () => {
			collaboration.updatePath('/documents');
			vi.clearAllMocks();
			
			collaboration.handleReconnect();
			
			expect(websocket.send).toHaveBeenCalledWith({
				type: 'presence',
				data: {
					action: 'join',
					path: '/documents',
					user: expect.any(Object)
				}
			});
		});
	});

	describe('Statistics', () => {
		it('calculates active user count', () => {
			collaboration.addUser({
				id: 'user2',
				name: 'Jane Doe',
				path: '/',
				status: 'online',
				lastSeen: new Date()
			});
			
			collaboration.addUser({
				id: 'user3',
				name: 'Bob Smith',
				path: '/',
				status: 'away',
				lastSeen: new Date()
			});
			
			const stats = get(collaboration.stats$);
			expect(stats.activeUsers).toBe(2);
		});

		it('calculates locked files count', () => {
			collaboration.lockFile('file1');
			collaboration.lockFile('file2');
			collaboration.lockFile('file3');
			
			const stats = get(collaboration.stats$);
			expect(stats.lockedFiles).toBe(3);
		});
	});
});
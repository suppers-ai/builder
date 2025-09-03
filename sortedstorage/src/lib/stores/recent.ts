import { writable, derived, get } from 'svelte/store';
import type { FileItem, FolderItem } from '$lib/types/storage';

export interface RecentItem {
	item: FileItem | FolderItem;
	accessedAt: Date;
	accessType: 'view' | 'edit' | 'download' | 'share';
	accessCount: number;
}

export interface StarredItem {
	item: FileItem | FolderItem;
	starredAt: Date;
	notes?: string;
}

class RecentFilesStore {
	private recentItems = writable<RecentItem[]>([]);
	private starredItems = writable<StarredItem[]>([]);
	private maxRecentItems = 50;
	
	// Public stores
	recentItems$ = { subscribe: this.recentItems.subscribe };
	starredItems$ = { subscribe: this.starredItems.subscribe };
	
	// Derived stores
	recentFiles$ = derived(this.recentItems, ($items) => 
		$items.filter(item => item.item.type === 'file')
	);
	
	recentFolders$ = derived(this.recentItems, ($items) => 
		$items.filter(item => item.item.type === 'folder')
	);
	
	starredFiles$ = derived(this.starredItems, ($items) =>
		$items.filter(item => item.item.type === 'file')
	);
	
	starredFolders$ = derived(this.starredItems, ($items) =>
		$items.filter(item => item.item.type === 'folder')
	);
	
	mostAccessed$ = derived(this.recentItems, ($items) => {
		return [...$items]
			.sort((a, b) => b.accessCount - a.accessCount)
			.slice(0, 10);
	});
	
	constructor() {
		this.loadFromStorage();
		
		// Auto-save to localStorage
		this.recentItems.subscribe(items => {
			this.saveToStorage('recentItems', items);
		});
		
		this.starredItems.subscribe(items => {
			this.saveToStorage('starredItems', items);
		});
	}
	
	/**
	 * Track file/folder access
	 */
	trackAccess(
		item: FileItem | FolderItem,
		accessType: RecentItem['accessType'] = 'view'
	): void {
		this.recentItems.update(items => {
			// Find existing item
			const existingIndex = items.findIndex(i => i.item.id === item.id);
			
			if (existingIndex >= 0) {
				// Update existing item
				const existing = items[existingIndex];
				items[existingIndex] = {
					...existing,
					accessedAt: new Date(),
					accessType,
					accessCount: existing.accessCount + 1
				};
				
				// Move to front
				items.unshift(items.splice(existingIndex, 1)[0]);
			} else {
				// Add new item
				items.unshift({
					item,
					accessedAt: new Date(),
					accessType,
					accessCount: 1
				});
			}
			
			// Limit to max items
			return items.slice(0, this.maxRecentItems);
		});
	}
	
	/**
	 * Star/unstar an item
	 */
	toggleStar(item: FileItem | FolderItem, notes?: string): boolean {
		let isStarred = false;
		
		this.starredItems.update(items => {
			const existingIndex = items.findIndex(i => i.item.id === item.id);
			
			if (existingIndex >= 0) {
				// Remove star
				items.splice(existingIndex, 1);
				isStarred = false;
			} else {
				// Add star
				items.unshift({
					item,
					starredAt: new Date(),
					notes
				});
				isStarred = true;
			}
			
			return items;
		});
		
		return isStarred;
	}
	
	/**
	 * Check if an item is starred
	 */
	isStarred(itemId: string): boolean {
		const items = get(this.starredItems);
		return items.some(i => i.item.id === itemId);
	}
	
	/**
	 * Update star notes
	 */
	updateStarNotes(itemId: string, notes: string): void {
		this.starredItems.update(items => {
			const item = items.find(i => i.item.id === itemId);
			if (item) {
				item.notes = notes;
			}
			return items;
		});
	}
	
	/**
	 * Clear recent items
	 */
	clearRecent(): void {
		this.recentItems.set([]);
	}
	
	/**
	 * Clear starred items
	 */
	clearStarred(): void {
		this.starredItems.set([]);
	}
	
	/**
	 * Remove specific recent item
	 */
	removeRecent(itemId: string): void {
		this.recentItems.update(items => 
			items.filter(i => i.item.id !== itemId)
		);
	}
	
	/**
	 * Get recent items by type
	 */
	getRecentByType(type: 'view' | 'edit' | 'download' | 'share'): RecentItem[] {
		const items = get(this.recentItems);
		return items.filter(i => i.accessType === type);
	}
	
	/**
	 * Get items accessed in date range
	 */
	getRecentInRange(from: Date, to: Date): RecentItem[] {
		const items = get(this.recentItems);
		return items.filter(i => 
			i.accessedAt >= from && i.accessedAt <= to
		);
	}
	
	/**
	 * Load from localStorage
	 */
	private loadFromStorage(): void {
		if (typeof localStorage === 'undefined') return;
		
		try {
			// Load recent items
			const recentData = localStorage.getItem('recentItems');
			if (recentData) {
				const items = JSON.parse(recentData);
				// Convert date strings to Date objects
				items.forEach((item: any) => {
					item.accessedAt = new Date(item.accessedAt);
					if (item.item.createdAt) {
						item.item.createdAt = new Date(item.item.createdAt);
					}
					if (item.item.modifiedAt) {
						item.item.modifiedAt = new Date(item.item.modifiedAt);
					}
				});
				this.recentItems.set(items);
			}
			
			// Load starred items
			const starredData = localStorage.getItem('starredItems');
			if (starredData) {
				const items = JSON.parse(starredData);
				// Convert date strings to Date objects
				items.forEach((item: any) => {
					item.starredAt = new Date(item.starredAt);
					if (item.item.createdAt) {
						item.item.createdAt = new Date(item.item.createdAt);
					}
					if (item.item.modifiedAt) {
						item.item.modifiedAt = new Date(item.item.modifiedAt);
					}
				});
				this.starredItems.set(items);
			}
		} catch (error) {
			console.error('Failed to load recent/starred items:', error);
		}
	}
	
	/**
	 * Save to localStorage
	 */
	private saveToStorage(key: string, items: any[]): void {
		if (typeof localStorage === 'undefined') return;
		
		try {
			localStorage.setItem(key, JSON.stringify(items));
		} catch (error) {
			console.error(`Failed to save ${key}:`, error);
		}
	}
	
	/**
	 * Export recent activity as CSV
	 */
	exportRecentActivity(): string {
		const items = get(this.recentItems);
		const headers = ['Name', 'Type', 'Access Type', 'Access Count', 'Last Accessed'];
		const rows = items.map(item => [
			item.item.name,
			item.item.type,
			item.accessType,
			item.accessCount.toString(),
			item.accessedAt.toLocaleString()
		]);
		
		return [headers, ...rows]
			.map(row => row.map(cell => `"${cell}"`).join(','))
			.join('\n');
	}
}

export const recentFiles = new RecentFilesStore();
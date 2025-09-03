import { writable, derived } from 'svelte/store';
import type { FileItem, FolderItem } from '$lib/types/storage';

export interface DragItem {
	type: 'file' | 'folder' | 'multi';
	items: (FileItem | FolderItem)[];
	source: string; // Path where the drag started
}

export interface DropZone {
	id: string;
	path: string;
	type: 'folder' | 'root';
	canDrop: boolean;
}

class DragDropService {
	private draggedItem = writable<DragItem | null>(null);
	private dropZones = writable<Map<string, DropZone>>(new Map());
	private isDragging = writable(false);
	private dropTarget = writable<string | null>(null);
	
	// Public stores
	public dragging$ = derived(this.isDragging, $isDragging => $isDragging);
	public draggedItem$ = derived(this.draggedItem, $item => $item);
	public dropTarget$ = derived(this.dropTarget, $target => $target);
	
	// Start dragging
	startDrag(items: (FileItem | FolderItem)[], source: string) {
		const type = items.length > 1 ? 'multi' : items[0].type === 'folder' ? 'folder' : 'file';
		
		this.draggedItem.set({
			type,
			items,
			source
		});
		
		this.isDragging.set(true);
	}
	
	// End dragging
	endDrag() {
		this.draggedItem.set(null);
		this.isDragging.set(false);
		this.dropTarget.set(null);
		this.clearDropZones();
	}
	
	// Register a drop zone
	registerDropZone(id: string, path: string, type: 'folder' | 'root' = 'folder') {
		this.dropZones.update(zones => {
			zones.set(id, {
				id,
				path,
				type,
				canDrop: true
			});
			return zones;
		});
	}
	
	// Unregister a drop zone
	unregisterDropZone(id: string) {
		this.dropZones.update(zones => {
			zones.delete(id);
			return zones;
		});
	}
	
	// Clear all drop zones
	clearDropZones() {
		this.dropZones.set(new Map());
	}
	
	// Set current drop target
	setDropTarget(id: string | null) {
		this.dropTarget.set(id);
	}
	
	// Check if can drop
	canDrop(targetPath: string): boolean {
		let canDrop = false;
		
		this.draggedItem.subscribe(item => {
			if (!item) {
				canDrop = false;
				return;
			}
			
			// Can't drop on same location
			if (item.source === targetPath) {
				canDrop = false;
				return;
			}
			
			// Can't drop folder into itself or its children
			if (item.type === 'folder' || item.type === 'multi') {
				const hasFolders = item.items.some(i => i.type === 'folder');
				if (hasFolders) {
					const folderPaths = item.items
						.filter(i => i.type === 'folder')
						.map(i => i.path);
					
					for (const folderPath of folderPaths) {
						if (targetPath.startsWith(folderPath)) {
							canDrop = false;
							return;
						}
					}
				}
			}
			
			canDrop = true;
		})();
		
		return canDrop;
	}
	
	// Handle drop
	async handleDrop(targetPath: string, operation: 'move' | 'copy' = 'move'): Promise<void> {
		let draggedItem: DragItem | null = null;
		
		this.draggedItem.subscribe(item => {
			draggedItem = item;
		})();
		
		if (!draggedItem || !this.canDrop(targetPath)) {
			this.endDrag();
			return;
		}
		
		try {
			// Perform the operation
			const items = draggedItem.items;
			const itemIds = items.map(item => item.id);
			
			// This would call the actual API
			// For now, we'll just log the operation
			console.log(`${operation} items:`, itemIds, 'to:', targetPath);
			
			// In a real implementation:
			// await storageService.moveItems(itemIds, targetPath);
			// or
			// await storageService.copyItems(itemIds, targetPath);
			
			this.endDrag();
		} catch (error) {
			console.error(`Failed to ${operation} items:`, error);
			this.endDrag();
			throw error;
		}
	}
	
	// Get file type from drag event
	getFileTypeFromEvent(event: DragEvent): string {
		if (!event.dataTransfer) return 'unknown';
		
		// Check for files
		if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
			const file = event.dataTransfer.files[0];
			return file.type || 'file';
		}
		
		// Check for custom data
		const customType = event.dataTransfer.types.find(type => 
			type.startsWith('application/x-storage-')
		);
		
		if (customType) {
			return customType.replace('application/x-storage-', '');
		}
		
		return 'unknown';
	}
	
	// Create ghost image for drag
	createDragGhost(element: HTMLElement, count: number = 1): HTMLElement {
		const ghost = element.cloneNode(true) as HTMLElement;
		ghost.style.position = 'absolute';
		ghost.style.top = '-1000px';
		ghost.style.opacity = '0.8';
		ghost.style.transform = 'rotate(2deg)';
		
		if (count > 1) {
			// Add a badge showing count
			const badge = document.createElement('div');
			badge.className = 'absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold';
			badge.textContent = count.toString();
			ghost.appendChild(badge);
		}
		
		document.body.appendChild(ghost);
		
		// Clean up after drag
		setTimeout(() => {
			if (document.body.contains(ghost)) {
				document.body.removeChild(ghost);
			}
		}, 0);
		
		return ghost;
	}
}

// Export singleton instance
export const dragDropService = new DragDropService();

// Export helper functions
export function handleFileDrop(event: DragEvent): File[] {
	event.preventDefault();
	event.stopPropagation();
	
	const files: File[] = [];
	
	if (event.dataTransfer?.files) {
		for (let i = 0; i < event.dataTransfer.files.length; i++) {
			files.push(event.dataTransfer.files[i]);
		}
	}
	
	return files;
}

export function isExternalDrag(event: DragEvent): boolean {
	if (!event.dataTransfer) return false;
	
	// Check if dragging files from outside the browser
	return event.dataTransfer.types.includes('Files') && 
		!event.dataTransfer.types.some(type => type.startsWith('application/x-storage-'));
}

export function preventDefaultDrag(event: DragEvent) {
	event.preventDefault();
	event.stopPropagation();
}
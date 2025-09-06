<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { 
		Download, Trash2, Share2, Move, Copy, Archive,
		Tag, Lock, Unlock, CheckSquare, Square, X
	} from 'lucide-svelte';
	import { storage } from '$lib/stores/storage';
	import { notifications } from '$lib/stores/notifications';
	import Button from '../common/Button.svelte';
	import type { FileItem, FolderItem } from '$lib/types/storage';
	
	export let selectedItems: string[] = [];
	export let items: (FileItem | FolderItem)[] = [];
	
	const dispatch = createEventDispatcher();
	
	$: selectedCount = selectedItems.length;
	$: hasSelection = selectedCount > 0;
	$: selectedFiles = items.filter(item => 
		selectedItems.includes(item.id) && item.type === 'file'
	);
	$: selectedFolders = items.filter(item => 
		selectedItems.includes(item.id) && item.type === 'folder'
	);
	$: totalSize = selectedFiles.reduce((sum, file) => 
		sum + (file as FileItem).size, 0
	);
	
	function selectAll() {
		const allIds = items.map(item => item.id);
		storage.selectItems(allIds);
		dispatch('select-all', { items: allIds });
	}
	
	function clearSelection() {
		storage.clearSelection();
		dispatch('clear-selection');
	}
	
	async function downloadSelected() {
		if (!hasSelection) return;
		
		const notificationId = notifications.progress(
			'Preparing download',
			0,
			selectedCount
		);
		
		try {
			if (selectedCount === 1) {
				// Single file download
				await storage.downloadFile(selectedItems[0]);
			} else {
				// Multiple files - create ZIP
				await storage.downloadFiles(selectedItems);
			}
			
			notifications.success('Download started');
		} catch (error) {
			notifications.error('Download failed', error.message);
		} finally {
			notifications.remove(notificationId);
		}
	}
	
	async function deleteSelected() {
		if (!hasSelection) return;
		
		const confirmMessage = selectedCount === 1 
			? 'Are you sure you want to delete this item?'
			: `Are you sure you want to delete ${selectedCount} items?`;
		
		if (!confirm(confirmMessage)) return;
		
		const notificationId = notifications.progress(
			'Deleting items',
			0,
			selectedCount
		);
		
		try {
			let completed = 0;
			for (const itemId of selectedItems) {
				await storage.deleteItem(itemId);
				completed++;
				notifications.updateProgress(notificationId, completed, selectedCount);
			}
			
			notifications.success(
				`${selectedCount} item${selectedCount > 1 ? 's' : ''} deleted`
			);
			clearSelection();
		} catch (error) {
			notifications.error('Delete failed', error.message);
		} finally {
			notifications.remove(notificationId);
		}
	}
	
	async function shareSelected() {
		if (!hasSelection) return;
		dispatch('share', { items: selectedItems });
	}
	
	async function moveSelected() {
		if (!hasSelection) return;
		dispatch('move', { items: selectedItems });
	}
	
	async function copySelected() {
		if (!hasSelection) return;
		dispatch('copy', { items: selectedItems });
	}
	
	async function archiveSelected() {
		if (!hasSelection) return;
		
		const notificationId = notifications.progress(
			'Creating archive',
			0,
			100
		);
		
		try {
			// Create archive name
			const timestamp = new Date().toISOString().split('T')[0];
			const archiveName = `archive-${timestamp}.zip`;
			
			// TODO: Implement actual archive creation
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			notifications.success(`Archive created: ${archiveName}`);
		} catch (error) {
			notifications.error('Archive failed', error.message);
		} finally {
			notifications.remove(notificationId);
		}
	}
	
	async function tagSelected() {
		if (!hasSelection) return;
		dispatch('tag', { items: selectedItems });
	}
	
	async function toggleLockSelected() {
		if (!hasSelection) return;
		
		try {
			// TODO: Implement file locking
			const isLocked = false; // Check if items are locked
			
			if (isLocked) {
				await storage.unlockItems(selectedItems);
				notifications.success('Items unlocked');
			} else {
				await storage.lockItems(selectedItems);
				notifications.success('Items locked');
			}
		} catch (error) {
			notifications.error('Lock operation failed', error.message);
		}
	}
	
	function formatSize(bytes: number): string {
		const units = ['B', 'KB', 'MB', 'GB'];
		let size = bytes;
		let unitIndex = 0;
		
		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}
		
		return `${size.toFixed(1)} ${units[unitIndex]}`;
	}
</script>

{#if hasSelection}
	<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
		<div class="bg-base-100 rounded-2xl shadow-2xl border border-base-200 p-4">
			<div class="flex items-center gap-4">
				<!-- Selection Info -->
				<div class="flex items-center gap-3 pr-4 border-r border-base-200">
					<button
						type="button"
						class="p-2 rounded-lg hover:bg-base-200 transition-colors"
						on:click={clearSelection}
						title="Clear selection"
					>
						<X class="w-4 h-4" />
					</button>
					<div class="text-sm">
						<div class="font-semibold">
							{selectedCount} selected
						</div>
						{#if selectedFiles.length > 0}
							<div class="text-base-content/60">
								{formatSize(totalSize)}
							</div>
						{/if}
					</div>
				</div>
				
				<!-- Actions -->
				<div class="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						icon={Download}
						on:click={downloadSelected}
						title="Download"
					>
						Download
					</Button>
					
					<Button
						variant="ghost"
						size="sm"
						icon={Share2}
						on:click={shareSelected}
						title="Share"
					>
						Share
					</Button>
					
					<Button
						variant="ghost"
						size="sm"
						icon={Copy}
						on:click={copySelected}
						title="Copy"
					>
						Copy
					</Button>
					
					<Button
						variant="ghost"
						size="sm"
						icon={Move}
						on:click={moveSelected}
						title="Move"
					>
						Move
					</Button>
					
					<div class="dropdown dropdown-top">
						<button
							tabindex="0"
							class="btn btn-ghost btn-sm"
							title="More actions"
						>
							More
						</button>
						<ul 
							tabindex="0" 
							class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-200 mb-2"
						>
							<li>
								<button on:click={archiveSelected}>
									<Archive class="w-4 h-4" />
									Create Archive
								</button>
							</li>
							<li>
								<button on:click={tagSelected}>
									<Tag class="w-4 h-4" />
									Add Tags
								</button>
							</li>
							<li>
								<button on:click={toggleLockSelected}>
									<Lock class="w-4 h-4" />
									Lock/Unlock
								</button>
							</li>
							<li class="border-t border-base-200 mt-1 pt-1">
								<button 
									on:click={deleteSelected}
									class="text-error hover:bg-error/10"
								>
									<Trash2 class="w-4 h-4" />
									Delete
								</button>
							</li>
						</ul>
					</div>
				</div>
				
				<!-- Select All -->
				{#if selectedCount < items.length}
					<div class="pl-4 border-l border-base-200">
						<Button
							variant="ghost"
							size="sm"
							icon={CheckSquare}
							on:click={selectAll}
						>
							Select All
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes slide-up {
		from {
			transform: translate(-50%, 100%);
			opacity: 0;
		}
		to {
			transform: translate(-50%, 0);
			opacity: 1;
		}
	}
	
	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}
</style>
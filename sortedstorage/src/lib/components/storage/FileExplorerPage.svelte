<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import FileExplorer from './FileExplorer.svelte';
	import ShareDialog from './ShareDialog.svelte';
	import FilePreview from './FilePreview.svelte';
	import NewItemModal from './NewItemModal.svelte';
	import { storageAPI } from '$lib/api/storage';
	import { notifications } from '$lib/stores/notifications';
	import { websocket } from '$lib/services/websocket';
	import { onMount, onDestroy } from 'svelte';
	import type { StorageItem } from '$lib/types/storage';
	import SlideMenu from '$lib/components/common/SlideMenu.svelte';
	import { Plus, Share2, Edit, Menu } from 'lucide-svelte';
	
	// Props
	export let folderId: string | null = null;
	
	// Menu state
	let menuOpen = false;
	
	// File explorer state
	let currentPath = ['Home'];
	let pathIds: (string | null)[] = [null]; // Track folder IDs for navigation
	let items: StorageItem[] = [];
	let showShare = false;
	let showPreview = false;
	let showNewModal = false;
	let selectedFile: StorageItem | null = null;
	let selectedItem: StorageItem | null = null;
	let selectedItems: StorageItem[] = [];
	let loading = false;
	let storageUnsubscribe: (() => void) | null = null;
	let mounted = false;
	
	// WebSocket subscriptions
	let unsubscribers: (() => void)[] = [];
	
	// Reactive statement to reload when folderId changes
	$: if (mounted && folderId !== undefined) {
		loadItems();
	}
	
	onMount(async () => {
		mounted = true;
		
		// Check authentication
		if (!$auth.user) {
			goto('/');
			return;
		}
		
		// Load items
		await loadItems();
		
		// Subscribe to WebSocket events
		unsubscribers.push(
			websocket.subscribe('file_added', (data) => {
				loadItems();
			}),
			websocket.subscribe('file_deleted', (data) => {
				loadItems();
			}),
			websocket.subscribe('file_updated', (data) => {
				loadItems();
			})
		);
	});
	
	onDestroy(() => {
		// Cleanup WebSocket subscriptions
		unsubscribers.forEach(unsub => unsub());
		if (storageUnsubscribe) {
			storageUnsubscribe();
		}
	});
	
	async function loadItems() {
		loading = true;
		try {
			if (folderId) {
				// Load folder contents
				const folderInfo = await storageAPI.getItem(folderId);
				
				if (!folderInfo || folderInfo.type !== 'folder') {
					notifications.error('Folder not found');
					goto('/');
					return;
				}
				
				// Update last viewed for this folder
				try {
					await fetch(`/api/storage/items/${folderId}/last-viewed`, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
						}
					});
				} catch (error) {
					console.error('Failed to update last viewed:', error);
				}
				
				// Get folder hierarchy for breadcrumbs
				const hierarchy = await storageAPI.getFolderHierarchy(folderId);
				currentPath = ['Home', ...hierarchy.map(f => f.name)];
				pathIds = [null, ...hierarchy.map(f => f.id)];
				
				// Load items in this folder
				const result = await storageAPI.listItemsInFolder(folderId);
				items = result || [];
			} else {
				// Load root items (no parent folder)
				const result = await storageAPI.listFiles({});
				items = result.items;
				currentPath = ['Home'];
				pathIds = [null];
			}
			
			console.log('Loaded items:', items);
		} catch (error) {
			console.error('Failed to load items:', error);
			notifications.error('Failed to load files');
			items = [];
		} finally {
			loading = false;
		}
	}
	
	function navigateToFolder(folder: StorageItem) {
		if (folder.type === 'folder') {
			// Update last viewed and navigate
			updateLastViewed(folder.id);
			goto(`/folder/${folder.id}`);
		}
	}
	
	function handleFileSelect(file: StorageItem) {
		if (file.type === 'folder') {
			navigateToFolder(file);
		} else {
			selectedFile = file;
			showPreview = true;
			updateLastViewed(file.id);
		}
	}
	
	function handleShare(item: StorageItem) {
		selectedItem = item;
		showShare = true;
	}
	
	async function handleDeleteItem(item: StorageItem) {
		if (confirm(`Are you sure you want to delete ${item.name}?`)) {
			try {
				await storageAPI.deleteItem(item.id);
				notifications.success(`${item.name} deleted`);
				await loadItems();
			} catch (error) {
				notifications.error('Failed to delete item');
			}
		}
	}
	
	async function handleRenameItem(item: StorageItem, newName: string) {
		try {
			await storageAPI.rename(item.id, newName);
			notifications.success('Item renamed');
			await loadItems();
		} catch (error) {
			notifications.error('Failed to rename item');
		}
	}
	
	async function handleNewItem(event: CustomEvent<{ type: 'file' | 'folder'; name?: string; files?: FileList }>) {
		const { type, name, files } = event.detail;
		
		if (type === 'folder' && name) {
			try {
				// Create folder with current folder as parent
				await storageAPI.createFolder(name, undefined, folderId || undefined);
				notifications.success(`Folder "${name}" created`);
				await loadItems();
			} catch (error) {
				notifications.error('Failed to create folder');
			}
		} else if (type === 'file' && files) {
			// Upload files to current folder
			try {
				const fileArray = Array.from(files);
				await storageAPI.uploadFiles(fileArray, { parentId: folderId || undefined });
				notifications.success('Upload complete', `${files.length} file(s) uploaded successfully`);
				await loadItems();
			} catch (error) {
				notifications.error('Failed to upload files');
			}
		}
	}
	
	async function updateLastViewed(itemId: string) {
		try {
			await fetch(`/api/storage/items/${itemId}/last-viewed`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
				}
			});
		} catch (error) {
			// Silent fail - not critical
			console.error('Failed to update last viewed:', error);
		}
	}
	
	function navigateToBreadcrumb(index: number) {
		if (index === 0) {
			// Navigate to Home
			goto('/');
		} else if (index >= 1 && pathIds[index]) {
			// Navigate to specific folder
			goto(`/folder/${pathIds[index]}`);
		}
	}
</script>

<div class="files-container">
	<!-- Common Slide Menu (without floating button) -->
	<SlideMenu bind:open={menuOpen} />
	
	<!-- Floating Action Buttons -->
	<div class="floating-actions">
		<button 
			class="floating-action-btn" 
			on:click={() => notifications.info('Edit mode coming soon!')}
			title="Edit"
		>
			<Edit size={20} />
		</button>
		<button 
			class="floating-action-btn" 
			on:click={() => {
				if (selectedItems.length > 0) {
					selectedItem = selectedItems[0];
					showShare = true;
				} else {
					notifications.info('Select items to share');
				}
			}}
			title="Share"
		>
			<Share2 size={20} />
		</button>
		<button 
			class="floating-action-btn primary" 
			on:click={() => showNewModal = true}
			title="New"
		>
			<Plus size={20} />
		</button>
		<button 
			class="floating-menu-btn" 
			on:click={() => menuOpen = !menuOpen}
			title="Menu"
		>
			<Menu size={20} />
		</button>
	</div>
	
	<div class="content-card">
		<FileExplorer
			{items}
			{currentPath}
			{loading}
			onNavigate={(path) => {
				navigateToBreadcrumb(path.length - 1);
			}}
			onNavigateToFolder={navigateToFolder}
			onEdit={(item) => console.log('Edit:', item)}
			onDelete={(item) => handleDeleteItem(item)}
			onShare={(item) => handleShare(item)}
			on:new={handleNewItem}
		/>
	</div>
	
	{#if showShare && selectedItem}
		<ShareDialog
			item={selectedItem}
			bind:open={showShare}
			on:close={() => {
				showShare = false;
				selectedItem = null;
			}}
		/>
	{/if}
	
	{#if showPreview && selectedFile}
		<FilePreview
			file={selectedFile}
			bind:open={showPreview}
			on:close={() => {
				showPreview = false;
				selectedFile = null;
			}}
		/>
	{/if}
	
	{#if showNewModal}
		<NewItemModal
			bind:open={showNewModal}
			on:new={handleNewItem}
		/>
	{/if}
</div>

<style>
	.files-container {
		min-height: 100vh;
		padding: 1rem;
		max-width: 1400px;
		margin: 0 auto;
		background: var(--bg-base, #f0f0f0);
	}
	
	.content-card {
		background: #ffffff;
		border-radius: 24px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}
	
	/* Floating Action Buttons */
	.floating-actions {
		position: fixed;
		top: 2rem;
		right: max(2rem, calc((100vw - 1400px) / 2 + 2rem));
		z-index: 40;
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}
	
	.floating-action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 22px;
		background: #ffffff;
		border: 2px solid var(--color-tertiary, #f1e2dd);
		cursor: pointer;
		transition: all 0.3s;
		color: var(--color-accent, #a16d5b);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	
	.floating-action-btn:hover {
		transform: scale(1.05);
		background: var(--color-tertiary, #f1e2dd);
		color: var(--color-primary, #f7ad00);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
	
	.floating-action-btn.primary {
		background: var(--color-primary, #f7ad00);
		color: #ffffff;
		border-color: var(--color-primary, #f7ad00);
	}
	
	.floating-action-btn.primary:hover {
		background: var(--color-primary-hover, #e59c00);
		border-color: var(--color-primary-hover, #e59c00);
		transform: scale(1.08);
		box-shadow: 0 4px 16px rgba(247, 173, 0, 0.3);
	}
	
	.floating-action-btn:active {
		transform: scale(0.98);
	}
	
	.floating-menu-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 22px;
		background: #ffffff;
		border: 2px solid var(--color-tertiary, #f1e2dd);
		cursor: pointer;
		transition: all 0.3s;
		color: var(--color-primary, #f7ad00);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	
	.floating-menu-btn:hover {
		transform: scale(1.05);
		background: var(--color-primary, #f7ad00);
		color: #ffffff;
		box-shadow: 0 4px 12px rgba(247, 173, 0, 0.3);
		border-color: var(--color-primary, #f7ad00);
	}
	
	.floating-menu-btn:active {
		transform: scale(0.98);
	}
	
	/* Dark mode */
	:global(.dark) .files-container {
		background: var(--bg-base, #0f172a);
	}
	
	:global(.dark) .content-card {
		background: #1f2937;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}
	
	:global(.dark) .floating-action-btn {
		background: #1e293b;
		border-color: #374151;
		color: var(--color-secondary, #FBD680);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}
	
	:global(.dark) .floating-action-btn:hover {
		background: #374151;
		border-color: var(--color-secondary, #FBD680);
		color: var(--color-secondary, #FBD680);
	}
	
	:global(.dark) .floating-action-btn.primary {
		background: var(--color-primary, #f7ad00);
		border-color: var(--color-primary, #f7ad00);
		color: #1e293b;
	}
	
	:global(.dark) .floating-action-btn.primary:hover {
		background: var(--color-secondary, #FBD680);
		border-color: var(--color-secondary, #FBD680);
		color: #1e293b;
	}
	
	:global(.dark) .floating-menu-btn {
		background: #1e293b;
		border-color: var(--color-secondary, #FBD680);
		color: var(--color-secondary, #FBD680);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}
	
	:global(.dark) .floating-menu-btn:hover {
		background: var(--color-secondary, #FBD680);
		color: #1e293b;
		box-shadow: 0 4px 12px rgba(251, 214, 128, 0.3);
		border-color: var(--color-secondary, #FBD680);
	}
	
	/* Mobile adjustments */
	@media (max-width: 640px) {
		.files-container {
			padding: 0.5rem;
		}
		
		.content-card {
			border-radius: 16px;
			min-height: calc(100vh - 1rem);
		}
		
		.floating-actions {
			top: 1rem;
			right: 1rem;
			gap: 0.5rem;
		}
		
		.floating-action-btn,
		.floating-menu-btn {
			width: 40px;
			height: 40px;
		}
	}
	
	/* Smaller mobile devices */
	@media (max-width: 375px) {
		.files-container {
			padding: 0.25rem;
		}
		
		.content-card {
			border-radius: 12px;
		}
		
		.floating-actions {
			top: 0.75rem;
			right: 0.75rem;
			gap: 0.375rem;
		}
		
		.floating-action-btn,
		.floating-menu-btn {
			width: 36px;
			height: 36px;
		}
	}
</style>
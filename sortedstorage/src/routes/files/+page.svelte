<script lang="ts">
	import FileExplorer from '$lib/components/storage/FileExplorer.svelte';
	import UploadManager from '$lib/components/storage/UploadManager.svelte';
	import ShareDialog from '$lib/components/storage/ShareDialog.svelte';
	import FilePreview from '$lib/components/storage/FilePreview.svelte';
	import Modal from '$lib/components/common/Modal.svelte';
	import { storage } from '$lib/stores/storage';
	import { notifications } from '$lib/stores/notifications';
	import { websocket } from '$lib/services/websocket';
	import { onMount, onDestroy } from 'svelte';
	import type { StorageItem } from '$lib/types/storage';
	
	let currentPath = ['Home'];
	let items: StorageItem[] = [];
	let showUpload = false;
	let showShare = false;
	let showPreview = false;
	let selectedFile: StorageItem | null = null;
	let selectedItem: StorageItem | null = null;
	let loading = false;
	
	// WebSocket subscriptions
	let unsubscribers: (() => void)[] = [];
	
	// Convert path array to string for API calls
	$: currentPathString = '/' + currentPath.slice(1).join('/');
	
	onMount(async () => {
		// Load files for current path
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
	});
	
	async function loadItems() {
		loading = true;
		try {
			await storage.loadFiles(currentPathString);
			// Subscribe to storage state
			const unsubscribe = storage.subscribe(state => {
				const files = state.files || [];
				const folders = state.folders || [];
				// Convert to StorageItem format
				items = [
					...folders.map(f => ({ ...f, type: 'folder' as const })),
					...files.map(f => ({ ...f, type: 'file' as const }))
				];
			});
			unsubscribers.push(unsubscribe);
		} catch (error: any) {
			notifications.error('Failed to load files', error.message || 'An error occurred');
		} finally {
			loading = false;
		}
	}
	
	function handleNavigate(path: string[]) {
		currentPath = path;
		loadItems();
	}
	
	async function handleEdit(item: StorageItem) {
		try {
			await storage.updateItem(item.id, item);
			notifications.success('Updated', `"${item.name}" updated successfully`);
			await loadItems();
		} catch (error: any) {
			notifications.error('Update failed', error.message || 'An error occurred');
		}
	}
	
	async function handleDelete(item: StorageItem) {
		try {
			await storage.deleteItems([item.id]);
			notifications.success('Deleted', `"${item.name}" deleted successfully`);
			await loadItems();
		} catch (error: any) {
			notifications.error('Delete failed', error.message || 'An error occurred');
		}
	}
	
	function handleShare(item: StorageItem) {
		selectedItem = item;
		showShare = true;
	}
	
	async function handleNew(event: CustomEvent<{ type: 'file' | 'folder'; name?: string; files?: FileList }>) {
		const { type, name, files } = event.detail;
		console.log('handleNew called:', { type, name, files });
		
		try {
			if (type === 'folder' && name) {
				await storage.createFolder(name, currentPathString);
				notifications.success('Folder created', `"${name}" created successfully`);
				await loadItems();
			} else if (type === 'file' && files) {
				console.log(`Uploading ${files.length} files`);
				// Upload the files
				const progressId = notifications.progress('Uploading files', 0, files.length);
				
				for (let i = 0; i < files.length; i++) {
					const file = files[i];
					console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);
					try {
						await storage.uploadFile(file, currentPathString);
						notifications.updateProgress(progressId, i + 1, files.length);
					} catch (error: any) {
						console.error(`Upload error for ${file.name}:`, error);
						notifications.error(`Failed to upload ${file.name}`, error.message);
					}
				}
				
				notifications.success('Upload complete', `${files.length} file(s) uploaded successfully`);
				await loadItems();
			}
		} catch (error: any) {
			console.error('Error in handleNew:', error);
			notifications.error('Failed to create ' + type, error.message || 'An error occurred');
		}
	}
	
</script>

<div class="files-page">
	<!-- Main Content with FileExplorer -->
	<FileExplorer 
		{items}
		{currentPath}
		onNavigate={handleNavigate}
		onEdit={handleEdit}
		onDelete={handleDelete}
		onShare={handleShare}
		on:new={handleNew}
	/>
</div>

<!-- Modals -->
<Modal bind:open={showUpload} title="Upload Files" size="lg">
	<UploadManager />
</Modal>

{#if selectedItem}
	<ShareDialog bind:open={showShare} item={selectedItem} />
{/if}

{#if selectedFile}
	<FilePreview bind:open={showPreview} file={selectedFile} />
{/if}

<style>
	.files-page {
		width: 100%;
		height: 100%;
		background: #f8f9fa;
	}
</style>
<script lang="ts">
	import { ChevronRight, Home, Upload, FolderPlus, Download, Share2, Trash2 } from 'lucide-svelte';
	import FileExplorer from '$lib/components/storage/FileExplorer.svelte';
	import UploadManager from '$lib/components/storage/UploadManager.svelte';
	import ShareDialog from '$lib/components/storage/ShareDialog.svelte';
	import FilePreview from '$lib/components/storage/FilePreview.svelte';
	import BatchActions from '$lib/components/storage/BatchActions.svelte';
	import Modal from '$lib/components/common/Modal.svelte';
	import Button from '$lib/components/common/Button.svelte';
	import { storage } from '$lib/stores/storage';
	import { notifications } from '$lib/stores/notifications';
	import { websocket } from '$lib/services/websocket';
	import { onMount, onDestroy } from 'svelte';
	import type { FileItem, FolderItem } from '$lib/types/storage';
	
	let currentPath = '/';
	let selectedItems: string[] = [];
	let showUpload = false;
	let showShare = false;
	let showPreview = false;
	let selectedFile: FileItem | null = null;
	let selectedItem: FileItem | FolderItem | null = null;
	let loading = false;
	let searchQuery = '';
	let currentPage = 1;
	let itemsPerPage = 20;
	let totalItems = 0;
	
	// WebSocket subscriptions
	let unsubscribers: (() => void)[] = [];
	
	// Start with empty data - will be loaded from API
	let folders: FolderItem[] = [];
	let files: FileItem[] = [];
	
	$: pathSegments = currentPath.split('/').filter(Boolean);
	
	onMount(async () => {
		// Load files for current path
		await loadFilesAndFolders();
		
		// Subscribe to WebSocket events
		unsubscribers.push(
			websocket.subscribe('file_added', (data) => {
				loadFilesAndFolders();
			}),
			websocket.subscribe('file_deleted', (data) => {
				loadFilesAndFolders();
			}),
			websocket.subscribe('file_updated', (data) => {
				loadFilesAndFolders();
			})
		);
	});
	
	onDestroy(() => {
		// Cleanup WebSocket subscriptions
		unsubscribers.forEach(unsub => unsub());
	});
	
	async function loadFilesAndFolders() {
		loading = true;
		try {
			await storage.loadFiles(currentPath);
			// Subscribe to storage state
			const unsubscribe = storage.subscribe(state => {
				files = state.files || [];
				folders = state.folders || [];
				totalItems = files.length + folders.length;
			});
			unsubscribers.push(unsubscribe);
		} catch (error: any) {
			notifications.error('Failed to load files', error.message || 'An error occurred');
		} finally {
			loading = false;
		}
	}
	
	async function handleDeleteSelected() {
		if (selectedItems.length === 0) return;
		
		if (confirm(`Delete ${selectedItems.length} item(s)?`)) {
			const progressId = notifications.progress('Deleting files', 0, selectedItems.length);
			
			try {
				await storage.deleteItems(selectedItems);
				for (let i = 0; i < selectedItems.length; i++) {
					notifications.updateProgress(progressId, i + 1, selectedItems.length);
				}
				notifications.success('Files deleted', `${selectedItems.length} items deleted successfully`);
				selectedItems = [];
				await loadFilesAndFolders();
			} catch (error) {
				notifications.error('Delete failed', 'Some files could not be deleted');
			}
		}
	}
	
	function handleShareSelected() {
		if (selectedItems.length === 0) return;
		
		// For now, share the first selected item
		const itemId = selectedItems[0];
		const item = [...files, ...folders].find(i => i.id === itemId);
		if (item) {
			selectedItem = item;
			showShare = true;
		}
	}
	
	function handlePreviewFile(file: FileItem) {
		selectedFile = file;
		showPreview = true;
	}
	
	async function handleCreateFolder() {
		const name = prompt('Enter folder name:');
		if (name) {
			try {
				await storage.createFolder(name, currentPath);
				notifications.success('Folder created', `"${name}" created successfully`);
				await loadFilesAndFolders();
			} catch (error) {
				notifications.error('Failed to create folder', error.message || 'An error occurred');
			}
		}
	}
	
	async function handleBatchAction(event: CustomEvent) {
		const action = event.detail.action;
		
		switch (action) {
			case 'delete':
				handleDeleteSelected();
				break;
			case 'share':
				handleShareSelected();
				break;
			case 'download':
				// Implement batch download
				notifications.info('Preparing download...');
				break;
			case 'move':
				// Implement move dialog
				notifications.info('Move feature coming soon');
				break;
			case 'copy':
				// Implement copy dialog
				notifications.info('Copy feature coming soon');
				break;
			case 'archive':
				// Implement archive
				notifications.info('Archive feature coming soon');
				break;
		}
	}
</script>

<div class="container mx-auto px-4 py-6 space-y-4">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">My Files</h1>
		<div class="flex items-center gap-2 text-sm text-gray-500">
			<button class="flex items-center gap-1 hover:text-primary-600" on:click={() => currentPath = '/'}>
				<Home class="w-4 h-4" />
				<span>Home</span>
			</button>
			{#each pathSegments as segment, i}
				<ChevronRight class="w-4 h-4 text-gray-400" />
				<button class="hover:text-primary-600">
					{segment}
				</button>
			{/each}
		</div>
	</div>
	
	<!-- Main Content Card -->
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
		<FileExplorer 
			{files} 
			{folders} 
			bind:selectedItems
			{currentPath}
			{loading}
			{searchQuery}
			{currentPage}
			{itemsPerPage}
			totalItems={files.length + folders.length}
			on:upload={() => showUpload = true}
			on:createFolder={handleCreateFolder}
			on:search={(e) => searchQuery = e.detail.query}
			on:paginate={(e) => {
				currentPage = e.detail.page;
				itemsPerPage = e.detail.itemsPerPage;
			}}
		/>
	</div>
	
	<!-- Batch Actions Bar (appears when items are selected) -->
	{#if selectedItems.length > 0}
		<BatchActions
			selectedCount={selectedItems.length}
			on:action={handleBatchAction}
			on:clear={() => selectedItems = []}
		/>
	{/if}
</div>

<!-- Modals -->
<Modal bind:open={showUpload} title="Upload Files" size="lg">
	<UploadManager />
</Modal>

<ShareDialog bind:open={showShare} item={selectedItem} />

<FilePreview bind:open={showPreview} file={selectedFile} />
<script lang="ts">
	import { ChevronRight, Home, Upload, FolderPlus, Download, Share2, Trash2 } from 'lucide-svelte';
	import FileExplorer from '$lib/components/storage/FileExplorer.svelte';
	import UploadManager from '$lib/components/storage/UploadManager.svelte';
	import ShareDialog from '$lib/components/storage/ShareDialog.svelte';
	import FilePreview from '$lib/components/storage/FilePreview.svelte';
	import BatchActions from '$lib/components/storage/BatchActions.svelte';
	import Modal from '$lib/components/common/Modal.svelte';
	import Button from '$lib/components/common/Button.svelte';
	import { storage } from '$lib/stores/storage-api';
	import { toasts } from '$lib/stores/notifications';
	import { notifications } from '$lib/stores/notifications';
	import { websocket } from '$lib/services/websocket';
	import { collaboration } from '$lib/stores/collaboration';
	import ActiveUsers from '$lib/components/collaboration/ActiveUsers.svelte';
	import ActivityFeed from '$lib/components/collaboration/ActivityFeed.svelte';
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
	
	// Mock data - will be replaced with API calls
	const folders: FolderItem[] = [
		{
			id: 'f1',
			name: 'Documents',
			path: '/',
			itemCount: 24,
			size: 15728640,
			isShared: false,
			permissions: [],
			createdAt: new Date('2024-01-01'),
			modifiedAt: new Date('2024-01-20')
		},
		{
			id: 'f2',
			name: 'Images',
			path: '/',
			itemCount: 156,
			size: 524288000,
			isShared: true,
			permissions: [],
			createdAt: new Date('2024-01-05'),
			modifiedAt: new Date('2024-01-22')
		},
		{
			id: 'f3',
			name: 'Projects',
			path: '/',
			itemCount: 8,
			size: 104857600,
			isShared: false,
			permissions: [],
			createdAt: new Date('2024-01-10'),
			modifiedAt: new Date('2024-01-25')
		}
	];
	
	const files: FileItem[] = [
		{
			id: 'file1',
			name: 'README.md',
			path: '/',
			size: 4096,
			mimeType: 'text/markdown',
			isShared: false,
			permissions: [],
			createdAt: new Date('2024-01-15'),
			modifiedAt: new Date('2024-01-20')
		},
		{
			id: 'file2',
			name: 'budget.xlsx',
			path: '/',
			size: 45056,
			mimeType: 'application/vnd.ms-excel',
			isShared: true,
			permissions: [],
			createdAt: new Date('2024-01-18'),
			modifiedAt: new Date('2024-01-23')
		}
	];
	
	const pathSegments = currentPath.split('/').filter(Boolean);
	
	onMount(() => {
		// Load files for current path
		storage.loadFiles(currentPath);
		
		// Announce presence for collaboration
		collaboration.announcePresence(currentPath);
		
		// Subscribe to WebSocket events
		unsubscribers.push(
			websocket.subscribe('file_added', (data) => {
				// Notifications are now handled by collaboration store
				storage.loadFiles(currentPath);
			}),
			websocket.subscribe('file_deleted', (data) => {
				storage.loadFiles(currentPath);
			}),
			websocket.subscribe('file_updated', (data) => {
				storage.loadFiles(currentPath);
			})
		);
	});
	
	// Update collaboration path when current path changes
	$: if (currentPath) {
		collaboration.updatePath(currentPath);
	}
	
	onDestroy(() => {
		// Cleanup WebSocket subscriptions
		unsubscribers.forEach(unsub => unsub());
	});
	
	async function handleDeleteSelected() {
		if (selectedItems.length === 0) return;
		
		if (confirm(`Delete ${selectedItems.length} item(s)?`)) {
			const progressId = notifications.progress('Deleting files', 0, selectedItems.length);
			
			try {
				for (let i = 0; i < selectedItems.length; i++) {
					await storage.deleteItem(selectedItems[i]);
					notifications.updateProgress(progressId, i + 1, selectedItems.length);
				}
				notifications.success('Files deleted', `${selectedItems.length} items deleted successfully`);
				selectedItems = [];
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
				toasts.info('Preparing download...');
				break;
			case 'move':
				// Implement move dialog
				toasts.info('Move feature coming soon');
				break;
			case 'copy':
				// Implement copy dialog
				toasts.info('Copy feature coming soon');
				break;
			case 'archive':
				// Implement archive
				toasts.info('Archive feature coming soon');
				break;
		}
	}
</script>

<div class="flex gap-6">
	<!-- Main Content -->
	<div class="flex-1 space-y-4">
	<!-- Breadcrumb -->
	<div class="flex items-center gap-2 text-sm">
		<button class="flex items-center gap-1 hover:text-primary-600">
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
	
	<!-- Action Buttons -->
	<div class="flex gap-2">
		<Button icon={Upload} on:click={() => showUpload = true}>Upload</Button>
		<Button icon={FolderPlus} variant="secondary" on:click={handleCreateFolder}>New Folder</Button>
		{#if selectedItems.length > 0}
			<div class="ml-auto flex gap-2">
				<Button icon={Download} variant="ghost" size="sm">Download</Button>
				<Button icon={Share2} variant="ghost" size="sm" on:click={handleShareSelected}>Share</Button>
				<Button icon={Trash2} variant="ghost" size="sm" on:click={handleDeleteSelected}>Delete</Button>
			</div>
		{/if}
	</div>
	
	<!-- File Explorer -->
	<div class="bg-white dark:bg-gray-800 rounded-lg p-6">
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
	
		<!-- Batch Actions Bar -->
		<BatchActions
			selectedCount={selectedItems.length}
			on:action={handleBatchAction}
			on:clear={() => selectedItems = []}
		/>
	</div>
	
	<!-- Collaboration Sidebar -->
	<div class="hidden xl:block w-80 space-y-4">
		<!-- Active Users -->
		<div class="bg-white dark:bg-gray-800 rounded-lg p-4">
			<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Collaborators</h3>
			<ActiveUsers path={currentPath} />
		</div>
		
		<!-- Activity Feed -->
		<ActivityFeed limit={8} />
	</div>
</div>

<!-- Modals -->
<Modal bind:open={showUpload} title="Upload Files" size="lg">
	<UploadManager />
</Modal>

<ShareDialog bind:open={showShare} item={selectedItem} />

<FilePreview bind:open={showPreview} file={selectedFile} />
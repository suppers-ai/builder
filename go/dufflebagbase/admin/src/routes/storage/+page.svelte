<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		HardDrive, FolderPlus, Upload, Download,
		Trash2, Edit2, Search, Grid, List,
		Folder, File, Image, FileText, Film,
		Music, Archive, Code, ChevronRight,
		Plus, X, Check, Copy, Move, Eye
	} from 'lucide-svelte';
	import { api } from '$lib/api';
	
	let viewMode = 'grid'; // 'grid' or 'list'
	let selectedBucket: any = null;
	let currentPath = '/';
	let searchQuery = '';
	let selectedItems = new Set<string>();
	let showCreateBucketModal = false;
	let showCreateFolderModal = false;
	let showUploadModal = false;
	let showDeleteModal = false;
	let itemToDelete: any = null;
	
	// Form data
	let newBucket = {
		name: '',
		public: false
	};
	
	let newFolder = {
		name: ''
	};
	
	// Real data from API
	let buckets: any[] = [];
	
	let files: any[] = [];
	
	// Stats from API
	let totalStorage = '0 B';
	let usedStorage = '0 B';
	let totalFiles = 0;
	let totalBuckets = 0;
	
	// Breadcrumb path parts
	$: pathParts = currentPath.split('/').filter(p => p);
	
	// Filtered files based on search
	$: filteredFiles = files.filter(file => 
		file.name.toLowerCase().includes(searchQuery.toLowerCase())
	);
	
	function getFileIcon(type: string) {
		switch(type) {
			case 'folder': return Folder;
			case 'image': return Image;
			case 'pdf': return FileText;
			case 'video': return Film;
			case 'audio': return Music;
			case 'archive': return Archive;
			case 'code': return Code;
			default: return File;
		}
	}
	
	function getFileIconColor(type: string) {
		switch(type) {
			case 'folder': return '#f59e0b';
			case 'image': return '#10b981';
			case 'pdf': return '#ef4444';
			case 'video': return '#8b5cf6';
			case 'audio': return '#3b82f6';
			case 'archive': return '#6366f1';
			case 'code': return '#14b8a6';
			default: return '#64748b';
		}
	}
	
	async function selectBucket(bucket: any) {
		selectedBucket = bucket;
		currentPath = '/';
		selectedItems.clear();
		
		// Fetch objects for this bucket
		if (bucket && bucket.name) {
			await fetchBucketObjects(bucket.name);
		}
	}
	
	function navigateToFolder(folder: any) {
		if (folder.type === 'folder') {
			currentPath = currentPath + folder.name + '/';
			selectedItems.clear();
		}
	}
	
	function navigateToPath(index: number) {
		const parts = pathParts.slice(0, index + 1);
		currentPath = '/' + parts.join('/') + (parts.length > 0 ? '/' : '');
		selectedItems.clear();
	}
	
	function toggleItemSelection(item: any) {
		if (selectedItems.has(item.id)) {
			selectedItems.delete(item.id);
		} else {
			selectedItems.add(item.id);
		}
		selectedItems = selectedItems;
	}
	
	function selectAll() {
		if (selectedItems.size === filteredFiles.length) {
			selectedItems.clear();
		} else {
			filteredFiles.forEach(file => selectedItems.add(file.id));
		}
		selectedItems = selectedItems;
	}
	
	// Modal functions
	function openCreateBucketModal() {
		newBucket = { name: '', public: false };
		showCreateBucketModal = true;
	}
	
	function closeCreateBucketModal() {
		showCreateBucketModal = false;
	}
	
	async function createBucket() {
		if (!newBucket.name) {
			alert('Bucket name is required');
			return;
		}
		
		try {
			await api.post('/storage/buckets', newBucket);
			await fetchBuckets(); // Refresh bucket list
			closeCreateBucketModal();
		} catch (error) {
			console.error('Failed to create bucket:', error);
			alert('Failed to create bucket');
		}
	}
	
	function openCreateFolderModal() {
		newFolder = { name: '' };
		showCreateFolderModal = true;
	}
	
	function closeCreateFolderModal() {
		showCreateFolderModal = false;
	}
	
	function createFolder() {
		console.log('Creating folder:', newFolder);
		closeCreateFolderModal();
	}
	
	function openUploadModal() {
		showUploadModal = true;
	}
	
	function closeUploadModal() {
		showUploadModal = false;
	}
	
	function handleFileDrop(e: DragEvent) {
		e.preventDefault();
		const files = e.dataTransfer?.files;
		if (files) {
			console.log('Files dropped:', files);
		}
	}
	
	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const files = input.files;
		if (files) {
			console.log('Files selected:', files);
		}
	}
	
	function openDeleteModal(item: any) {
		itemToDelete = item;
		showDeleteModal = true;
	}
	
	function closeDeleteModal() {
		showDeleteModal = false;
		itemToDelete = null;
	}
	
	function deleteItem() {
		console.log('Deleting:', itemToDelete);
		closeDeleteModal();
	}
	
	function downloadFile(file: any) {
		console.log('Downloading:', file);
	}
	
	function previewFile(file: any) {
		console.log('Previewing:', file);
	}
	
	function copyFile(file: any) {
		console.log('Copying:', file);
	}
	
	function moveFile(file: any) {
		console.log('Moving:', file);
	}
	
	async function fetchBuckets() {
		try {
			const response = await api.get('/storage/buckets');
			// Handle both array response and error response
			if (Array.isArray(response)) {
				buckets = response;
			} else if (response && response.error) {
				console.error('API error:', response.error);
				buckets = [];
			} else {
				buckets = [];
			}
			totalBuckets = buckets.length;
			
			// Calculate total files and storage
			let filesCount = 0;
			let storageUsed = 0;
			buckets.forEach(bucket => {
				filesCount += bucket.files || 0;
				storageUsed += bucket.size_bytes || 0;
			});
			totalFiles = filesCount;
			usedStorage = formatBytes(storageUsed);
			
			// Select first bucket if available
			if (buckets.length > 0) {
				selectBucket(buckets[0]);
			}
		} catch (error) {
			console.error('Failed to fetch buckets:', error);
			buckets = [];
		}
	}
	
	async function fetchBucketObjects(bucketName: string) {
		try {
			const response = await api.get(`/storage/buckets/${bucketName}/objects`);
			files = response || [];
		} catch (error) {
			console.error('Failed to fetch bucket objects:', error);
			files = [];
		}
	}
	
	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
	
	onMount(async () => {
		// Load initial data
		await fetchBuckets();
	});
</script>

<div class="page-header">
	<div class="breadcrumb">
		<a href="/">Home</a>
		<span class="breadcrumb-separator">›</span>
		<span>Storage</span>
	</div>
</div>

<div class="page-content">
	<!-- Stats Cards -->
	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-header">
				<HardDrive size={20} style="color: var(--text-muted)" />
			</div>
			<div class="stat-label">TOTAL STORAGE</div>
			<div class="stat-value">{totalStorage}</div>
			<div class="stat-description">Allocated space</div>
		</div>
		
		<div class="stat-card">
			<div class="stat-header">
				<HardDrive size={20} style="color: var(--primary-color)" />
			</div>
			<div class="stat-label">USED STORAGE</div>
			<div class="stat-value" style="color: var(--primary-color)">{usedStorage}</div>
			<div class="stat-description">Current usage</div>
		</div>
		
		<div class="stat-card">
			<div class="stat-header">
				<File size={20} style="color: var(--success-color)" />
			</div>
			<div class="stat-label">TOTAL FILES</div>
			<div class="stat-value">{totalFiles.toLocaleString()}</div>
			<div class="stat-description">Across all buckets</div>
		</div>
		
		<div class="stat-card">
			<div class="stat-header">
				<Folder size={20} style="color: var(--warning-color)" />
			</div>
			<div class="stat-label">BUCKETS</div>
			<div class="stat-value">{totalBuckets}</div>
			<div class="stat-description">Storage containers</div>
		</div>
	</div>
	
	<div class="storage-layout">
		<!-- Buckets Sidebar -->
		<div class="buckets-sidebar">
			<div class="sidebar-header">
				<h3 class="sidebar-title">Buckets</h3>
				<button class="btn-icon-sm" on:click={openCreateBucketModal} title="Create bucket">
					<Plus size={16} />
				</button>
			</div>
			
			<div class="buckets-list">
				{#each buckets as bucket}
					<button 
						class="bucket-item {selectedBucket?.id === bucket.id ? 'active' : ''}"
						on:click={() => selectBucket(bucket)}
					>
						<Folder size={18} style="color: var(--warning-color)" />
						<div class="bucket-info">
							<div class="bucket-name">{bucket.name}</div>
							<div class="bucket-meta">
								{bucket.files} files • {bucket.size}
							</div>
						</div>
						{#if bucket.public}
							<span class="bucket-badge">Public</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
		
		<!-- Files Area -->
		<div class="files-area">
			{#if selectedBucket}
				<!-- Files Header -->
				<div class="files-header">
					<div class="files-breadcrumb">
						<button class="breadcrumb-item" on:click={() => currentPath = '/'}>
							<Folder size={16} />
							{selectedBucket.name}
						</button>
						{#each pathParts as part, i}
							<ChevronRight size={16} style="color: var(--text-muted)" />
							<button class="breadcrumb-item" on:click={() => navigateToPath(i)}>
								{part}
							</button>
						{/each}
					</div>
					
					<div class="files-actions">
						<div class="search-input" style="width: 250px;">
							<Search size={16} class="search-input-icon" />
							<input 
								type="text" 
								class="form-input" 
								placeholder="Search files..."
								bind:value={searchQuery}
							/>
						</div>
						
						<div class="view-toggles">
							<button 
								class="btn-icon-sm {viewMode === 'grid' ? 'active' : ''}"
								on:click={() => viewMode = 'grid'}
								title="Grid view"
							>
								<Grid size={16} />
							</button>
							<button 
								class="btn-icon-sm {viewMode === 'list' ? 'active' : ''}"
								on:click={() => viewMode = 'list'}
								title="List view"
							>
								<List size={16} />
							</button>
						</div>
						
						<button class="btn btn-secondary btn-sm" on:click={openCreateFolderModal}>
							<FolderPlus size={16} />
							New Folder
						</button>
						
						<button class="btn btn-primary btn-sm" on:click={openUploadModal}>
							<Upload size={16} />
							Upload
						</button>
					</div>
				</div>
				
				<!-- Selection Bar -->
				{#if selectedItems.size > 0}
					<div class="selection-bar">
						<div class="selection-info">
							<Check size={16} />
							{selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
						</div>
						<div class="selection-actions">
							<button class="btn btn-secondary btn-sm">
								<Download size={14} />
								Download
							</button>
							<button class="btn btn-secondary btn-sm">
								<Copy size={14} />
								Copy
							</button>
							<button class="btn btn-secondary btn-sm">
								<Move size={14} />
								Move
							</button>
							<button class="btn btn-danger btn-sm">
								<Trash2 size={14} />
								Delete
							</button>
							<button class="btn-text" on:click={() => selectedItems.clear()}>
								Clear selection
							</button>
						</div>
					</div>
				{/if}
				
				<!-- Files Display -->
				{#if viewMode === 'grid'}
					<div class="files-grid">
						{#each filteredFiles as file}
							<div 
								class="file-card {selectedItems.has(file.id) ? 'selected' : ''}"
								on:dblclick={() => navigateToFolder(file)}
							>
								<div class="file-card-checkbox">
									<input 
										type="checkbox" 
										checked={selectedItems.has(file.id)}
										on:change={() => toggleItemSelection(file)}
									/>
								</div>
								
								<div class="file-card-icon">
									<svelte:component 
										this={getFileIcon(file.type)} 
										size={48} 
										style="color: {getFileIconColor(file.type)}"
									/>
								</div>
								
								<div class="file-card-name">{file.name}</div>
								<div class="file-card-meta">
									{file.type === 'folder' ? `${file.items} items` : file.size}
								</div>
								
								<div class="file-card-actions">
									{#if file.type !== 'folder'}
										<button class="btn-icon-xs" on:click={() => previewFile(file)} title="Preview">
											<Eye size={14} />
										</button>
										<button class="btn-icon-xs" on:click={() => downloadFile(file)} title="Download">
											<Download size={14} />
										</button>
									{/if}
									<button class="btn-icon-xs" on:click={() => openDeleteModal(file)} title="Delete">
										<Trash2 size={14} />
									</button>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="files-list">
						<table class="table">
							<thead>
								<tr>
									<th style="width: 40px;">
										<input 
											type="checkbox" 
											checked={selectedItems.size === filteredFiles.length && filteredFiles.length > 0}
											on:change={selectAll}
										/>
									</th>
									<th>Name</th>
									<th style="width: 100px;">Size</th>
									<th style="width: 150px;">Modified</th>
									<th style="width: 100px;">Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each filteredFiles as file}
									<tr 
										class="{selectedItems.has(file.id) ? 'selected' : ''}"
										on:dblclick={() => navigateToFolder(file)}
									>
										<td>
											<input 
												type="checkbox" 
												checked={selectedItems.has(file.id)}
												on:change={() => toggleItemSelection(file)}
											/>
										</td>
										<td>
											<div class="file-name">
												<svelte:component 
													this={getFileIcon(file.type)} 
													size={20} 
													style="color: {getFileIconColor(file.type)}"
												/>
												{file.name}
												{#if file.public}
													<span class="badge badge-success">Public</span>
												{/if}
											</div>
										</td>
										<td class="text-muted">
											{file.type === 'folder' ? `${file.items} items` : file.size}
										</td>
										<td class="text-muted">{file.modified}</td>
										<td>
											<div class="action-buttons">
												{#if file.type !== 'folder'}
													<button class="btn-icon-sm" on:click={() => previewFile(file)} title="Preview">
														<Eye size={14} />
													</button>
													<button class="btn-icon-sm" on:click={() => downloadFile(file)} title="Download">
														<Download size={14} />
													</button>
												{/if}
												<button class="btn-icon-sm" on:click={() => openDeleteModal(file)} title="Delete">
													<Trash2 size={14} />
												</button>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			{:else}
				<div class="no-bucket-selected">
					<Folder size={48} style="color: var(--text-muted)" />
					<p>Select a bucket to view files</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Create Bucket Modal -->
{#if showCreateBucketModal}
	<div class="modal-overlay" on:click={closeCreateBucketModal}>
		<div class="modal modal-sm" on:click|stopPropagation>
			<div class="modal-header">
				<h3 class="modal-title">Create Bucket</h3>
				<button class="modal-close" on:click={closeCreateBucketModal}>
					<X size={20} />
				</button>
			</div>
			
			<div class="modal-body">
				<div class="form-group">
					<label class="form-label">Bucket Name</label>
					<input 
						type="text" 
						class="form-input" 
						bind:value={newBucket.name}
						placeholder="my-bucket"
					/>
					<small class="form-hint">Use lowercase letters, numbers, and hyphens</small>
				</div>
				
				<div class="form-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={newBucket.public} />
						Public Access
					</label>
					<small class="form-hint">Allow public read access to files in this bucket</small>
				</div>
			</div>
			
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={closeCreateBucketModal}>Cancel</button>
				<button class="btn btn-primary" on:click={createBucket}>Create Bucket</button>
			</div>
		</div>
	</div>
{/if}

<!-- Create Folder Modal -->
{#if showCreateFolderModal}
	<div class="modal-overlay" on:click={closeCreateFolderModal}>
		<div class="modal modal-sm" on:click|stopPropagation>
			<div class="modal-header">
				<h3 class="modal-title">Create Folder</h3>
				<button class="modal-close" on:click={closeCreateFolderModal}>
					<X size={20} />
				</button>
			</div>
			
			<div class="modal-body">
				<div class="form-group">
					<label class="form-label">Folder Name</label>
					<input 
						type="text" 
						class="form-input" 
						bind:value={newFolder.name}
						placeholder="New Folder"
					/>
				</div>
			</div>
			
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={closeCreateFolderModal}>Cancel</button>
				<button class="btn btn-primary" on:click={createFolder}>Create Folder</button>
			</div>
		</div>
	</div>
{/if}

<!-- Upload Modal -->
{#if showUploadModal}
	<div class="modal-overlay" on:click={closeUploadModal}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h3 class="modal-title">Upload Files</h3>
				<button class="modal-close" on:click={closeUploadModal}>
					<X size={20} />
				</button>
			</div>
			
			<div class="modal-body">
				<div 
					class="upload-zone"
					on:drop={handleFileDrop}
					on:dragover|preventDefault
				>
					<Upload size={48} style="color: var(--text-muted)" />
					<p class="upload-text">Drag and drop files here or click to browse</p>
					<input 
						type="file" 
						multiple 
						class="upload-input"
						on:change={handleFileSelect}
					/>
					<button class="btn btn-primary">Browse Files</button>
				</div>
				
				<div class="upload-info">
					<p class="text-muted">Maximum file size: 100MB</p>
					<p class="text-muted">Supported formats: All file types</p>
				</div>
			</div>
			
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={closeUploadModal}>Cancel</button>
			</div>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
	<div class="modal-overlay" on:click={closeDeleteModal}>
		<div class="modal modal-sm" on:click|stopPropagation>
			<div class="modal-header">
				<h3 class="modal-title">Delete {itemToDelete?.type === 'folder' ? 'Folder' : 'File'}</h3>
				<button class="modal-close" on:click={closeDeleteModal}>
					<X size={20} />
				</button>
			</div>
			
			<div class="modal-body">
				<p>Are you sure you want to delete this {itemToDelete?.type === 'folder' ? 'folder' : 'file'}?</p>
				<p class="text-muted">{itemToDelete?.name}</p>
				{#if itemToDelete?.type === 'folder'}
					<p class="text-danger">This will delete all files and folders inside.</p>
				{/if}
				<p class="text-danger">This action cannot be undone.</p>
			</div>
			
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={closeDeleteModal}>Cancel</button>
				<button class="btn btn-danger" on:click={deleteItem}>Delete</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.storage-layout {
		display: grid;
		grid-template-columns: 280px 1fr;
		gap: 1.5rem;
		margin-top: 1.5rem;
	}
	
	/* Buckets Sidebar */
	.buckets-sidebar {
		background: white;
		border-radius: 8px;
		border: 1px solid var(--border-color);
		height: fit-content;
	}
	
	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid var(--border-color);
	}
	
	.sidebar-title {
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-muted);
		letter-spacing: 0.5px;
	}
	
	.buckets-list {
		padding: 0.5rem;
	}
	
	.bucket-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem;
		border: none;
		background: none;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}
	
	.bucket-item:hover {
		background: var(--bg-hover);
	}
	
	.bucket-item.active {
		background: var(--primary-color);
		color: white;
	}
	
	.bucket-info {
		flex: 1;
		min-width: 0;
	}
	
	.bucket-name {
		font-size: 0.875rem;
		font-weight: 500;
	}
	
	.bucket-meta {
		font-size: 0.75rem;
		opacity: 0.7;
		margin-top: 0.125rem;
	}
	
	.bucket-badge {
		padding: 0.125rem 0.375rem;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		font-size: 0.625rem;
		font-weight: 500;
		text-transform: uppercase;
	}
	
	.bucket-item:not(.active) .bucket-badge {
		background: var(--success-color);
		color: white;
	}
	
	/* Files Area */
	.files-area {
		background: white;
		border-radius: 8px;
		border: 1px solid var(--border-color);
		min-height: 600px;
	}
	
	.files-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid var(--border-color);
	}
	
	.files-breadcrumb {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.breadcrumb-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
		border: none;
		background: none;
		color: var(--text-secondary);
		font-size: 0.875rem;
		cursor: pointer;
		border-radius: 4px;
		transition: all 0.2s;
	}
	
	.breadcrumb-item:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
	}
	
	.files-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	
	.view-toggles {
		display: flex;
		gap: 0.25rem;
		padding: 0.25rem;
		background: var(--bg-secondary);
		border-radius: 6px;
	}
	
	.btn-icon-sm.active {
		background: white;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}
	
	/* Selection Bar */
	.selection-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: var(--info-color);
		color: white;
	}
	
	.selection-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
	}
	
	.selection-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.btn-text {
		border: none;
		background: none;
		color: white;
		font-size: 0.875rem;
		cursor: pointer;
		text-decoration: underline;
		opacity: 0.9;
	}
	
	.btn-text:hover {
		opacity: 1;
	}
	
	/* Grid View */
	.files-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
		padding: 1rem;
	}
	
	.file-card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.file-card:hover {
		background: var(--bg-hover);
		border-color: var(--primary-color);
	}
	
	.file-card.selected {
		background: rgba(14, 165, 233, 0.1);
		border-color: var(--primary-color);
	}
	
	.file-card-checkbox {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		opacity: 0;
		transition: opacity 0.2s;
	}
	
	.file-card:hover .file-card-checkbox,
	.file-card.selected .file-card-checkbox {
		opacity: 1;
	}
	
	.file-card-icon {
		margin-bottom: 0.75rem;
	}
	
	.file-card-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary);
		text-align: center;
		word-break: break-word;
		margin-bottom: 0.25rem;
	}
	
	.file-card-meta {
		font-size: 0.75rem;
		color: var(--text-muted);
	}
	
	.file-card-actions {
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
		display: flex;
		gap: 0.25rem;
		opacity: 0;
		transition: opacity 0.2s;
	}
	
	.file-card:hover .file-card-actions {
		opacity: 1;
	}
	
	.btn-icon-xs {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		background: white;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.btn-icon-xs:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
	}
	
	/* List View */
	.files-list {
		padding: 0;
	}
	
	.files-list .table {
		margin: 0;
	}
	
	.files-list tbody tr.selected {
		background: rgba(14, 165, 233, 0.1);
	}
	
	.file-name {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	/* No Bucket Selected */
	.no-bucket-selected {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 400px;
		color: var(--text-muted);
	}
	
	.no-bucket-selected p {
		margin-top: 1rem;
		font-size: 0.875rem;
	}
	
	/* Upload Zone */
	.upload-zone {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		border: 2px dashed var(--border-color);
		border-radius: 8px;
		background: var(--bg-secondary);
		text-align: center;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.upload-zone:hover {
		border-color: var(--primary-color);
		background: rgba(14, 165, 233, 0.05);
	}
	
	.upload-text {
		margin: 1rem 0;
		color: var(--text-secondary);
	}
	
	.upload-input {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
	}
	
	.upload-info {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border-color);
	}
	
	.upload-info p {
		margin: 0.25rem 0;
		font-size: 0.875rem;
	}
	
	/* Modal Styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
	}
	
	.modal {
		background: white;
		border-radius: 8px;
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow: auto;
	}
	
	.modal-sm {
		max-width: 400px;
	}
	
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid var(--border-color);
	}
	
	.modal-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-primary);
	}
	
	.modal-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background: none;
		color: var(--text-muted);
		cursor: pointer;
		border-radius: 4px;
		transition: all 0.2s;
	}
	
	.modal-close:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
	}
	
	.modal-body {
		padding: 1.5rem;
	}
	
	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid var(--border-color);
	}
	
	.form-hint {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.75rem;
		color: var(--text-muted);
	}
	
	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--text-primary);
		cursor: pointer;
	}
	
	.text-danger {
		color: var(--danger-color);
	}
	
	.text-muted {
		color: var(--text-muted);
		font-size: 0.875rem;
	}
	
	.btn-icon-sm {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		background: white;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.btn-icon-sm:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
	}
	
	.action-buttons {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
</style>
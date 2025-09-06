<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { 
		Home, ChevronRight, Edit, Share2, Plus, 
		MoreHorizontal, Trash, Folder, File, Image 
	} from 'lucide-svelte';
	import NewItemModal from './NewItemModal.svelte';
	import EditItemModal from './EditItemModal.svelte';
	import AuthenticatedImage from './AuthenticatedImage.svelte';
	import type { StorageItem } from '$lib/types/storage';
	
	const dispatch = createEventDispatcher();
	
	export let items: StorageItem[] = [];
	export let currentPath: string[] = ['Home'];
	export let onNavigate: (path: string[]) => void = () => {};
	export let onEdit: (item: StorageItem) => void = () => {};
	export let onDelete: (item: StorageItem) => void = () => {};
	export let onShare: (item: StorageItem) => void = () => {};
	
	let showNewModal = false;
	let showEditModal = false;
	let editingItem: StorageItem | null = null;
	let activeDropdown: string | null = null;
	
	// Separate items by type
	$: mediaItems = items.filter(item => item.type === 'file' && isImageFile(item.name));
	$: fileItems = items.filter(item => item.type === 'file' && !isImageFile(item.name));
	$: folderItems = items.filter(item => item.type === 'folder');
	
	function isImageFile(name: string): boolean {
		const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp'];
		return imageExtensions.some(ext => name.toLowerCase().endsWith(ext));
	}
	
	function handleBreadcrumbClick(index: number) {
		const newPath = currentPath.slice(0, index + 1);
		onNavigate(newPath);
	}
	
	function toggleDropdown(itemId: string) {
		activeDropdown = activeDropdown === itemId ? null : itemId;
	}
	
	function handleEdit(item: StorageItem) {
		editingItem = item;
		showEditModal = true;
		activeDropdown = null;
	}
	
	function handleDelete(item: StorageItem) {
		if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
			onDelete(item);
		}
		activeDropdown = null;
	}
	
	function handleNewItem(event: CustomEvent<{ type: 'file' | 'folder'; name?: string; files?: FileList }>) {
		// Pass the entire event up to the parent
		dispatch('new', event.detail);
		showNewModal = false;
	}
	
	function handleUpdateItem(event: CustomEvent<StorageItem>) {
		onEdit(event.detail);
		showEditModal = false;
		editingItem = null;
	}
	
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.dropdown-container')) {
			activeDropdown = null;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="file-explorer">
	<!-- Header with breadcrumbs and actions -->
	<div class="explorer-header">
		<div class="breadcrumbs">
			{#each currentPath as segment, i}
				<button 
					class="breadcrumb-item"
					on:click={() => handleBreadcrumbClick(i)}
				>
					{#if i === 0}
						<Home size={16} />
					{/if}
					<span>{segment}</span>
				</button>
				{#if i < currentPath.length - 1}
					<ChevronRight size={16} class="breadcrumb-separator" />
				{/if}
			{/each}
		</div>
		
		<div class="header-actions">
			<button class="action-btn" title="Edit">
				<Edit size={18} />
				<span>EDIT</span>
			</button>
			<button class="action-btn" title="Share">
				<Share2 size={18} />
				<span>SHARE</span>
			</button>
			<button class="action-btn primary" on:click={() => showNewModal = true} title="New">
				<Plus size={18} />
				<span>NEW</span>
			</button>
		</div>
	</div>
	
	<!-- Media Section -->
	{#if mediaItems.length > 0}
		<div class="section">
			<h3 class="section-title">Media</h3>
			<div class="media-grid">
				{#each mediaItems as item}
					<div class="media-item">
						<AuthenticatedImage 
							src={item.downloadUrl || `/api/storage/buckets/int_storage/objects/${item.id}/download`} 
							alt={item.name}
							loading="lazy"
							className="media-image"
						/>
						<div class="media-overlay">
							<button 
								class="item-menu-btn"
								on:click|stopPropagation={() => toggleDropdown(item.id)}
							>
								<MoreHorizontal size={16} />
							</button>
							{#if activeDropdown === item.id}
								<div class="dropdown-menu dropdown-container">
									<button on:click={() => handleEdit(item)}>
										<Edit size={14} />
										<span>Edit</span>
									</button>
									<button on:click={() => handleDelete(item)} class="danger">
										<Trash size={14} />
										<span>Delete</span>
									</button>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
	
	<!-- Files Section -->
	{#if fileItems.length > 0}
		<div class="section">
			<h3 class="section-title">Files</h3>
			<div class="items-list">
				{#each fileItems as item}
					<div class="list-item">
						<div class="item-info">
							<span class="item-icon">{item.icon || '📄'}</span>
							<span class="item-name">{item.name}</span>
						</div>
						<div class="item-actions dropdown-container">
							<button 
								class="item-menu-btn"
								on:click|stopPropagation={() => toggleDropdown(item.id)}
							>
								<MoreHorizontal size={18} />
							</button>
							{#if activeDropdown === item.id}
								<div class="dropdown-menu">
									<button on:click={() => handleEdit(item)}>
										<Edit size={14} />
										<span>Edit</span>
									</button>
									<button on:click={() => handleDelete(item)} class="danger">
										<Trash size={14} />
										<span>Delete</span>
									</button>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
	
	<!-- Folders Section -->
	{#if folderItems.length > 0}
		<div class="section">
			<h3 class="section-title">Folders</h3>
			<div class="items-list">
				{#each folderItems as item}
					<div class="list-item" on:dblclick={() => onNavigate([...currentPath, item.name])}>
						<div class="item-info">
							<span class="item-icon">{item.icon || '📁'}</span>
							<span class="item-name">{item.name}</span>
						</div>
						<div class="item-actions dropdown-container">
							<button 
								class="item-menu-btn"
								on:click|stopPropagation={() => toggleDropdown(item.id)}
							>
								<MoreHorizontal size={18} />
							</button>
							{#if activeDropdown === item.id}
								<div class="dropdown-menu">
									<button on:click={() => handleEdit(item)}>
										<Edit size={14} />
										<span>Edit</span>
									</button>
									<button on:click={() => handleDelete(item)} class="danger">
										<Trash size={14} />
										<span>Delete</span>
									</button>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
	
	<!-- Empty state -->
	{#if items.length === 0}
		<div class="empty-state">
			<Folder size={48} />
			<p>This folder is empty</p>
			<button class="action-btn primary" on:click={() => showNewModal = true}>
				<Plus size={18} />
				<span>Add files or folders</span>
			</button>
		</div>
	{/if}
</div>

<!-- Modals -->
<NewItemModal bind:open={showNewModal} on:create={handleNewItem} />
{#if editingItem}
	<EditItemModal 
		bind:open={showEditModal} 
		item={editingItem}
		on:update={handleUpdateItem}
	/>
{/if}

<style>
	.file-explorer {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 1.25rem;
		min-height: 100%;
	}
	
	@media (max-width: 768px) {
		.file-explorer {
			gap: 1rem;
			padding: 1rem;
		}
	}
	
	.explorer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
	}
	
	.breadcrumbs {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	
	.breadcrumb-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		transition: all 0.2s;
	}
	
	.breadcrumb-item:hover {
		background: var(--hover-bg);
		color: var(--text-primary);
	}
	
	.breadcrumb-item:last-child {
		color: var(--text-primary);
		font-weight: 500;
	}
	
	.breadcrumb-separator {
		color: var(--text-muted);
		opacity: 0.5;
	}
	
	.header-actions {
		display: flex;
		gap: 0.75rem;
	}
	
	.action-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: white;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		color: var(--text-primary);
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.875rem;
		font-weight: 500;
	}
	
	.action-btn:hover {
		background: var(--hover-bg);
		border-color: var(--primary-color);
	}
	
	.action-btn.primary {
		background: var(--primary-color);
		color: white;
		border-color: var(--primary-color);
	}
	
	.action-btn.primary:hover {
		background: var(--primary-hover);
		border-color: var(--primary-hover);
	}
	
	.section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.section-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}
	
	/* Media Grid */
	.media-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 0.75rem;
	}
	
	@media (min-width: 1200px) {
		.media-grid {
			grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		}
	}
	
	@media (max-width: 768px) {
		.media-grid {
			grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		}
	}
	
	.media-item {
		position: relative;
		aspect-ratio: 1;
		border-radius: 8px;
		overflow: hidden;
		background: var(--bg-secondary);
		cursor: pointer;
		transition: transform 0.2s;
	}
	
	.media-item:hover {
		transform: scale(1.02);
	}
	
	.media-item img,
	.media-item :global(.media-image) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.media-overlay {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
	}
	
	/* List Items - Grid layout on desktop */
	.items-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}
	
	@media (max-width: 768px) {
		.items-list {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}
	}
	
	.list-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.625rem 0.875rem;
		background: white;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		transition: all 0.2s;
		min-height: 56px;
		cursor: pointer;
	}
	
	.list-item:hover {
		background: var(--hover-bg);
		border-color: var(--primary-color);
	}
	
	.item-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		min-width: 0;
	}
	
	.item-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}
	
	.item-name {
		font-size: 0.875rem;
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.item-actions {
		position: relative;
	}
	
	.item-menu-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
		color: var(--text-muted);
	}
	
	.item-menu-btn:hover {
		background: var(--hover-bg);
		color: var(--text-primary);
	}
	
	.dropdown-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 0.5rem;
		background: white;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		min-width: 150px;
		padding: 0.5rem;
	}
	
	.dropdown-menu button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		background: none;
		border: none;
		border-radius: 4px;
		color: var(--text-primary);
		font-size: 0.875rem;
		cursor: pointer;
		text-align: left;
		transition: background 0.2s;
	}
	
	.dropdown-menu button:hover {
		background: var(--hover-bg);
	}
	
	.dropdown-menu button.danger {
		color: var(--danger-color);
	}
	
	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 4rem 2rem;
		color: var(--text-muted);
	}
	
	.empty-state p {
		font-size: 1.1rem;
		margin: 0;
	}
	
	/* CSS Variables */
	:global(:root) {
		--border-color: #e2e8f0;
		--hover-bg: #f7fafc;
		--bg-secondary: #f8f9fa;
		--danger-color: #e53e3e;
	}
</style>
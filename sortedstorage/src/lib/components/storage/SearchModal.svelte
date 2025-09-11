<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import storageAPI from '$lib/api/storage';
	import { goto } from '$app/navigation';
	import { Search, X, Folder, File, Clock } from 'lucide-svelte';
	import type { StorageItem } from '$lib/types/storage';
	import { isFolder, isFile } from '$lib/types/storage';
	
	export let open = false;
	
	const dispatch = createEventDispatcher();
	
	let searchInput: HTMLInputElement;
	let searchQuery = '';
	let searchResults: StorageItem[] = [];
	let loading = false;
	let debounceTimer: NodeJS.Timeout;
	
	// Focus input when modal opens
	$: if (open && searchInput) {
		setTimeout(() => searchInput?.focus(), 50);
	}
	
	// Clear search when modal closes
	$: if (!open) {
		searchQuery = '';
		searchResults = [];
	}
	
	// Debounced search
	$: if (searchQuery) {
		loading = true;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			performSearch();
		}, 300);
	} else {
		searchResults = [];
		loading = false;
	}
	
	async function performSearch() {
		if (!searchQuery.trim()) {
			searchResults = [];
			loading = false;
			return;
		}
		
		try {
			// Search for items matching the query
			const appId = 'sortedstorage'; // Or get from config/env
			const response = await fetch(`/api/storage/search?q=${encodeURIComponent(searchQuery)}&app_id=${appId}`, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
				}
			});
			
			if (response.ok) {
				const data = await response.json();
				searchResults = data.items || [];
			} else {
				searchResults = [];
			}
		} catch (error) {
			console.error('Search failed:', error);
			searchResults = [];
		} finally {
			loading = false;
		}
	}
	
	function handleResultClick(item: StorageItem) {
		if (isFolder(item)) {
			goto(`/folder/${item.id}`);
		} else {
			// For files, navigate to parent folder and highlight/preview the file
			if (item.parent_folder_id) {
				goto(`/folder/${item.parent_folder_id}`);
			} else {
				goto('/');
			}
		}
		closeModal();
	}
	
	function closeModal() {
		open = false;
		dispatch('close');
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}
	
	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
	});
	
	onDestroy(() => {
		window.removeEventListener('keydown', handleKeydown);
		clearTimeout(debounceTimer);
	});
	
	function formatPath(item: StorageItem) {
		// You could enhance this to show the full path
		return item.parent_folder_id ? 'In folder' : 'My Files';
	}
	
	function formatDate(date: string) {
		const d = new Date(date);
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		
		if (diffDays === 0) {
			return 'Today';
		} else if (diffDays === 1) {
			return 'Yesterday';
		} else if (diffDays < 7) {
			return `${diffDays} days ago`;
		} else {
			return d.toLocaleDateString();
		}
	}
</script>

{#if open}
	<div class="modal-overlay" on:click={closeModal}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="search-header">
				<div class="search-input-wrapper">
					<Search size={20} class="search-icon" />
					<input
						bind:this={searchInput}
						bind:value={searchQuery}
						type="text"
						placeholder="Search files and folders..."
						class="search-input"
					/>
					{#if searchQuery}
						<button 
							class="clear-button" 
							on:click={() => searchQuery = ''}
							aria-label="Clear search"
						>
							<X size={18} />
						</button>
					{/if}
				</div>
				<button class="close-modal-button" on:click={closeModal} aria-label="Close">
					<X size={24} />
				</button>
			</div>
			
			<div class="search-results">
				{#if loading}
					<div class="loading-state">
						<div class="spinner"></div>
						<p>Searching...</p>
					</div>
				{:else if searchQuery && searchResults.length === 0}
					<div class="empty-state">
						<Search size={48} />
						<p>No results found for "{searchQuery}"</p>
						<span>Try different keywords</span>
					</div>
				{:else if searchResults.length > 0}
					<div class="results-list">
						{#each searchResults as item}
							<button 
								class="result-item"
								on:click={() => handleResultClick(item)}
							>
								<div class="result-icon">
									{#if isFolder(item)}
										<Folder size={24} />
									{:else}
										<File size={24} />
									{/if}
								</div>
								<div class="result-info">
									<div class="result-name">{item.object_name}</div>
									<div class="result-meta">
										<span class="result-path">{formatPath(item)}</span>
										{#if item.updated_at}
											<span class="result-separator">•</span>
											<span class="result-date">
												<Clock size={12} />
												{formatDate(item.updated_at)}
											</span>
										{/if}
									</div>
								</div>
							</button>
						{/each}
					</div>
				{:else}
					<div class="empty-state initial">
						<Search size={48} />
						<p>Start typing to search</p>
						<span>Search across all your files and folders</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		z-index: 100;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 10vh;
	}
	
	.modal-content {
		background: white;
		border-radius: 16px;
		width: 90%;
		max-width: 600px;
		max-height: 70vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		overflow: hidden;
	}
	
	.search-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.search-input-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		position: relative;
		background: var(--bg-base, #f0f0f0);
		border-radius: 12px;
		padding: 0 1rem;
	}
	
	.search-icon {
		color: #6b7280;
		flex-shrink: 0;
	}
	
	.search-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		padding: 0.75rem;
		font-size: 1rem;
		color: #1f2937;
	}
	
	.search-input::placeholder {
		color: #9ca3af;
	}
	
	.clear-button {
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		padding: 0.25rem;
		border-radius: 4px;
		cursor: pointer;
		color: #6b7280;
		transition: all 0.2s;
	}
	
	.clear-button:hover {
		background: rgba(0, 0, 0, 0.05);
		color: #374151;
	}
	
	.close-modal-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 12px;
		background: transparent;
		border: none;
		cursor: pointer;
		color: #6b7280;
		transition: all 0.2s;
	}
	
	.close-modal-button:hover {
		background: var(--bg-base, #f0f0f0);
		color: #374151;
	}
	
	.search-results {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
	}
	
	.loading-state,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		color: #6b7280;
		text-align: center;
		gap: 1rem;
	}
	
	.empty-state.initial {
		color: #9ca3af;
	}
	
	.empty-state p {
		font-size: 1.125rem;
		font-weight: 500;
		color: #374151;
		margin: 0;
	}
	
	.empty-state span {
		font-size: 0.875rem;
		color: #6b7280;
	}
	
	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-tertiary, #f1e2dd);
		border-top-color: var(--color-primary, #f7ad00);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.results-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.result-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.875rem 1rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		width: 100%;
	}
	
	.result-item:hover {
		background: var(--bg-base, #f0f0f0);
		border-color: var(--color-primary, #f7ad00);
		transform: translateX(4px);
	}
	
	.result-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 8px;
		background: var(--color-tertiary, #f1e2dd);
		color: var(--color-primary, #f7ad00);
		flex-shrink: 0;
	}
	
	.result-info {
		flex: 1;
		min-width: 0;
	}
	
	.result-name {
		font-weight: 500;
		color: #1f2937;
		margin-bottom: 0.25rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.result-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: #6b7280;
	}
	
	.result-path {
		color: var(--color-accent, #a16d5b);
	}
	
	.result-separator {
		opacity: 0.5;
	}
	
	.result-date {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	
	/* Dark mode */
	:global(.dark) .modal-content {
		background: #1f2937;
	}
	
	:global(.dark) .search-header {
		border-bottom-color: #374151;
	}
	
	:global(.dark) .search-input-wrapper {
		background: #111827;
	}
	
	:global(.dark) .search-input {
		color: #f3f4f6;
	}
	
	:global(.dark) .clear-button:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #d1d5db;
	}
	
	:global(.dark) .close-modal-button:hover {
		background: #111827;
		color: #d1d5db;
	}
	
	:global(.dark) .result-item {
		background: #1f2937;
		border-color: #374151;
	}
	
	:global(.dark) .result-item:hover {
		background: #111827;
	}
	
	:global(.dark) .result-name {
		color: #f3f4f6;
	}
	
	:global(.dark) .empty-state p {
		color: #d1d5db;
	}
	
	/* Mobile adjustments */
	@media (max-width: 640px) {
		.modal-overlay {
			padding-top: 5vh;
		}
		
		.modal-content {
			width: 95%;
			max-height: 80vh;
		}
		
		.search-header {
			padding: 1rem;
		}
		
		.search-input {
			font-size: 0.9375rem;
		}
		
		.result-item {
			padding: 0.75rem;
		}
		
		.result-icon {
			width: 36px;
			height: 36px;
		}
	}
</style>
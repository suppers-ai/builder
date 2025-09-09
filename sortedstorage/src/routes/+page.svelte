<script lang="ts">
	import { Search, Menu } from 'lucide-svelte';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getAuthLoginUrl } from '$lib/config/auth';
	
	// File explorer imports
	import FilePreview from '$lib/components/storage/FilePreview.svelte';
	import SearchModal from '$lib/components/storage/SearchModal.svelte';
	import SlideMenu from '$lib/components/common/SlideMenu.svelte';
	import { storageAPI } from '$lib/api/storage';
	import { notifications } from '$lib/stores/notifications';
	import type { StorageItem } from '$lib/types/storage';
	
	let loading = true;
	let menuOpen = false;
	let showSearch = false;
	
	// Recently viewed state
	let recentlyViewed: StorageItem[] = [];
	let loadingRecent = false;
	let showAllRecent = false;
	let showPreview = false;
	let selectedFile: StorageItem | null = null;
	let myFilesFolderId: string | null = null;
	
	onMount(async () => {
		// Wait for auth check to complete
		await auth.checkAuth();
		
		if (!$auth.user) {
			// Not authenticated, redirect to login with return URL
			window.location.href = getAuthLoginUrl('/');
			return;
		}
		
		// User is authenticated, get their My Files folder ID for navigation
		try {
			const response = await fetch('/api/storage/my-files', {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
				}
			});
			
			if (response.ok) {
				const data = await response.json();
				myFilesFolderId = data.folder_id;
			}
		} catch (error) {
			console.error('Failed to get My Files folder:', error);
		}
		
		// Load recently viewed items to show on homepage
		await loadRecentlyViewed();
		loading = false;
	});
	
	async function loadRecentlyViewed() {
		loadingRecent = true;
		try {
			const response = await fetch('/api/storage/recently-viewed?limit=30', {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
				}
			});
			
			if (response.ok) {
				recentlyViewed = await response.json();
			}
		} catch (error) {
			console.error('Failed to load recently viewed:', error);
		} finally {
			loadingRecent = false;
		}
	}
	
	async function handleRecentItemClick(item: StorageItem) {
		if (item.type === 'folder') {
			// Navigate to the folder
			goto(`/folder/${item.id}`);
		} else {
			// Show preview and update last viewed
			selectedFile = item;
			showPreview = true;
			
			// Update last viewed timestamp
			try {
				await fetch(`/api/storage/items/${item.id}/last-viewed`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
					}
				});
				// Reload recently viewed
				loadRecentlyViewed();
			} catch (error) {
				console.error('Failed to update last viewed:', error);
			}
		}
	}
	
	function formatTimeAgo(date: string | Date): string {
		const now = new Date();
		const then = new Date(date);
		const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
		
		if (seconds < 60) return 'just now';
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
		if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
		if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
		return then.toLocaleDateString();
	}
</script>

{#if loading}
	<!-- Don't show anything while checking auth, let layout handle the spinner -->
{:else if $auth.user}
	<!-- Authenticated user - show dashboard -->
	<div class="home-container">
		<!-- Common Slide Menu -->
		<SlideMenu bind:open={menuOpen} />
		
		<!-- Floating Menu Button -->
		<button 
			class="floating-menu-btn" 
			on:click={() => menuOpen = !menuOpen}
			aria-label="Menu"
		>
			<Menu size={24} />
		</button>
		
		<div class="dashboard-card">
			<!-- Header with logo and search -->
			<div class="dashboard-header">
				<img src="/logos/short.svg" alt="SortedStorage" class="dashboard-logo" />
				<button class="search-bar" on:click={() => showSearch = true}>
					<Search size={18} />
					<span>Search files...</span>
				</button>
			</div>
			
			<!-- Welcome section -->
			<div class="welcome-section">
				<h1 class="welcome-title">Welcome back!</h1>
				<p class="welcome-subtitle">What would you like to do today?</p>
			</div>
			
			<!-- Quick Actions -->
			<div class="quick-actions">
				<button class="action-card" on:click={() => myFilesFolderId ? goto(`/folder/${myFilesFolderId}`) : goto('/')}>
					<div class="action-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
						</svg>
					</div>
					<div class="action-content">
						<h3 class="action-title">My Files</h3>
						<p class="action-description">Browse and manage your files</p>
					</div>
				</button>
				
				<button class="action-card" on:click={() => notifications.info('Coming soon!')}>
					<div class="action-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
							<circle cx="8.5" cy="7" r="4"></circle>
							<line x1="20" y1="8" x2="20" y2="14"></line>
							<line x1="23" y1="11" x2="17" y2="11"></line>
						</svg>
					</div>
					<div class="action-content">
						<h3 class="action-title">Shared with Me</h3>
						<p class="action-description">Files others have shared</p>
					</div>
					<span class="coming-soon-badge">Coming Soon</span>
				</button>
			</div>
			
			<!-- Recently Viewed Section -->
			<div class="recent-section">
				<div class="recent-header">
					<h2 class="recent-title">Recently Viewed</h2>
					{#if recentlyViewed.length > 10 && !showAllRecent}
						<button class="show-more-btn" on:click={() => showAllRecent = true}>
							Show all {recentlyViewed.length}
						</button>
					{:else if showAllRecent}
						<button class="show-more-btn" on:click={() => showAllRecent = false}>
							Show less
						</button>
					{/if}
				</div>
				
				{#if loadingRecent}
					<div class="loading-state">
						<div class="spinner"></div>
						<p>Loading recently viewed...</p>
					</div>
				{:else if recentlyViewed.length === 0}
					<div class="empty-recent">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="10"></circle>
							<polyline points="12 6 12 12 16 14"></polyline>
						</svg>
						<p>No recently viewed items</p>
						<span>Files and folders you view will appear here</span>
					</div>
				{:else}
					<div class="recent-grid">
						{#each showAllRecent ? recentlyViewed : recentlyViewed.slice(0, 10) as item}
							<button 
								class="recent-item"
								on:click={() => handleRecentItemClick(item)}
							>
								<div class="recent-item-icon">
									{#if item.type === 'folder'}
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
										</svg>
									{:else if item.content_type?.startsWith('image/')}
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
											<circle cx="8.5" cy="8.5" r="1.5"></circle>
											<polyline points="21 15 16 10 5 21"></polyline>
										</svg>
									{:else}
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
											<polyline points="13 2 13 9 20 9"></polyline>
										</svg>
									{/if}
								</div>
								<span class="recent-item-name">{item.name}</span>
								<span class="recent-item-time">{formatTimeAgo(item.last_viewed)}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
		
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
		
		{#if showSearch}
			<SearchModal
				bind:open={showSearch}
				on:close={() => showSearch = false}
			/>
		{/if}
	</div>
{/if}

<style>
	/* Dashboard container */
	.home-container {
		min-height: 100vh;
		padding: 1rem;
		max-width: 1200px;
		margin: 0 auto;
	}
	
	/* Dashboard card */
	.dashboard-card {
		background: #ffffff;
		border-radius: 24px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		position: relative;
		min-height: calc(100vh - 4rem);
		padding: 2rem;
	}
	
	/* Floating Menu Button */
	.floating-menu-btn {
		position: fixed;
		top: 2rem;
		right: max(2rem, calc((100vw - 1200px) / 2 + 2rem));
		z-index: 45;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border-radius: 24px;
		background: #ffffff;
		cursor: pointer;
		transition: all 0.3s;
		color: var(--color-primary, #f7ad00);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		border: 2px solid var(--color-tertiary, #f1e2dd);
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
	
	
	/* Header with logo and search */
	.dashboard-header {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	.dashboard-logo {
		height: 48px;
		width: 48px;
		flex-shrink: 0;
	}
	
	.search-bar {
		flex: 1;
		max-width: 400px;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: var(--bg-base, #f0f0f0);
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;
		color: #6b7280;
		font-size: 0.9375rem;
	}
	
	.search-bar:hover {
		background: white;
		border-color: var(--color-primary, #f7ad00);
		color: #374151;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}
	
	.search-bar:focus {
		outline: none;
		border-color: var(--color-primary, #f7ad00);
		box-shadow: 0 0 0 3px rgba(247, 173, 0, 0.1);
	}
	
	/* Welcome section */
	.welcome-section {
		padding: 0;
		margin-bottom: 2rem;
	}
	
	.welcome-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-primary, #f7ad00);
		margin: 2rem 0 0.5rem;
	}
	
	.welcome-subtitle {
		font-size: 1.125rem;
		color: #6b7280;
		margin: 0;
	}
	
	/* Quick Actions */
	.quick-actions {
		display: flex;
		flex-direction: row;
		gap: 1rem;
		margin-bottom: 2rem;
	}
	
	.action-card {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 1rem;
		background: var(--color-tertiary, #f1e2dd);
		border: 2px solid transparent;
		border-radius: 12px;
		padding: 1rem 1.5rem;
		cursor: pointer;
		transition: all 0.3s;
		position: relative;
		text-align: left;
	}
	
	.action-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
		border-color: var(--color-primary, #f7ad00);
	}
	
	.action-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: var(--color-secondary, #FBD680);
		border-radius: 10px;
		color: var(--color-primary, #f7ad00);
		flex-shrink: 0;
	}
	
	.action-content {
		flex: 1;
	}
	
	.action-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 0.25rem;
	}
	
	.action-description {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
	}
	
	.coming-soon-badge {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: var(--color-primary, #f7ad00);
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
	}
	
	/* Recently Viewed Section */
	.recent-section {
		background: #f9fafb;
		border-radius: 16px;
		margin: 0;
	}
	
	.recent-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}
	
	.recent-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0;
	}
	
	.show-more-btn {
		background: none;
		border: none;
		color: var(--color-primary, #f7ad00);
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.2s;
	}
	
	.show-more-btn:hover {
		opacity: 0.8;
	}
	
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
	}
	
	.empty-recent {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		text-align: center;
		color: #9ca3af;
	}
	
	.empty-recent p {
		font-weight: 500;
		color: #6b7280;
		margin: 1rem 0 0.5rem;
	}
	
	.empty-recent span {
		font-size: 0.875rem;
		color: #9ca3af;
	}
	
	.recent-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}
	
	.recent-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.recent-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border-color: var(--color-primary, #f7ad00);
	}
	
	.recent-item-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		margin-bottom: 0.5rem;
		color: var(--color-accent, #a16d5b);
	}
	
	.recent-item-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: #1f2937;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		width: 100%;
		margin-bottom: 0.25rem;
	}
	
	.recent-item-time {
		font-size: 0.75rem;
		color: #9ca3af;
	}
	
	/* Loading state spinner in recently viewed section */
	.loading-state .spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #e5e7eb;
		border-top-color: var(--color-primary, #f7ad00);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	/* Dark mode */
	:global(.dark) .dashboard-card {
		background: #1f2937;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
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
	
	:global(.dark) .search-bar {
		background: #111827;
		border-color: #374151;
		color: #9ca3af;
	}
	
	:global(.dark) .search-bar:hover {
		background: #1f2937;
		border-color: var(--color-secondary, #FBD680);
		color: #d1d5db;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}
	
	:global(.dark) .welcome-subtitle {
		color: #9ca3af;
	}
	
	:global(.dark) .action-card {
		background: #374151;
		border-color: transparent;
	}
	
	:global(.dark) .action-card:hover {
		border-color: var(--color-secondary, #FBD680);
	}
	
	:global(.dark) .action-title {
		color: #f9fafb;
	}
	
	:global(.dark) .action-description {
		color: #9ca3af;
	}
	
	:global(.dark) .recent-section {
		background: #1e293b;
	}
	
	:global(.dark) .recent-title {
		color: #f9fafb;
	}
	
	:global(.dark) .recent-item {
		background: #374151;
		border-color: #4b5563;
	}
	
	:global(.dark) .recent-item:hover {
		border-color: var(--color-secondary, #FBD680);
	}
	
	:global(.dark) .recent-item-name {
		color: #f9fafb;
	}
	
	:global(.dark) .empty-recent p {
		color: #d1d5db;
	}
	
	
	/* Mobile adjustments */
	@media (max-width: 640px) {
		.home-container {
			padding: 0.5rem;
		}
		
		.dashboard-card {
			border-radius: 16px;
			min-height: calc(100vh - 1rem);
			padding: 1.5rem;
		}
		
		.dashboard-header {
			padding: 1.5rem;
			padding-bottom: 0;
			gap: 0.875rem;
		}
		
		.dashboard-logo {
			height: 40px;
			width: 40px;
		}
		
		.floating-menu-btn {
			width: 44px;
			height: 44px;
			top: 1rem;
			right: 1rem;
		}
		
		.search-bar {
			padding: 0.625rem 0.875rem;
			font-size: 0.875rem;
		}
		
		.welcome-section {
			padding: 1.5rem 1rem 0;
			margin-bottom: 2rem;
		}
		
		.welcome-title {
			font-size: 1.5rem;
			margin: 1rem 0 0.5rem;
		}
		
		.welcome-subtitle {
			font-size: 1rem;
		}
		
		.quick-actions {
			gap: 0.75rem;
			margin-bottom: 1.5rem;
		}
		
		.action-card {
			padding: 0.875rem 1rem;
			border-radius: 10px;
		}
		
		.action-icon {
			width: 40px;
			height: 40px;
			border-radius: 8px;
		}
		
		.action-title {
			font-size: 1rem;
		}
		
		.action-description {
			font-size: 0.8125rem;
		}
		
		.coming-soon-badge {
			top: 0.75rem;
			right: 0.75rem;
			font-size: 0.625rem;
			padding: 0.125rem 0.5rem;
		}
		
		.recent-section {
			padding: 1rem;
			margin: 0 1rem 1.5rem;
			border-radius: 12px;
		}
		
		.recent-header {
			margin-bottom: 1rem;
		}
		
		.recent-title {
			font-size: 1.125rem;
		}
		
		.show-more-btn {
			font-size: 0.875rem;
		}
		
		.recent-grid {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}
		
		.recent-item {
			padding: 0.875rem;
			flex-direction: row;
			align-items: center;
			justify-content: flex-start;
			gap: 0.75rem;
		}
		
		.recent-item-icon {
			width: 36px;
			height: 36px;
			margin-bottom: 0;
			flex-shrink: 0;
		}
		
		.recent-item-name {
			flex: 1;
			text-align: left;
			margin-bottom: 0;
		}
		
		.recent-item-time {
			font-size: 0.6875rem;
			white-space: nowrap;
		}
		
		.empty-recent {
			padding: 2rem 1rem;
		}
		
		.empty-recent svg {
			width: 40px;
			height: 40px;
		}
		
		.empty-recent p {
			font-size: 0.9375rem;
		}
		
		.empty-recent span {
			font-size: 0.8125rem;
		}
		
	}
	
	/* Smaller mobile devices */
	@media (max-width: 375px) {
		.home-container {
			padding: 0.25rem;
		}
		
		.dashboard-card {
			border-radius: 12px;
			padding-top: 1rem;
		}
		
		.logo-section {
			padding: 1rem 0.75rem 0;
		}
		
		.dashboard-header {
			padding: 1rem;
			padding-bottom: 0;
			gap: 0.75rem;
			flex-direction: column;
			align-items: stretch;
		}
		
		.dashboard-logo {
			height: 32px;
			width: 32px;
			align-self: center;
		}
		
		.search-bar {
			max-width: 100%;
			padding: 0.5rem 0.75rem;
			font-size: 0.8125rem;
		}
		
		.welcome-section {
			padding: 1rem 0.75rem 0;
		}
		
		.welcome-title {
			font-size: 1.25rem;
		}
		
		.welcome-subtitle {
			font-size: 0.875rem;
		}
		
		.quick-actions {
			padding: 0 0.75rem;
		}
		
		.action-card {
			padding: 1.25rem;
			border-radius: 12px;
		}
		
		.action-icon {
			width: 44px;
			height: 44px;
		}
		
		.action-title {
			font-size: 1rem;
		}
		
		.recent-section {
			padding: 0.875rem;
			margin: 0 0.75rem 1rem;
		}
		
		.recent-item {
			padding: 0.75rem;
			border-radius: 8px;
		}
		
		.recent-item-icon {
			width: 32px;
			height: 32px;
		}
		
		.recent-item-name {
			font-size: 0.8125rem;
		}
	}
</style>
<script lang="ts">
	import { Menu, X, Home, Files, Share2, Settings, LogOut, Search } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { auth } from '$lib/stores/auth';
	import { notifications } from '$lib/stores/notifications';
	import SearchModal from '../storage/SearchModal.svelte';
	import { onMount } from 'svelte';
	
	export let open = false;
	export let showSearchInMenu = true;
	
	let showSearch = false;
	let rootFolders: any[] = [];
	
	onMount(async () => {
		// Get all root folders when component mounts
		if ($auth.user) {
			try {
				const response = await fetch('/api/storage/buckets/int_storage/objects?parent_folder_id=', {
					headers: {
						'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
					}
				});
				
				if (response.ok) {
					const objects = await response.json();
					// Filter to only get folders at the root level
					rootFolders = objects.filter(obj => 
						obj.content_type === 'application/x-directory' && 
						!obj.parent_folder_id
					);
				}
			} catch (error) {
				console.error('Failed to load root folders:', error);
			}
		}
	});
	
	$: menuItems = [
		{ title: 'Home', href: '/', icon: Home },
		// Add each root folder to the menu
		...rootFolders.map(folder => ({
			title: folder.name,
			href: `/folder/${folder.id}`,
			icon: Files
		})),
		{ title: 'Shared with Me', href: '#', icon: Share2, disabled: true }
	];
	
	function handleNavigation(href: string) {
		if (href !== '#') {
			goto(href);
		}
		open = false;
	}
	
	function handleLogout() {
		localStorage.removeItem('auth_token');
		auth.logout();
		goto('/');
	}
	
	function openSearchModal() {
		open = false;
		showSearch = true;
	}
	
	$: currentPath = $page.url.pathname;
</script>

{#if open}
	<div class="menu-overlay" on:click={() => open = false} transition:fade={{ duration: 200 }} />
	<nav class="slide-menu" transition:fly={{ x: -300, duration: 200 }}>
		<div class="menu-header">
			<img src="/logos/short.svg" alt="SortedStorage" class="menu-logo-short" />
			{#if showSearchInMenu}
				<button class="search-bar" on:click={openSearchModal}>
					<Search size={18} />
					<span>Search files...</span>
				</button>
			{/if}
			<button class="close-button" on:click={() => open = false} aria-label="Close menu">
				<X size={24} />
			</button>
		</div>
		
		<div class="menu-items">
			{#each menuItems as item}
				<button 
					class="menu-item"
					class:active={currentPath === item.href || (item.title === 'My Files' && currentPath.startsWith('/folder'))}
					class:disabled={item.disabled}
					on:click={() => !item.disabled && handleNavigation(item.href)}
					disabled={item.disabled}
				>
					<svelte:component this={item.icon} size={20} />
					<span>{item.title}</span>
					{#if item.disabled}
						<span class="coming-soon">Coming Soon</span>
					{/if}
				</button>
			{/each}
		</div>
		
		<div class="menu-footer">
			<button class="menu-item" on:click={() => notifications.info('Settings coming soon!')}>
				<Settings size={20} />
				<span>Settings</span>
			</button>
			{#if $auth.user}
				<button class="menu-item" on:click={handleLogout}>
					<LogOut size={20} />
					<span>Sign Out</span>
				</button>
			{/if}
		</div>
	</nav>
{/if}

{#if showSearch}
	<SearchModal
		bind:open={showSearch}
		on:close={() => showSearch = false}
	/>
{/if}

<style>
	/* Floating Menu Button */
	.floating-menu-button {
		position: fixed;
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
	
	.floating-menu-button:hover {
		transform: scale(1.05);
		background: var(--color-primary, #f7ad00);
		color: #ffffff;
		box-shadow: 0 4px 12px rgba(247, 173, 0, 0.3);
		border-color: var(--color-primary, #f7ad00);
	}
	
	.floating-menu-button:active {
		transform: scale(0.98);
	}
	
	/* Menu Overlay and Slide-out Menu */
	.menu-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 50;
	}
	
	.slide-menu {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 280px;
		background: #ffffff;
		box-shadow: 4px 0 24px rgba(0, 0, 0, 0.1);
		z-index: 51;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}
	
	.menu-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		gap: 0.75rem;
	}
	
	.menu-logo-short {
		height: 36px;
		width: 36px;
		flex-shrink: 0;
	}
	
	.search-bar {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 1rem;
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
	}
	
	.search-bar:focus {
		outline: none;
		border-color: var(--color-primary, #f7ad00);
		box-shadow: 0 0 0 3px rgba(247, 173, 0, 0.1);
	}
	
	.close-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background 0.2s;
		color: #6b7280;
	}
	
	.close-button:hover {
		background: #f3f4f6;
		color: #374151;
	}
	
	.menu-items {
		flex: 1;
		padding: 1rem 0;
	}
	
	.menu-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem 1.5rem;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background 0.2s;
		color: var(--color-secondary, #FBD680);
		font-size: 0.9375rem;
		text-align: left;
		font-weight: 500;
		position: relative;
	}
	
	.menu-item:hover:not(.disabled) {
		background: rgba(251, 214, 128, 0.15);
		color: var(--color-primary, #f7ad00);
	}
	
	.menu-item.active {
		background: rgba(251, 214, 128, 0.2);
		color: var(--color-primary, #f7ad00);
		font-weight: 600;
	}
	
	.menu-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.coming-soon {
		position: absolute;
		right: 1.5rem;
		font-size: 0.75rem;
		color: #9ca3af;
		font-weight: 400;
	}
	
	.menu-footer {
		padding: 1rem 0;
		border-top: 1px solid #e5e7eb;
	}
	
	/* Dark mode */
	:global(.dark) .floating-menu-button {
		background: #1e293b;
		border-color: var(--color-secondary, #FBD680);
		color: var(--color-secondary, #FBD680);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}
	
	:global(.dark) .floating-menu-button:hover {
		background: var(--color-secondary, #FBD680);
		color: #1e293b;
		box-shadow: 0 4px 12px rgba(251, 214, 128, 0.3);
		border-color: var(--color-secondary, #FBD680);
	}
	
	:global(.dark) .slide-menu {
		background: #1f2937;
	}
	
	:global(.dark) .menu-header {
		border-bottom-color: #374151;
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
	}
	
	:global(.dark) .close-button {
		color: #9ca3af;
	}
	
	:global(.dark) .close-button:hover {
		background: #374151;
		color: #d1d5db;
	}
	
	:global(.dark) .menu-item {
		color: var(--color-secondary, #FBD680);
	}
	
	:global(.dark) .menu-item:hover:not(.disabled) {
		background: var(--color-accent, #a16d5b);
		color: #ffffff;
	}
	
	:global(.dark) .menu-item.active {
		background: var(--color-primary, #f7ad00);
		color: #ffffff;
	}
	
	:global(.dark) .menu-footer {
		border-top-color: #374151;
	}
	
	/* Mobile adjustments */
	@media (max-width: 640px) {
		.floating-menu-button {
			width: 44px;
			height: 44px;
		}
		
		.slide-menu {
			width: 85%;
			max-width: 280px;
		}
		
		.menu-header {
			padding: 0.875rem 1rem;
		}
		
		.menu-logo-short {
			height: 32px;
			width: 32px;
		}
		
		.search-bar {
			padding: 0.5rem 0.875rem;
			font-size: 0.875rem;
		}
		
		.menu-item {
			padding: 0.625rem 1rem;
			font-size: 0.875rem;
		}
		
		.coming-soon {
			font-size: 0.625rem;
			right: 1rem;
		}
		
		.menu-footer {
			padding: 0.75rem 0;
		}
	}
	
	/* Smaller mobile devices */
	@media (max-width: 375px) {
		.floating-menu-button {
			width: 40px;
			height: 40px;
		}
		
		.menu-header {
			padding: 0.75rem;
			gap: 0.5rem;
		}
		
		.menu-logo-short {
			height: 28px;
			width: 28px;
		}
		
		.search-bar {
			padding: 0.375rem 0.75rem;
			font-size: 0.8125rem;
			gap: 0.5rem;
		}
	}
</style>
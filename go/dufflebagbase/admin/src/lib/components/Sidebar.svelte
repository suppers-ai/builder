<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { 
		Home, Users, Database, HardDrive, 
		FileText, Puzzle, Settings, ChevronRight,
		Webhook, BarChart3, Grid3x3, ChevronDown,
		ChevronLeft, LogOut, User, ChevronUp
	} from 'lucide-svelte';
	import { api } from '$lib/api';
	
	export let currentUser: { email?: string } | null = null;
	
	let expandedItems: { [key: string]: boolean } = {};
	let collapsed = false;
	let showProfileMenu = false;
	
	const navigation = [
		{ 
			title: 'Home', 
			href: '/', 
			icon: Home 
		},
		{ 
			title: 'Users', 
			href: '/users', 
			icon: Users 
		},
		{ 
			title: 'Database', 
			href: '/database', 
			icon: Database 
		},
		{ 
			title: 'Storage', 
			href: '/storage', 
			icon: HardDrive 
		},
		{ 
			title: 'Logs', 
			href: '/logs', 
			icon: FileText 
		},
		{
			title: 'Extensions',
			icon: Puzzle,
			expandable: true,
			children: [
				{ 
					title: 'Webhooks', 
					href: '/extensions/webhooks',
					badge: '•',
					badgeColor: 'success'
				},
				{ 
					title: 'Analytics', 
					href: '/extensions/analytics',
					badge: '•',
					badgeColor: 'success'
				},
				{ 
					title: 'Manage Extensions', 
					href: '/extensions/manage'
				}
			]
		},
		{ 
			title: 'Settings', 
			href: '/settings', 
			icon: Settings 
		}
	];
	
	function toggleExpanded(title: string) {
		expandedItems[title] = !expandedItems[title];
	}
	
	function toggleSidebar() {
		collapsed = !collapsed;
	}
	
	function toggleProfileMenu() {
		showProfileMenu = !showProfileMenu;
	}
	
	// Close profile menu when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.sidebar-user') && !target.closest('.profile-menu')) {
			showProfileMenu = false;
		}
	}
	
	async function handleLogout() {
		try {
			await api.logout();
			// Navigate to login page
			goto('/login');
		} catch (error) {
			console.error('Logout failed:', error);
			// Still navigate to login on error
			goto('/login');
		}
	}
	
	$: currentPath = $page.url.pathname;
	
	// Add click outside listener
	import { onMount, onDestroy } from 'svelte';
	
	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<aside class="sidebar {collapsed ? 'collapsed' : ''}">
	<!-- Logo -->
	<div class="sidebar-header">
		<a href="/" class="sidebar-logo">
			{#if collapsed}
				<img src="/logo.png" alt="Solobase" width="36" height="36" />
			{:else}
				<img src="/logo_long.png" alt="Solobase" height="36" style="height: 36px; width: auto;" />
			{/if}
		</a>
	</div>
	
	<!-- Navigation -->
	<nav class="sidebar-nav">
		{#each navigation as item}
			<div class="nav-item {expandedItems[item.title] ? 'expanded' : ''}">
				{#if item.expandable}
					<button 
						class="nav-link"
						on:click={() => toggleExpanded(item.title)}
					>
						<svelte:component this={item.icon} class="nav-icon" />
						{#if !collapsed}
							<span class="nav-text">{item.title}</span>
							<ChevronRight class="nav-expand-icon" />
						{/if}
					</button>
					{#if expandedItems[item.title]}
						<div class="nav-submenu">
							{#each item.children as child}
								<a 
									href={child.href}
									class="nav-link nav-subitem {currentPath === child.href ? 'active' : ''}"
								>
									{#if !collapsed}
										<span class="nav-text">{child.title}</span>
									{:else}
										<span class="nav-tooltip">{child.title}</span>
									{/if}
									{#if child.badge}
										<span class="nav-badge" style="background: var(--{child.badgeColor}-color)">
											{child.badge}
										</span>
									{/if}
								</a>
							{/each}
						</div>
					{/if}
				{:else}
					<a 
						href={item.href}
						class="nav-link {currentPath === item.href ? 'active' : ''}"
					>
						<svelte:component this={item.icon} class="nav-icon" />
						{#if !collapsed}
							<span class="nav-text">{item.title}</span>
						{/if}
					</a>
				{/if}
			</div>
		{/each}
		
		<!-- Collapse Toggle Button -->
		<button class="sidebar-toggle" on:click={toggleSidebar} title="{collapsed ? 'Expand' : 'Collapse'} sidebar">
			{#if collapsed}
				<ChevronRight size={16} />
			{:else}
				<ChevronLeft size={16} />
			{/if}
		</button>
	</nav>
	
	<!-- User Section -->
	<div class="sidebar-user-container">
		{#if currentUser && currentUser.email}
			<button class="sidebar-user" on:click={toggleProfileMenu}>
				<div class="user-avatar">
					{currentUser.email.substring(0, 1).toUpperCase()}
				</div>
				{#if !collapsed}
					<div class="user-info">
						<div class="user-email">{currentUser.email}</div>
					</div>
					{#if showProfileMenu}
						<ChevronUp size={16} style="color: var(--text-muted)" />
					{:else}
						<ChevronDown size={16} style="color: var(--text-muted)" />
					{/if}
				{/if}
			</button>
		{/if}
		
		<!-- Profile Menu Popup -->
		{#if showProfileMenu}
			<div class="profile-menu {collapsed ? 'profile-menu-collapsed' : ''}">
				<div class="profile-menu-header">
					<div class="profile-menu-avatar">
						{currentUser.email.substring(0, 1).toUpperCase()}
					</div>
					<div class="profile-menu-info">
						<div class="profile-menu-email">{currentUser.email}</div>
						<div class="profile-menu-role">Administrator</div>
					</div>
				</div>
				<div class="profile-menu-divider"></div>
				<button class="profile-menu-item" on:click={() => goto('/profile')}>
					<User size={16} />
					<span>Profile Settings</span>
				</button>
				<button class="profile-menu-item profile-menu-item-danger" on:click={handleLogout}>
					<LogOut size={16} />
					<span>Sign Out</span>
				</button>
			</div>
		{/if}
	</div>
</aside>

<style>
	.sidebar * {
		transition-property: opacity, transform, width, padding, margin;
		transition-duration: 0.3s;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.nav-icon {
		width: 20px;
		height: 20px;
		stroke-width: 1.5;
		flex-shrink: 0;
	}
	
	.nav-expand-icon {
		width: 16px;
		height: 16px;
		margin-left: auto;
		stroke-width: 2;
	}
	
	.sidebar.collapsed .nav-badge {
		position: absolute;
		top: 4px;
		right: 4px;
		min-width: 8px;
		height: 8px;
		padding: 0;
		border-radius: 50%;
		font-size: 0;
	}
	
	.nav-tooltip {
		position: absolute;
		left: 100%;
		margin-left: 0.5rem;
		padding: 0.25rem 0.5rem;
		background: var(--text-primary);
		color: white;
		border-radius: 4px;
		font-size: 0.75rem;
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		z-index: 1000;
		transition: opacity 0.2s;
	}
	
	.sidebar.collapsed .nav-link:hover .nav-tooltip,
	.sidebar.collapsed .nav-subitem:hover .nav-tooltip {
		opacity: 1;
	}
	
	/* Profile Menu Styles */
	.sidebar-user-container {
		position: relative;
	}
	
	.sidebar-user {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background-color 0.2s;
		text-align: left;
		border-radius: 0.5rem;
		margin: 0.5rem;
		width: calc(100% - 1rem);
	}
	
	.sidebar-user:hover {
		background: var(--bg-hover);
	}
	
	.profile-menu {
		position: absolute;
		bottom: 100%;
		left: 0.5rem;
		right: 0.5rem;
		margin-bottom: 0.5rem;
		background: white;
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		overflow: hidden;
		animation: slideUp 0.2s ease-out;
	}
	
	.profile-menu-collapsed {
		left: 100%;
		right: auto;
		margin-left: 0.5rem;
		width: 280px;
	}
	
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.profile-menu-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background: var(--bg-secondary);
	}
	
	.profile-menu-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--primary-color);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 1rem;
	}
	
	.profile-menu-info {
		flex: 1;
	}
	
	.profile-menu-email {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary);
		word-break: break-word;
	}
	
	.profile-menu-role {
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-top: 0.125rem;
	}
	
	.profile-menu-divider {
		height: 1px;
		background: var(--border-color);
	}
	
	.profile-menu-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background-color 0.2s;
		text-align: left;
		font-size: 0.875rem;
		color: var(--text-primary);
	}
	
	.profile-menu-item:hover {
		background: var(--bg-hover);
	}
	
	.profile-menu-item-danger {
		color: var(--danger-color, #ef4444);
	}
	
	.profile-menu-item-danger:hover {
		background: rgba(239, 68, 68, 0.1);
	}
	
	.user-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--primary-color);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.875rem;
		flex-shrink: 0;
	}
	
	.user-info {
		flex: 1;
		min-width: 0;
	}
	
	.user-email {
		font-size: 0.875rem;
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
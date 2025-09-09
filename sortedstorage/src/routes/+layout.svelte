<script lang="ts">
	import '../app.css';
	import '@common/ui-components/css/variables.css';
	import { page } from '$app/stores';
	import MinimalLayout from '$lib/components/layout/MinimalLayout.svelte';
	import Toast from '$lib/components/common/Toast.svelte';
	import NotificationContainer from '$lib/components/common/NotificationContainer.svelte';
	import CommandPalette from '$lib/components/common/CommandPalette.svelte';
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { registerServiceWorker, setupInstallPrompt, setupNetworkHandling } from '$lib/utils/pwa';
	import { KeyboardShortcutManager, defaultShortcuts } from '$lib/utils/keyboard-shortcuts';
	import SettingsModal from '$lib/components/settings/SettingsModal.svelte';
	import UpgradeModal from '$lib/components/upgrade/UpgradeModal.svelte';
	import { getAuthLoginUrl } from '$lib/config/auth';
	
	export let data;
	
	// Get user from auth store
	let user: any = null;
	let authChecked = false;
	
	// Subscribe to auth store
	$: authState = $auth;
	$: user = authState.user;
	// Consider auth checked if we have a user or if we've already checked and there's no user
	$: authReady = user !== null || (authChecked && !authState.loading);
	
	// Define public pages that don't require authentication
	const publicPages = ['/', '/auth/login'];
	
	let commandPaletteOpen = false;
	let settingsModalOpen = false;
	let upgradeModalOpen = false;
	let shortcutManager: KeyboardShortcutManager;
	
	onMount(async () => {
		// Fix invalid URLs that might come from boolean values
		const currentPath = $page.url.pathname;
		if (currentPath === '/false' || currentPath === '/true' || currentPath === '/null' || currentPath === '/undefined') {
			goto('/');
			return;
		}
		
		// Check if user is authenticated
		await auth.checkAuth();
		authChecked = true;
		
		// If not authenticated and not on a public page, redirect to Solobase login
		const isPublicPage = publicPages.some(path => currentPath.startsWith(path));
		
		if (!$auth.user && !isPublicPage && currentPath !== '/') {
			// Redirect to Solobase's auth login page
			goto('/auth/login?redirect=' + encodeURIComponent(currentPath));
		}
		
		// Apply saved theme
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme === 'dark') {
			document.documentElement.classList.add('dark');
		} else if (savedTheme === 'light') {
			document.documentElement.classList.remove('dark');
		}
		
		// Register service worker and PWA features
		registerServiceWorker();
		setupInstallPrompt();
		setupNetworkHandling();
		
		// Setup keyboard shortcuts
		shortcutManager = new KeyboardShortcutManager();
		defaultShortcuts.forEach(shortcut => {
			shortcutManager.register(shortcut);
		});
		
		// Listen for command palette shortcut
		const handleCommandPalette = () => { commandPaletteOpen = true; };
		document.addEventListener('shortcut:command-palette', handleCommandPalette);
		
		return () => {
			document.removeEventListener('shortcut:command-palette', handleCommandPalette);
		};
	});
	
	// Reactive authentication check
	$: if (authChecked && !authState.loading) {
		const currentPath = $page.url.pathname;
		const isPublicPage = publicPages.some(path => currentPath.startsWith(path));
		
		if (!user && !isPublicPage && currentPath !== '/') {
			// Redirect to Solobase's auth login page
			goto('/auth/login?redirect=' + encodeURIComponent(currentPath));
		}
	}
	
	async function handleLogout() {
		await auth.logout();
	}
	
	function handleOpenSettings() {
		settingsModalOpen = true;
	}
	
	function handleOpenUpgradeFromSettings() {
		settingsModalOpen = false;
		upgradeModalOpen = true;
	}
	
	// Check if on homepage without auth or login page
	$: isAuthPage = $page.url.pathname.startsWith('/auth/');
	$: isHomepageNoAuth = $page.url.pathname === '/' && !user;
</script>

<Toast />
<NotificationContainer />

{#if isAuthPage || isHomepageNoAuth}
	<!-- Auth pages and homepage without layout -->
	<slot />
{:else if !authReady}
	<!-- Show loading state while checking auth -->
	<div class="auth-loading">
		<div class="spinner"></div>
		<p>Loading...</p>
	</div>
{:else}
	<!-- Main app with minimal layout -->
	<MinimalLayout
		currentUser={user}
		currentPath={$page.url.pathname}
		onLogout={handleLogout}
		onOpenSettings={handleOpenSettings}
	>
		<slot />
	</MinimalLayout>
{/if}

<!-- Command Palette -->
<CommandPalette bind:open={commandPaletteOpen} />

<!-- Settings Modal -->
<SettingsModal 
	bind:open={settingsModalOpen} 
	user={user}
	on:openUpgrade={handleOpenUpgradeFromSettings}
/>

<!-- Upgrade Modal -->
<UpgradeModal bind:open={upgradeModalOpen} />

<style>
	.auth-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		background: #f0f0f0;
	}
	
	.auth-loading .spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e2e8f0;
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: layout-spin 1s linear infinite;
	}
	
	@keyframes layout-spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	.auth-loading p {
		margin-top: 1rem;
		color: #666;
		font-size: 14px;
	}
</style>
<script lang="ts">
	import '../app.css';
	import '@common/ui-components/css/variables.css';
	import { page } from '$app/stores';
	import { AppLayout } from '@common/ui-components';
	import { 
		Files, Share2, BarChart3
	} from 'lucide-svelte';
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
	
	export let data;
	
	// Get user from auth store
	let user: any = null;
	let authChecked = false;
	
	// Subscribe to auth store
	$: authState = $auth;
	$: user = authState.user;
	
	// Define public pages that don't require authentication
	const publicPages = ['/auth/login', '/auth/register', '/auth/logout', '/auth/forgot', '/'];
	
	const navigation = [
		{ title: 'My Files', href: '/files', icon: Files },
		{ title: 'Shared', href: '/shared', icon: Share2 }
	];
	
	// Add admin navigation if user is admin
	$: if (user?.role === 'admin') {
		if (!navigation.find(item => item.title === 'Admin Analytics')) {
			navigation.push({ title: 'Admin Analytics', href: '/admin/analytics', icon: BarChart3 });
		}
	}
	
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
		
		// If not authenticated and not on a public page, redirect to login
		const isPublicPage = publicPages.some(path => currentPath.startsWith(path));
		
		if (!$auth.user && !isPublicPage && currentPath !== '/') {
			goto('/auth/login');
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
			goto('/auth/login');
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
	
	// Check if on login/signup page or homepage without auth
	$: isAuthPage = $page.url.pathname.startsWith('/auth/');
	$: isHomepageNoAuth = $page.url.pathname === '/' && !user;
</script>

<Toast />
<NotificationContainer />

{#if isAuthPage || isHomepageNoAuth}
	<!-- Auth pages and homepage without layout -->
	<slot />
{:else if !authChecked}
	<!-- Show loading state while checking auth -->
	<div class="auth-loading">
		<div class="spinner"></div>
		<p>Loading...</p>
	</div>
{:else}
	<!-- Main app with layout -->
	<AppLayout
		currentUser={user}
		{navigation}
		currentPath={$page.url.pathname}
		logoSrc="/logos/long_light.svg"
		logoCollapsedSrc="/favicon.ico"
		projectName="SortedStorage"
		mobileTitle="SortedStorage"
		onLogout={handleLogout}
		onOpenSettings={handleOpenSettings}
	>
		<slot />
	</AppLayout>
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
	:global(:root) {
		/* Override primary color for SortedStorage */
		--primary-color: #3b82f6;
		--primary-hover: #2563eb;
	}
	
	.auth-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		background: #f0f0f0;
	}
	
	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e2e8f0;
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	.auth-loading p {
		margin-top: 1rem;
		color: #666;
		font-size: 14px;
	}
</style>
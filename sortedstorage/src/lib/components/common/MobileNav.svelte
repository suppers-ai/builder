<script lang="ts">
	import { 
		Menu, X, Home, Files, Share2, Settings, 
		CreditCard, LogOut, User, HardDrive, ChevronRight
	} from 'lucide-svelte';
	import { page } from '$app/stores';
	import { slide, fade } from 'svelte/transition';
	import { auth } from '$lib/stores/auth';
	import StorageMeter from '../storage/StorageMeter.svelte';
	
	export let user: any = null;
	
	let mobileMenuOpen = false;
	let profileMenuOpen = false;
	
	const navigation = [
		{ title: 'Home', href: '/', icon: Home },
		{ title: 'My Files', href: '/files', icon: Files },
		{ title: 'Shared', href: '/shared', icon: Share2 },
		{ title: 'Settings', href: '/settings', icon: Settings },
		{ title: 'Upgrade', href: '/upgrade', icon: CreditCard }
	];
	
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
		// Prevent body scroll when menu is open
		if (mobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	}
	
	function closeMobileMenu() {
		mobileMenuOpen = false;
		document.body.style.overflow = '';
	}
	
	// Close menu on route change
	$: if ($page) {
		closeMobileMenu();
	}
</script>

<!-- Mobile Header -->
<header class="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
	<div class="flex items-center justify-between px-4 py-3">
		<!-- Logo and Menu Button -->
		<div class="flex items-center gap-3">
			<button
				on:click={toggleMobileMenu}
				class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				aria-label="Toggle menu"
			>
				{#if mobileMenuOpen}
					<X class="w-6 h-6" />
				{:else}
					<Menu class="w-6 h-6" />
				{/if}
			</button>
			
			<div class="flex items-center gap-2">
				<HardDrive class="w-6 h-6 text-primary-600" />
				<span class="font-bold text-lg">SortedStorage</span>
			</div>
		</div>
		
		<!-- User Menu -->
		{#if user}
			<button
				on:click={() => profileMenuOpen = !profileMenuOpen}
				class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
			>
				<div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
					{user.email.charAt(0).toUpperCase()}
				</div>
			</button>
		{:else}
			<a 
				href="/auth/login" 
				class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
			>
				Sign In
			</a>
		{/if}
	</div>
	
	<!-- Profile Dropdown -->
	{#if profileMenuOpen && user}
		<div 
			transition:slide={{ duration: 200 }}
			class="absolute top-full right-4 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
		>
			<div class="p-4 border-b border-gray-200 dark:border-gray-700">
				<p class="font-medium">{user.name || 'User'}</p>
				<p class="text-sm text-gray-500">{user.email}</p>
			</div>
			
			<div class="p-2">
				<a 
					href="/settings/profile" 
					class="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
					on:click={closeMobileMenu}
				>
					<User class="w-4 h-4" />
					<span>Profile</span>
				</a>
				
				<button 
					on:click={() => auth.logout()}
					class="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
				>
					<LogOut class="w-4 h-4" />
					<span>Logout</span>
				</button>
			</div>
		</div>
	{/if}
</header>

<!-- Mobile Navigation Drawer -->
{#if mobileMenuOpen}
	<!-- Backdrop -->
	<div 
		transition:fade={{ duration: 200 }}
		class="lg:hidden fixed inset-0 z-40 bg-black/50"
		on:click={closeMobileMenu}
	></div>
	
	<!-- Drawer -->
	<nav 
		transition:slide={{ duration: 200, axis: 'x' }}
		class="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-xl"
	>
		<!-- Header -->
		<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
			<div class="flex items-center gap-2">
				<HardDrive class="w-8 h-8 text-primary-600" />
				<span class="text-xl font-bold">SortedStorage</span>
			</div>
			<button
				on:click={closeMobileMenu}
				class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
				aria-label="Close menu"
			>
				<X class="w-5 h-5" />
			</button>
		</div>
		
		<!-- Navigation Links -->
		<div class="flex-1 overflow-y-auto p-4">
			<div class="space-y-1">
				{#each navigation as item}
					<a
						href={item.href}
						class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors {
							$page.url.pathname === item.href 
								? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
								: 'hover:bg-gray-100 dark:hover:bg-gray-700'
						}"
						on:click={closeMobileMenu}
					>
						<svelte:component this={item.icon} class="w-5 h-5" />
						<span class="font-medium">{item.title}</span>
						{#if $page.url.pathname === item.href}
							<ChevronRight class="w-4 h-4 ml-auto" />
						{/if}
					</a>
				{/each}
			</div>
			
			<!-- Storage Meter -->
			<div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
				<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Storage</h3>
				<StorageMeter used={2.5} total={5} unit="GB" />
			</div>
		</div>
		
		<!-- User Section -->
		{#if user}
			<div class="p-4 border-t border-gray-200 dark:border-gray-700">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
						{user.email.charAt(0).toUpperCase()}
					</div>
					<div class="flex-1 min-w-0">
						<p class="font-medium truncate">{user.name || 'User'}</p>
						<p class="text-sm text-gray-500 truncate">{user.email}</p>
					</div>
				</div>
			</div>
		{/if}
	</nav>
{/if}

<!-- Spacer for fixed header -->
<div class="lg:hidden h-14"></div>

<style>
	/* Prevent body scroll when menu is open */
	:global(body.menu-open) {
		overflow: hidden;
	}
	
	/* Smooth transitions */
	nav {
		will-change: transform;
	}
	
	/* Touch-friendly tap targets */
	button, a {
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
	}
	
	/* Safe area insets for notched devices */
	@supports (padding: max(0px)) {
		header {
			padding-top: max(0px, env(safe-area-inset-top));
		}
		
		nav {
			padding-bottom: max(0px, env(safe-area-inset-bottom));
		}
	}
</style>
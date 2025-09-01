<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { auth, currentUser } from '$lib/stores/auth';
	import { Menu, X } from 'lucide-svelte';
	
	let user: any = null;
	let mobileMenuOpen = false;
	let windowWidth = 0;
	
	// Subscribe to the currentUser store
	$: user = $currentUser;
	
	// Define pages that don't require admin role
	const publicPages = ['/login', '/signup', '/logout', '/profile'];
	
	// Reactive role-based routing - handles navigation after auth state changes
	$: if (user && typeof window !== 'undefined') {
		const currentPath = $page.url.pathname;
		const isAdminPage = !publicPages.includes(currentPath);
		
		// Redirect non-admin users away from admin pages
		if (user.role !== 'admin' && isAdminPage) {
			goto('/profile');
		}
	}
	
	onMount(async () => {
		// Check if user is authenticated on mount
		const isAuth = await auth.checkAuth();
		
		// Redirect to login if not authenticated (exclude public pages)
		if (!isAuth && !publicPages.includes($page.url.pathname)) {
			goto('/login');
			return;
		}
		
		// Note: Role-based checks are handled by the reactive statement above
		// and by individual page components using requireAdmin()
		
		// Set initial window width
		windowWidth = window.innerWidth;
		
		// Listen for window resize
		const handleResize = () => {
			windowWidth = window.innerWidth;
			// Close mobile menu on desktop resize
			if (windowWidth >= 768) {
				mobileMenuOpen = false;
			}
		};
		
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
	
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
	
	async function handleLogout() {
		// Navigate to logout page which handles the logout process
		window.location.href = '/logout';
	}
</script>

{#if $page.url.pathname === '/login' || $page.url.pathname === '/signup' || $page.url.pathname === '/logout' || $page.url.pathname === '/profile'}
	<slot />
{:else}
	<div class="app-layout {mobileMenuOpen ? 'mobile-menu-open' : ''}">
		<!-- Mobile Header -->
		<header class="mobile-header">
			<button class="menu-toggle" on:click={toggleMobileMenu}>
				{#if mobileMenuOpen}
					<X size={24} />
				{:else}
					<Menu size={24} />
				{/if}
			</button>
			<div class="mobile-title">Solobase Admin</div>
		</header>
		
		<!-- Sidebar with overlay for mobile -->
		<div class="sidebar-container {mobileMenuOpen ? 'active' : ''}">
			{#if windowWidth < 768 && mobileMenuOpen}
				<div class="sidebar-overlay" on:click={toggleMobileMenu}></div>
			{/if}
			<div class="sidebar-wrapper">
				<Sidebar currentUser={user} />
			</div>
		</div>
		
		<main class="main-content">
			<div class="content-wrapper">
				<slot />
			</div>
		</main>
	</div>
{/if}

<style>
	.app-layout {
		display: flex;
		height: 100vh;
		background: #f0f0f0;
		padding: 1rem;
		gap: 1rem;
		position: relative;
	}
	
	.mobile-header {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 60px;
		background: white;
		border-bottom: 1px solid #e2e8f0;
		align-items: center;
		padding: 0 1rem;
		z-index: 100;
	}
	
	.menu-toggle {
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #333;
	}
	
	.mobile-title {
		flex: 1;
		text-align: center;
		font-weight: 600;
		font-size: 1.1rem;
		color: #333;
	}
	
	.sidebar-container {
		position: relative;
	}
	
	.sidebar-overlay {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 199;
	}
	
	.sidebar-wrapper {
		position: relative;
		z-index: 200;
	}
	
	.main-content {
		flex: 1;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		overflow-y: auto;
		overflow-x: hidden;
	}
	
	.content-wrapper {
		padding: 1.5rem;
	}
	
	/* Mobile Styles */
	@media (max-width: 767px) {
		.app-layout {
			padding: 0;
			gap: 0;
			padding-top: 60px;
		}
		
		.mobile-header {
			display: flex;
		}
		
		.sidebar-container {
			position: fixed;
			left: -280px;
			top: 60px;
			bottom: 0;
			width: 280px;
			transition: left 0.3s ease;
			z-index: 200;
		}
		
		.sidebar-container.active {
			left: 0;
		}
		
		.sidebar-container.active .sidebar-overlay {
			display: block;
		}
		
		.main-content {
			border-radius: 0;
			border: none;
		}
		
		.content-wrapper {
			padding: 1rem;
		}
	}
	
	/* Tablet Styles */
	@media (min-width: 768px) and (max-width: 1023px) {
		.app-layout {
			padding: 0.5rem;
			gap: 0.5rem;
		}
		
		.content-wrapper {
			padding: 1.25rem;
		}
	}
	
	/* Small Desktop */
	@media (min-width: 1024px) and (max-width: 1279px) {
		.content-wrapper {
			padding: 1.5rem;
		}
	}
</style>
<script lang="ts">
	import '../app.css';
	import '@common/ui-components/css/variables.css';
	import { page } from '$app/stores';
	import { AppLayout } from '@common/ui-components';
	import { 
		Home, Users, Database, HardDrive, 
		FileText, Puzzle, Settings, Plus
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth, currentUser } from '$lib/stores/auth';
	
	let user: any = null;
	let authChecked = false;
	
	// Subscribe to the currentUser store
	$: user = $currentUser;
	
	// Define pages that don't require admin role
	const publicPages = ['/auth/login', '/auth/signup', '/auth/logout', '/'];
	const profilePages = ['/profile'];
	
	// Navigation configuration for admin
	const navigation = [
		{ 
			title: 'Dashboard', 
			href: '/admin', 
			icon: Home 
		},
		{ 
			title: 'Users', 
			href: '/admin/users', 
			icon: Users 
		},
		{ 
			title: 'Database', 
			href: '/admin/database', 
			icon: Database 
		},
		{ 
			title: 'Storage', 
			href: '/admin/storage', 
			icon: HardDrive 
		},
		{ 
			title: 'Logs', 
			href: '/admin/logs', 
			icon: FileText 
		},
		{
			title: 'Extensions',
			icon: Puzzle,
			expandable: true,
			children: [
				{ 
					title: 'Products & Pricing', 
					href: '/admin/extensions/products'
				},
				{ 
					title: 'Hugo Sites', 
					href: '/admin/extensions/hugo'
				},
				{ 
					title: 'Analytics', 
					href: '/admin/extensions/analytics'
				},
				{ 
					title: 'Cloud Storage', 
					href: '/admin/extensions/cloudstorage'
				},
				{ 
					title: 'Webhooks', 
					href: '/admin/extensions/webhooks'
				},
				{ 
					title: 'Manage Extensions', 
					href: '/admin/extensions/manage',
					icon: Plus
				}
			]
		},
		{ 
			title: 'Settings', 
			href: '/admin/settings', 
			icon: Settings 
		}
	];
	
	// Reactive role-based routing - handles navigation after auth state changes
	$: if (user && typeof window !== 'undefined') {
		const currentPath = $page.url.pathname;
		const isPublicPage = publicPages.some(p => currentPath === p || currentPath.startsWith('/auth/'));
		const isProfilePage = currentPath.startsWith('/profile');
		const isAdminPage = currentPath.startsWith('/admin');
		
		// Redirect non-admin users away from admin pages
		if (user.role !== 'admin' && isAdminPage) {
			goto('/profile');
		}
	}
	
	onMount(async () => {
		// First check if we have a stored token before doing auth check
		const hasStoredToken = typeof window !== 'undefined' && localStorage.getItem('auth_token');
		
		// If we have a stored token, attempt to validate it
		if (hasStoredToken) {
			// Check if user is authenticated on mount
			const isAuth = await auth.checkAuth();
			authChecked = true;
			
			// Only redirect if auth check definitively failed (not just loading)
			if (!isAuth) {
				const currentPath = $page.url.pathname;
				const isPublicPage = publicPages.some(p => currentPath === p || currentPath.startsWith('/auth/'));
				const isProfilePage = currentPath.startsWith('/profile');
				
				if (!isPublicPage && !isProfilePage) {
					goto('/auth/login');
					return;
				}
			}
		} else {
			// No stored token, check if we need to redirect
			const currentPath = $page.url.pathname;
			const isPublicPage = publicPages.some(p => currentPath === p || currentPath.startsWith('/auth/'));
			const isProfilePage = currentPath.startsWith('/profile');
			
			authChecked = true;
			
			if (!isPublicPage && !isProfilePage) {
				goto('/auth/login');
				return;
			}
		}
	});
	
	async function handleLogout() {
		// Navigate to logout page which handles the logout process
		window.location.href = '/auth/logout';
	}
	
	// Check if on auth pages or admin pages
	$: isAuthPage = $page.url.pathname.startsWith('/auth/');
	$: isProfilePage = $page.url.pathname.startsWith('/profile');
	$: isAdminPage = $page.url.pathname.startsWith('/admin');
	$: isRootPage = $page.url.pathname === '/';
</script>

{#if isAuthPage || isRootPage}
	<!-- Auth pages and root page without layout -->
	<slot />
{:else if !authChecked && !publicPages.some(p => $page.url.pathname === p || $page.url.pathname.startsWith('/auth/'))}
	<!-- Show loading state while checking auth for protected pages -->
	<div class="auth-loading">
		<div class="spinner"></div>
		<p>Loading...</p>
	</div>
{:else if isProfilePage}
	<!-- Profile pages have their own layout -->
	<slot />
{:else if isAdminPage}
	<!-- Main admin layout - only for admin pages -->
	<AppLayout
		currentUser={user}
		{navigation}
		currentPath={$page.url.pathname}
		logoSrc="/logo_long.png"
		logoCollapsedSrc="/logo.png"
		projectName="Solobase"
		mobileTitle="Solobase Admin"
		onLogout={handleLogout}
	>
		<slot />
	</AppLayout>
{:else}
	<!-- Other pages without layout -->
	<slot />
{/if}

<style>
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
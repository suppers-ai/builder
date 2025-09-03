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
	const publicPages = ['/login', '/signup', '/logout'];
	const profilePages = ['/profile'];
	
	// Navigation configuration
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
					title: 'Products & Pricing', 
					href: '/extensions/products'
				},
				{ 
					title: 'Hugo Sites', 
					href: '/extensions/hugo'
				},
				{ 
					title: 'Analytics', 
					href: '/extensions/analytics'
				},
				{ 
					title: 'Cloud Storage', 
					href: '/extensions/cloudstorage'
				},
				{ 
					title: 'Webhooks', 
					href: '/extensions/webhooks'
				},
				{ 
					title: 'Manage Extensions', 
					href: '/extensions/manage',
					icon: Plus
				}
			]
		},
		{ 
			title: 'Settings', 
			href: '/settings', 
			icon: Settings 
		}
	];
	
	// Reactive role-based routing - handles navigation after auth state changes
	$: if (user && typeof window !== 'undefined') {
		const currentPath = $page.url.pathname;
		const isPublicPage = publicPages.includes(currentPath);
		const isProfilePage = currentPath.startsWith('/profile');
		const isAdminPage = !isPublicPage && !isProfilePage;
		
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
				const isPublicPage = publicPages.includes(currentPath);
				const isProfilePage = currentPath.startsWith('/profile');
				
				if (!isPublicPage && !isProfilePage) {
					goto('/login');
					return;
				}
			}
		} else {
			// No stored token, check if we need to redirect
			const currentPath = $page.url.pathname;
			const isPublicPage = publicPages.includes(currentPath);
			const isProfilePage = currentPath.startsWith('/profile');
			
			authChecked = true;
			
			if (!isPublicPage && !isProfilePage) {
				goto('/login');
				return;
			}
		}
	});
	
	async function handleLogout() {
		// Navigate to logout page which handles the logout process
		window.location.href = '/logout';
	}
	
	// Check if on auth pages
	$: isAuthPage = $page.url.pathname === '/login' || $page.url.pathname === '/signup' || $page.url.pathname === '/logout';
	$: isProfilePage = $page.url.pathname.startsWith('/profile');
</script>

{#if isAuthPage}
	<!-- Auth pages without layout -->
	<slot />
{:else if !authChecked && !publicPages.includes($page.url.pathname)}
	<!-- Show loading state while checking auth for protected pages -->
	<div class="auth-loading">
		<div class="spinner"></div>
		<p>Loading...</p>
	</div>
{:else if isProfilePage}
	<!-- Profile pages have their own layout -->
	<slot />
{:else}
	<!-- Main admin layout -->
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
<script lang="ts">
	import { LoginForm } from '@common/ui-components';
	import '@common/ui-components/css/variables.css';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { page } from '$app/stores';
	
	let email = '';
	let password = '';
	let loading = false;
	let error = '';
	
	// Get redirect parameter from URL
	$: redirectTo = $page.url.searchParams.get('redirect');
	
	async function handleLogin(loginEmail: string, loginPassword: string) {
		loading = true;
		error = '';
		
		const success = await auth.login(loginEmail, loginPassword);
		
		if (success) {
			// Check for redirect parameter first
			if (redirectTo) {
				// Handle both absolute and relative URLs
				if (redirectTo.startsWith('http')) {
					// Absolute URL - navigate directly
					window.location.href = redirectTo;
				} else {
					// Relative URL - use goto
					goto(redirectTo);
				}
			} else {
				// Default redirect to /files for SortedStorage integration
				// Check if /files route exists (SortedStorage), otherwise use default admin/profile
				if (window.location.pathname === '/auth/login') {
					// We're on the login page, likely came from SortedStorage
					goto('/files');
				} else {
					// Fallback to role-based redirect
					const authState = get(auth);
					const user = authState.user;
					
					if (user && user.role === 'admin') {
						goto('/admin');
					} else {
						goto('/profile');
					}
				}
			}
		} else {
			const authState = get(auth);
			error = authState.error || 'Invalid email or password';
		}
		
		loading = false;
	}
</script>

<LoginForm
	bind:email
	bind:password
	{loading}
	{error}
	logoSrc="/logo_long.png"
	projectName="Solobase"
	subtitle="Welcome back! Please login to your account."
	showSignupLink={true}
	signupUrl="/auth/signup"
	showForgotPassword={true}
	forgotPasswordUrl="/auth/forgot-password"
	showRememberMe={true}
	onSubmit={handleLogin}
/>
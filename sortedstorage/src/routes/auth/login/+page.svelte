<script lang="ts">
	import { LoginForm } from '@common/ui-components';
	import '@common/ui-components/css/variables.css';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	
	let email = '';
	let password = '';
	let loading = false;
	let error = '';
	
	// Get redirect URL from query params
	$: redirectTo = $page.url.searchParams.get('redirect') || '/files';
	
	async function handleLogin(loginEmail: string, loginPassword: string) {
		error = '';
		loading = true;
		
		try {
			await auth.login(loginEmail, loginPassword);
			// Set cookie for authentication
			document.cookie = `auth-token=mock-token-${Date.now()}; path=/; max-age=86400`;
			// Redirect to intended page
			goto(redirectTo);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Login failed';
		} finally {
			loading = false;
		}
	}
</script>

<LoginForm
	bind:email
	bind:password
	{loading}
	{error}
	logoSrc="/images/long_light.svg"
	projectName="SortedStorage"
	subtitle="Sign in to access your secure cloud storage"
	showSignupLink={true}
	signupUrl="/auth/register"
	showForgotPassword={true}
	forgotPasswordUrl="/auth/forgot"
	showRememberMe={true}
	onSubmit={handleLogin}
/>

<style>
	:global(:root) {
		/* Override primary color for SortedStorage */
		--primary-color: #3b82f6;
		--primary-hover: #2563eb;
	}
</style>
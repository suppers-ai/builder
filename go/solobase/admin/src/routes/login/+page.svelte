<script lang="ts">
	import { LoginForm } from '@common/ui-components';
	import '@common/ui-components/css/variables.css';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	
	let email = '';
	let password = '';
	let loading = false;
	let error = '';
	
	async function handleLogin(loginEmail: string, loginPassword: string) {
		loading = true;
		error = '';
		
		const success = await auth.login(loginEmail, loginPassword);
		
		if (success) {
			goto('/');
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
	signupUrl="/signup"
	showForgotPassword={true}
	forgotPasswordUrl="/forgot-password"
	showRememberMe={true}
	onSubmit={handleLogin}
/>
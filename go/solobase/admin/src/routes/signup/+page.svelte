<script lang="ts">
	import { api } from '$lib/api';
	import { goto } from '$app/navigation';
	
	let email = '';
	let password = '';
	let confirmPassword = '';
	let loading = false;
	let error = '';
	
	async function handleSignup() {
		loading = true;
		error = '';
		
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			loading = false;
			return;
		}
		
		if (password.length < 8) {
			error = 'Password must be at least 8 characters';
			loading = false;
			return;
		}
		
		const response = await api.signup({ email, password });
		
		if (response.error) {
			error = response.error;
		} else {
			goto('/login');
		}
		
		loading = false;
	}
</script>

<div class="flex items-center justify-center min-h-screen bg-surface-50-900-token">
	<div class="card p-8 w-full max-w-md">
		<h1 class="h2 text-center mb-6">Create Account</h1>
		
		{#if error}
			<div class="alert variant-filled-error mb-4">
				{error}
			</div>
		{/if}
		
		<form on:submit|preventDefault={handleSignup}>
			<label class="label mb-4">
				<span>Email</span>
				<input
					type="email"
					class="input"
					bind:value={email}
					required
					disabled={loading}
				/>
			</label>
			
			<label class="label mb-4">
				<span>Password</span>
				<input
					type="password"
					class="input"
					bind:value={password}
					required
					disabled={loading}
				/>
			</label>
			
			<label class="label mb-6">
				<span>Confirm Password</span>
				<input
					type="password"
					class="input"
					bind:value={confirmPassword}
					required
					disabled={loading}
				/>
			</label>
			
			<button
				type="submit"
				class="btn variant-filled-primary w-full"
				disabled={loading}
			>
				{loading ? 'Creating account...' : 'Sign Up'}
			</button>
		</form>
		
		<div class="text-center mt-4">
			<a href="/login" class="anchor">
				Already have an account? Login
			</a>
		</div>
	</div>
</div>
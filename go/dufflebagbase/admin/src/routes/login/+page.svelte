<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	
	let email = '';
	let password = '';
	let loading = false;
	let error = '';
	
	async function handleLogin() {
		loading = true;
		error = '';
		
		const success = await auth.login(email, password);
		
		if (success) {
			goto('/');
		} else {
			error = $auth.error || 'Login failed';
		}
		
		loading = false;
	}
</script>

<div class="flex items-center justify-center min-h-screen">
	<div class="admin-card w-full max-w-md">
		<h1 class="text-2xl font-bold text-center mb-6 text-gray-900" style="font-family: 'Itim', cursive;">Login to Dufflebag</h1>
		
		{#if error}
			<div class="admin-alert admin-alert-error">
				{error}
			</div>
		{/if}
		
		<form on:submit|preventDefault={handleLogin}>
			<div class="mb-4">
				<label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
				<input
					type="email"
					class="admin-input"
					bind:value={email}
					required
					disabled={loading}
				/>
			</div>
			
			<div class="mb-6">
				<label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
				<input
					type="password"
					class="admin-input"
					bind:value={password}
					required
					disabled={loading}
				/>
			</div>
			
			<button
				type="submit"
				class="admin-button w-full"
				disabled={loading}
			>
				{loading ? 'Logging in...' : 'Login'}
			</button>
		</form>
		
		<div class="text-center mt-4">
			<a href="/signup" class="text-blue-600 hover:text-blue-700 transition-colors">
				Don't have an account? Sign up
			</a>
		</div>
	</div>
</div>
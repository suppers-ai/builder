<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth';
	import { LogOut } from 'lucide-svelte';
	
	onMount(async () => {
		// Perform logout
		await auth.logout();
		// The auth store will handle the redirect to login page
	});
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
	<div class="text-center">
		<div class="flex justify-center mb-4">
			<div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
				<LogOut class="w-8 h-8 text-primary-600 dark:text-primary-400" />
			</div>
		</div>
		<h1 class="text-2xl font-bold mb-2">Logging out...</h1>
		<p class="text-gray-600 dark:text-gray-400">You are being signed out securely.</p>
		<div class="mt-6">
			<div class="spinner mx-auto"></div>
		</div>
	</div>
</div>

<style>
	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(59, 130, 246, 0.2);
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
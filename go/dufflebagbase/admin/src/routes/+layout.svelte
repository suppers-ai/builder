<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { auth, currentUser } from '$lib/stores/auth';
	
	let user: any = null;
	
	currentUser.subscribe(value => {
		user = value;
	});
	
	onMount(async () => {
		// Check if user is authenticated on mount
		await auth.checkAuth();
	});
</script>

{#if $page.url.pathname === '/login' || $page.url.pathname === '/signup'}
	<slot />
{:else}
	<div class="app-layout">
		<Sidebar currentUser={user} />
		<main class="main-content">
			<slot />
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
	}
	
	.main-content {
		flex: 1;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		overflow-y: auto;
	}
</style>
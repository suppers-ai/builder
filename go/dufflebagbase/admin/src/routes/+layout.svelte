<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Sidebar from '$lib/components/Sidebar.svelte';
	
	let sidebarCollapsed = false;
	
	function toggleSidebar() {
		sidebarCollapsed = !sidebarCollapsed;
	}
</script>

{#if $page.url.pathname === '/login' || $page.url.pathname === '/signup'}
	<slot />
{:else}
	<div class="app-layout">
		<aside class="admin-sidebar {sidebarCollapsed ? 'collapsed' : ''}">
			<div class="sidebar-logo-section">
				<a href="/" class="flex items-center">
					<span class="text-2xl font-bold text-gray-700" style="font-family: 'Itim', cursive;">
						{#if !sidebarCollapsed}
							Dufflebag
						{:else}
							DB
						{/if}
					</span>
				</a>
			</div>
			
			<div class="sidebar-menu-card">
				<Sidebar collapsed={sidebarCollapsed} />
			</div>
			
			<button 
				on:click={toggleSidebar}
				class="mt-auto p-3 rounded-lg glass-effect hover:bg-white/20 transition-all duration-200"
			>
				<svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					{#if sidebarCollapsed}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
					{:else}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
					{/if}
				</svg>
			</button>
		</aside>
		
		<main class="admin-main {sidebarCollapsed ? 'sidebar-collapsed' : ''} fade-in">
			<slot />
		</main>
	</div>
{/if}

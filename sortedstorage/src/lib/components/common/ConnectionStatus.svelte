<script lang="ts">
	import { Wifi, WifiOff } from 'lucide-svelte';
	import { websocket } from '$lib/services/websocket';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	
	let showStatus = false;
	let hideTimeout: NodeJS.Timeout;
	let connected = false;
	
	onMount(() => {
		// Only subscribe to websocket in browser
		const unsubscribe = websocket.connected.subscribe(value => {
			connected = value;
			if (value !== undefined) {
				showStatus = true;
				clearTimeout(hideTimeout);
				hideTimeout = setTimeout(() => {
					showStatus = false;
				}, 3000);
			}
		});
		
		return unsubscribe;
	});
</script>

{#if showStatus}
	<div 
		transition:fade={{ duration: 200 }}
		class="fixed bottom-4 right-4 z-50"
	>
		<div 
			class="flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg
				{connected 
					? 'bg-green-500 text-white' 
					: 'bg-red-500 text-white'}"
		>
			{#if connected}
				<Wifi class="w-4 h-4" />
				<span class="text-sm font-medium">Connected</span>
			{:else}
				<WifiOff class="w-4 h-4" />
				<span class="text-sm font-medium">Disconnected</span>
			{/if}
		</div>
	</div>
{/if}

<!-- Persistent indicator in header (optional) -->
<div class="flex items-center">
	<div 
		class="w-2 h-2 rounded-full {connected ? 'bg-green-500' : 'bg-red-500'}"
		title={connected ? 'Connected to server' : 'Disconnected from server'}
	></div>
</div>
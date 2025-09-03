<script lang="ts">
	import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';
	import { notifications } from '$lib/stores/notifications';
	
	const icons = {
		success: CheckCircle,
		error: AlertCircle,
		info: Info,
		warning: AlertTriangle
	};
	
	const colors = {
		success: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
		error: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
		info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
		warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
	};
</script>

<div class="fixed bottom-0 right-0 p-4 z-50 pointer-events-none">
	<div class="space-y-2">
		{#each $notifications as item (item.id)}
			<div
				class="pointer-events-auto max-w-sm w-full shadow-lg rounded-lg border {colors[item.type]} p-4"
				transition:fly={{ x: 100, duration: 300 }}
			>
				<div class="flex items-start gap-3">
					<svelte:component this={icons[item.type]} class="w-5 h-5 flex-shrink-0 mt-0.5" />
					<div class="flex-1 min-w-0">
						{#if item.title}
							<p class="font-medium">{item.title}</p>
						{/if}
						{#if item.message}
							<p class="text-sm opacity-90">{item.message}</p>
						{/if}
					</div>
					<button
						on:click={() => notifications.dismiss(item.id)}
						class="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
					>
						<X class="w-4 h-4" />
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>
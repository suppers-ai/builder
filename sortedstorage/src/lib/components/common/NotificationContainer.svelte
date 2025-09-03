<script lang="ts">
	import { 
		CheckCircle, XCircle, AlertTriangle, Info, 
		X, Download, Upload, Loader2 
	} from 'lucide-svelte';
	import { notifications } from '$lib/stores/notifications';
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import Button from './Button.svelte';
	
	const iconMap = {
		success: CheckCircle,
		error: XCircle,
		warning: AlertTriangle,
		info: Info
	};
	
	const colorMap = {
		success: 'text-green-500',
		error: 'text-red-500',
		warning: 'text-orange-500',
		info: 'text-blue-500'
	};
	
	const bgMap = {
		success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
		error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
		warning: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
		info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
	};
	
	function getProgressIcon(title: string) {
		if (title.toLowerCase().includes('upload')) return Upload;
		if (title.toLowerCase().includes('download')) return Download;
		return Loader2;
	}
</script>

<div class="notification-container fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
	{#each $notifications as notification (notification.id)}
		<div
			animate:flip={{ duration: 200 }}
			transition:fly={{ x: 100, duration: 200 }}
			class="notification pointer-events-auto max-w-sm w-full"
		>
			<div class="flex items-start gap-3 p-4 rounded-lg shadow-lg border {bgMap[notification.type]} bg-white dark:bg-gray-800">
				<!-- Icon -->
				<div class="flex-shrink-0">
					{#if notification.progress}
						<svelte:component 
							this={getProgressIcon(notification.title)} 
							class="w-5 h-5 {colorMap[notification.type]} {notification.progress.value < notification.progress.total ? 'animate-pulse' : ''}"
						/>
					{:else}
						<svelte:component 
							this={iconMap[notification.type]} 
							class="w-5 h-5 {colorMap[notification.type]}"
						/>
					{/if}
				</div>
				
				<!-- Content -->
				<div class="flex-1 min-w-0">
					<p class="text-sm font-medium text-gray-900 dark:text-gray-100">
						{notification.title}
					</p>
					
					{#if notification.message}
						<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
							{notification.message}
						</p>
					{/if}
					
					{#if notification.progress}
						<div class="mt-2">
							<div class="flex items-center justify-between text-xs text-gray-500 mb-1">
								<span>{Math.round((notification.progress.value / notification.progress.total) * 100)}%</span>
								<span>{notification.progress.value} / {notification.progress.total}</span>
							</div>
							<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
								<div 
									class="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
									style="width: {(notification.progress.value / notification.progress.total) * 100}%"
								></div>
							</div>
						</div>
					{/if}
					
					{#if notification.action}
						<button
							on:click={notification.action.callback}
							class="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
						>
							{notification.action.label}
						</button>
					{/if}
				</div>
				
				<!-- Dismiss button -->
				{#if notification.dismissible}
					<button
						on:click={() => notifications.remove(notification.id)}
						class="flex-shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						aria-label="Dismiss"
					>
						<X class="w-4 h-4 text-gray-400" />
					</button>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	.notification-container {
		max-height: calc(100vh - 2rem);
		overflow-y: auto;
		scrollbar-width: none;
	}
	
	.notification-container::-webkit-scrollbar {
		display: none;
	}
	
	.notification {
		container-type: inline-size;
	}
	
	@container (max-width: 320px) {
		.notification {
			font-size: 0.875rem;
		}
	}
	
	@media (max-width: 640px) {
		.notification-container {
			left: 1rem;
			right: 1rem;
			bottom: 1rem;
		}
	}
</style>
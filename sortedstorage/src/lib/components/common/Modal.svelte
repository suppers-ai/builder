<script lang="ts">
	import { X } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	
	export let open = false;
	export let title = '';
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let closable = true;
	
	const dispatch = createEventDispatcher();
	
	$: sizeClass = {
		'sm': 'max-w-md',
		'md': 'max-w-lg',
		'lg': 'max-w-2xl',
		'xl': 'max-w-4xl'
	}[size];
	
	function handleClose() {
		if (closable) {
			open = false;
			dispatch('close');
		}
	}
	
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && closable) {
			handleClose();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
	<div 
		class="fixed inset-0 z-50 overflow-y-auto"
		transition:fade={{ duration: 200 }}
	>
		<!-- Backdrop -->
		<div 
			class="fixed inset-0 bg-black bg-opacity-50"
			on:click={handleClose}
			role="button"
			tabindex="-1"
		/>
		
		<!-- Modal -->
		<div class="flex min-h-full items-center justify-center p-4">
			<div
				class="relative w-full {sizeClass} glass rounded-lg shadow-xl"
				transition:scale={{ duration: 200 }}
				on:click|stopPropagation
				role="dialog"
				aria-modal="true"
			>
				<!-- Header -->
				<div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
						{title}
					</h2>
					{#if closable}
						<button
							on:click={handleClose}
							class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
						>
							<X class="w-5 h-5" />
						</button>
					{/if}
				</div>
				
				<!-- Content -->
				<div class="p-6">
					<slot />
				</div>
				
				<!-- Footer -->
				{#if $$slots.footer}
					<div class="p-6 border-t border-gray-200 dark:border-gray-700">
						<slot name="footer" />
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
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
		'lg': 'max-w-3xl',
		'xl': 'max-w-5xl'
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
	<!-- Backdrop -->
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 modal-backdrop"
		transition:fade={{ duration: 200 }}
		on:click={handleClose}
		role="presentation"
		aria-hidden="true"
	/>
	
	<!-- Modal -->
	<div 
		class="fixed inset-0 flex items-center justify-center p-4 modal-wrapper"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="relative w-full {sizeClass} bg-white rounded-xl shadow-2xl overflow-hidden modal-dialog"
			transition:scale={{ duration: 200 }}
			on:click|stopPropagation
			role="dialog"
			aria-modal="true"
		>
				<!-- Header (only shown if title is provided) -->
				{#if title}
					<div class="modal-header flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
						<h2 class="text-xl font-semibold text-gray-900">
							{title}
						</h2>
						{#if closable}
							<button
								on:click={handleClose}
								class="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
							>
								<X class="w-5 h-5 text-gray-500" />
							</button>
						{/if}
					</div>
				{/if}
				
				<!-- Content -->
				<div class="modal-content">
					<slot />
				</div>
				
				<!-- Footer -->
				{#if $$slots.footer}
					<div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
						<slot name="footer" />
					</div>
				{/if}
			</div>
		</div>
{/if}

<style>
	.modal-backdrop {
		z-index: 9998;
	}
	
	.modal-wrapper {
		z-index: 9999;
		pointer-events: none;
	}
	
	.modal-wrapper > * {
		pointer-events: auto;
	}
	
	.modal-dialog {
		z-index: 10000;
		position: relative;
	}
	
	.modal-header {
		z-index: 1;
		position: relative;
	}
	
	.modal-content {
		max-height: calc(80vh - 120px);
		overflow: visible;
		position: relative;
		z-index: 1;
	}
	
	.modal-content::-webkit-scrollbar {
		width: 6px;
	}
	
	.modal-content::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.modal-content::-webkit-scrollbar-thumb {
		background: var(--color-tertiary, #f1e2dd);
		border-radius: 3px;
	}
	
	.modal-content::-webkit-scrollbar-thumb:hover {
		background: var(--color-accent, #a16d5b);
	}
</style>
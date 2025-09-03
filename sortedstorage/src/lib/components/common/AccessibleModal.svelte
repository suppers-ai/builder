<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { X } from 'lucide-svelte';
	import { trapFocus, announceToScreenReader } from '$lib/utils/accessibility';
	import Button from './Button.svelte';
	
	export let open = false;
	export let title = '';
	export let description = '';
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let closeOnEscape = true;
	export let closeOnBackdrop = true;
	export let showClose = true;
	export let role: 'dialog' | 'alertdialog' = 'dialog';
	export let labelledBy = '';
	export let describedBy = '';
	
	const dispatch = createEventDispatcher();
	
	let modalElement: HTMLElement;
	let previousFocus: HTMLElement | null = null;
	let removeTrapFocus: (() => void) | null = null;
	
	const modalId = `modal-${Math.random().toString(36).substr(2, 9)}`;
	const titleId = labelledBy || `${modalId}-title`;
	const descId = describedBy || `${modalId}-description`;
	
	const sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl'
	};
	
	function handleClose() {
		dispatch('close');
		open = false;
	}
	
	function handleBackdropClick(event: MouseEvent) {
		if (closeOnBackdrop && event.target === event.currentTarget) {
			handleClose();
		}
	}
	
	function handleKeyDown(event: KeyboardEvent) {
		if (closeOnEscape && event.key === 'Escape') {
			event.preventDefault();
			handleClose();
		}
	}
	
	$: if (open && modalElement) {
		// Store current focus
		previousFocus = document.activeElement as HTMLElement;
		
		// Trap focus in modal
		removeTrapFocus = trapFocus(modalElement);
		
		// Announce modal opening
		announceToScreenReader(`${title} dialog opened`, 'assertive');
		
		// Prevent body scroll
		document.body.style.overflow = 'hidden';
		
		// Add escape listener
		modalElement.addEventListener('escape', handleClose);
	}
	
	$: if (!open && previousFocus) {
		// Restore focus
		previousFocus.focus();
		previousFocus = null;
		
		// Remove focus trap
		removeTrapFocus?.();
		removeTrapFocus = null;
		
		// Restore body scroll
		document.body.style.overflow = '';
		
		// Announce modal closing
		announceToScreenReader('Dialog closed', 'assertive');
	}
	
	onDestroy(() => {
		// Cleanup
		removeTrapFocus?.();
		document.body.style.overflow = '';
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		on:keydown={handleKeyDown}
		aria-modal="true"
		{role}
		aria-labelledby={titleId}
		aria-describedby={description ? descId : undefined}
	>
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/50 backdrop-blur-sm"
			on:click={handleBackdropClick}
			aria-hidden="true"
		></div>
		
		<!-- Modal -->
		<div
			bind:this={modalElement}
			class="relative bg-base-100 rounded-2xl shadow-2xl w-full {sizeClasses[size]} max-h-[90vh] flex flex-col"
		>
			<!-- Header -->
			{#if title || showClose}
				<div class="flex items-center justify-between p-6 border-b border-base-200">
					{#if title}
						<h2 id={titleId} class="text-xl font-semibold">
							{title}
						</h2>
					{/if}
					
					{#if showClose}
						<button
							type="button"
							class="ml-auto p-2 rounded-lg hover:bg-base-200 transition-colors"
							on:click={handleClose}
							aria-label="Close dialog"
						>
							<X class="w-5 h-5" />
						</button>
					{/if}
				</div>
			{/if}
			
			<!-- Description -->
			{#if description}
				<div id={descId} class="sr-only">
					{description}
				</div>
			{/if}
			
			<!-- Content -->
			<div class="flex-1 overflow-y-auto p-6">
				<slot />
			</div>
			
			<!-- Footer -->
			{#if $$slots.footer}
				<div class="p-6 border-t border-base-200">
					<slot name="footer" />
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Ensure proper stacking context */
	:global(body) {
		position: relative;
	}
	
	/* Animation for modal entrance */
	.fixed {
		animation: fadeIn 0.2s ease-out;
	}
	
	.relative {
		animation: slideUp 0.3s ease-out;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	
	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.fixed,
		.relative {
			animation: none;
		}
	}
</style>
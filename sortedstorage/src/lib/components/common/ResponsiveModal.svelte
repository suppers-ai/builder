<script lang="ts">
	import { X } from 'lucide-svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { createEventDispatcher, onMount } from 'svelte';
	
	export let open = false;
	export let title = '';
	export let size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
	export let closable = true;
	export let slideFrom: 'bottom' | 'right' = 'bottom';
	export let fullscreenOnMobile = true;
	
	const dispatch = createEventDispatcher();
	
	let isMobile = false;
	
	onMount(() => {
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	});
	
	function checkMobile() {
		isMobile = window.innerWidth < 768;
	}
	
	function handleClose() {
		if (closable) {
			open = false;
			dispatch('close');
		}
	}
	
	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget && closable) {
			handleClose();
		}
	}
	
	function handleEscape(e: KeyboardEvent) {
		if (e.key === 'Escape' && closable) {
			handleClose();
		}
	}
	
	$: if (open) {
		document.body.style.overflow = 'hidden';
	} else {
		document.body.style.overflow = '';
	}
	
	const sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		full: 'max-w-full'
	};
</script>

<svelte:window on:keydown={handleEscape} />

{#if open}
	<!-- Backdrop -->
	<div 
		transition:fade={{ duration: 200 }}
		class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
		on:click={handleBackdropClick}
		aria-hidden="true"
	>
		<!-- Modal Container -->
		{#if isMobile && fullscreenOnMobile}
			<!-- Mobile Full Screen -->
			<div 
				transition:slide={{ duration: 300, axis: 'y' }}
				class="fixed inset-0 bg-white dark:bg-gray-800 flex flex-col"
			>
				<!-- Mobile Header -->
				<header class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
					<h2 class="text-lg font-semibold">{title}</h2>
					{#if closable}
						<button
							on:click={handleClose}
							class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
							aria-label="Close"
						>
							<X class="w-5 h-5" />
						</button>
					{/if}
				</header>
				
				<!-- Mobile Content -->
				<div class="flex-1 overflow-y-auto px-4 py-4">
					<slot />
				</div>
				
				<!-- Mobile Footer (if provided) -->
				{#if $$slots.footer}
					<footer class="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
						<slot name="footer" />
					</footer>
				{/if}
			</div>
		{:else}
			<!-- Desktop/Tablet Modal -->
			<div class="flex items-center justify-center min-h-screen p-4">
				<div 
					transition:fly={{ y: 20, duration: 300 }}
					class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full {sizeClasses[size]} max-h-[90vh] flex flex-col"
				>
					<!-- Desktop Header -->
					{#if title || closable}
						<header class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
							<h2 class="text-xl font-semibold">{title}</h2>
							{#if closable}
								<button
									on:click={handleClose}
									class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
									aria-label="Close"
								>
									<X class="w-5 h-5" />
								</button>
							{/if}
						</header>
					{/if}
					
					<!-- Desktop Content -->
					<div class="flex-1 overflow-y-auto px-6 py-4">
						<slot />
					</div>
					
					<!-- Desktop Footer (if provided) -->
					{#if $$slots.footer}
						<footer class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
							<slot name="footer" />
						</footer>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	/* Ensure proper stacking context */
	:global(body.modal-open) {
		overflow: hidden;
	}
	
	/* Safe area for notched devices */
	@supports (padding: max(0px)) {
		header {
			padding-top: max(1rem, env(safe-area-inset-top));
		}
		
		footer {
			padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
		}
	}
	
	/* Smooth scrolling on iOS */
	.overflow-y-auto {
		-webkit-overflow-scrolling: touch;
	}
</style>
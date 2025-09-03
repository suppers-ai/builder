<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { writable } from 'svelte/store';
	
	export let items: any[] = [];
	export let height = '600px';
	export let itemHeight = 50;
	export let buffer = 5;
	export let threshold = 0;
	
	const dispatch = createEventDispatcher();
	
	let container: HTMLDivElement;
	let viewport: HTMLDivElement;
	let scrollTop = 0;
	let viewportHeight = 600;
	let visibleStart = 0;
	let visibleEnd = 0;
	
	$: totalHeight = items.length * itemHeight;
	$: {
		visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
		visibleEnd = Math.min(
			items.length,
			Math.ceil((scrollTop + viewportHeight) / itemHeight) + buffer
		);
	}
	$: visibleItems = items.slice(visibleStart, visibleEnd);
	$: offsetY = visibleStart * itemHeight;
	
	// Check if we need to load more items
	$: if (items.length > 0 && visibleEnd >= items.length - threshold) {
		dispatch('loadmore');
	}
	
	function handleScroll() {
		if (viewport) {
			scrollTop = viewport.scrollTop;
		}
	}
	
	function updateViewportHeight() {
		if (viewport) {
			viewportHeight = viewport.clientHeight;
		}
	}
	
	onMount(() => {
		updateViewportHeight();
		
		// Add resize observer
		if ('ResizeObserver' in window && viewport) {
			const resizeObserver = new ResizeObserver(() => {
				updateViewportHeight();
			});
			
			resizeObserver.observe(viewport);
			
			return () => {
				resizeObserver.disconnect();
			};
		}
		
		// Fallback to window resize event
		window.addEventListener('resize', updateViewportHeight);
		
		return () => {
			window.removeEventListener('resize', updateViewportHeight);
		};
	});
</script>

<div 
	bind:this={container}
	class="virtual-list-container"
	style="height: {height};"
>
	<div 
		bind:this={viewport}
		class="virtual-list-viewport"
		on:scroll={handleScroll}
	>
		<!-- Total height spacer -->
		<div 
			class="virtual-list-spacer" 
			style="height: {totalHeight}px;"
		>
			<!-- Visible items -->
			<div 
				class="virtual-list-content"
				style="transform: translateY({offsetY}px);"
			>
				{#each visibleItems as item, index (item.id || visibleStart + index)}
					<div 
						class="virtual-list-item"
						style="height: {itemHeight}px;"
					>
						<slot {item} index={visibleStart + index} />
					</div>
				{/each}
			</div>
		</div>
	</div>
	
	<!-- Scroll indicator -->
	{#if items.length > 50}
		<div class="scroll-indicator">
			<div 
				class="scroll-thumb"
				style="
					height: {Math.max(20, (viewportHeight / totalHeight) * 100)}%;
					top: {(scrollTop / totalHeight) * 100}%;
				"
			/>
		</div>
	{/if}
</div>

<style>
	.virtual-list-container {
		position: relative;
		overflow: hidden;
	}
	
	.virtual-list-viewport {
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		-webkit-overflow-scrolling: touch;
	}
	
	.virtual-list-spacer {
		position: relative;
		width: 100%;
	}
	
	.virtual-list-content {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
	}
	
	.virtual-list-item {
		width: 100%;
		overflow: hidden;
	}
	
	/* Custom scrollbar */
	.virtual-list-viewport::-webkit-scrollbar {
		width: 8px;
	}
	
	.virtual-list-viewport::-webkit-scrollbar-track {
		background: rgb(243 244 246);
		border-radius: 4px;
	}
	
	.virtual-list-viewport::-webkit-scrollbar-thumb {
		background: rgb(209 213 219);
		border-radius: 4px;
	}
	
	.virtual-list-viewport::-webkit-scrollbar-thumb:hover {
		background: rgb(156 163 175);
	}
	
	/* Scroll indicator for mobile */
	.scroll-indicator {
		position: absolute;
		right: 2px;
		top: 0;
		bottom: 0;
		width: 4px;
		background: rgba(0, 0, 0, 0.1);
		border-radius: 2px;
		opacity: 0;
		transition: opacity 0.3s;
		pointer-events: none;
	}
	
	.virtual-list-viewport:hover ~ .scroll-indicator,
	.virtual-list-viewport:focus ~ .scroll-indicator {
		opacity: 1;
	}
	
	.scroll-thumb {
		position: absolute;
		width: 100%;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 2px;
		transition: top 0.1s;
	}
	
	:global(.dark) .virtual-list-viewport::-webkit-scrollbar-track {
		background: rgb(31 41 55);
	}
	
	:global(.dark) .virtual-list-viewport::-webkit-scrollbar-thumb {
		background: rgb(75 85 99);
	}
	
	:global(.dark) .virtual-list-viewport::-webkit-scrollbar-thumb:hover {
		background: rgb(107 114 128);
	}
	
	:global(.dark) .scroll-indicator {
		background: rgba(255, 255, 255, 0.1);
	}
	
	:global(.dark) .scroll-thumb {
		background: rgba(255, 255, 255, 0.5);
	}
	
	:global(.dark) .virtual-list-viewport::-webkit-scrollbar-track {
		background: rgb(31 41 55);
	}
	
	:global(.dark) .virtual-list-viewport::-webkit-scrollbar-thumb {
		background: rgb(75 85 99);
	}
	
	:global(.dark) .virtual-list-viewport::-webkit-scrollbar-thumb:hover {
		background: rgb(107 114 128);
	}
	
	:global(.dark) .scroll-indicator {
		background: rgba(255, 255, 255, 0.1);
	}
	
	:global(.dark) .scroll-thumb {
		background: rgba(255, 255, 255, 0.5);
	}
</style>
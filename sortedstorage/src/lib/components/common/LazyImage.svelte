<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	
	export let src: string;
	export let alt: string = '';
	export let className: string = '';
	export let placeholder: string = '';
	export let threshold = 0.1;
	export let rootMargin = '50px';
	
	let imgElement: HTMLImageElement;
	let containerElement: HTMLDivElement;
	let loaded = false;
	let error = false;
	let inView = false;
	
	onMount(() => {
		// Check if IntersectionObserver is supported
		if ('IntersectionObserver' in window) {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach(entry => {
						if (entry.isIntersecting && !inView) {
							inView = true;
							loadImage();
							observer.unobserve(entry.target);
						}
					});
				},
				{
					threshold,
					rootMargin
				}
			);
			
			if (containerElement) {
				observer.observe(containerElement);
			}
			
			return () => {
				if (containerElement) {
					observer.unobserve(containerElement);
				}
			};
		} else {
			// Fallback for browsers that don't support IntersectionObserver
			inView = true;
			loadImage();
		}
	});
	
	function loadImage() {
		if (!src) return;
		
		const img = new Image();
		
		img.onload = () => {
			loaded = true;
			error = false;
		};
		
		img.onerror = () => {
			error = true;
			loaded = false;
		};
		
		img.src = src;
	}
	
	function handleImageError() {
		error = true;
		loaded = false;
	}
</script>

<div bind:this={containerElement} class="lazy-image-container {className}">
	{#if !inView || (!loaded && !error)}
		<!-- Placeholder -->
		{#if placeholder}
			<img 
				src={placeholder} 
				{alt}
				class="placeholder {className}"
				aria-hidden="true"
			/>
		{:else}
			<div class="skeleton {className}">
				<svg class="skeleton-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
					/>
				</svg>
			</div>
		{/if}
	{/if}
	
	{#if inView && !error}
		<img
			bind:this={imgElement}
			{src}
			{alt}
			class="{className} {loaded ? 'loaded' : 'loading'}"
			on:load={() => loaded = true}
			on:error={handleImageError}
			transition:fade={{ duration: 300 }}
			loading="lazy"
			decoding="async"
		/>
	{/if}
	
	{#if error}
		<div class="error-state {className}">
			<svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
					d="M6 18L18 6M6 6l12 12" 
				/>
			</svg>
			<span class="error-text">Failed to load</span>
		</div>
	{/if}
</div>

<style>
	.lazy-image-container {
		position: relative;
		overflow: hidden;
		background: rgb(243 244 246);
	}
	
	.skeleton {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			rgb(243 244 246) 0%,
			rgb(229 231 235) 50%,
			rgb(243 244 246) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
	}
	
	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}
	
	.skeleton-icon {
		width: 2rem;
		height: 2rem;
		color: rgb(156 163 175);
	}
	
	.placeholder {
		filter: blur(10px);
		transform: scale(1.1);
	}
	
	img.loading {
		opacity: 0;
	}
	
	img.loaded {
		opacity: 1;
		animation: fadeIn 0.3s ease-in-out;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		background: rgb(254 242 242);
		color: rgb(239 68 68);
	}
	
	.error-icon {
		width: 2rem;
		height: 2rem;
		margin-bottom: 0.5rem;
	}
	
	.error-text {
		font-size: 0.75rem;
	}
	
	:global(.dark) .lazy-image-container {
		background: rgb(55 65 81);
	}
	
	:global(.dark) .skeleton {
		background: linear-gradient(
			90deg,
			rgb(55 65 81) 0%,
			rgb(75 85 99) 50%,
			rgb(55 65 81) 100%
		);
	}
	
	:global(.dark) .lazy-image-container {
		background: rgb(55 65 81);
	}
	
	:global(.dark) .error-state {
		background: rgb(127 29 29 / 0.2);
	}
</style>
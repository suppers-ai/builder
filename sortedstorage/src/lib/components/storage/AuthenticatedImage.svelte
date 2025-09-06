<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	
	export let src: string;
	export let alt: string = '';
	export let loading: 'lazy' | 'eager' = 'lazy';
	export let className: string = '';
	
	let imageUrl: string | null = null;
	let error = false;
	let isLoading = true;
	
	onMount(async () => {
		if (!src) {
			error = true;
			isLoading = false;
			return;
		}
		
		try {
			// Fetch the image with authentication
			const response = await fetch(src, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
				}
			});
			
			if (!response.ok) {
				throw new Error(`Failed to load image: ${response.status}`);
			}
			
			// Convert response to blob and create object URL
			const blob = await response.blob();
			imageUrl = URL.createObjectURL(blob);
			isLoading = false;
		} catch (err) {
			console.error('Failed to load image:', err);
			error = true;
			isLoading = false;
		}
		
		// Cleanup function to revoke object URL
		return () => {
			if (imageUrl) {
				URL.revokeObjectURL(imageUrl);
			}
		};
	});
</script>

{#if isLoading}
	<div class="image-placeholder {className}">
		<div class="spinner"></div>
	</div>
{:else if error}
	<div class="image-error {className}">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
			<circle cx="8.5" cy="8.5" r="1.5"></circle>
			<polyline points="21 15 16 10 5 21"></polyline>
		</svg>
		<span>Failed to load image</span>
	</div>
{:else if imageUrl}
	<img src={imageUrl} {alt} class={className} />
{/if}

<style>
	.image-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f3f4f6;
		min-height: 100px;
	}
	
	.spinner {
		width: 24px;
		height: 24px;
		border: 2px solid #e5e7eb;
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.image-error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem;
		background: #f3f4f6;
		color: #6b7280;
		min-height: 100px;
	}
	
	.image-error svg {
		opacity: 0.5;
	}
	
	.image-error span {
		font-size: 0.75rem;
	}
</style>
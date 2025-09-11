<script lang="ts">
	import { File, Folder, MoreVertical, Download, Share2, Trash2 } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import type { StorageItem } from '$lib/types/storage';
	import { isFolder as checkIsFolder } from '$lib/types/storage';
	
	export let item: StorageItem;
	export let selected = false;
	
	const dispatch = createEventDispatcher();
	
	$: isFolder = checkIsFolder(item);
	
	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	}
	
	function handleTap() {
		dispatch('tap', { item });
	}
	
	function handleLongPress() {
		dispatch('longpress', { item });
	}
	
	function handleAction(action: string) {
		dispatch('action', { action, item });
	}
	
	let pressTimer: number;
	let moved = false;
	
	function handleTouchStart(e: TouchEvent) {
		moved = false;
		pressTimer = window.setTimeout(() => {
			if (!moved) {
				handleLongPress();
				// Haptic feedback if available
				if ('vibrate' in navigator) {
					navigator.vibrate(50);
				}
			}
		}, 500);
	}
	
	function handleTouchMove() {
		moved = true;
		clearTimeout(pressTimer);
	}
	
	function handleTouchEnd() {
		clearTimeout(pressTimer);
		if (!moved) {
			handleTap();
		}
	}
</script>

<div 
	class="mobile-file-card {selected ? 'selected' : ''}"
	on:touchstart={handleTouchStart}
	on:touchmove={handleTouchMove}
	on:touchend={handleTouchEnd}
	on:click={handleTap}
	role="button"
	tabindex="0"
>
	<div class="card-content">
		<!-- Icon/Thumbnail -->
		<div class="icon-container">
			{#if isFolder}
				<Folder class="w-10 h-10 text-blue-500" />
			{:else if item.thumbnailUrl}
				<img 
					src={item.thumbnailUrl} 
					alt={item.object_name} 
					class="w-10 h-10 object-cover rounded"
					loading="lazy"
				/>
			{:else}
				<File class="w-10 h-10 text-gray-400" />
			{/if}
		</div>
		
		<!-- Info -->
		<div class="info">
			<p class="name">{item.object_name}</p>
			<p class="meta">
				{#if isFolder}
					Folder
				{:else}
					{formatFileSize(item.size)}
				{/if}
			</p>
		</div>
		
		<!-- Actions -->
		<div class="actions">
			<button 
				class="action-btn"
				on:click|stopPropagation={() => handleAction('menu')}
				aria-label="More options"
			>
				<MoreVertical class="w-5 h-5" />
			</button>
		</div>
	</div>
	
	<!-- Selection indicator -->
	{#if selected}
		<div class="selection-indicator">
			<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
			</svg>
		</div>
	{/if}
</div>

<style>
	.mobile-file-card {
		position: relative;
		background: white;
		border-radius: 0.5rem;
		border: 1px solid rgb(229 231 235);
		transition: all 0.2s;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}
	
	.mobile-file-card:active {
		transform: scale(0.98);
		background: rgb(249 250 251);
	}
	
	.mobile-file-card.selected {
		background: rgb(239 246 255);
		border-color: rgb(59 130 246);
	}
	
	.card-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
	}
	
	.icon-container {
		flex-shrink: 0;
	}
	
	.info {
		flex: 1;
		min-width: 0;
	}
	
	.name {
		font-size: 0.875rem;
		font-weight: 500;
		color: rgb(17 24 39);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.meta {
		font-size: 0.75rem;
		color: rgb(107 114 128);
	}
	
	.actions {
		flex-shrink: 0;
	}
	
	.action-btn {
		padding: 0.5rem;
		border-radius: 0.375rem;
		color: rgb(107 114 128);
		transition: all 0.15s;
	}
	
	.action-btn:hover {
		background: rgb(243 244 246);
	}
	
	.selection-indicator {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		width: 1.5rem;
		height: 1.5rem;
		background: rgb(59 130 246);
		color: white;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: pop 0.2s ease-out;
	}
	
	@keyframes pop {
		0% {
			transform: scale(0);
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
		}
	}
	
	/* Improve touch responsiveness */
	@media (hover: none) {
		.mobile-file-card {
			-webkit-touch-callout: none;
		}
	}
	
	:global(.dark) .mobile-file-card {
		background: rgb(31 41 55);
		border-color: rgb(55 65 81);
	}
	
	:global(.dark) .mobile-file-card:active {
		background: rgb(55 65 81);
	}
	
	:global(.dark) .mobile-file-card.selected {
		background: rgb(30 58 138);
	}
	
	:global(.dark) .name {
		color: rgb(243 244 246);
	}
	
	:global(.dark) .meta {
		color: rgb(156 163 175);
	}
	
	:global(.dark) .action-btn:hover {
		background: rgb(55 65 81);
	}
</style>
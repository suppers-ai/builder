<script lang="ts">
	import { Upload, FolderOpen, Copy, Move } from 'lucide-svelte';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { dragDropService, isExternalDrag, handleFileDrop, preventDefaultDrag } from '$lib/services/dragdrop';
	
	export let path: string = '/';
	export let accept: string = '*/*';
	export let multiple: boolean = true;
	export let disabled: boolean = false;
	export let className: string = '';
	
	const dispatch = createEventDispatcher();
	
	let dropZone: HTMLElement;
	let isDragOver = false;
	let isExternalDragOver = false;
	let dragCounter = 0;
	
	$: canDrop = !disabled && (isExternalDragOver || dragDropService.canDrop(path));
	$: isActive = isDragOver && canDrop;
	
	function handleDragEnter(event: DragEvent) {
		preventDefaultDrag(event);
		dragCounter++;
		
		if (isExternalDrag(event)) {
			isExternalDragOver = true;
			isDragOver = true;
		} else if ($dragDropService.dragging$) {
			isDragOver = true;
			dragDropService.setDropTarget(path);
		}
	}
	
	function handleDragLeave(event: DragEvent) {
		preventDefaultDrag(event);
		dragCounter--;
		
		if (dragCounter === 0) {
			isDragOver = false;
			isExternalDragOver = false;
			if ($dragDropService.dragging$) {
				dragDropService.setDropTarget(null);
			}
		}
	}
	
	function handleDragOver(event: DragEvent) {
		preventDefaultDrag(event);
		
		// Set drop effect
		if (event.dataTransfer) {
			if (event.ctrlKey || event.metaKey) {
				event.dataTransfer.dropEffect = 'copy';
			} else {
				event.dataTransfer.dropEffect = 'move';
			}
		}
	}
	
	async function handleDrop(event: DragEvent) {
		preventDefaultDrag(event);
		
		// Reset drag state
		isDragOver = false;
		isExternalDragOver = false;
		dragCounter = 0;
		
		if (disabled) return;
		
		// Handle external file drop
		if (isExternalDrag(event)) {
			const files = handleFileDrop(event);
			if (files.length > 0) {
				dispatch('upload', { files, path });
			}
			return;
		}
		
		// Handle internal drag and drop
		if ($dragDropService.dragging$) {
			const operation = (event.ctrlKey || event.metaKey) ? 'copy' : 'move';
			
			try {
				await dragDropService.handleDrop(path, operation);
				dispatch('drop', { 
					path, 
					operation,
					items: $dragDropService.draggedItem$?.items || []
				});
			} catch (error) {
				console.error('Drop failed:', error);
				dispatch('error', { error });
			}
		}
	}
	
	onMount(() => {
		if (dropZone) {
			// Register this as a drop zone
			dragDropService.registerDropZone(path, path, path === '/' ? 'root' : 'folder');
		}
	});
	
	onDestroy(() => {
		// Unregister drop zone
		dragDropService.unregisterDropZone(path);
	});
</script>

<div
	bind:this={dropZone}
	on:dragenter={handleDragEnter}
	on:dragleave={handleDragLeave}
	on:dragover={handleDragOver}
	on:drop={handleDrop}
	class="drag-drop-zone {className}"
	class:drag-over={isActive}
	class:can-drop={canDrop && isDragOver}
	class:cannot-drop={!canDrop && isDragOver}
	aria-label="Drop zone"
	role="region"
>
	{#if isDragOver}
		<div class="drop-overlay">
			{#if isExternalDragOver}
				<div class="drop-indicator">
					<Upload class="w-12 h-12 text-primary-500" />
					<p class="text-lg font-medium">Drop files here to upload</p>
					<p class="text-sm text-gray-500">
						{multiple ? 'Drop one or more files' : 'Drop a file'} to {path}
					</p>
				</div>
			{:else if canDrop}
				<div class="drop-indicator">
					{#if $dragDropService.draggedItem$?.type === 'folder'}
						<FolderOpen class="w-12 h-12 text-primary-500" />
					{:else}
						<div class="relative">
							{#if event?.ctrlKey || event?.metaKey}
								<Copy class="w-12 h-12 text-primary-500" />
							{:else}
								<Move class="w-12 h-12 text-primary-500" />
							{/if}
						</div>
					{/if}
					<p class="text-lg font-medium">
						{#if event?.ctrlKey || event?.metaKey}
							Copy to {path === '/' ? 'root' : path}
						{:else}
							Move to {path === '/' ? 'root' : path}
						{/if}
					</p>
					<p class="text-sm text-gray-500">
						{$dragDropService.draggedItem$?.items.length || 0} item(s)
					</p>
				</div>
			{:else}
				<div class="drop-indicator cannot-drop">
					<div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
						<svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
						</svg>
					</div>
					<p class="text-lg font-medium text-red-600 dark:text-red-400">Cannot drop here</p>
					<p class="text-sm text-gray-500">
						{#if path === $dragDropService.draggedItem$?.source}
							Items are already in this location
						{:else}
							Cannot move folder into itself
						{/if}
					</p>
				</div>
			{/if}
		</div>
	{/if}
	
	<slot />
</div>

<style>
	.drag-drop-zone {
		position: relative;
		min-height: 100px;
	}
	
	.drop-overlay {
		position: absolute;
		inset: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(4px);
		border-radius: 0.5rem;
		pointer-events: none;
	}
	
	.drag-over.can-drop .drop-overlay {
		border: 2px dashed rgb(59, 130, 246);
		background-color: rgba(239, 246, 255, 0.95);
	}
	
	.drag-over.cannot-drop .drop-overlay {
		border: 2px dashed rgb(239, 68, 68);
		background-color: rgba(254, 242, 242, 0.95);
	}
	
	.drop-indicator {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 2rem;
		text-align: center;
		animation: fadeIn 0.2s ease-in-out;
	}
	
	.drop-indicator.cannot-drop {
		animation: shake 0.3s ease-in-out;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	
	:global(.dark) .drop-overlay {
		background-color: rgba(17, 24, 39, 0.95);
	}
	
	@keyframes shake {
		0%, 100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-5px);
		}
		75% {
			transform: translateX(5px);
		}
	}
	
	:global(.dark) .drop-overlay {
		background-color: rgba(17, 24, 39, 0.95);
	}
	
	:global(.dark) .drag-over.can-drop .drop-overlay {
		background-color: rgba(30, 58, 138, 0.2);
	}
	
	:global(.dark) .drag-over.cannot-drop .drop-overlay {
		background-color: rgba(127, 29, 29, 0.2);
	}
</style>
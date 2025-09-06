<script lang="ts">
	import { File, Folder, Image, FileText, Film, Music, Archive, MoreVertical, Download, Share2, Trash2, Edit3 } from 'lucide-svelte';
	import Dropdown from '../common/Dropdown.svelte';
	import type { FileItem, FolderItem } from '$lib/types/storage';
	import { createEventDispatcher } from 'svelte';
	
	export let item: FileItem | FolderItem;
	export let selected = false;
	export let view: 'grid' | 'list' = 'grid';
	
	const dispatch = createEventDispatcher();
	
	function getFileIcon(mimeType?: string) {
		if (!mimeType) return Folder;
		
		if (mimeType.startsWith('image/')) return Image;
		if (mimeType.startsWith('video/')) return Film;
		if (mimeType.startsWith('audio/')) return Music;
		if (mimeType.includes('pdf')) return FileText;
		if (mimeType.includes('zip') || mimeType.includes('tar')) return Archive;
		
		return File;
	}
	
	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	}
	
	function formatDate(date: Date | string): string {
		return new Date(date).toLocaleDateString();
	}
	
	function isFolder(item: FileItem | FolderItem): item is FolderItem {
		return 'itemCount' in item;
	}
	
	const dropdownItems = [
		{ label: 'Download', value: 'download', icon: Download },
		{ label: 'Share', value: 'share', icon: Share2 },
		{ label: 'Rename', value: 'rename', icon: Edit3 },
		{ divider: true },
		{ label: 'Delete', value: 'delete', icon: Trash2 }
	];
	
	function handleAction(event: CustomEvent) {
		dispatch('action', { action: event.detail.value, item });
	}
	
	$: Icon = isFolder(item) ? Folder : getFileIcon((item as FileItem).mimeType);
</script>

{#if view === 'grid'}
	<!-- Grid View Card -->
	<div 
		class="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all cursor-pointer
			{selected ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''}"
		on:click={() => dispatch('select', item)}
		on:dblclick={() => dispatch('open', item)}
	>
		<!-- Selection Checkbox -->
		<div class="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
			<input 
				type="checkbox" 
				{selected}
				on:click|stopPropagation
				on:change={() => dispatch('select', item)}
				class="rounded border-gray-300 dark:border-gray-600"
			/>
		</div>
		
		<!-- Actions Menu -->
		<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
			<Dropdown on:select={handleAction} items={dropdownItems} position="right">
				<button 
					slot="trigger"
					on:click|stopPropagation
					class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
				>
					<MoreVertical class="w-4 h-4" />
				</button>
			</Dropdown>
		</div>
		
		<!-- Icon/Thumbnail -->
		<div class="flex justify-center mb-3">
			{#if !isFolder(item) && (item as FileItem).mimeType?.startsWith('image/')}
				<!-- Image thumbnail would go here -->
				<div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
					<Image class="w-8 h-8 text-gray-400" />
				</div>
			{:else}
				<svelte:component this={Icon} class="w-16 h-16 text-gray-400" />
			{/if}
		</div>
		
		<!-- Name -->
		<p class="text-sm font-medium truncate mb-1" title={item.name}>
			{item.name}
		</p>
		
		<!-- Info -->
		<div class="text-xs text-gray-500">
			{#if isFolder(item)}
				<span>{item.itemCount} items</span>
			{:else}
				<span>{formatFileSize(item.size)}</span>
			{/if}
		</div>
		
		<!-- Shared Badge -->
		{#if item.isShared}
			<div class="absolute bottom-2 right-2">
				<Share2 class="w-3 h-3 text-primary-500" />
			</div>
		{/if}
	</div>
{:else}
	<!-- List View Row -->
	<tr 
		class="group hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer
			{selected ? 'bg-primary-50 dark:bg-primary-900/20' : ''}"
		on:click={() => dispatch('select', item)}
		on:dblclick={() => dispatch('open', item)}
	>
		<td class="px-4 py-3">
			<input 
				type="checkbox" 
				{selected}
				on:click|stopPropagation
				on:change={() => dispatch('select', item)}
				class="rounded border-gray-300 dark:border-gray-600"
			/>
		</td>
		<td class="px-4 py-3">
			<div class="flex items-center gap-3">
				<svelte:component this={Icon} class="w-5 h-5 text-gray-400 flex-shrink-0" />
				<span class="truncate font-medium">{item.name}</span>
				{#if item.isShared}
					<Share2 class="w-3 h-3 text-primary-500" />
				{/if}
			</div>
		</td>
		<td class="px-4 py-3 text-sm text-gray-500">
			{#if isFolder(item)}
				{item.itemCount} items
			{:else}
				{formatFileSize(item.size)}
			{/if}
		</td>
		<td class="px-4 py-3 text-sm text-gray-500">
			{formatDate(item.modifiedAt)}
		</td>
		<td class="px-4 py-3">
			<div class="opacity-0 group-hover:opacity-100 transition-opacity">
				<Dropdown on:select={handleAction} items={dropdownItems} position="right">
					<button 
						slot="trigger"
						on:click|stopPropagation
						class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
					>
						<MoreVertical class="w-4 h-4" />
					</button>
				</Dropdown>
			</div>
		</td>
	</tr>
{/if}
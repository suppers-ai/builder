<script lang="ts">
	import { onMount } from 'svelte';
	import { Clock, Star, Download, Eye, Edit, Share2, MoreVertical, FileText, Image, Video, Archive, Music } from 'lucide-svelte';
	import { recentFiles } from '$lib/stores/recent';
	import { formatFileSize, formatRelativeTime } from '$lib/utils/format';
	import Button from '../common/Button.svelte';
	import type { RecentItem } from '$lib/stores/recent';
	
	export let view: 'recent' | 'starred' | 'most-accessed' = 'recent';
	export let limit = 20;
	
	let items: RecentItem[] = [];
	let loading = false;
	
	// Get appropriate items based on view
	$: {
		switch (view) {
			case 'recent':
				items = $recentFiles.recentItems$.slice(0, limit);
				break;
			case 'starred':
				items = $recentFiles.starredItems$.map(s => ({
					item: s.item,
					accessedAt: s.starredAt,
					accessType: 'view' as const,
					accessCount: 1
				}));
				break;
			case 'most-accessed':
				items = $recentFiles.mostAccessed$;
				break;
		}
	}
	
	function getFileIcon(mimeType: string) {
		if (mimeType.startsWith('image/')) return Image;
		if (mimeType.startsWith('video/')) return Video;
		if (mimeType.startsWith('audio/')) return Music;
		if (mimeType.includes('zip') || mimeType.includes('tar')) return Archive;
		return FileText;
	}
	
	function getAccessIcon(type: string) {
		switch (type) {
			case 'view': return Eye;
			case 'edit': return Edit;
			case 'download': return Download;
			case 'share': return Share2;
			default: return Eye;
		}
	}
	
	function getAccessLabel(type: string) {
		switch (type) {
			case 'view': return 'Viewed';
			case 'edit': return 'Edited';
			case 'download': return 'Downloaded';
			case 'share': return 'Shared';
			default: return 'Accessed';
		}
	}
	
	async function toggleStar(item: RecentItem) {
		const isStarred = recentFiles.isStarred(item.item.id);
		recentFiles.toggleStar(item.item);
	}
	
	function openFile(item: RecentItem) {
		// Track access
		recentFiles.trackAccess(item.item, 'view');
		
		// Dispatch event to open file
		const event = new CustomEvent('open-file', { 
			detail: item.item,
			bubbles: true
		});
		document.dispatchEvent(event);
	}
	
	function clearHistory() {
		if (confirm('Are you sure you want to clear your recent history?')) {
			recentFiles.clearRecent();
		}
	}
	
	function exportHistory() {
		const csv = recentFiles.exportRecentActivity();
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `recent-files-${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			{#if view === 'recent'}
				<Clock class="w-6 h-6 text-primary" />
				<h2 class="text-xl font-semibold">Recent Files</h2>
			{:else if view === 'starred'}
				<Star class="w-6 h-6 text-yellow-500" />
				<h2 class="text-xl font-semibold">Starred Files</h2>
			{:else}
				<Clock class="w-6 h-6 text-primary" />
				<h2 class="text-xl font-semibold">Most Accessed</h2>
			{/if}
			<span class="badge badge-primary badge-outline">
				{items.length}
			</span>
		</div>
		
		{#if view === 'recent' && items.length > 0}
			<div class="flex gap-2">
				<Button variant="ghost" size="sm" on:click={exportHistory}>
					Export
				</Button>
				<Button variant="ghost" size="sm" on:click={clearHistory}>
					Clear
				</Button>
			</div>
		{/if}
	</div>
	
	<!-- Items List -->
	{#if loading}
		<div class="space-y-4">
			{#each Array(5) as _}
				<div class="skeleton h-20 w-full rounded-lg"></div>
			{/each}
		</div>
	{:else if items.length === 0}
		<div class="text-center py-12">
			<div class="inline-flex items-center justify-center w-16 h-16 bg-base-200 rounded-full mb-4">
				{#if view === 'starred'}
					<Star class="w-8 h-8 text-base-content/40" />
				{:else}
					<Clock class="w-8 h-8 text-base-content/40" />
				{/if}
			</div>
			<h3 class="text-lg font-medium mb-2">
				{#if view === 'starred'}
					No starred files
				{:else}
					No recent activity
				{/if}
			</h3>
			<p class="text-base-content/60">
				{#if view === 'starred'}
					Star important files to quickly access them here
				{:else}
					Your recently accessed files will appear here
				{/if}
			</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each items as item (item.item.id)}
				<div class="group relative bg-base-100 hover:bg-base-200 rounded-lg p-4 transition-colors">
					<div class="flex items-center gap-4">
						<!-- File Icon -->
						<div class="shrink-0">
							{#if item.item.type === 'file'}
								<div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
									<svelte:component 
										this={getFileIcon(item.item.mimeType)} 
										class="w-6 h-6 text-primary"
									/>
								</div>
							{:else}
								<div class="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
									<Folder class="w-6 h-6 text-amber-500" />
								</div>
							{/if}
						</div>
						
						<!-- File Info -->
						<div class="flex-1 min-w-0">
							<button
								type="button"
								class="text-left w-full"
								on:click={() => openFile(item)}
							>
								<div class="flex items-center gap-2">
									<h3 class="font-medium truncate">
										{item.item.name}
									</h3>
									{#if recentFiles.isStarred(item.item.id)}
										<Star class="w-4 h-4 text-yellow-500 fill-yellow-500" />
									{/if}
								</div>
								<div class="flex items-center gap-4 mt-1 text-sm text-base-content/60">
									<span class="flex items-center gap-1">
										<svelte:component 
											this={getAccessIcon(item.accessType)} 
											class="w-3 h-3"
										/>
										{getAccessLabel(item.accessType)}
									</span>
									<span>
										{formatRelativeTime(item.accessedAt)}
									</span>
									{#if item.item.type === 'file'}
										<span>
											{formatFileSize(item.item.size)}
										</span>
									{/if}
									{#if view === 'most-accessed'}
										<span class="text-primary">
											{item.accessCount} times
										</span>
									{/if}
								</div>
							</button>
						</div>
						
						<!-- Actions -->
						<div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								type="button"
								class="p-2 rounded-lg hover:bg-base-300 transition-colors"
								on:click={() => toggleStar(item)}
								title={recentFiles.isStarred(item.item.id) ? 'Unstar' : 'Star'}
							>
								<Star 
									class="w-4 h-4 {recentFiles.isStarred(item.item.id) ? 'text-yellow-500 fill-yellow-500' : ''}"
								/>
							</button>
							
							<div class="dropdown dropdown-end">
								<button
									tabindex="0"
									class="p-2 rounded-lg hover:bg-base-300 transition-colors"
								>
									<MoreVertical class="w-4 h-4" />
								</button>
								<ul 
									tabindex="0" 
									class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-200"
								>
									<li>
										<button on:click={() => openFile(item)}>
											<Eye class="w-4 h-4" />
											Open
										</button>
									</li>
									<li>
										<button>
											<Download class="w-4 h-4" />
											Download
										</button>
									</li>
									<li>
										<button>
											<Share2 class="w-4 h-4" />
											Share
										</button>
									</li>
									<li class="border-t border-base-200 mt-1 pt-1">
										<button 
											on:click={() => recentFiles.removeRecent(item.item.id)}
											class="text-error"
										>
											Remove from history
										</button>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
<script lang="ts">
	import { Users, Link, Clock, Download } from 'lucide-svelte';
	import Card from '$lib/components/common/Card.svelte';
	import Button from '$lib/components/common/Button.svelte';
	import { onMount } from 'svelte';
	import { storageService } from '$lib/services/storage';
	import type { Share, FileItem, FolderItem } from '$lib/types/storage';
	
	let activeTab: 'shared-with-me' | 'shared-by-me' = 'shared-with-me';
	let sharedWithMe: { files: FileItem[], folders: FolderItem[] } = { files: [], folders: [] };
	let myShares: Share[] = [];
	let loading = false;
	
	onMount(async () => {
		await loadShares();
	});
	
	async function loadShares() {
		loading = true;
		try {
			if (activeTab === 'shared-with-me') {
				sharedWithMe = await storageService.getSharedWithMe();
			} else {
				myShares = await storageService.getShares();
			}
		} catch (error) {
			console.error('Failed to load shares:', error);
		} finally {
			loading = false;
		}
	}
	
	function formatDate(date: Date | string): string {
		return new Date(date).toLocaleDateString();
	}
	
	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	}
	
	async function revokeShare(shareId: string) {
		if (confirm('Revoke this share?')) {
			try {
				await storageService.revokeShare(shareId);
				await loadShares();
			} catch (error) {
				console.error('Failed to revoke share:', error);
			}
		}
	}
	
	$: {
		activeTab;
		loadShares();
	}
</script>

<div class="container mx-auto px-4 py-6 space-y-6">
	<h1 class="text-2xl font-bold">Shared Files</h1>
	
	<!-- Tabs -->
	<div class="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
		<button
			on:click={() => activeTab = 'shared-with-me'}
			class="px-4 py-2 rounded-md transition-colors {activeTab === 'shared-with-me' ? 'bg-white dark:bg-gray-700 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}"
		>
			<Users class="inline w-4 h-4 mr-2" />
			Shared with Me
		</button>
		<button
			on:click={() => activeTab = 'shared-by-me'}
			class="px-4 py-2 rounded-md transition-colors {activeTab === 'shared-by-me' ? 'bg-white dark:bg-gray-700 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}"
		>
			<Link class="inline w-4 h-4 mr-2" />
			Shared by Me
		</button>
	</div>
	
	{#if loading}
		<div class="text-center py-12">
			<div class="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
			<p class="text-gray-500 mt-2">Loading...</p>
		</div>
	{:else if activeTab === 'shared-with-me'}
		<!-- Shared with Me -->
		{#if sharedWithMe.files.length === 0 && sharedWithMe.folders.length === 0}
			<Card>
				<div class="text-center py-12">
					<Users class="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p class="text-gray-500">No files have been shared with you yet</p>
				</div>
			</Card>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each sharedWithMe.folders as folder}
					<Card>
						<div class="flex items-start justify-between">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-2">
									<svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
										<path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
									</svg>
									<h3 class="font-medium truncate">{folder.name}</h3>
								</div>
								<p class="text-sm text-gray-500">{folder.itemCount} items</p>
								<p class="text-xs text-gray-400 mt-1">Shared on {formatDate(folder.createdAt)}</p>
							</div>
						</div>
					</Card>
				{/each}
				
				{#each sharedWithMe.files as file}
					<Card>
						<div class="flex items-start justify-between">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-2">
									<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									<h3 class="font-medium truncate">{file.name}</h3>
								</div>
								<p class="text-sm text-gray-500">{formatFileSize(file.size)}</p>
								<p class="text-xs text-gray-400 mt-1">Shared on {formatDate(file.createdAt)}</p>
							</div>
							<Button size="sm" variant="ghost" icon={Download}>
								Download
							</Button>
						</div>
					</Card>
				{/each}
			</div>
		{/if}
	{:else}
		<!-- Shared by Me -->
		{#if myShares.length === 0}
			<Card>
				<div class="text-center py-12">
					<Link class="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p class="text-gray-500">You haven't shared any files yet</p>
					<Button href="/" variant="primary" class="mt-4">
						Go to Files
					</Button>
				</div>
			</Card>
		{:else}
			<div class="space-y-4">
				{#each myShares as share}
					<Card>
						<div class="flex items-center justify-between">
							<div class="flex-1">
								<div class="flex items-center gap-3">
									{#if share.shareType === 'public'}
										<Link class="w-5 h-5 text-blue-500" />
									{:else}
										<Users class="w-5 h-5 text-green-500" />
									{/if}
									<div>
										<p class="font-medium">
											{share.itemType === 'folder' ? 'Folder' : 'File'} Share
										</p>
										<div class="flex items-center gap-4 text-sm text-gray-500">
											<span>Created {formatDate(share.createdAt)}</span>
											{#if share.expiresAt}
												<span class="flex items-center gap-1">
													<Clock class="w-3 h-3" />
													Expires {formatDate(share.expiresAt)}
												</span>
											{/if}
											<span>{share.accessCount} views</span>
										</div>
									</div>
								</div>
							</div>
							<div class="flex items-center gap-2">
								{#if share.shareType === 'public'}
									<Button size="sm" variant="ghost">Copy Link</Button>
								{/if}
								<Button size="sm" variant="ghost" on:click={() => revokeShare(share.id)}>
									Revoke
								</Button>
							</div>
						</div>
					</Card>
				{/each}
			</div>
		{/if}
	{/if}
</div>
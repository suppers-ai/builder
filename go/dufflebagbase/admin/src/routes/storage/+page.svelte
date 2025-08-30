<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import type { StorageBucket, StorageObject } from '$lib/types';
	import { FolderOpen, Upload, File, Download, Trash2 } from 'lucide-svelte';
	
	let buckets: StorageBucket[] = [];
	let objects: StorageObject[] = [];
	let loading = true;
	let selectedBucket: string | null = null;
	
	onMount(async () => {
		const response = await api.getStorageBuckets();
		if (response.data) {
			buckets = response.data;
		}
		loading = false;
	});
	
	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	}
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="h1">Storage</h1>
		<button class="btn variant-filled-primary">
			<Upload size={16} />
			<span>Upload File</span>
		</button>
	</div>
	
	{#if loading}
		<div class="placeholder animate-pulse h-64"></div>
	{:else}
		<!-- Buckets Grid -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			{#each buckets as bucket}
				<button
					class="card p-6 text-left hover:variant-soft-primary"
					on:click={() => selectedBucket = bucket.name}
				>
					<div class="flex items-center gap-4">
						<div class="rounded-full bg-primary-500/20 p-3">
							<FolderOpen size={24} class="text-primary-500" />
						</div>
						<div>
							<p class="font-medium">{bucket.name}</p>
							<p class="text-sm text-surface-500">
								{bucket.objects_count} files • {formatBytes(bucket.total_size)}
							</p>
						</div>
					</div>
				</button>
			{/each}
		</div>
		
		<!-- Files List -->
		{#if selectedBucket}
			<div class="card">
				<header class="card-header">
					<h3 class="h3">{selectedBucket}</h3>
				</header>
				<div class="p-4">
					<p class="text-surface-500">File browser coming soon...</p>
				</div>
			</div>
		{/if}
	{/if}
</div>
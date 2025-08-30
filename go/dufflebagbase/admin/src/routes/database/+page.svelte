<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import type { DatabaseTable } from '$lib/types';
	import { Database, Table, Eye } from 'lucide-svelte';
	
	let tables: DatabaseTable[] = [];
	let loading = true;
	let selectedTable: string | null = null;
	
	onMount(async () => {
		const response = await api.getDatabaseTables();
		if (response.data) {
			tables = response.data;
		}
		loading = false;
	});
</script>

<div class="space-y-6">
	<h1 class="h1">Database Browser</h1>
	
	{#if loading}
		<div class="placeholder animate-pulse h-64"></div>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Tables List -->
			<div class="card">
				<header class="card-header">
					<h3 class="h3">Tables</h3>
				</header>
				<div class="p-4">
					<div class="space-y-2">
						{#each tables as table}
							<button
								class="w-full text-left p-3 rounded-lg hover:bg-surface-500/10 
									{selectedTable === table.name ? 'bg-primary-500/20' : ''}"
								on:click={() => selectedTable = table.name}
							>
								<div class="flex items-center gap-3">
									<Table size={16} />
									<div class="flex-1">
										<p class="font-medium">{table.name}</p>
										<p class="text-sm text-surface-500">{table.rows_count} rows</p>
									</div>
								</div>
							</button>
						{/each}
					</div>
				</div>
			</div>
			
			<!-- Table Details -->
			<div class="lg:col-span-2">
				{#if selectedTable}
					<div class="card">
						<header class="card-header">
							<h3 class="h3">{selectedTable}</h3>
						</header>
						<div class="p-4">
							<p class="text-surface-500">Table viewer coming soon...</p>
						</div>
					</div>
				{:else}
					<div class="card p-8 text-center text-surface-500">
						<Database size={48} class="mx-auto mb-4 opacity-50" />
						<p>Select a table to view its contents</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
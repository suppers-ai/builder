<script lang="ts">
	import { ChevronUp, ChevronDown } from 'lucide-svelte';
	
	export let columns: {
		key: string;
		label: string;
		sortable?: boolean;
		width?: string;
		align?: 'left' | 'center' | 'right';
	}[] = [];
	
	export let data: any[] = [];
	export let sortBy = '';
	export let sortOrder: 'asc' | 'desc' = 'asc';
	export let selectable = false;
	export let selectedRows: any[] = [];
	export let loading = false;
	export let emptyMessage = 'No data available';
	
	let className = '';
	export { className as class };
	
	function handleSort(column: string) {
		if (sortBy === column) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = column;
			sortOrder = 'asc';
		}
	}
	
	function toggleSelection(row: any) {
		if (selectedRows.includes(row)) {
			selectedRows = selectedRows.filter(r => r !== row);
		} else {
			selectedRows = [...selectedRows, row];
		}
	}
	
	function toggleSelectAll() {
		if (selectedRows.length === data.length) {
			selectedRows = [];
		} else {
			selectedRows = [...data];
		}
	}
	
	$: allSelected = data.length > 0 && selectedRows.length === data.length;
	$: someSelected = selectedRows.length > 0 && selectedRows.length < data.length;
</script>

<div class="overflow-x-auto {className}">
	<table class="w-full">
		<thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
			<tr>
				{#if selectable}
					<th class="px-4 py-3 text-left">
						<input
							type="checkbox"
							checked={allSelected}
							indeterminate={someSelected}
							on:change={toggleSelectAll}
							class="rounded border-gray-300 dark:border-gray-600"
						/>
					</th>
				{/if}
				{#each columns as column}
					<th 
						class="px-4 py-3 text-{column.align || 'left'} text-sm font-medium text-gray-700 dark:text-gray-300"
						style={column.width ? `width: ${column.width}` : ''}
					>
						{#if column.sortable}
							<button
								on:click={() => handleSort(column.key)}
								class="flex items-center gap-1 hover:text-primary-600 transition-colors"
							>
								{column.label}
								<span class="flex flex-col">
									<ChevronUp 
										class="w-3 h-3 -mb-1 {sortBy === column.key && sortOrder === 'asc' ? 'text-primary-600' : 'text-gray-400'}"
									/>
									<ChevronDown 
										class="w-3 h-3 {sortBy === column.key && sortOrder === 'desc' ? 'text-primary-600' : 'text-gray-400'}"
									/>
								</span>
							</button>
						{:else}
							{column.label}
						{/if}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
			{#if loading}
				<tr>
					<td colspan={columns.length + (selectable ? 1 : 0)} class="px-4 py-8 text-center">
						<div class="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
						<p class="text-gray-500 mt-2">Loading...</p>
					</td>
				</tr>
			{:else if data.length === 0}
				<tr>
					<td colspan={columns.length + (selectable ? 1 : 0)} class="px-4 py-8 text-center text-gray-500">
						{emptyMessage}
					</td>
				</tr>
			{:else}
				{#each data as row}
					<tr 
						class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
						class:bg-primary-50={selectedRows.includes(row)}
						class:dark:bg-primary-900={selectedRows.includes(row)}
					>
						{#if selectable}
							<td class="px-4 py-3">
								<input
									type="checkbox"
									checked={selectedRows.includes(row)}
									on:change={() => toggleSelection(row)}
									class="rounded border-gray-300 dark:border-gray-600"
								/>
							</td>
						{/if}
						{#each columns as column}
							<td class="px-4 py-3 text-{column.align || 'left'}">
								<slot name="cell" {column} {row} value={row[column.key]}>
									{row[column.key]}
								</slot>
							</td>
						{/each}
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
<script lang="ts">
	import { Search, X, Filter, Calendar, FileType, HardDrive } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import Dropdown from './Dropdown.svelte';
	
	export let value = '';
	export let placeholder = 'Search files and folders...';
	export let showFilters = true;
	export let loading = false;
	
	const dispatch = createEventDispatcher();
	
	let showAdvanced = false;
	let filters = {
		type: 'all',
		dateRange: 'any',
		sizeRange: 'any',
		shared: false
	};
	
	const fileTypes = [
		{ value: 'all', label: 'All Types' },
		{ value: 'document', label: 'Documents' },
		{ value: 'image', label: 'Images' },
		{ value: 'video', label: 'Videos' },
		{ value: 'audio', label: 'Audio' },
		{ value: 'archive', label: 'Archives' }
	];
	
	const dateRanges = [
		{ value: 'any', label: 'Any Time' },
		{ value: 'today', label: 'Today' },
		{ value: 'week', label: 'Past Week' },
		{ value: 'month', label: 'Past Month' },
		{ value: 'year', label: 'Past Year' }
	];
	
	const sizeRanges = [
		{ value: 'any', label: 'Any Size' },
		{ value: 'small', label: '< 1 MB' },
		{ value: 'medium', label: '1 - 10 MB' },
		{ value: 'large', label: '10 - 100 MB' },
		{ value: 'huge', label: '> 100 MB' }
	];
	
	let searchTimeout: NodeJS.Timeout;
	
	function handleInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			dispatch('search', { query: value, filters });
		}, 300);
	}
	
	function clearSearch() {
		value = '';
		dispatch('clear');
		dispatch('search', { query: '', filters });
	}
	
	function applyFilters() {
		dispatch('search', { query: value, filters });
		showAdvanced = false;
	}
	
	function resetFilters() {
		filters = {
			type: 'all',
			dateRange: 'any',
			sizeRange: 'any',
			shared: false
		};
		dispatch('search', { query: value, filters });
	}
	
	$: hasActiveFilters = filters.type !== 'all' || 
		filters.dateRange !== 'any' || 
		filters.sizeRange !== 'any' || 
		filters.shared;
</script>

<div class="w-full">
	<div class="relative">
		<div class="relative">
			<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
			
			<input
				type="search"
				bind:value
				on:input={handleInput}
				{placeholder}
				class="w-full pl-10 pr-24 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
					focus:outline-none focus:ring-2 focus:ring-primary-500 
					bg-white dark:bg-gray-700"
			/>
			
			<div class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
				{#if loading}
					<div class="animate-spin w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full" />
				{/if}
				
				{#if value}
					<button
						on:click={clearSearch}
						class="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
						title="Clear search"
					>
						<X class="w-4 h-4" />
					</button>
				{/if}
				
				{#if showFilters}
					<button
						on:click={() => showAdvanced = !showAdvanced}
						class="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded
							{hasActiveFilters ? 'text-primary-500' : ''}"
						title="Advanced filters"
					>
						<Filter class="w-4 h-4" />
						{#if hasActiveFilters}
							<span class="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
						{/if}
					</button>
				{/if}
			</div>
		</div>
		
		<!-- Advanced Filters -->
		{#if showAdvanced}
			<div class="absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
				<h3 class="font-medium mb-3">Advanced Filters</h3>
				
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<!-- File Type -->
					<div>
						<label class="block text-sm font-medium mb-1">
							<FileType class="inline w-4 h-4 mr-1" />
							File Type
						</label>
						<select
							bind:value={filters.type}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
						>
							{#each fileTypes as type}
								<option value={type.value}>{type.label}</option>
							{/each}
						</select>
					</div>
					
					<!-- Date Range -->
					<div>
						<label class="block text-sm font-medium mb-1">
							<Calendar class="inline w-4 h-4 mr-1" />
							Modified Date
						</label>
						<select
							bind:value={filters.dateRange}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
						>
							{#each dateRanges as range}
								<option value={range.value}>{range.label}</option>
							{/each}
						</select>
					</div>
					
					<!-- File Size -->
					<div>
						<label class="block text-sm font-medium mb-1">
							<HardDrive class="inline w-4 h-4 mr-1" />
							File Size
						</label>
						<select
							bind:value={filters.sizeRange}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
						>
							{#each sizeRanges as size}
								<option value={size.value}>{size.label}</option>
							{/each}
						</select>
					</div>
					
					<!-- Shared Files -->
					<div>
						<label class="flex items-center gap-2 mt-6">
							<input
								type="checkbox"
								bind:checked={filters.shared}
								class="rounded border-gray-300 dark:border-gray-600"
							/>
							<span class="text-sm font-medium">Only shared files</span>
						</label>
					</div>
				</div>
				
				<div class="flex justify-end gap-2 mt-4">
					<button
						on:click={resetFilters}
						class="px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
					>
						Reset
					</button>
					<button
						on:click={applyFilters}
						class="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600"
					>
						Apply Filters
					</button>
				</div>
			</div>
		{/if}
	</div>
	
	<!-- Search suggestions could go here -->
	<slot name="suggestions" />
</div>
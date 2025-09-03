<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Search, Filter, Calendar, HardDrive, User, Tag, X, Clock } from 'lucide-svelte';
	import { searchStore } from '$lib/stores/search';
	import type { SearchFilter } from '$lib/stores/search';
	import Button from '../common/Button.svelte';
	import Input from '../common/Input.svelte';
	import Select from '../common/Select.svelte';
	
	export let open = false;
	
	const dispatch = createEventDispatcher();
	
	let query = '';
	let fileType = 'all';
	let dateFrom = '';
	let dateTo = '';
	let sizeMin = '';
	let sizeMax = '';
	let owner = '';
	let isShared = false;
	let extensions = '';
	
	const fileTypes = [
		{ value: 'all', label: 'All Files' },
		{ value: 'file', label: 'Files Only' },
		{ value: 'folder', label: 'Folders Only' },
		{ value: 'image', label: 'Images' },
		{ value: 'document', label: 'Documents' },
		{ value: 'video', label: 'Videos' },
		{ value: 'audio', label: 'Audio' },
		{ value: 'archive', label: 'Archives' }
	];
	
	const sizeUnits = [
		{ value: 1, label: 'Bytes' },
		{ value: 1024, label: 'KB' },
		{ value: 1024 * 1024, label: 'MB' },
		{ value: 1024 * 1024 * 1024, label: 'GB' }
	];
	
	let sizeMinUnit = 1024 * 1024; // MB
	let sizeMaxUnit = 1024 * 1024; // MB
	
	function handleSearch() {
		const filters: SearchFilter = {};
		
		// Add type filter
		if (fileType !== 'all') {
			filters.type = fileType as any;
		}
		
		// Add date range filter
		if (dateFrom || dateTo) {
			filters.dateRange = {};
			if (dateFrom) filters.dateRange.from = new Date(dateFrom);
			if (dateTo) filters.dateRange.to = new Date(dateTo);
		}
		
		// Add size range filter
		if (sizeMin || sizeMax) {
			filters.sizeRange = {};
			if (sizeMin) filters.sizeRange.min = parseFloat(sizeMin) * sizeMinUnit;
			if (sizeMax) filters.sizeRange.max = parseFloat(sizeMax) * sizeMaxUnit;
		}
		
		// Add owner filter
		if (owner) {
			filters.owner = owner;
		}
		
		// Add shared filter
		if (isShared) {
			filters.shared = true;
		}
		
		// Add extension filter
		if (extensions) {
			filters.extension = extensions.split(',').map(e => e.trim());
		}
		
		// Perform search
		searchStore.search({
			query,
			filters,
			sortBy: 'relevance',
			sortOrder: 'desc'
		});
		
		// Close dialog
		open = false;
		dispatch('close');
	}
	
	function clearFilters() {
		query = '';
		fileType = 'all';
		dateFrom = '';
		dateTo = '';
		sizeMin = '';
		sizeMax = '';
		owner = '';
		isShared = false;
		extensions = '';
	}
	
	// Recent searches
	$: recentSearches = $searchStore.recentSearches$;
	
	function applyRecentSearch(search: any) {
		query = search.query;
		
		// Apply filters
		if (search.filters.type) fileType = search.filters.type;
		if (search.filters.dateRange) {
			if (search.filters.dateRange.from) {
				dateFrom = new Date(search.filters.dateRange.from).toISOString().split('T')[0];
			}
			if (search.filters.dateRange.to) {
				dateTo = new Date(search.filters.dateRange.to).toISOString().split('T')[0];
			}
		}
		if (search.filters.owner) owner = search.filters.owner;
		if (search.filters.shared) isShared = search.filters.shared;
		if (search.filters.extension) extensions = search.filters.extension.join(', ');
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
		<div class="bg-base-100 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-base-200">
				<div class="flex items-center gap-3">
					<Search class="w-6 h-6 text-primary" />
					<h2 class="text-xl font-semibold">Advanced Search</h2>
				</div>
				<button
					type="button"
					class="p-2 rounded-lg hover:bg-base-200 transition-colors"
					on:click={() => { open = false; dispatch('close'); }}
				>
					<X class="w-5 h-5" />
				</button>
			</div>
			
			<!-- Content -->
			<div class="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
				<!-- Search Query -->
				<div class="mb-6">
					<label for="search-query" class="block text-sm font-medium mb-2">
						Search Query
					</label>
					<Input
						id="search-query"
						bind:value={query}
						placeholder="Enter search terms..."
						icon={Search}
						class="w-full"
					/>
				</div>
				
				<!-- Filters Grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
					<!-- File Type -->
					<div>
						<label for="file-type" class="block text-sm font-medium mb-2">
							<Filter class="w-4 h-4 inline mr-1" />
							File Type
						</label>
						<Select
							id="file-type"
							bind:value={fileType}
							options={fileTypes}
							class="w-full"
						/>
					</div>
					
					<!-- Owner -->
					<div>
						<label for="owner" class="block text-sm font-medium mb-2">
							<User class="w-4 h-4 inline mr-1" />
							Owner
						</label>
						<Input
							id="owner"
							bind:value={owner}
							placeholder="Owner name or ID"
							class="w-full"
						/>
					</div>
					
					<!-- Date From -->
					<div>
						<label for="date-from" class="block text-sm font-medium mb-2">
							<Calendar class="w-4 h-4 inline mr-1" />
							Date From
						</label>
						<Input
							id="date-from"
							type="date"
							bind:value={dateFrom}
							class="w-full"
						/>
					</div>
					
					<!-- Date To -->
					<div>
						<label for="date-to" class="block text-sm font-medium mb-2">
							<Calendar class="w-4 h-4 inline mr-1" />
							Date To
						</label>
						<Input
							id="date-to"
							type="date"
							bind:value={dateTo}
							class="w-full"
						/>
					</div>
					
					<!-- Size Min -->
					<div>
						<label for="size-min" class="block text-sm font-medium mb-2">
							<HardDrive class="w-4 h-4 inline mr-1" />
							Min Size
						</label>
						<div class="flex gap-2">
							<Input
								id="size-min"
								type="number"
								bind:value={sizeMin}
								placeholder="0"
								class="flex-1"
							/>
							<Select
								bind:value={sizeMinUnit}
								options={sizeUnits}
								class="w-24"
							/>
						</div>
					</div>
					
					<!-- Size Max -->
					<div>
						<label for="size-max" class="block text-sm font-medium mb-2">
							<HardDrive class="w-4 h-4 inline mr-1" />
							Max Size
						</label>
						<div class="flex gap-2">
							<Input
								id="size-max"
								type="number"
								bind:value={sizeMax}
								placeholder="∞"
								class="flex-1"
							/>
							<Select
								bind:value={sizeMaxUnit}
								options={sizeUnits}
								class="w-24"
							/>
						</div>
					</div>
					
					<!-- Extensions -->
					<div>
						<label for="extensions" class="block text-sm font-medium mb-2">
							<Tag class="w-4 h-4 inline mr-1" />
							File Extensions
						</label>
						<Input
							id="extensions"
							bind:value={extensions}
							placeholder="e.g., pdf, docx, xlsx"
							class="w-full"
						/>
					</div>
					
					<!-- Shared Files -->
					<div>
						<label class="flex items-center gap-2 mt-7">
							<input
								type="checkbox"
								bind:checked={isShared}
								class="checkbox checkbox-primary"
							/>
							<span class="text-sm font-medium">Shared Files Only</span>
						</label>
					</div>
				</div>
				
				<!-- Recent Searches -->
				{#if $recentSearches.length > 0}
					<div class="mb-6">
						<h3 class="text-sm font-medium mb-3 flex items-center gap-2">
							<Clock class="w-4 h-4" />
							Recent Searches
						</h3>
						<div class="space-y-2">
							{#each $recentSearches.slice(0, 5) as search}
								<button
									type="button"
									class="w-full text-left p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
									on:click={() => applyRecentSearch(search)}
								>
									<div class="flex justify-between items-center">
										<div>
											<span class="font-medium">{search.query}</span>
											{#if Object.keys(search.filters).length > 0}
												<span class="text-sm text-base-content/60 ml-2">
													+{Object.keys(search.filters).length} filters
												</span>
											{/if}
										</div>
										<span class="text-sm text-base-content/60">
											{search.resultCount} results
										</span>
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			
			<!-- Footer -->
			<div class="flex justify-between items-center p-6 border-t border-base-200">
				<Button variant="ghost" on:click={clearFilters}>
					Clear Filters
				</Button>
				<div class="flex gap-3">
					<Button
						variant="outline"
						on:click={() => { open = false; dispatch('close'); }}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						icon={Search}
						on:click={handleSearch}
					>
						Search
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
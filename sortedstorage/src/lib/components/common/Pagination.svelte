<script lang="ts">
	import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	
	export let currentPage = 1;
	export let totalPages = 1;
	export let totalItems = 0;
	export let itemsPerPage = 20;
	export let showInfo = true;
	
	const dispatch = createEventDispatcher();
	
	$: startItem = (currentPage - 1) * itemsPerPage + 1;
	$: endItem = Math.min(currentPage * itemsPerPage, totalItems);
	
	// Calculate visible page numbers
	$: visiblePages = getVisiblePages(currentPage, totalPages);
	
	function getVisiblePages(current: number, total: number): (number | string)[] {
		if (total <= 7) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}
		
		const pages: (number | string)[] = [];
		
		if (current <= 3) {
			for (let i = 1; i <= 5; i++) pages.push(i);
			pages.push('...');
			pages.push(total);
		} else if (current >= total - 2) {
			pages.push(1);
			pages.push('...');
			for (let i = total - 4; i <= total; i++) pages.push(i);
		} else {
			pages.push(1);
			pages.push('...');
			for (let i = current - 1; i <= current + 1; i++) pages.push(i);
			pages.push('...');
			pages.push(total);
		}
		
		return pages;
	}
	
	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			dispatch('change', { page });
		}
	}
	
	function goToFirst() {
		goToPage(1);
	}
	
	function goToLast() {
		goToPage(totalPages);
	}
	
	function goToPrevious() {
		goToPage(currentPage - 1);
	}
	
	function goToNext() {
		goToPage(currentPage + 1);
	}
</script>

{#if totalPages > 1}
	<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
		{#if showInfo}
			<div class="text-sm text-gray-600 dark:text-gray-400">
				Showing {startItem} to {endItem} of {totalItems} items
			</div>
		{/if}
		
		<div class="flex items-center gap-2">
			<!-- First page button -->
			<button
				on:click={goToFirst}
				disabled={currentPage === 1}
				class="p-2 rounded-lg transition-colors
					{currentPage === 1 
						? 'text-gray-400 cursor-not-allowed' 
						: 'hover:bg-gray-100 dark:hover:bg-gray-700'}"
				title="First page"
			>
				<ChevronsLeft class="w-4 h-4" />
			</button>
			
			<!-- Previous page button -->
			<button
				on:click={goToPrevious}
				disabled={currentPage === 1}
				class="p-2 rounded-lg transition-colors
					{currentPage === 1 
						? 'text-gray-400 cursor-not-allowed' 
						: 'hover:bg-gray-100 dark:hover:bg-gray-700'}"
				title="Previous page"
			>
				<ChevronLeft class="w-4 h-4" />
			</button>
			
			<!-- Page numbers -->
			<div class="flex items-center gap-1">
				{#each visiblePages as page}
					{#if page === '...'}
						<span class="px-3 py-1 text-gray-400">...</span>
					{:else}
						<button
							on:click={() => goToPage(page)}
							class="min-w-[2.5rem] px-3 py-1 rounded-lg transition-colors
								{page === currentPage 
									? 'bg-primary-500 text-white' 
									: 'hover:bg-gray-100 dark:hover:bg-gray-700'}"
						>
							{page}
						</button>
					{/if}
				{/each}
			</div>
			
			<!-- Next page button -->
			<button
				on:click={goToNext}
				disabled={currentPage === totalPages}
				class="p-2 rounded-lg transition-colors
					{currentPage === totalPages 
						? 'text-gray-400 cursor-not-allowed' 
						: 'hover:bg-gray-100 dark:hover:bg-gray-700'}"
				title="Next page"
			>
				<ChevronRight class="w-4 h-4" />
			</button>
			
			<!-- Last page button -->
			<button
				on:click={goToLast}
				disabled={currentPage === totalPages}
				class="p-2 rounded-lg transition-colors
					{currentPage === totalPages 
						? 'text-gray-400 cursor-not-allowed' 
						: 'hover:bg-gray-100 dark:hover:bg-gray-700'}"
				title="Last page"
			>
				<ChevronsRight class="w-4 h-4" />
			</button>
		</div>
		
		<!-- Items per page selector -->
		<div class="flex items-center gap-2 text-sm">
			<label for="items-per-page">Items per page:</label>
			<select
				id="items-per-page"
				bind:value={itemsPerPage}
				on:change={() => dispatch('change', { page: 1, itemsPerPage })}
				class="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
			>
				<option value={10}>10</option>
				<option value={20}>20</option>
				<option value={50}>50</option>
				<option value={100}>100</option>
			</select>
		</div>
	</div>
{/if}
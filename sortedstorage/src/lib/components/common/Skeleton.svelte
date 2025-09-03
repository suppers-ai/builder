<script lang="ts">
	export let type: 'text' | 'title' | 'avatar' | 'thumbnail' | 'card' | 'table' = 'text';
	export let lines = 1;
	export let width = '100%';
	export let height = 'auto';
	
	let className = '';
	export { className as class };
	
	const baseClass = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';
	
	$: skeletonClass = `${baseClass} ${className}`.trim();
</script>

{#if type === 'text'}
	<div class="space-y-2">
		{#each Array(lines) as _, i}
			<div 
				class={skeletonClass}
				style="width: {i === lines - 1 ? '75%' : width}; height: 1rem;"
			/>
		{/each}
	</div>
{:else if type === 'title'}
	<div 
		class={skeletonClass}
		style="width: {width}; height: 2rem;"
	/>
{:else if type === 'avatar'}
	<div 
		class="{skeletonClass} rounded-full"
		style="width: 3rem; height: 3rem;"
	/>
{:else if type === 'thumbnail'}
	<div 
		class={skeletonClass}
		style="width: {width}; height: {height === 'auto' ? '200px' : height};"
	/>
{:else if type === 'card'}
	<div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
		<div class="flex items-start gap-4">
			<div 
				class="{baseClass} rounded-full flex-shrink-0"
				style="width: 3rem; height: 3rem;"
			/>
			<div class="flex-1 space-y-2">
				<div class={baseClass} style="width: 60%; height: 1.5rem;" />
				<div class={baseClass} style="width: 100%; height: 1rem;" />
				<div class={baseClass} style="width: 85%; height: 1rem;" />
			</div>
		</div>
	</div>
{:else if type === 'table'}
	<div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
		<!-- Table Header -->
		<div class="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
			<div class="flex gap-4">
				{#each Array(4) as _}
					<div class={baseClass} style="width: 25%; height: 1rem;" />
				{/each}
			</div>
		</div>
		<!-- Table Rows -->
		{#each Array(5) as _}
			<div class="p-4 border-b border-gray-200 dark:border-gray-700">
				<div class="flex gap-4">
					{#each Array(4) as _}
						<div class={baseClass} style="width: 25%; height: 1rem;" />
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
	
	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
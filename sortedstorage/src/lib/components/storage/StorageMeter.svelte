<script lang="ts">
	import { ArrowUpRight } from 'lucide-svelte';
	
	export let used: number;
	export let total: number;
	export let unit: 'GB' | 'TB' = 'GB';
	export let showUpgrade = true;
	
	$: percentage = Math.round((used / total) * 100);
	$: color = percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-primary-500';
</script>

<div class="storage-meter p-4 rounded-lg glass">
	<div class="flex items-center justify-between mb-2">
		<h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Storage</h4>
		{#if showUpgrade && percentage > 75}
			<a 
				href="/upgrade" 
				class="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
			>
				Upgrade <ArrowUpRight class="w-3 h-3" />
			</a>
		{/if}
	</div>
	
	<div class="mb-2">
		<div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
			<div 
				class="h-full {color} transition-all duration-300"
				style="width: {percentage}%"
			/>
		</div>
	</div>
	
	<div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
		<span>{used} {unit} used</span>
		<span>{total} {unit} total</span>
	</div>
	
	{#if percentage > 90}
		<div class="mt-2 text-xs text-red-600 dark:text-red-400">
			Warning: Storage almost full
		</div>
	{/if}
</div>
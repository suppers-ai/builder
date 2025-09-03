<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { ComponentType } from 'svelte';
	
	export let items: {
		label: string;
		value?: string;
		icon?: ComponentType;
		divider?: boolean;
		disabled?: boolean;
	}[] = [];
	
	export let position: 'left' | 'right' = 'right';
	export let open = false;
	
	const dispatch = createEventDispatcher();
	
	let dropdown: HTMLDivElement;
	
	function handleClickOutside(event: MouseEvent) {
		if (dropdown && !dropdown.contains(event.target as Node)) {
			open = false;
		}
	}
	
	function handleItemClick(item: any) {
		if (!item.disabled && !item.divider) {
			dispatch('select', item);
			open = false;
		}
	}
	
	$: if (open) {
		document.addEventListener('click', handleClickOutside);
	} else {
		document.removeEventListener('click', handleClickOutside);
	}
</script>

<div class="relative" bind:this={dropdown}>
	<div on:click={() => open = !open}>
		<slot name="trigger" />
	</div>
	
	{#if open}
		<div
			transition:fade={{ duration: 150 }}
			class="absolute z-50 mt-2 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[200px]
				{position === 'left' ? 'left-0' : 'right-0'}"
		>
			{#each items as item}
				{#if item.divider}
					<hr class="my-1 border-gray-200 dark:border-gray-700" />
				{:else}
					<button
						on:click={() => handleItemClick(item)}
						disabled={item.disabled}
						class="w-full px-4 py-2 text-left flex items-center gap-3 transition-colors
							{item.disabled 
								? 'opacity-50 cursor-not-allowed' 
								: 'hover:bg-gray-100 dark:hover:bg-gray-700'}"
					>
						{#if item.icon}
							<svelte:component this={item.icon} class="w-4 h-4" />
						{/if}
						<span class="flex-1">{item.label}</span>
					</button>
				{/if}
			{/each}
		</div>
	{/if}
</div>
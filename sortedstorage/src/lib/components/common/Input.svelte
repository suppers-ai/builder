<script lang="ts">
	import type { ComponentType } from 'svelte';
	
	export let type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' = 'text';
	export let value: string | number = '';
	export let placeholder = '';
	export let label = '';
	export let error = '';
	export let disabled = false;
	export let required = false;
	export let readonly = false;
	export let icon: ComponentType | null = null;
	export let id = `input-${Math.random().toString(36).substr(2, 9)}`;
	
	let className = '';
	export { className as class };
	
	$: inputClass = `
		w-full px-3 py-2 
		border rounded-lg 
		focus:outline-none focus:ring-2 focus:ring-primary-500
		transition-colors
		${icon ? 'pl-10' : ''}
		${error 
			? 'border-red-500 focus:ring-red-500' 
			: 'border-gray-300 dark:border-gray-600'}
		${disabled 
			? 'bg-gray-100 dark:bg-gray-800 opacity-75 cursor-not-allowed' 
			: 'bg-white dark:bg-gray-700'}
		${className}
	`.trim();
</script>

<div class="w-full">
	{#if label}
		<label for={id} class="block text-sm font-medium mb-2">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}
	
	<div class="relative">
		{#if icon}
			<div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
				<svelte:component this={icon} class="w-5 h-5" />
			</div>
		{/if}
		
		<input
			{id}
			{type}
			{value}
			{placeholder}
			{disabled}
			{required}
			{readonly}
			class={inputClass}
			on:input
			on:change
			on:blur
			on:focus
			on:keydown
			on:keyup
		/>
	</div>
	
	{#if error}
		<p class="mt-1 text-sm text-red-500">{error}</p>
	{/if}
</div>
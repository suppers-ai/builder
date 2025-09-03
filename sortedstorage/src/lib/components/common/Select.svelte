<script lang="ts">
	export let value: string = '';
	export let options: { value: string; label: string }[] = [];
	export let placeholder = 'Select an option';
	export let label = '';
	export let error = '';
	export let disabled = false;
	export let required = false;
	export let id = `select-${Math.random().toString(36).substr(2, 9)}`;
	
	let className = '';
	export { className as class };
	
	$: selectClass = `
		w-full px-3 py-2 
		border rounded-lg 
		focus:outline-none focus:ring-2 focus:ring-primary-500
		transition-colors
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
	
	<select
		{id}
		bind:value
		{disabled}
		{required}
		class={selectClass}
		on:change
		on:blur
		on:focus
	>
		{#if placeholder}
			<option value="" disabled selected>{placeholder}</option>
		{/if}
		{#each options as option}
			<option value={option.value}>
				{option.label}
			</option>
		{/each}
	</select>
	
	{#if error}
		<p class="mt-1 text-sm text-red-500">{error}</p>
	{/if}
</div>
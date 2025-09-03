<script lang="ts">
	export let checked = false;
	export let label = '';
	export let disabled = false;
	export let required = false;
	export let id = `checkbox-${Math.random().toString(36).substr(2, 9)}`;
	
	let className = '';
	export { className as class };
	
	$: checkboxClass = `
		rounded 
		border-gray-300 dark:border-gray-600 
		text-primary-600 
		focus:ring-primary-500
		disabled:opacity-50 disabled:cursor-not-allowed
		${className}
	`.trim();
</script>

<div class="flex items-center">
	<input
		{id}
		type="checkbox"
		bind:checked
		{disabled}
		{required}
		class={checkboxClass}
		on:change
		on:click
	/>
	{#if label}
		<label 
			for={id} 
			class="ml-2 text-sm {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
		>
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}
</div>
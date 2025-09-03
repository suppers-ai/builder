<script lang="ts">
	export let title = '';
	export let subtitle = '';
	export let glass = true;
	export let padding = true;
</script>

<div class="rounded-lg {glass ? 'glass' : 'bg-white dark:bg-gray-800'} {padding ? 'p-6' : ''}">
	{#if title}
		<div class="mb-4">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
			{#if subtitle}
				<p class="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
			{/if}
		</div>
	{/if}
	
	<div class="card-content">
		<slot />
	</div>
	
	{#if $$slots.footer}
		<div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
			<slot name="footer" />
		</div>
	{/if}
</div>
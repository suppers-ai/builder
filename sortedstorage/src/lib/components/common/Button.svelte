<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import type { ComponentType } from 'svelte';
	
	export let variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let loading = false;
	export let disabled = false;
	export let icon: ComponentType | null = null;
	export let href: string | null = null;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	
	// Allow custom classes to be passed
	let className = '';
	export { className as class };
	
	$: classes = [
		'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
		{
			'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': variant === 'primary',
			'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600': variant === 'secondary',
			'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500': variant === 'ghost',
			'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger'
		}[variant],
		{
			'px-3 py-1.5 text-sm': size === 'sm',
			'px-4 py-2 text-base': size === 'md',
			'px-6 py-3 text-lg': size === 'lg'
		}[size],
		'disabled:opacity-50 disabled:cursor-not-allowed',
		className // Add custom class if provided
	].filter(Boolean).join(' ');
</script>

{#if href && !disabled}
	<a {href} class={classes} on:click>
		{#if loading}
			<Loader2 class="w-4 h-4 mr-2 animate-spin" />
		{:else if icon}
			<svelte:component this={icon} class="w-4 h-4 mr-2" />
		{/if}
		<slot />
	</a>
{:else}
	<button
		{type}
		{disabled}
		class={classes}
		on:click
	>
		{#if loading}
			<Loader2 class="w-4 h-4 mr-2 animate-spin" />
		{:else if icon}
			<svelte:component this={icon} class="w-4 h-4 mr-2" />
		{/if}
		<slot />
	</button>
{/if}
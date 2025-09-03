<script lang="ts">
	import { onMount } from 'svelte';
	import ErrorBoundary from './ErrorBoundary.svelte';
	
	export let fallback: typeof ErrorBoundary | null = null;
	export let onError: ((error: Error) => void) | null = null;
	export let resetKeys: any[] = [];
	export let resetOnPropsChange = true;
	
	let error: Error | null = null;
	let resetCount = 0;
	let previousResetKeys = resetKeys;
	
	// Error handling
	function handleError(event: ErrorEvent) {
		error = event.error || new Error(event.message);
		if (onError) {
			onError(error);
		}
		event.preventDefault();
	}
	
	function handleUnhandledRejection(event: PromiseRejectionEvent) {
		error = new Error(event.reason);
		if (onError) {
			onError(error);
		}
		event.preventDefault();
	}
	
	function reset() {
		error = null;
		resetCount++;
	}
	
	// Check if reset keys have changed
	$: if (resetOnPropsChange && JSON.stringify(resetKeys) !== JSON.stringify(previousResetKeys)) {
		previousResetKeys = resetKeys;
		reset();
	}
	
	onMount(() => {
		// Add error listeners
		window.addEventListener('error', handleError);
		window.addEventListener('unhandledrejection', handleUnhandledRejection);
		
		return () => {
			// Clean up listeners
			window.removeEventListener('error', handleError);
			window.removeEventListener('unhandledrejection', handleUnhandledRejection);
		};
	});
</script>

{#if error}
	{#if fallback}
		<svelte:component this={fallback} {error} {reset} />
	{:else}
		<ErrorBoundary {error} {reset} />
	{/if}
{:else}
	{#key resetCount}
		<slot />
	{/key}
{/if}
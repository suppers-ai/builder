<script lang="ts">
	import { onMount } from 'svelte';
	import { AlertCircle, RefreshCw, Home } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import Button from './Button.svelte';
	
	export let error: Error | null = null;
	export let reset: (() => void) | null = null;
	export let fullPage = false;
	
	let errorId = '';
	
	onMount(() => {
		// Generate unique error ID for support reference
		errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		
		// Log error to console for debugging
		if (error) {
			console.error('Error Boundary caught:', error);
			
			// Send error to monitoring service (if configured)
			if (typeof window !== 'undefined' && window.reportError) {
				window.reportError(error, { errorId });
			}
		}
	});
	
	function handleReset() {
		if (reset) {
			reset();
		} else {
			// Fallback: reload the page
			window.location.reload();
		}
	}
	
	function goHome() {
		goto('/');
	}
</script>

<div class={fullPage ? 'min-h-screen' : 'min-h-[400px]'} class="flex items-center justify-center p-8">
	<div class="max-w-md w-full">
		<div class="bg-base-100 rounded-2xl shadow-xl p-8 text-center">
			<!-- Error Icon -->
			<div class="inline-flex items-center justify-center w-20 h-20 bg-error/10 rounded-full mb-6">
				<AlertCircle class="w-10 h-10 text-error" />
			</div>
			
			<!-- Error Message -->
			<h2 class="text-2xl font-bold text-base-content mb-2">
				Something went wrong
			</h2>
			
			<p class="text-base-content/70 mb-6">
				{error?.message || 'An unexpected error occurred. Please try again.'}
			</p>
			
			<!-- Error ID for support -->
			{#if errorId}
				<div class="bg-base-200 rounded-lg px-4 py-2 mb-6">
					<p class="text-sm text-base-content/60">
						Error ID: <code class="text-xs font-mono select-all">{errorId}</code>
					</p>
				</div>
			{/if}
			
			<!-- Actions -->
			<div class="flex gap-3 justify-center">
				{#if !fullPage}
					<Button
						variant="outline"
						icon={Home}
						on:click={goHome}
					>
						Go Home
					</Button>
				{/if}
				
				<Button
					variant="primary"
					icon={RefreshCw}
					on:click={handleReset}
				>
					Try Again
				</Button>
			</div>
			
			<!-- Debug Info (dev mode only) -->
			{#if import.meta.env.DEV && error?.stack}
				<details class="mt-6 text-left">
					<summary class="cursor-pointer text-sm text-base-content/60 hover:text-base-content">
						Show technical details
					</summary>
					<pre class="mt-2 p-3 bg-base-200 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap break-words">
{error.stack}
					</pre>
				</details>
			{/if}
		</div>
	</div>
</div>

<style>
	code {
		@apply bg-base-200 px-1 py-0.5 rounded;
	}
</style>
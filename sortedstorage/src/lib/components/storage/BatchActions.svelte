<script lang="ts">
	import { Download, Share2, Trash2, Copy, Move, Archive, CheckSquare, XSquare } from 'lucide-svelte';
	import Button from '../common/Button.svelte';
	import { createEventDispatcher } from 'svelte';
	
	export let selectedCount = 0;
	export let loading = false;
	
	const dispatch = createEventDispatcher();
	
	const actions = [
		{ id: 'download', label: 'Download', icon: Download, variant: 'ghost' },
		{ id: 'share', label: 'Share', icon: Share2, variant: 'ghost' },
		{ id: 'copy', label: 'Copy', icon: Copy, variant: 'ghost' },
		{ id: 'move', label: 'Move', icon: Move, variant: 'ghost' },
		{ id: 'archive', label: 'Archive', icon: Archive, variant: 'ghost' },
		{ id: 'delete', label: 'Delete', icon: Trash2, variant: 'danger' }
	];
	
	function handleAction(action: string) {
		dispatch('action', { action });
	}
</script>

{#if selectedCount > 0}
	<div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
		<div class="bg-gray-900 text-white rounded-lg shadow-xl px-6 py-4">
			<div class="flex items-center gap-6">
				<!-- Selection Info -->
				<div class="flex items-center gap-3">
					<CheckSquare class="w-5 h-5" />
					<span class="font-medium">
						{selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
					</span>
				</div>
				
				<!-- Divider -->
				<div class="h-8 w-px bg-gray-700"></div>
				
				<!-- Actions -->
				<div class="flex items-center gap-2">
					{#each actions as action}
						<button
							on:click={() => handleAction(action.id)}
							disabled={loading}
							class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
								{action.variant === 'danger' 
									? 'hover:bg-red-600/20 hover:text-red-400' 
									: 'hover:bg-gray-800'}"
							title={action.label}
						>
							<svelte:component this={action.icon} class="w-4 h-4" />
							<span class="hidden sm:inline text-sm">{action.label}</span>
						</button>
					{/each}
				</div>
				
				<!-- Clear Selection -->
				<button
					on:click={() => dispatch('clear')}
					class="ml-2 p-2 rounded-lg hover:bg-gray-800 transition-colors"
					title="Clear selection"
				>
					<XSquare class="w-5 h-5" />
				</button>
			</div>
			
			{#if loading}
				<div class="mt-3 pt-3 border-t border-gray-700">
					<div class="flex items-center gap-3">
						<div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
						<span class="text-sm">Processing...</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Add smooth animation for appearance */
	div :global(.fixed) {
		animation: slideUp 0.3s ease-out;
	}
	
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translate(-50%, 100%);
		}
		to {
			opacity: 1;
			transform: translate(-50%, 0);
		}
	}
</style>
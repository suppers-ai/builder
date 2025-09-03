<script lang="ts">
	import { Users, Circle } from 'lucide-svelte';
	import { collaboration } from '$lib/stores/collaboration';
	import { fade, scale } from 'svelte/transition';
	import Tooltip from '../common/Tooltip.svelte';
	
	export let path: string = '/';
	export let compact = false;
	
	$: activeUsers = collaboration.activeUsersInPath$(path);
	$: displayUsers = $activeUsers.slice(0, 5);
	$: extraCount = Math.max(0, $activeUsers.length - 5);
	
	function getStatusColor(status: string) {
		switch (status) {
			case 'active':
				return 'bg-green-500';
			case 'idle':
				return 'bg-yellow-500';
			case 'away':
				return 'bg-gray-400';
			default:
				return 'bg-gray-400';
		}
	}
	
	function getInitials(name: string): string {
		return name
			.split(' ')
			.map(part => part[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

{#if $activeUsers.length > 0}
	<div class="active-users {compact ? 'compact' : ''}" transition:fade={{ duration: 200 }}>
		{#if !compact}
			<div class="flex items-center gap-2 mb-2">
				<Users class="w-4 h-4 text-gray-500" />
				<span class="text-sm text-gray-500">
					{$activeUsers.length} active {$activeUsers.length === 1 ? 'user' : 'users'}
				</span>
			</div>
		{/if}
		
		<div class="flex items-center {compact ? 'gap-0' : 'gap-2'}">
			{#each displayUsers as user, i (user.id)}
				<div 
					class="user-avatar"
					style={compact ? `z-index: ${5 - i}; margin-left: ${i > 0 ? '-0.5rem' : '0'}` : ''}
					transition:scale={{ duration: 200, delay: i * 50 }}
				>
					<Tooltip content="{user.name} ({user.status})">
						<div class="relative">
							{#if user.avatar}
								<img 
									src={user.avatar} 
									alt={user.name}
									class="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
								/>
							{:else}
								<div class="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-800">
									{getInitials(user.name)}
								</div>
							{/if}
							
							<!-- Status indicator -->
							<div class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full {getStatusColor(user.status)} border border-white dark:border-gray-800"></div>
						</div>
					</Tooltip>
				</div>
			{/each}
			
			{#if extraCount > 0}
				<div 
					class="user-avatar"
					style={compact ? `z-index: 0; margin-left: -0.5rem` : ''}
					transition:scale={{ duration: 200, delay: 250 }}
				>
					<Tooltip content="{extraCount} more {extraCount === 1 ? 'user' : 'users'}">
						<div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-800">
							+{extraCount}
						</div>
					</Tooltip>
				</div>
			{/if}
		</div>
		
		{#if !compact && $activeUsers.length > 0}
			<div class="mt-3 space-y-1">
				{#each $activeUsers.slice(0, 3) as user}
					<div class="flex items-center gap-2 text-xs">
						<Circle class="w-2 h-2 {getStatusColor(user.status)} rounded-full" />
						<span class="text-gray-600 dark:text-gray-400">{user.name}</span>
						<span class="text-gray-400">in {user.currentPath}</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.active-users {
		padding: 0.75rem;
		background: white;
		border-radius: 0.5rem;
		border: 1px solid rgb(229 231 235);
	}
	
	.active-users.compact {
		padding: 0;
		background: transparent;
		border: none;
	}
	
	.user-avatar {
		position: relative;
		transition: all 0.2s;
	}
	
	.user-avatar:hover {
		transform: translateY(-2px);
		z-index: 10 !important;
	}
	
	:global(.dark) .active-users {
		background: rgb(31 41 55);
		border-color: rgb(55 65 81);
	}
</style>
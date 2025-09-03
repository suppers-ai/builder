<script lang="ts">
	import { 
		Upload, Download, Edit, Eye, Share2, Trash2, 
		FolderPlus, Copy, Move, Clock 
	} from 'lucide-svelte';
	import { collaboration } from '$lib/stores/collaboration';
	import { fade, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import type { FileActivity } from '$lib/stores/collaboration';
	
	export let limit = 10;
	export let showHeader = true;
	
	$: activities = collaboration.recentActivities$;
	$: displayActivities = $activities.slice(0, limit);
	
	function getActivityIcon(type: FileActivity['type']) {
		switch (type) {
			case 'upload':
				return Upload;
			case 'download':
				return Download;
			case 'edit':
				return Edit;
			case 'view':
				return Eye;
			default:
				return Clock;
		}
	}
	
	function getActivityColor(type: FileActivity['type']) {
		switch (type) {
			case 'upload':
				return 'text-green-500';
			case 'download':
				return 'text-blue-500';
			case 'edit':
				return 'text-orange-500';
			case 'view':
				return 'text-gray-500';
			default:
				return 'text-gray-400';
		}
	}
	
	function getActivityText(activity: FileActivity): string {
		switch (activity.type) {
			case 'upload':
				return `uploaded`;
			case 'download':
				return `downloaded`;
			case 'edit':
				return `edited`;
			case 'view':
				return `viewed`;
			default:
				return 'interacted with';
		}
	}
	
	function formatTime(date: Date): string {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const seconds = Math.floor(diff / 1000);
		
		if (seconds < 5) return 'just now';
		if (seconds < 60) return `${seconds}s ago`;
		
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days}d ago`;
		
		return date.toLocaleDateString();
	}
	
	let currentTime = new Date();
	setInterval(() => {
		currentTime = new Date();
	}, 10000); // Update every 10 seconds
</script>

<div class="activity-feed">
	{#if showHeader}
		<div class="header">
			<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Live Activity</h3>
			<div class="pulse-indicator">
				<span class="pulse"></span>
				<span class="text-xs text-gray-500">Real-time</span>
			</div>
		</div>
	{/if}
	
	<div class="activities">
		{#if displayActivities.length === 0}
			<div class="empty-state">
				<Clock class="w-8 h-8 text-gray-400 mx-auto mb-2" />
				<p class="text-sm text-gray-500">No recent activity</p>
				<p class="text-xs text-gray-400 mt-1">Actions will appear here in real-time</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each displayActivities as activity (activity.timestamp)}
					<div 
						class="activity-item"
						animate:flip={{ duration: 300 }}
						transition:slide={{ duration: 200 }}
					>
						<div class="icon">
							<svelte:component 
								this={getActivityIcon(activity.type)} 
								class="w-4 h-4 {getActivityColor(activity.type)}"
							/>
						</div>
						
						<div class="content">
							<p class="text-sm">
								<span class="font-medium text-gray-900 dark:text-gray-100">
									{activity.userName}
								</span>
								<span class="text-gray-600 dark:text-gray-400">
									{getActivityText(activity)}
								</span>
								<span class="font-medium text-gray-800 dark:text-gray-200">
									{activity.fileName}
								</span>
							</p>
							<p class="text-xs text-gray-500 mt-0.5">
								{formatTime(activity.timestamp)}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.activity-feed {
		background: white;
		border-radius: 0.5rem;
		border: 1px solid rgb(229 231 235);
		overflow: hidden;
	}
	
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid rgb(229 231 235);
	}
	
	.pulse-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.pulse {
		display: inline-block;
		width: 0.5rem;
		height: 0.5rem;
		background: rgb(34 197 94);
		border-radius: 50%;
		animation: pulse 2s infinite;
	}
	
	@keyframes pulse {
		0% {
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
		}
		70% {
			box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
		}
	}
	
	.activities {
		max-height: 400px;
		overflow-y: auto;
		padding: 0.75rem;
	}
	
	.activities::-webkit-scrollbar {
		width: 6px;
	}
	
	.activities::-webkit-scrollbar-thumb {
		background: rgb(209 213 219);
		border-radius: 3px;
	}
	
	.empty-state {
		padding: 2rem;
		text-align: center;
	}
	
	.activity-item {
		display: flex;
		gap: 0.75rem;
		padding: 0.5rem;
		border-radius: 0.375rem;
		transition: background 0.15s;
	}
	
	.activity-item:hover {
		background: rgb(249 250 251);
	}
	
	.icon {
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgb(243 244 246);
		border-radius: 0.375rem;
	}
	
	.content {
		flex: 1;
		min-width: 0;
	}
	
	:global(.dark) .activity-feed {
		background: rgb(31 41 55);
		border-color: rgb(55 65 81);
	}
	
	:global(.dark) .header {
		border-bottom-color: rgb(55 65 81);
	}
	
	:global(.dark) .activities::-webkit-scrollbar-thumb {
		background: rgb(75 85 99);
	}
	
	:global(.dark) .activity-item:hover {
		background: rgb(55 65 81);
	}
	
	:global(.dark) .icon {
		background: rgb(55 65 81);
	}
</style>
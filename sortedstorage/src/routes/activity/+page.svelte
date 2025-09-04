<script lang="ts">
	import { 
		Activity, Upload, Download, Share2, Trash2, 
		TrendingUp, TrendingDown, Users, Files, HardDrive,
		Calendar, Clock, BarChart3
	} from 'lucide-svelte';
	import Card from '$lib/components/common/Card.svelte';
	import Table from '$lib/components/common/Table.svelte';
	import { onMount } from 'svelte';
	import { notifications } from '$lib/stores/notifications';
	
	// Initialize with empty data - will be loaded from API
	let recentActivity: any[] = [];
	let stats = {
		totalFiles: 0,
		totalStorage: 0,
		storageLimit: 0,
		sharedFiles: 0,
		recentUploads: 0,
		activeUsers: 0,
		weeklyGrowth: 0,
		monthlyActivity: [
			{ day: 'Mon', uploads: 0, downloads: 0 },
			{ day: 'Tue', uploads: 0, downloads: 0 },
			{ day: 'Wed', uploads: 0, downloads: 0 },
			{ day: 'Thu', uploads: 0, downloads: 0 },
			{ day: 'Fri', uploads: 0, downloads: 0 },
			{ day: 'Sat', uploads: 0, downloads: 0 },
			{ day: 'Sun', uploads: 0, downloads: 0 }
		]
	};
	
	let fileTypes: any[] = [];
	let loading = true;
	
	onMount(async () => {
		await loadActivityData();
	});
	
	async function loadActivityData() {
		loading = true;
		try {
			// Import the storage API
			const { storageAPI } = await import('$lib/api/storage');
			
			// Load real data from APIs
			const [quota, storageStats] = await Promise.all([
				storageAPI.getQuota(),
				storageAPI.getStats()
			]);
			
			// Update stats with real data
			stats = {
				...stats,
				totalFiles: storageStats.fileCount,
				totalStorage: quota.used,
				storageLimit: quota.total,
				sharedFiles: storageStats.sharedCount,
				recentUploads: storageStats.fileCount, // This should be from recent activity
			};
			
			// TODO: Load actual activity data when endpoint is available
			// const activityResponse = await fetch('/api/activity');
			// const activityData = await activityResponse.json();
			// recentActivity = activityData.recentActivity || [];
			
			// Mock some file types data for now
			if (stats.totalFiles > 0) {
				fileTypes = [
					{ type: 'Documents', count: Math.floor(stats.totalFiles * 0.4), size: Math.floor(stats.totalStorage * 0.3) },
					{ type: 'Images', count: Math.floor(stats.totalFiles * 0.3), size: Math.floor(stats.totalStorage * 0.4) },
					{ type: 'Videos', count: Math.floor(stats.totalFiles * 0.1), size: Math.floor(stats.totalStorage * 0.25) },
					{ type: 'Other', count: Math.floor(stats.totalFiles * 0.2), size: Math.floor(stats.totalStorage * 0.05) }
				];
			}
		} catch (error) {
			console.error('Failed to load activity data:', error);
			notifications.error('Failed to load activity data', error.message || 'An error occurred');
		} finally {
			loading = false;
		}
	}
	
	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	}
	
	function formatTimeAgo(date: Date): string {
		const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
		
		if (seconds < 60) return 'just now';
		if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
		if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
		if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
		return date.toLocaleDateString();
	}
	
	$: storagePercentage = stats.storageLimit > 0 ? (stats.totalStorage / stats.storageLimit) * 100 : 0;
	$: totalFileTypeSize = fileTypes.reduce((sum, type) => sum + (type.size || 0), 0);
	
	// Icon mapping for activity types
	const activityIcons = {
		upload: { icon: Upload, color: 'text-green-500' },
		download: { icon: Download, color: 'text-purple-500' },
		share: { icon: Share2, color: 'text-blue-500' },
		delete: { icon: Trash2, color: 'text-red-500' }
	};
</script>

<div class="container mx-auto px-4 py-6 space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Activity Dashboard</h1>
		<div class="flex items-center gap-2 text-sm text-gray-500">
			<Calendar class="w-4 h-4" />
			<span>Last 30 days</span>
		</div>
	</div>
	
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-center">
				<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
				<p class="mt-2 text-sm text-gray-500">Loading activity data...</p>
			</div>
		</div>
	{:else}
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<Card>
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-500 dark:text-gray-400">Total Files</p>
						<p class="text-2xl font-bold">{stats.totalFiles.toLocaleString()}</p>
						{#if stats.weeklyGrowth > 0}
							<p class="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
								<TrendingUp class="w-3 h-3" />
								+{stats.weeklyGrowth}% this week
							</p>
						{:else if stats.weeklyGrowth < 0}
							<p class="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
								<TrendingDown class="w-3 h-3" />
								{stats.weeklyGrowth}% this week
							</p>
						{/if}
					</div>
					<Files class="w-8 h-8 text-blue-500" />
				</div>
			</Card>
			
			<Card>
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-500 dark:text-gray-400">Storage Used</p>
						<p class="text-2xl font-bold">{formatFileSize(stats.totalStorage)}</p>
						<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
							<div 
								class="bg-primary-500 h-2 rounded-full transition-all"
								style="width: {storagePercentage}%"
							></div>
						</div>
					</div>
					<HardDrive class="w-8 h-8 text-purple-500" />
				</div>
			</Card>
			
			<Card>
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-500 dark:text-gray-400">Shared Files</p>
						<p class="text-2xl font-bold">{stats.sharedFiles}</p>
						{#if stats.activeUsers > 0}
							<p class="text-xs text-gray-500 mt-1">
								With {stats.activeUsers} users
							</p>
						{/if}
					</div>
					<Share2 class="w-8 h-8 text-green-500" />
				</div>
			</Card>
			
			<Card>
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-500 dark:text-gray-400">Recent Uploads</p>
						<p class="text-2xl font-bold">{stats.recentUploads}</p>
						<p class="text-xs text-gray-500 mt-1">
							Today
						</p>
					</div>
					<Upload class="w-8 h-8 text-orange-500" />
				</div>
			</Card>
		</div>
		
		{#if stats.monthlyActivity.some(day => day.uploads > 0 || day.downloads > 0)}
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<!-- Activity Chart -->
				<div class="lg:col-span-2">
					<Card title="Weekly Activity" subtitle="Uploads and downloads over the past week">
						<div class="h-64 flex items-end justify-between gap-2">
							{#each stats.monthlyActivity as day}
								{@const maxValue = Math.max(...stats.monthlyActivity.map(d => Math.max(d.uploads, d.downloads)))}
								<div class="flex-1 flex flex-col items-center gap-2">
									<div class="w-full flex flex-col gap-1">
										{#if maxValue > 0}
											<div 
												class="bg-green-500 rounded-t"
												style="height: {(day.uploads / maxValue) * 200}px"
												title="{day.uploads} uploads"
											></div>
											<div 
												class="bg-blue-500 rounded-b"
												style="height: {(day.downloads / maxValue) * 200}px"
												title="{day.downloads} downloads"
											></div>
										{:else}
											<div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
										{/if}
									</div>
									<span class="text-xs text-gray-500">{day.day}</span>
								</div>
							{/each}
						</div>
						<div class="flex items-center gap-4 mt-4 text-sm">
							<div class="flex items-center gap-2">
								<div class="w-3 h-3 bg-green-500 rounded"></div>
								<span>Uploads</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="w-3 h-3 bg-blue-500 rounded"></div>
								<span>Downloads</span>
							</div>
						</div>
					</Card>
				</div>
				
				<!-- File Types -->
				{#if fileTypes.length > 0}
					<Card title="File Types" subtitle="Distribution by type">
						<div class="space-y-3">
							{#each fileTypes as type}
								{@const percentage = totalFileTypeSize > 0 ? (type.size / totalFileTypeSize) * 100 : 0}
								<div>
									<div class="flex items-center justify-between mb-1">
										<span class="text-sm font-medium">{type.type}</span>
										<span class="text-xs text-gray-500">{type.count} files</span>
									</div>
									<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
										<div 
											class="{type.color} h-2 rounded-full transition-all"
											style="width: {percentage}%"
											title="{formatFileSize(type.size)}"
										></div>
									</div>
									<span class="text-xs text-gray-500">{formatFileSize(type.size)}</span>
								</div>
							{/each}
						</div>
					</Card>
				{:else}
					<Card title="File Types" subtitle="Distribution by type">
						<div class="text-center text-gray-500 py-8">
							<Files class="w-12 h-12 mx-auto mb-2 opacity-50" />
							<p>No file type data available</p>
						</div>
					</Card>
				{/if}
			</div>
		{/if}
		
		<!-- Recent Activity -->
		<Card title="Recent Activity" subtitle="Latest file operations">
			{#if recentActivity.length > 0}
				<div class="space-y-3">
					{#each recentActivity as activity}
						{@const iconConfig = activityIcons[activity.type] || { icon: Activity, color: 'text-gray-500' }}
						<div class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
							<div class="flex-shrink-0">
								<div class="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
									<svelte:component this={iconConfig.icon} class="w-5 h-5 {iconConfig.color}" />
								</div>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium">
									{activity.user} {activity.action?.toLowerCase()} 
									<span class="font-bold">{activity.fileName}</span>
									{#if activity.sharedWith}
										with <span class="text-primary-600">{activity.sharedWith}</span>
									{/if}
								</p>
								<p class="text-xs text-gray-500">
									{formatFileSize(activity.size)} • {formatTimeAgo(new Date(activity.timestamp))}
								</p>
							</div>
							<div class="flex-shrink-0">
								<Clock class="w-4 h-4 text-gray-400" />
							</div>
						</div>
					{/each}
				</div>
				
				<div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
					<button class="text-sm text-primary-600 hover:text-primary-700 font-medium">
						View all activity →
					</button>
				</div>
			{:else}
				<div class="text-center text-gray-500 py-8">
					<Activity class="w-12 h-12 mx-auto mb-2 opacity-50" />
					<p>No recent activity</p>
					<p class="text-sm mt-1">Your file activity will appear here</p>
				</div>
			{/if}
		</Card>
	{/if}
</div>
<script lang="ts">
	import { 
		Activity, Upload, Download, Share2, Trash2, 
		TrendingUp, TrendingDown, Users, Files, HardDrive,
		Calendar, Clock, BarChart3
	} from 'lucide-svelte';
	import Card from '$lib/components/common/Card.svelte';
	import Table from '$lib/components/common/Table.svelte';
	import { onMount } from 'svelte';
	
	// Mock activity data
	const recentActivity = [
		{
			id: '1',
			type: 'upload',
			icon: Upload,
			color: 'text-green-500',
			action: 'Uploaded',
			fileName: 'project-report.pdf',
			user: 'You',
			timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
			size: 2548576
		},
		{
			id: '2',
			type: 'share',
			icon: Share2,
			color: 'text-blue-500',
			action: 'Shared',
			fileName: 'presentation.pptx',
			user: 'You',
			timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
			size: 5242880,
			sharedWith: 'team@company.com'
		},
		{
			id: '3',
			type: 'download',
			icon: Download,
			color: 'text-purple-500',
			action: 'Downloaded',
			fileName: 'budget.xlsx',
			user: 'John Doe',
			timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
			size: 1048576
		},
		{
			id: '4',
			type: 'delete',
			icon: Trash2,
			color: 'text-red-500',
			action: 'Deleted',
			fileName: 'old-files.zip',
			user: 'You',
			timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
			size: 10485760
		}
	];
	
	// Statistics
	const stats = {
		totalFiles: 1234,
		totalStorage: 2.5 * 1024 * 1024 * 1024, // 2.5 GB
		storageLimit: 5 * 1024 * 1024 * 1024, // 5 GB
		sharedFiles: 45,
		recentUploads: 12,
		activeUsers: 3,
		weeklyGrowth: 15.2,
		monthlyActivity: [
			{ day: 'Mon', uploads: 5, downloads: 8 },
			{ day: 'Tue', uploads: 7, downloads: 12 },
			{ day: 'Wed', uploads: 3, downloads: 6 },
			{ day: 'Thu', uploads: 9, downloads: 15 },
			{ day: 'Fri', uploads: 12, downloads: 20 },
			{ day: 'Sat', uploads: 2, downloads: 4 },
			{ day: 'Sun', uploads: 1, downloads: 2 }
		]
	};
	
	// File type distribution
	const fileTypes = [
		{ type: 'Documents', count: 523, size: 1.2 * 1024 * 1024 * 1024, color: 'bg-blue-500' },
		{ type: 'Images', count: 456, size: 800 * 1024 * 1024, color: 'bg-green-500' },
		{ type: 'Videos', count: 78, size: 300 * 1024 * 1024, color: 'bg-purple-500' },
		{ type: 'Archives', count: 145, size: 150 * 1024 * 1024, color: 'bg-orange-500' },
		{ type: 'Other', count: 32, size: 50 * 1024 * 1024, color: 'bg-gray-500' }
	];
	
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
	
	$: storagePercentage = (stats.totalStorage / stats.storageLimit) * 100;
	$: totalFileTypeSize = fileTypes.reduce((sum, type) => sum + type.size, 0);
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Activity Dashboard</h1>
		<div class="flex items-center gap-2 text-sm text-gray-500">
			<Calendar class="w-4 h-4" />
			<span>Last 30 days</span>
		</div>
	</div>
	
	<!-- Stats Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<Card>
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-500 dark:text-gray-400">Total Files</p>
					<p class="text-2xl font-bold">{stats.totalFiles.toLocaleString()}</p>
					<p class="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
						<TrendingUp class="w-3 h-3" />
						+{stats.weeklyGrowth}% this week
					</p>
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
					<p class="text-xs text-gray-500 mt-1">
						With {stats.activeUsers} users
					</p>
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
	
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Activity Chart -->
		<div class="lg:col-span-2">
			<Card title="Weekly Activity" subtitle="Uploads and downloads over the past week">
				<div class="h-64 flex items-end justify-between gap-2">
					{#each stats.monthlyActivity as day}
						<div class="flex-1 flex flex-col items-center gap-2">
							<div class="w-full flex flex-col gap-1">
								<div 
									class="bg-green-500 rounded-t"
									style="height: {day.uploads * 10}px"
									title="{day.uploads} uploads"
								></div>
								<div 
									class="bg-blue-500 rounded-b"
									style="height: {day.downloads * 10}px"
									title="{day.downloads} downloads"
								></div>
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
		<Card title="File Types" subtitle="Distribution by type">
			<div class="space-y-3">
				{#each fileTypes as type}
					{@const percentage = (type.size / totalFileTypeSize) * 100}
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
	</div>
	
	<!-- Recent Activity -->
	<Card title="Recent Activity" subtitle="Latest file operations">
		<div class="space-y-3">
			{#each recentActivity as activity}
				<div class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
					<div class="flex-shrink-0">
						<div class="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
							<svelte:component this={activity.icon} class="w-5 h-5 {activity.color}" />
						</div>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium">
							{activity.user} {activity.action.toLowerCase()} 
							<span class="font-bold">{activity.fileName}</span>
							{#if activity.sharedWith}
								with <span class="text-primary-600">{activity.sharedWith}</span>
							{/if}
						</p>
						<p class="text-xs text-gray-500">
							{formatFileSize(activity.size)} • {formatTimeAgo(activity.timestamp)}
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
	</Card>
</div>
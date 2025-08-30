<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import type { DashboardStats } from '$lib/types';
	import { Users, Database, FolderOpen, Activity, TrendingUp, TrendingDown } from 'lucide-svelte';
	
	let stats: DashboardStats | null = null;
	let loading = true;
	
	onMount(async () => {
		const response = await api.getDashboardStats();
		if (response.data) {
			stats = response.data;
		}
		loading = false;
	});
	
	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	}
	
	function formatTimeAgo(date: Date): string {
		const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
		if (seconds < 60) return `${seconds}s ago`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	}
</script>

<div class="space-y-6">
	<h1 class="admin-title">Dashboard</h1>
	
	{#if loading}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each Array(4) as _}
				<div class="stats-card animate-pulse">
					<div class="h-20"></div>
				</div>
			{/each}
		</div>
	{:else if stats}
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<!-- Total Users -->
			<div class="stats-card">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-600">Total Users</p>
						<p class="text-3xl font-bold text-gray-900">{stats.total_users}</p>
						<div class="flex items-center gap-1 mt-2">
							{#if stats.users_growth >= 0}
								<TrendingUp size={16} class="text-green-500" />
								<span class="text-sm text-green-500">+{stats.users_growth}%</span>
							{:else}
								<TrendingDown size={16} class="text-red-500" />
								<span class="text-sm text-red-500">{stats.users_growth}%</span>
							{/if}
						</div>
					</div>
					<div class="p-3 rounded-full bg-blue-100">
						<Users size={24} class="text-blue-600" />
					</div>
				</div>
			</div>
			
			<!-- Total Collections -->
			<div class="stats-card">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-600">Collections</p>
						<p class="text-3xl font-bold text-gray-900">{stats.total_collections}</p>
					</div>
					<div class="p-3 rounded-full bg-green-100">
						<Database size={24} class="text-green-600" />
					</div>
				</div>
			</div>
			
			<!-- Storage Used -->
			<div class="stats-card">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-600">Storage Used</p>
						<p class="text-3xl font-bold text-gray-900">{formatBytes(stats.total_storage_used)}</p>
						<div class="flex items-center gap-1 mt-2">
							{#if stats.storage_growth >= 0}
								<TrendingUp size={16} class="text-green-500" />
								<span class="text-sm text-green-500">+{stats.storage_growth}%</span>
							{:else}
								<TrendingDown size={16} class="text-red-500" />
								<span class="text-sm text-red-500">{stats.storage_growth}%</span>
							{/if}
						</div>
					</div>
					<div class="p-3 rounded-full bg-purple-100">
						<FolderOpen size={24} class="text-purple-600" />
					</div>
				</div>
			</div>
			
			<!-- API Calls -->
			<div class="stats-card">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-600">API Calls</p>
						<p class="text-3xl font-bold text-gray-900">{stats.total_api_calls.toLocaleString()}</p>
					</div>
					<div class="p-3 rounded-full bg-orange-100">
						<Activity size={24} class="text-orange-600" />
					</div>
				</div>
			</div>
		</div>
		
		<!-- Recent Activity -->
		<div class="admin-card">
			<h2 class="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
			{#if stats.recent_activities.length > 0}
				<div class="space-y-3">
					{#each stats.recent_activities as activity}
						<div class="flex items-center gap-4 p-3 rounded-lg glass-effect hover:bg-white/10 transition-colors">
							<div class="w-2 h-2 rounded-full bg-blue-500"></div>
							<div class="flex-1">
								<p class="font-medium text-gray-900">{activity.description}</p>
								{#if activity.user_email}
									<p class="text-sm text-gray-600">{activity.user_email}</p>
								{/if}
							</div>
							<span class="text-sm text-gray-500">
								{formatTimeAgo(activity.created_at)}
							</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-center text-gray-500 py-8">No recent activity</p>
			{/if}
		</div>
	{:else}
		<div class="admin-alert admin-alert-error">
			Failed to load dashboard statistics
		</div>
	{/if}
</div>

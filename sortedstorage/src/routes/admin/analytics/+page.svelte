<script lang="ts">
	import { onMount } from 'svelte';
	import { Line, Bar, Doughnut } from 'svelte-chartjs';
	import {
		Chart,
		LineElement,
		BarElement,
		PointElement,
		ArcElement,
		LinearScale,
		CategoryScale,
		TimeScale,
		Tooltip,
		Legend,
		Filler
	} from 'chart.js';
	import { TrendingUp, TrendingDown, Users, HardDrive, Share2, Download } from 'lucide-svelte';
	
	// Register Chart.js components
	Chart.register(
		LineElement,
		BarElement,
		PointElement,
		ArcElement,
		LinearScale,
		CategoryScale,
		TimeScale,
		Tooltip,
		Legend,
		Filler
	);
	
	// Analytics data
	let analytics = {
		overview: {
			totalUsers: 0,
			activeUsers: 0,
			totalFiles: 0,
			totalStorage: 0,
			totalShares: 0,
			totalDownloads: 0
		},
		trends: {
			users: { current: 0, previous: 0, change: 0 },
			storage: { current: 0, previous: 0, change: 0 },
			uploads: { current: 0, previous: 0, change: 0 },
			shares: { current: 0, previous: 0, change: 0 }
		},
		charts: {
			userActivity: null,
			storageGrowth: null,
			fileTypes: null,
			topUsers: null
		}
	};
	
	let dateRange = '7d';
	let loading = true;
	
	// Fetch analytics data
	async function fetchAnalytics() {
		loading = true;
		try {
			const response = await fetch(`/api/admin/analytics?range=${dateRange}`);
			const data = await response.json();
			
			// Update overview
			analytics.overview = data.overview;
			
			// Calculate trends
			analytics.trends = data.trends;
			
			// Prepare chart data
			prepareChartData(data);
		} catch (error) {
			console.error('Failed to fetch analytics:', error);
		} finally {
			loading = false;
		}
	}
	
	// Prepare chart data
	function prepareChartData(data: any) {
		// User activity chart
		analytics.charts.userActivity = {
			labels: data.userActivity.labels,
			datasets: [
				{
					label: 'Active Users',
					data: data.userActivity.active,
					borderColor: '#3b82f6',
					backgroundColor: 'rgba(59, 130, 246, 0.1)',
					tension: 0.4,
					fill: true
				},
				{
					label: 'New Users',
					data: data.userActivity.new,
					borderColor: '#10b981',
					backgroundColor: 'rgba(16, 185, 129, 0.1)',
					tension: 0.4,
					fill: true
				}
			]
		};
		
		// Storage growth chart
		analytics.charts.storageGrowth = {
			labels: data.storageGrowth.labels,
			datasets: [
				{
					label: 'Storage Used (GB)',
					data: data.storageGrowth.values,
					borderColor: '#8b5cf6',
					backgroundColor: 'rgba(139, 92, 246, 0.1)',
					tension: 0.4,
					fill: true
				}
			]
		};
		
		// File types distribution
		analytics.charts.fileTypes = {
			labels: data.fileTypes.labels,
			datasets: [
				{
					data: data.fileTypes.values,
					backgroundColor: [
						'#3b82f6',
						'#10b981',
						'#f59e0b',
						'#ef4444',
						'#8b5cf6',
						'#ec4899'
					]
				}
			]
		};
		
		// Top users by storage
		analytics.charts.topUsers = {
			labels: data.topUsers.map((u: any) => u.name),
			datasets: [
				{
					label: 'Storage (GB)',
					data: data.topUsers.map((u: any) => u.storage),
					backgroundColor: '#3b82f6'
				}
			]
		};
	}
	
	// Format bytes to human readable
	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
	}
	
	// Format number with commas
	function formatNumber(num: number): string {
		return num.toLocaleString();
	}
	
	// Handle date range change
	function handleDateRangeChange() {
		fetchAnalytics();
	}
	
	onMount(() => {
		fetchAnalytics();
		
		// Refresh every 5 minutes
		const interval = setInterval(fetchAnalytics, 300000);
		return () => clearInterval(interval);
	});
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="mb-8 flex justify-between items-center">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
				<p class="text-gray-600 dark:text-gray-400 mt-2">Monitor your storage platform performance</p>
			</div>
			
			<!-- Date Range Selector -->
			<select
				bind:value={dateRange}
				on:change={handleDateRangeChange}
				class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
			>
				<option value="24h">Last 24 Hours</option>
				<option value="7d">Last 7 Days</option>
				<option value="30d">Last 30 Days</option>
				<option value="90d">Last 90 Days</option>
				<option value="1y">Last Year</option>
			</select>
		</div>
		
		{#if loading}
			<div class="flex justify-center items-center h-64">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		{:else}
			<!-- Overview Cards -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
				<!-- Total Users -->
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
					<div class="flex items-center justify-between mb-4">
						<Users class="h-8 w-8 text-blue-600" />
						{#if analytics.trends.users.change !== 0}
							<span class="flex items-center text-sm {analytics.trends.users.change > 0 ? 'text-green-600' : 'text-red-600'}">
								{#if analytics.trends.users.change > 0}
									<TrendingUp class="h-4 w-4 mr-1" />
								{:else}
									<TrendingDown class="h-4 w-4 mr-1" />
								{/if}
								{Math.abs(analytics.trends.users.change)}%
							</span>
						{/if}
					</div>
					<div class="text-2xl font-bold text-gray-900 dark:text-white">
						{formatNumber(analytics.overview.totalUsers)}
					</div>
					<div class="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
				</div>
				
				<!-- Active Users -->
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
					<div class="flex items-center justify-between mb-4">
						<Users class="h-8 w-8 text-green-600" />
					</div>
					<div class="text-2xl font-bold text-gray-900 dark:text-white">
						{formatNumber(analytics.overview.activeUsers)}
					</div>
					<div class="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
				</div>
				
				<!-- Total Files -->
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
					<div class="flex items-center justify-between mb-4">
						<HardDrive class="h-8 w-8 text-purple-600" />
						{#if analytics.trends.uploads.change !== 0}
							<span class="flex items-center text-sm {analytics.trends.uploads.change > 0 ? 'text-green-600' : 'text-red-600'}">
								{#if analytics.trends.uploads.change > 0}
									<TrendingUp class="h-4 w-4 mr-1" />
								{:else}
									<TrendingDown class="h-4 w-4 mr-1" />
								{/if}
								{Math.abs(analytics.trends.uploads.change)}%
							</span>
						{/if}
					</div>
					<div class="text-2xl font-bold text-gray-900 dark:text-white">
						{formatNumber(analytics.overview.totalFiles)}
					</div>
					<div class="text-sm text-gray-600 dark:text-gray-400">Total Files</div>
				</div>
				
				<!-- Storage Used -->
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
					<div class="flex items-center justify-between mb-4">
						<HardDrive class="h-8 w-8 text-orange-600" />
						{#if analytics.trends.storage.change !== 0}
							<span class="flex items-center text-sm {analytics.trends.storage.change > 0 ? 'text-green-600' : 'text-red-600'}">
								{#if analytics.trends.storage.change > 0}
									<TrendingUp class="h-4 w-4 mr-1" />
								{:else}
									<TrendingDown class="h-4 w-4 mr-1" />
								{/if}
								{Math.abs(analytics.trends.storage.change)}%
							</span>
						{/if}
					</div>
					<div class="text-2xl font-bold text-gray-900 dark:text-white">
						{formatBytes(analytics.overview.totalStorage)}
					</div>
					<div class="text-sm text-gray-600 dark:text-gray-400">Storage Used</div>
				</div>
				
				<!-- Total Shares -->
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
					<div class="flex items-center justify-between mb-4">
						<Share2 class="h-8 w-8 text-indigo-600" />
						{#if analytics.trends.shares.change !== 0}
							<span class="flex items-center text-sm {analytics.trends.shares.change > 0 ? 'text-green-600' : 'text-red-600'}">
								{#if analytics.trends.shares.change > 0}
									<TrendingUp class="h-4 w-4 mr-1" />
								{:else}
									<TrendingDown class="h-4 w-4 mr-1" />
								{/if}
								{Math.abs(analytics.trends.shares.change)}%
							</span>
						{/if}
					</div>
					<div class="text-2xl font-bold text-gray-900 dark:text-white">
						{formatNumber(analytics.overview.totalShares)}
					</div>
					<div class="text-sm text-gray-600 dark:text-gray-400">Total Shares</div>
				</div>
				
				<!-- Total Downloads -->
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
					<div class="flex items-center justify-between mb-4">
						<Download class="h-8 w-8 text-teal-600" />
					</div>
					<div class="text-2xl font-bold text-gray-900 dark:text-white">
						{formatNumber(analytics.overview.totalDownloads)}
					</div>
					<div class="text-sm text-gray-600 dark:text-gray-400">Total Downloads</div>
				</div>
			</div>
			
			<!-- Charts Grid -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
				<!-- User Activity Chart -->
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Activity</h3>
					{#if analytics.charts.userActivity}
						<Line
							data={analytics.charts.userActivity}
							options={{
								responsive: true,
								maintainAspectRatio: false,
								plugins: {
									legend: {
										position: 'bottom'
									}
								},
								scales: {
									y: {
										beginAtZero: true
									}
								}
							}}
							height={300}
						/>
					{/if}
				</div>
				
				<!-- Storage Growth Chart -->
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Storage Growth</h3>
					{#if analytics.charts.storageGrowth}
						<Line
							data={analytics.charts.storageGrowth}
							options={{
								responsive: true,
								maintainAspectRatio: false,
								plugins: {
									legend: {
										display: false
									}
								},
								scales: {
									y: {
										beginAtZero: true
									}
								}
							}}
							height={300}
						/>
					{/if}
				</div>
			</div>
			
			<!-- Additional Charts -->
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<!-- File Types Distribution -->
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">File Types</h3>
					{#if analytics.charts.fileTypes}
						<Doughnut
							data={analytics.charts.fileTypes}
							options={{
								responsive: true,
								maintainAspectRatio: false,
								plugins: {
									legend: {
										position: 'bottom'
									}
								}
							}}
							height={250}
						/>
					{/if}
				</div>
				
				<!-- Top Users by Storage -->
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 lg:col-span-2">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Users by Storage</h3>
					{#if analytics.charts.topUsers}
						<Bar
							data={analytics.charts.topUsers}
							options={{
								responsive: true,
								maintainAspectRatio: false,
								plugins: {
									legend: {
										display: false
									}
								},
								scales: {
									y: {
										beginAtZero: true
									}
								}
							}}
							height={250}
						/>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
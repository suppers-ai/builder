<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	
	let stats = {
		totalViews: 0,
		uniqueUsers: 0,
		todayViews: 0,
		activeNow: 0
	};
	
	let pageViews = [];
	let loading = true;
	let error = null;

	onMount(async () => {
		await loadData();
		// Auto-refresh every 30 seconds
		const interval = setInterval(loadData, 30000);
		return () => clearInterval(interval);
	});

	async function loadData() {
		await Promise.all([loadStats(), loadPageViews()]);
		loading = false;
	}

	async function loadStats() {
		try {
			const response = await api.getAnalyticsStats();
			if (response.error) {
				throw new Error(response.error);
			}
			stats = response.data || stats;
		} catch (err) {
			error = err.message;
		}
	}

	async function loadPageViews() {
		try {
			const response = await api.getAnalyticsPageviews();
			if (response.error) {
				throw new Error(response.error);
			}
			pageViews = response.data?.pageViews || [];
		} catch (err) {
			error = err.message;
		}
	}

	async function trackEvent() {
		const eventName = prompt('Enter event name:');
		if (!eventName) return;
		
		try {
			const response = await api.trackAnalyticsEvent({
				event: eventName,
				timestamp: new Date().toISOString()
			});
			
			if (!response.error) {
				alert('Event tracked successfully!');
				await loadStats();
			} else {
				throw new Error(response.error);
			}
		} catch (err) {
			alert('Failed to track event: ' + err.message);
		}
	}

	function formatNumber(num) {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
		if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
		return num.toString();
	}
</script>

<div class="container mx-auto p-6">
	<!-- Header -->
	<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white text-2xl">
					📊
				</div>
				<div>
					<h1 class="text-2xl font-bold text-gray-900">
						Analytics Dashboard
						<span class="badge badge-info badge-sm ml-2">Official Extension</span>
					</h1>
					<p class="text-gray-600">Real-time insights into page views, user behavior, and application metrics</p>
				</div>
			</div>
			<div class="flex gap-2">
				<button on:click={trackEvent} class="btn btn-primary btn-sm">
					📍 Track Event
				</button>
				<button class="btn btn-ghost btn-sm">
					📥 Export
				</button>
				<button on:click={loadData} class="btn btn-ghost btn-sm">
					↻ Refresh
				</button>
			</div>
		</div>
	</div>

	{#if loading}
		<div class="flex justify-center items-center h-64">
			<div class="loading loading-spinner loading-lg"></div>
		</div>
	{:else if error}
		<div class="alert alert-error">
			<span>Error: {error}</span>
		</div>
	{:else}
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
			<div class="stat bg-white rounded-lg shadow">
				<div class="stat-title">Total Page Views</div>
				<div class="stat-value text-primary">{formatNumber(stats.totalViews)}</div>
				<div class="stat-desc">All time</div>
			</div>
			
			<div class="stat bg-white rounded-lg shadow">
				<div class="stat-title">Unique Users</div>
				<div class="stat-value text-secondary">{formatNumber(stats.uniqueUsers)}</div>
				<div class="stat-desc">Registered users</div>
			</div>
			
			<div class="stat bg-white rounded-lg shadow">
				<div class="stat-title">Today's Views</div>
				<div class="stat-value text-accent">{formatNumber(stats.todayViews)}</div>
				<div class="stat-desc">Last 24 hours</div>
			</div>
			
			<div class="stat bg-white rounded-lg shadow">
				<div class="stat-title">Active Now</div>
				<div class="stat-value text-success">{stats.activeNow}</div>
				<div class="stat-desc">Current visitors</div>
			</div>
		</div>

		<!-- Chart Placeholder -->
		<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
			<h2 class="text-xl font-semibold mb-4">Page Views Trend (Last 7 Days)</h2>
			<div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
				<p>Chart visualization coming soon</p>
			</div>
		</div>

		<!-- Top Pages -->
		<div class="bg-white rounded-lg shadow-lg p-6">
			<h2 class="text-xl font-semibold mb-4">Top Pages This Week</h2>
			{#if pageViews.length > 0}
				<div class="space-y-2">
					{#each pageViews as page, index}
						<div class="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
							<div class="flex items-center gap-3">
								<span class="text-gray-400 text-sm">{index + 1}.</span>
								<a href={page.url} class="font-medium text-blue-600 hover:text-blue-800">
									{page.url}
								</a>
							</div>
							<span class="badge badge-ghost">
								{formatNumber(page.views)} views
							</span>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12 text-gray-500">
					<svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
					<p>No page view data available yet</p>
					<p class="text-sm mt-2">Data will appear once users start visiting your site</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 1200px;
	}
</style>
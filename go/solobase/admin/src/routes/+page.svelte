<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import { 
		Cpu, HardDrive, Database, Users, 
		Activity, Clock, FolderOpen, Image,
		FileText
	} from 'lucide-svelte';
	import { api } from '$lib/api';
	
	Chart.register(...registerables);
	
	let cpuUsage = 0;
	let memoryUsage = 0;
	let diskUsage = 0;
	let memoryInfo = '';
	let diskInfo = '';
	let totalUsers = 0;
	let activeUsers = 0;
	let apiActivity = 0;
	let uptime = 'Loading...';
	let totalStorage = '0 B';
	let totalCollections = 0;
	let totalFiles = 0;
	let images = 0;
	let recentFiles = 0;
	let recentActivities: any[] = [];
	
	// Prometheus metrics
	let httpRequestsTotal = 0;
	let httpRequestRate = 0;
	let dbQueriesTotal = 0;
	let avgResponseTime = 0;
	let errorRate = 0;
	let extensionMetrics: any = {};
	
	let userGrowthChart: Chart | null = null;
	let apiActivityChart: Chart | null = null;
	let intervalId: ReturnType<typeof setInterval> | null = null;
	
	function recreateCharts() {
		// Destroy existing charts
		if (userGrowthChart) {
			userGrowthChart.destroy();
			userGrowthChart = null;
		}
		if (apiActivityChart) {
			apiActivityChart.destroy();
			apiActivityChart = null;
		}
		// Charts will be recreated in initCharts
		setTimeout(() => initCharts(), 100);
	}
	
	function initCharts() {
		const isMobile = window.innerWidth <= 767;
		
		// User Growth Chart
		const userCtx = document.getElementById('user-growth-chart') as HTMLCanvasElement;
		if (userCtx && !userGrowthChart) {
			userGrowthChart = new Chart(userCtx, {
				type: 'line',
				data: {
					labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
					datasets: [{
						label: 'Users',
						data: [totalUsers, totalUsers, totalUsers, totalUsers, totalUsers, totalUsers, totalUsers],
						borderColor: '#3b82f6',
						backgroundColor: 'rgba(59, 130, 246, 0.1)',
						tension: 0.4,
						fill: true,
						pointRadius: isMobile ? 2 : 3
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					layout: {
						padding: {
							left: isMobile ? 5 : 10,
							right: isMobile ? 15 : 10,
							top: 10,
							bottom: 10
						}
					},
					plugins: {
						legend: { display: false }
					},
					scales: {
						y: {
							beginAtZero: true,
							grid: {
								color: 'rgba(0, 0, 0, 0.05)'
							},
							ticks: {
								padding: 5,
								font: {
									size: isMobile ? 10 : 12
								}
							}
						},
						x: {
							grid: {
								display: false
							},
							ticks: {
								padding: 5,
								font: {
									size: isMobile ? 10 : 12
								}
							}
						}
					}
				}
			});
		}
		
		// API Activity Chart
		const apiCtx = document.getElementById('api-activity-chart') as HTMLCanvasElement;
		if (apiCtx && !apiActivityChart) {
			apiActivityChart = new Chart(apiCtx, {
				type: 'bar',
				data: {
					labels: Array.from({length: 24}, (_, i) => isMobile ? `${i}` : `${i}:00`),
					datasets: [{
						label: 'Requests',
						data: new Array(24).fill(0),
						backgroundColor: '#10b981',
						borderRadius: 4,
						maxBarThickness: isMobile ? 15 : 30
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					layout: {
						padding: {
							left: isMobile ? 5 : 10,
							right: isMobile ? 15 : 10,
							top: 10,
							bottom: isMobile ? 5 : 10
						}
					},
					plugins: {
						legend: { display: false }
					},
					scales: {
						y: {
							beginAtZero: true,
							grid: {
								color: 'rgba(0, 0, 0, 0.05)'
							},
							ticks: {
								padding: 5,
								font: {
									size: isMobile ? 10 : 12
								}
							}
						},
						x: {
							grid: {
								display: false
							},
							ticks: {
								maxRotation: isMobile ? 90 : 45,
								minRotation: isMobile ? 45 : 0,
								autoSkip: true,
								maxTicksLimit: isMobile ? 8 : 12,
								padding: 5,
								font: {
									size: isMobile ? 9 : 12
								}
							}
						}
					}
				}
			});
		}
	}
	
	onMount(async () => {
		// Fetch dashboard stats
		try {
			const stats = await api.get('/dashboard/stats');
			totalUsers = stats.total_users || 0;
			activeUsers = stats.total_users || 0; // For now, assume all users are active
			totalCollections = stats.total_collections || 0;
			apiActivity = stats.total_api_calls || 0;
			totalStorage = formatBytes(stats.total_storage_used || 0);
			recentActivities = stats.recent_activities || [];
		} catch (error) {
			console.error('Failed to fetch dashboard stats:', error);
		}
		
		// Fetch system metrics
		async function fetchMetrics() {
			try {
				const metrics = await api.get('/system/metrics');
				cpuUsage = metrics.cpu_usage || 0;
				memoryUsage = metrics.memory_usage || 0;
				diskUsage = metrics.disk_usage || 0;
				uptime = metrics.uptime || 'N/A';
				
				// Format memory info
				if (metrics.memory_used && metrics.memory_total) {
					memoryInfo = `${formatBytes(metrics.memory_used)} / ${formatBytes(metrics.memory_total)}`;
				}
				
				// Format disk info
				if (metrics.disk_used && metrics.disk_total) {
					diskInfo = `${formatBytes(metrics.disk_used)} / ${formatBytes(metrics.disk_total)}`;
				}
				
				// Update gauges
				drawGauge('cpu-gauge', cpuUsage, '#ef4444');
				drawGauge('memory-gauge', memoryUsage, '#3b82f6');
				drawGauge('disk-gauge', diskUsage, '#10b981');
			} catch (error) {
				console.error('Failed to fetch system metrics:', error);
			}
		}
		
		// Fetch Prometheus metrics
		async function fetchPrometheusMetrics() {
			try {
				const response = await fetch('/api/metrics');
				const text = await response.text();
				
				// Parse Prometheus metrics text format
				const lines = text.split('\n');
				let requestsCount = 0;
				let queriesCount = 0;
				let totalDuration = 0;
				let durationCount = 0;
				let errors = 0;
				
				lines.forEach(line => {
					if (line.startsWith('http_requests_total{')) {
						const match = line.match(/} (\d+)/);
						if (match) requestsCount += parseInt(match[1]);
						
						// Count errors (status codes >= 400)
						if (line.includes('status="4') || line.includes('status="5')) {
							const errorMatch = line.match(/} (\d+)/);
							if (errorMatch) errors += parseInt(errorMatch[1]);
						}
					}
					if (line.startsWith('database_queries_total{')) {
						const match = line.match(/} (\d+)/);
						if (match) queriesCount += parseInt(match[1]);
					}
					if (line.startsWith('http_request_duration_seconds_sum{')) {
						const match = line.match(/} ([\d.]+)/);
						if (match) totalDuration += parseFloat(match[1]);
					}
					if (line.startsWith('http_request_duration_seconds_count{')) {
						const match = line.match(/} (\d+)/);
						if (match) durationCount += parseInt(match[1]);
					}
				});
				
				httpRequestsTotal = requestsCount;
				dbQueriesTotal = queriesCount;
				avgResponseTime = durationCount > 0 ? (totalDuration / durationCount * 1000).toFixed(2) : 0;
				errorRate = requestsCount > 0 ? ((errors / requestsCount) * 100).toFixed(2) : 0;
				
				// Calculate request rate (requests per minute)
				// This would need historical data for accurate calculation
				httpRequestRate = Math.round(requestsCount / 60); // Simplified
				
			} catch (error) {
				console.error('Failed to fetch Prometheus metrics:', error);
			}
		}
		
		// Initial fetch
		await fetchMetrics();
		await fetchPrometheusMetrics();
		
		// Initialize charts
		initCharts();
		
		// Handle window resize
		let resizeTimeout: ReturnType<typeof setTimeout>;
		const handleResize = () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				recreateCharts();
			}, 250);
		};
		window.addEventListener('resize', handleResize);
		
		// Update metrics every 5 seconds
		intervalId = setInterval(async () => {
			await fetchMetrics();
			await fetchPrometheusMetrics();
		}, 5000);
		
		// Cleanup on unmount
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
	
	onDestroy(() => {
		// Clean up interval
		if (intervalId) {
			clearInterval(intervalId);
		}
		
		// Destroy charts
		if (userGrowthChart) {
			userGrowthChart.destroy();
			userGrowthChart = null;
		}
		if (apiActivityChart) {
			apiActivityChart.destroy();
			apiActivityChart = null;
		}
	});
	
	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
	
	function drawGauge(elementId: string, percentage: number, color: string) {
		const element = document.getElementById(elementId);
		if (!element) return;
		
		const canvas = element.querySelector('canvas') || document.createElement('canvas');
		
		// Responsive canvas size
		const isMobile = window.innerWidth <= 767;
		const canvasSize = isMobile ? 100 : 120;
		
		if (!element.querySelector('canvas')) {
			canvas.width = canvasSize;
			canvas.height = canvasSize;
			element.appendChild(canvas);
		}
		
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		
		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		const radius = isMobile ? 35 : 45;
		
		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		// Draw background circle
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, Math.PI * 0.7, Math.PI * 2.3);
		ctx.strokeStyle = '#e2e8f0';
		ctx.lineWidth = 8;
		ctx.stroke();
		
		// Draw progress arc
		const startAngle = Math.PI * 0.7;
		const endAngle = startAngle + (Math.PI * 1.6 * percentage / 100);
		
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, startAngle, endAngle);
		ctx.strokeStyle = color;
		ctx.lineWidth = 8;
		ctx.lineCap = 'round';
		ctx.stroke();
		
		// Draw text
		ctx.fillStyle = '#1e293b';
		ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(`${percentage.toFixed(1)}%`, centerX, centerY);
	}
</script>

<div class="page-header">
	<div class="breadcrumb">
		<a href="/">Home</a>
		<span class="breadcrumb-separator">›</span>
		<span>Dashboard</span>
	</div>
</div>

<div class="page-content">
	<!-- System Metrics Row -->
	<div class="metrics-grid">
		<!-- CPU Usage -->
		<div class="stat-card">
			<div class="stat-header">
				<Cpu size={20} style="color: var(--text-muted)" />
			</div>
			<div class="stat-label">CPU USAGE</div>
			<div id="cpu-gauge" class="gauge-container"></div>
			<div class="stat-description">System Load</div>
		</div>
		
		<!-- Memory Usage -->
		<div class="stat-card">
			<div class="stat-header">
				<Database size={20} style="color: var(--text-muted)" />
			</div>
			<div class="stat-label">MEMORY USAGE</div>
			<div id="memory-gauge" class="gauge-container"></div>
			<div class="stat-description">{memoryInfo || 'Loading...'}</div>
		</div>
		
		<!-- Disk Usage -->
		<div class="stat-card">
			<div class="stat-header">
				<HardDrive size={20} style="color: var(--text-muted)" />
			</div>
			<div class="stat-label">DISK USAGE</div>
			<div id="disk-gauge" class="gauge-container"></div>
			<div class="stat-description">{diskInfo || 'Loading...'}</div>
		</div>
	</div>
	
	<!-- Stats Grid -->
	<div class="stats-grid">
		<!-- Total Users -->
		<div class="stat-card">
			<div class="stat-header">
				<Users size={20} style="color: var(--text-muted)" />
			</div>
			<div class="stat-label">TOTAL USERS</div>
			<div class="stat-value">{totalUsers}</div>
			<div class="stat-description">{activeUsers} active</div>
		</div>
		
		<!-- API Activity -->
		<div class="stat-card">
			<div class="stat-header">
				<Activity size={20} style="color: var(--text-muted)" />
			</div>
			<div class="stat-label">API ACTIVITY</div>
			<div class="stat-value">{apiActivity}</div>
			<div class="stat-description">Last 24 hours</div>
		</div>
		
		<!-- Uptime -->
		<div class="stat-card">
			<div class="stat-header">
				<Clock size={20} style="color: var(--text-muted)" />
			</div>
			<div class="stat-label">UPTIME</div>
			<div class="stat-value">{uptime}</div>
			<div class="stat-description">&nbsp;</div>
		</div>
	</div>
	
	<!-- Storage & Collections Stats -->
	<div class="stats-grid">
		<!-- Total Storage -->
		<div class="stat-card">
			<div class="stat-header">
				<Database size={20} style="color: var(--text-muted)" />
			</div>
			<div class="stat-label">TOTAL STORAGE</div>
			<div class="stat-value">{totalStorage}</div>
			<div class="stat-description">Used Space</div>
		</div>
		
		<!-- Total Collections -->
		<div class="stat-card">
			<div class="stat-header">
				<FolderOpen size={20} style="color: var(--text-muted)" />
			</div>
			<div class="stat-label">COLLECTIONS</div>
			<div class="stat-value">{totalCollections}</div>
			<div class="stat-description">Database Collections</div>
		</div>
	</div>
	
	<!-- Prometheus Metrics Section -->
	<div style="margin-top: 2rem;">
		<h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary);">
			Performance Metrics
		</h3>
		<div class="stats-grid">
			<!-- HTTP Requests -->
			<div class="stat-card">
				<div class="stat-header">
					<Activity size={20} style="color: var(--primary-color)" />
				</div>
				<div class="stat-label">HTTP REQUESTS</div>
				<div class="stat-value" style="color: var(--primary-color)">{httpRequestsTotal.toLocaleString()}</div>
				<div class="stat-description">{httpRequestRate} req/min</div>
			</div>
			
			<!-- Database Queries -->
			<div class="stat-card">
				<div class="stat-header">
					<Database size={20} style="color: var(--success-color)" />
				</div>
				<div class="stat-label">DB QUERIES</div>
				<div class="stat-value" style="color: var(--success-color)">{dbQueriesTotal.toLocaleString()}</div>
				<div class="stat-description">Total queries</div>
			</div>
			
			<!-- Average Response Time -->
			<div class="stat-card">
				<div class="stat-header">
					<Clock size={20} style="color: var(--warning-color)" />
				</div>
				<div class="stat-label">AVG RESPONSE</div>
				<div class="stat-value" style="color: var(--warning-color)">{avgResponseTime}ms</div>
				<div class="stat-description">Average latency</div>
			</div>
			
			<!-- Error Rate -->
			<div class="stat-card">
				<div class="stat-header">
					<Activity size={20} style="color: var(--danger-color)" />
				</div>
				<div class="stat-label">ERROR RATE</div>
				<div class="stat-value" style="color: var(--danger-color)">{errorRate}%</div>
				<div class="stat-description">Request errors</div>
			</div>
		</div>
	</div>
	
	<!-- Charts Row -->
	<div class="charts-grid">
		<!-- User Growth Chart -->
		<div class="card">
			<div class="card-header">
				<h3 class="card-title">User Growth</h3>
				<span style="font-size: 0.75rem; color: var(--text-muted)">Last 7 days</span>
			</div>
			<div class="chart-container">
				<canvas id="user-growth-chart"></canvas>
			</div>
		</div>
		
		<!-- API Activity Chart -->
		<div class="card">
			<div class="card-header">
				<h3 class="card-title">API Activity</h3>
				<span style="font-size: 0.75rem; color: var(--text-muted)">Last 24 hours</span>
			</div>
			<div class="chart-container">
				<canvas id="api-activity-chart"></canvas>
			</div>
		</div>
	</div>
</div>

<style>
	.gauge-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 120px;
		position: relative;
	}
	
	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		max-width: 600px;
		margin-bottom: 1.5rem;
	}
	
	.charts-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		margin-top: 2rem;
	}
	
	.chart-container {
		position: relative;
		height: 200px;
		padding: 0.5rem;
	}
	
	/* Mobile Responsive */
	@media (max-width: 767px) {
		.chart-container {
			height: 180px;
			padding: 0.5rem 0.25rem;
		}
		.metrics-grid {
			grid-template-columns: 1fr;
			max-width: 100%;
		}
		
		.stats-grid {
			grid-template-columns: 1fr !important;
		}
		
		.charts-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
		
		.stat-card {
			min-height: auto;
		}
		
		.card {
			padding: 1rem !important;
		}
		
		.card-header {
			padding-bottom: 0.5rem !important;
			margin-bottom: 0.5rem !important;
		}
		
		.gauge-container {
			height: 100px;
		}
		
		.gauge-container canvas {
			width: 100px !important;
			height: 100px !important;
		}
	}
	
	/* Tablet */
	@media (min-width: 768px) and (max-width: 1023px) {
		.metrics-grid {
			max-width: 100%;
		}
		
		.stats-grid {
			grid-template-columns: repeat(2, 1fr) !important;
		}
		
		.charts-grid {
			grid-template-columns: 1fr;
		}
	}
	
	/* Small screens with limited width */
	@media (max-width: 480px) {
		.stat-value {
			font-size: 1.5rem;
		}
		
		.card {
			padding: 0.75rem;
		}
		
		.card-header {
			padding: 0.5rem;
		}
	}
</style>
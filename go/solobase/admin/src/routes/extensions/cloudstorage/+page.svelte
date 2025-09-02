<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		Cloud, Upload, FolderPlus, Settings, Download,
		HardDrive, Shield, Share2, Trash2, MoreVertical,
		FileText, Image, Film, Music, Archive, File
	} from 'lucide-svelte';
	import { api } from '$lib/api';
	import { requireAdmin } from '$lib/utils/auth';

	let providers: any[] = [];
	let loading = true;
	let selectedProvider: any = null;
	let showConfigModal = false;
	let activeTab = 'overview';
	
	// Form data for new provider
	let newProvider = {
		name: '',
		type: 's3',
		endpoint: '',
		region: '',
		accessKey: '',
		secretKey: ''
	};

	// Stats
	let stats = {
		totalProviders: 0,
		activeSyncs: 0,
		totalStorage: '0 GB',
		lastActivity: 'No activity'
	};

	// Recent activities
	let recentActivities: any[] = [];

	onMount(async () => {
		if (!requireAdmin()) return;
		await loadProviders();
	});

	async function loadProviders() {
		try {
			loading = true;
			
			// Fetch providers and activity from API
			const [providersRes, activityRes, statsRes] = await Promise.all([
				api.get('/ext/cloudstorage/api/providers'),
				api.get('/ext/cloudstorage/api/activity'),
				api.get('/ext/cloudstorage/api/stats')
			]);
			
			providers = providersRes || [];
			recentActivities = activityRes || [];
			stats = statsRes || {
				totalProviders: 0,
				activeSyncs: 0,
				totalStorage: '0 GB',
				lastActivity: 'No activity'
			};
		} catch (error) {
			console.error('Failed to load providers:', error);
			providers = [];
			recentActivities = [];
		} finally {
			loading = false;
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'connected': return 'bg-green-100 text-green-700';
			case 'disconnected': return 'bg-red-100 text-red-700';
			case 'pending': return 'bg-yellow-100 text-yellow-700';
			default: return 'bg-gray-100 text-gray-700';
		}
	}

	function getActionIcon(action: string) {
		switch (action) {
			case 'upload': return Upload;
			case 'delete': return Trash2;
			case 'share': return Share2;
			case 'download': return Download;
			default: return File;
		}
	}

	function getActionColor(action: string) {
		switch (action) {
			case 'upload': return 'text-green-600';
			case 'delete': return 'text-red-600';
			case 'share': return 'text-blue-600';
			case 'download': return 'text-purple-600';
			default: return 'text-gray-600';
		}
	}
	
	async function addProvider() {
		try {
			const result = await api.post('/ext/cloudstorage/api/providers', newProvider);
			if (result) {
				// Reset form
				newProvider = {
					name: '',
					type: 's3',
					endpoint: '',
					region: '',
					accessKey: '',
					secretKey: ''
				};
				showConfigModal = false;
				// Reload providers
				await loadProviders();
			}
		} catch (error) {
			console.error('Failed to add provider:', error);
			alert('Failed to add storage provider');
		}
	}
	
	function openConfigModal() {
		showConfigModal = true;
	}
</script>

<div class="page-container">
	<!-- Header -->
	<div class="page-header">
		<div class="header-content">
			<div class="header-left">
				<div class="header-title">
					<Cloud size={24} />
					<h1>Cloud Storage</h1>
				</div>
				<p class="header-subtitle">Multi-provider storage management and optimization</p>
			</div>
			<div class="header-actions">
				<button class="btn btn-secondary" on:click={openConfigModal}>
					<Settings size={16} />
					Add Provider
				</button>
				<button class="btn btn-primary">
					<Upload size={16} />
					Upload Files
				</button>
			</div>
		</div>
	</div>

	<!-- Tabs -->
	<div class="tabs">
		<button 
			class="tab {activeTab === 'overview' ? 'active' : ''}"
			on:click={() => activeTab = 'overview'}
		>
			Overview
		</button>
		<button 
			class="tab {activeTab === 'providers' ? 'active' : ''}"
			on:click={() => activeTab = 'providers'}
		>
			Providers
		</button>
		<button 
			class="tab {activeTab === 'activity' ? 'active' : ''}"
			on:click={() => activeTab = 'activity'}
		>
			Activity
		</button>
		<button 
			class="tab {activeTab === 'settings' ? 'active' : ''}"
			on:click={() => activeTab = 'settings'}
		>
			Settings
		</button>
	</div>

	{#if activeTab === 'overview'}
		<!-- Stats Overview -->
		<div class="stats-grid">
			<div class="stat-card">
				<div class="stat-icon bg-cyan-100">
					<Cloud size={20} class="text-cyan-600" />
				</div>
				<div class="stat-content">
					<p class="stat-label">Total Providers</p>
					<p class="stat-value">{stats.totalProviders}</p>
				</div>
			</div>
			
			<div class="stat-card">
				<div class="stat-icon bg-green-100">
					<Shield size={20} class="text-green-600" />
				</div>
				<div class="stat-content">
					<p class="stat-label">Active Syncs</p>
					<p class="stat-value">{stats.activeSyncs}</p>
				</div>
			</div>
			
			<div class="stat-card">
				<div class="stat-icon bg-purple-100">
					<HardDrive size={20} class="text-purple-600" />
				</div>
				<div class="stat-content">
					<p class="stat-label">Total Storage</p>
					<p class="stat-value">{stats.totalStorage}</p>
				</div>
			</div>
			
			<div class="stat-card">
				<div class="stat-icon bg-orange-100">
					<FileText size={20} class="text-orange-600" />
				</div>
				<div class="stat-content">
					<p class="stat-label">Last Activity</p>
					<p class="stat-value">{stats.lastActivity}</p>
				</div>
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="quick-actions">
			<h3>Quick Actions</h3>
			<div class="actions-grid">
				<button class="action-card">
					<Upload size={24} class="text-cyan-600" />
					<span>Upload Files</span>
				</button>
				<button class="action-card">
					<FolderPlus size={24} class="text-purple-600" />
					<span>Create Bucket</span>
				</button>
				<button class="action-card">
					<Shield size={24} class="text-green-600" />
					<span>Security Scan</span>
				</button>
				<button class="action-card">
					<Settings size={24} class="text-gray-600" />
					<span>Settings</span>
				</button>
			</div>
		</div>
	{/if}

	{#if activeTab === 'providers'}
		<!-- Providers List -->
		<div class="providers-grid">
			{#each providers as provider}
				<div class="provider-card">
					<div class="provider-header">
						<div class="provider-icon">{provider.icon}</div>
						<button class="btn-icon-sm">
							<MoreVertical size={16} />
						</button>
					</div>
					
					<div class="provider-body">
						<h3 class="provider-name">{provider.name}</h3>
						<span class="status-badge {getStatusColor(provider.status)}">
							{provider.status}
						</span>
						
						<div class="provider-stats">
							<div class="stat">
								<span class="label">Region</span>
								<span class="value">{provider.region}</span>
							</div>
							<div class="stat">
								<span class="label">Buckets</span>
								<span class="value">{provider.buckets}</span>
							</div>
							<div class="stat">
								<span class="label">Storage</span>
								<span class="value">{provider.storage}</span>
							</div>
							<div class="stat">
								<span class="label">Files</span>
								<span class="value">{provider.files.toLocaleString()}</span>
							</div>
						</div>
						
						<div class="provider-cost">
							<span class="cost-label">Monthly Cost</span>
							<span class="cost-value">{provider.cost}</span>
						</div>
					</div>
					
					<div class="provider-footer">
						<button class="btn btn-sm">Manage</button>
						<button class="btn btn-sm btn-secondary">Configure</button>
					</div>
				</div>
			{/each}
			
			<div class="provider-card add-provider">
				<Cloud size={48} class="text-gray-400" />
				<h3>Add Provider</h3>
				<p>Connect a new storage provider</p>
				<button class="btn btn-primary">
					<Plus size={16} />
					Add Provider
				</button>
			</div>
		</div>
	{/if}

	{#if activeTab === 'activity'}
		<!-- Recent Activity -->
		<div class="activity-card">
			<h3>Recent Activity</h3>
			<div class="activity-list">
				{#each recentActivities as activity}
					<div class="activity-item">
						<div class="activity-icon {getActionColor(activity.action)}">
							<svelte:component this={getActionIcon(activity.action)} size={16} />
						</div>
						<div class="activity-details">
							<p class="activity-description">
								<strong>{activity.user}</strong> {activity.action}d 
								<span class="file-name">{activity.file}</span>
							</p>
							<div class="activity-meta">
								<span>{activity.size}</span>
								<span>•</span>
								<span>{activity.time}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.page-container {
		padding: 1.5rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.page-header {
		background: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		border: 1px solid #e5e7eb;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.header-title h1 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
		margin: 0;
	}

	.header-subtitle {
		color: #6b7280;
		font-size: 0.875rem;
		margin: 0;
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
	}

	.tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		background: white;
		padding: 0.5rem;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
	}

	.tab {
		padding: 0.5rem 1rem;
		border: none;
		background: transparent;
		color: #6b7280;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tab:hover {
		background: #f3f4f6;
		color: #111827;
	}

	.tab.active {
		background: #06b6d4;
		color: white;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.stat-card {
		background: white;
		border-radius: 0.5rem;
		padding: 1.25rem;
		border: 1px solid #e5e7eb;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.stat-card.large {
		grid-column: span 2;
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.stat-content {
		flex: 1;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0 0 0.25rem 0;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
		margin: 0;
	}

	.storage-bar {
		height: 8px;
		background: #e5e7eb;
		border-radius: 4px;
		margin: 1rem 0 0.5rem 0;
		overflow: hidden;
	}

	.storage-used {
		height: 100%;
		background: linear-gradient(to right, #06b6d4, #0891b2);
		border-radius: 4px;
	}

	.storage-info {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
	}

	.storage-info .used {
		color: #06b6d4;
	}

	.storage-info .available {
		color: #6b7280;
	}

	.quick-actions {
		background: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		border: 1px solid #e5e7eb;
		margin-bottom: 1.5rem;
	}

	.quick-actions h3 {
		margin: 0 0 1rem 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 1rem;
	}

	.action-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1.5rem 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		background: white;
		cursor: pointer;
		transition: all 0.2s;
	}

	.action-card:hover {
		background: #f9fafb;
		border-color: #06b6d4;
	}

	.action-card span {
		font-size: 0.875rem;
		color: #374151;
	}

	.providers-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.provider-card {
		background: white;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
		overflow: hidden;
	}

	.provider-card.add-provider {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		text-align: center;
		border-style: dashed;
	}

	.add-provider h3 {
		margin: 1rem 0 0.5rem 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
	}

	.add-provider p {
		margin: 0 0 1rem 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.provider-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid #f3f4f6;
	}

	.provider-icon {
		font-size: 2rem;
	}

	.provider-body {
		padding: 1.25rem;
	}

	.provider-name {
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}

	.provider-stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin: 1rem 0;
	}

	.provider-stats .stat {
		display: flex;
		flex-direction: column;
	}

	.provider-stats .label {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.provider-stats .value {
		font-size: 0.875rem;
		font-weight: 500;
		color: #111827;
	}

	.provider-cost {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: #f9fafb;
		border-radius: 0.375rem;
		margin-top: 1rem;
	}

	.cost-label {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.cost-value {
		font-size: 1.125rem;
		font-weight: 600;
		color: #059669;
	}

	.provider-footer {
		display: flex;
		gap: 0.5rem;
		padding: 1rem 1.25rem;
		border-top: 1px solid #f3f4f6;
		background: #f9fafb;
	}

	.activity-card {
		background: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		border: 1px solid #e5e7eb;
	}

	.activity-card h3 {
		margin: 0 0 1rem 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
	}

	.activity-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.activity-item {
		display: flex;
		gap: 1rem;
		padding: 0.75rem;
		border-radius: 0.375rem;
		transition: background 0.2s;
	}

	.activity-item:hover {
		background: #f9fafb;
	}

	.activity-icon {
		width: 32px;
		height: 32px;
		border-radius: 0.375rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f3f4f6;
	}

	.activity-details {
		flex: 1;
	}

	.activity-description {
		font-size: 0.875rem;
		color: #374151;
		margin: 0 0 0.25rem 0;
	}

	.file-name {
		color: #06b6d4;
		font-weight: 500;
	}

	.activity-meta {
		display: flex;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: #6b7280;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #06b6d4;
		color: white;
	}

	.btn-primary:hover {
		background: #0891b2;
	}

	.btn-secondary {
		background: white;
		color: #374151;
		border: 1px solid #e5e7eb;
	}

	.btn-secondary:hover {
		background: #f9fafb;
	}

	.btn-sm {
		padding: 0.375rem 0.75rem;
		font-size: 0.813rem;
	}

	.btn-icon-sm {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		background: transparent;
		cursor: pointer;
		border-radius: 0.375rem;
		color: #6b7280;
	}

	.btn-icon-sm:hover {
		background: #f3f4f6;
		color: #111827;
	}

	@media (max-width: 768px) {
		.stat-card.large {
			grid-column: span 1;
		}
		
		.providers-grid {
			grid-template-columns: 1fr;
		}
	}

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}

	.modal {
		background: white;
		border-radius: 0.5rem;
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	.form-group input,
	.form-group select {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: #06b6d4;
		box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
	}

	.form-help {
		font-size: 0.75rem;
		color: #6b7280;
		margin-top: 0.25rem;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}
</style>

<!-- Add Provider Modal -->
{#if showConfigModal}
	<div class="modal-overlay" on:click={() => showConfigModal = false}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Add Storage Provider</h2>
				<button class="btn-icon-sm" on:click={() => showConfigModal = false}>
					<MoreVertical size={20} />
				</button>
			</div>
			<div class="modal-body">
				<div class="form-group">
					<label for="provider-name">Provider Name</label>
					<input type="text" id="provider-name" bind:value={newProvider.name} placeholder="My S3 Bucket" />
				</div>
				<div class="form-group">
					<label for="provider-type">Provider Type</label>
					<select id="provider-type" bind:value={newProvider.type}>
						<option value="s3">Amazon S3</option>
						<option value="gcs">Google Cloud Storage</option>
						<option value="azure">Azure Blob Storage</option>
						<option value="local">Local Storage</option>
					</select>
				</div>
				{#if newProvider.type !== 'local'}
					<div class="form-group">
						<label for="endpoint">Endpoint</label>
						<input type="text" id="endpoint" bind:value={newProvider.endpoint} placeholder="s3.amazonaws.com" />
						<div class="form-help">Leave empty for default provider endpoint</div>
					</div>
					<div class="form-group">
						<label for="region">Region</label>
						<input type="text" id="region" bind:value={newProvider.region} placeholder="us-east-1" />
					</div>
					<div class="form-group">
						<label for="access-key">Access Key</label>
						<input type="text" id="access-key" bind:value={newProvider.accessKey} placeholder="AKIA..." />
					</div>
					<div class="form-group">
						<label for="secret-key">Secret Key</label>
						<input type="password" id="secret-key" bind:value={newProvider.secretKey} placeholder="Enter secret key" />
					</div>
				{/if}
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={() => showConfigModal = false}>Cancel</button>
				<button class="btn btn-primary" on:click={addProvider}>Add Provider</button>
			</div>
		</div>
	</div>
{/if}
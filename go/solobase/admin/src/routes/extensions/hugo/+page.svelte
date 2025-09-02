<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		Globe, Plus, Play, Pause, Settings, ExternalLink,
		GitBranch, Clock, HardDrive, Zap, MoreVertical,
		RefreshCw, Eye, Edit, Trash2, AlertCircle, CheckCircle,
		Terminal, Download, Package
	} from 'lucide-svelte';
	import { api } from '$lib/api';
	import { requireAdmin } from '$lib/utils/auth';

	let sites: any[] = [];
	let loading = true;
	let selectedSite: any = null;
	let showCreateModal = false;
	let buildingStatus: { [key: string]: boolean } = {};
	let creatingExample = false;
	let showRequirements = true;
	
	// Form data for new site
	let newSite = {
		name: '',
		domain: '',
		theme: 'default'
	};

	// Stats
	let stats = {
		totalSites: 0,
		activeSites: 0,
		totalBuilds: 0,
		storageUsed: '0 MB'
	};

	onMount(async () => {
		if (!requireAdmin()) return;
		await loadSites();
		
		// Check if we should create an example site
		if (sites.length === 0 && !localStorage.getItem('hugo_example_created')) {
			await createExampleSite();
		}
		
		// Check if user has dismissed requirements
		if (localStorage.getItem('hugo_requirements_dismissed')) {
			showRequirements = false;
		}
	});

	async function loadSites() {
		try {
			loading = true;
			
			// Fetch sites from API
			const [sitesRes, statsRes] = await Promise.all([
				api.get('/ext/hugo/api/sites'),
				api.get('/ext/hugo/api/stats')
			]);
			
			sites = sitesRes || [];
			stats = statsRes || {
				totalSites: 0,
				activeSites: 0,
				totalBuilds: 0,
				storageUsed: '0 MB'
			};
		} catch (error) {
			console.error('Failed to load sites:', error);
			sites = [];
		} finally {
			loading = false;
		}
	}


	function getStatusColor(status: string) {
		switch (status) {
			case 'published': return 'bg-green-100 text-green-700';
			case 'building': return 'bg-yellow-100 text-yellow-700';
			case 'draft': return 'bg-gray-100 text-gray-700';
			case 'error': return 'bg-red-100 text-red-700';
			default: return 'bg-gray-100 text-gray-700';
		}
	}

	async function buildSite(siteId: string) {
		try {
			buildingStatus[siteId] = true;
			
			// Trigger build via API
			const result = await api.post(`/ext/hugo/api/sites/${siteId}/build`);
			
			if (result) {
				// Refresh sites to get updated status
				await loadSites();
			}
		} catch (error) {
			console.error('Failed to build site:', error);
		} finally {
			buildingStatus[siteId] = false;
		}
	}
	
	async function createSite() {
		try {
			const result = await api.post('/ext/hugo/api/sites', newSite);
			if (result) {
				// Reset form
				newSite = {
					name: '',
					domain: '',
					theme: 'default'
				};
				showCreateModal = false;
				// Reload sites
				await loadSites();
			}
		} catch (error) {
			console.error('Failed to create site:', error);
			alert('Failed to create site');
		}
	}
	
	async function deleteSite(id: string) {
		if (!confirm('Are you sure you want to delete this site? This action cannot be undone.')) return;
		
		try {
			await api.delete(`/ext/hugo/api/sites/${id}`);
			// Reload sites
			await loadSites();
		} catch (error) {
			console.error('Failed to delete site:', error);
			alert('Failed to delete site');
		}
	}
	
	async function createExampleSite() {
		try {
			creatingExample = true;
			
			// Create the example site
			const exampleSite = await api.post('/ext/hugo/api/sites', {
				name: 'Example Blog',
				domain: 'example-blog.local',
				theme: 'default',
				isExample: true
			});
			
			if (exampleSite && exampleSite.id) {
				// Build the example site
				await api.post(`/ext/hugo/api/sites/${exampleSite.id}/build`);
				
				// Mark as created
				localStorage.setItem('hugo_example_created', 'true');
				
				// Reload sites
				await loadSites();
			}
		} catch (error) {
			console.error('Failed to create example site:', error);
		} finally {
			creatingExample = false;
		}
	}
	
	function dismissRequirements() {
		showRequirements = false;
		localStorage.setItem('hugo_requirements_dismissed', 'true');
	}
	
	function viewSite(siteId: string) {
		// Get the backend URL - in dev it's on port 8080, in production it's the same origin
		const backendUrl = import.meta.env.DEV 
			? 'http://localhost:8080' 
			: window.location.origin;
		// Use new storage path structure
		window.open(`${backendUrl}/storage/ext/hugo/public/${siteId}/`, '_blank');
	}
	
	// Edit functionality
	let showEditModal = false;
	let editingSite: any = null;
	let fileTree: any[] = [];
	let selectedFile: any = null;
	let fileContent = '';
	let saving = false;
	let loadingFiles = false;
	let loadingContent = false;
	
	async function editSite(site: any) {
		editingSite = site;
		showEditModal = true;
		selectedFile = null;
		fileContent = '';
		await loadFileTree();
	}
	
	async function loadFileTree() {
		try {
			loadingFiles = true;
			const files = await api.get(`/ext/hugo/api/sites/${editingSite.id}/files`);
			fileTree = files || [];
		} catch (error) {
			console.error('Failed to load files:', error);
			fileTree = [];
		} finally {
			loadingFiles = false;
		}
	}
	
	async function selectFile(file: any) {
		if (file.type === 'directory') return;
		
		try {
			loadingContent = true;
			selectedFile = file;
			const response = await api.post(`/ext/hugo/api/sites/${editingSite.id}/files/read`, {
				path: file.path
			});
			fileContent = response.content || '';
		} catch (error) {
			console.error('Failed to load file:', error);
			alert('Failed to load file');
		} finally {
			loadingContent = false;
		}
	}
	
	async function saveFile() {
		if (!selectedFile) return;
		
		try {
			saving = true;
			await api.post(`/ext/hugo/api/sites/${editingSite.id}/files/save`, {
				path: selectedFile.path,
				content: fileContent
			});
			
			// Show success message
			const saveBtn = document.querySelector('.save-button');
			if (saveBtn) {
				saveBtn.textContent = 'Saved!';
				setTimeout(() => {
					saveBtn.textContent = 'Save';
				}, 2000);
			}
		} catch (error) {
			console.error('Failed to save file:', error);
			alert('Failed to save file');
		} finally {
			saving = false;
		}
	}
	
	function closeEditModal() {
		showEditModal = false;
		editingSite = null;
		selectedFile = null;
		fileContent = '';
	}
	
	// Helper to render file tree
	function renderFileTree(nodes: any[], level = 0) {
		return nodes;
	}
</script>

<div class="page-container">
	<!-- Installation Requirements Banner -->
	{#if showRequirements}
		<div class="requirements-banner">
			<div class="requirements-icon">
				<AlertCircle size={20} />
			</div>
			<div class="requirements-content">
				<h3>Installation Requirements</h3>
				<p>This extension requires Hugo to be installed on your system.</p>
				<div class="requirements-steps">
					<div class="requirement-item">
						<Package size={16} />
						<span><strong>Hugo Extended v0.110+</strong> - Static site generator</span>
					</div>
					<div class="install-commands">
						<div class="command-group">
							<label>macOS (Homebrew):</label>
							<code>brew install hugo</code>
						</div>
						<div class="command-group">
							<label>Ubuntu/Debian:</label>
							<code>sudo snap install hugo --channel=extended</code>
						</div>
						<div class="command-group">
							<label>Manual:</label>
							<code>Download from <a href="https://gohugo.io/installation/" target="_blank">gohugo.io</a></code>
						</div>
					</div>
				</div>
			</div>
			<button class="btn-close" on:click={dismissRequirements}>
				<MoreVertical size={16} />
			</button>
		</div>
	{/if}

	<!-- Header -->
	<div class="page-header">
		<div class="header-content">
			<div class="header-left">
				<div class="header-title">
					<Globe size={24} />
					<h1>Hugo Sites</h1>
				</div>
				<p class="header-subtitle">Manage your static sites powered by Hugo</p>
			</div>
			<div class="header-actions">
				<button class="btn btn-secondary">
					<Settings size={16} />
					Settings
				</button>
				<button class="btn btn-primary" on:click={() => showCreateModal = true}>
					<Plus size={16} />
					New Site
				</button>
			</div>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-icon bg-cyan-100">
				<Globe size={20} class="text-cyan-600" />
			</div>
			<div class="stat-content">
				<p class="stat-label">Total Sites</p>
				<p class="stat-value">{stats.totalSites}</p>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon bg-green-100">
				<Zap size={20} class="text-green-600" />
			</div>
			<div class="stat-content">
				<p class="stat-label">Published</p>
				<p class="stat-value">{stats.activeSites}</p>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon bg-purple-100">
				<GitBranch size={20} class="text-purple-600" />
			</div>
			<div class="stat-content">
				<p class="stat-label">Total Builds</p>
				<p class="stat-value">{stats.totalBuilds}</p>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon bg-orange-100">
				<HardDrive size={20} class="text-orange-600" />
			</div>
			<div class="stat-content">
				<p class="stat-label">Storage Used</p>
				<p class="stat-value">{stats.storageUsed}</p>
			</div>
		</div>
	</div>

	<!-- Sites Grid -->
	{#if loading || creatingExample}
		<div class="loading-container">
			<div class="loading loading-spinner loading-lg text-cyan-600"></div>
			{#if creatingExample}
				<p class="loading-text">Creating example site...</p>
			{/if}
		</div>
	{:else if sites.length === 0}
		<div class="empty-state-card">
			<Globe size={48} class="text-gray-400" />
			<h3>No sites yet</h3>
			<p>Create your first Hugo site to get started</p>
			<button class="btn btn-primary mt-4" on:click={() => showCreateModal = true}>
				<Plus size={16} />
				Create Site
			</button>
		</div>
	{:else}
		<div class="sites-grid">
			{#each sites as site}
				<div class="site-card">
					<div class="site-header">
						<div class="site-status">
							<span class="status-badge {getStatusColor(site.status)}">
								{site.status}
							</span>
							<button class="btn-icon-sm btn-icon-danger" on:click={() => deleteSite(site.id)} title="Delete">
								<Trash2 size={16} />
							</button>
						</div>
					</div>
					
					<div class="site-body">
						<h3 class="site-name">{site.name}</h3>
						<a href="https://{site.domain}" target="_blank" class="site-domain">
							{site.domain}
							<ExternalLink size={14} />
						</a>
						
						<div class="site-meta">
							<div class="meta-item">
								<Clock size={14} />
								<span>{site.lastBuild}</span>
							</div>
							<div class="meta-item">
								<HardDrive size={14} />
								<span>{site.size}</span>
							</div>
						</div>
						
						<div class="site-stats">
							<div class="stat">
								<span class="stat-value">{site.pages}</span>
								<span class="stat-label">Pages</span>
							</div>
							<div class="stat">
								<span class="stat-value">{site.visits}</span>
								<span class="stat-label">Visits</span>
							</div>
							<div class="stat">
								<span class="stat-value">{site.buildTime}</span>
								<span class="stat-label">Build Time</span>
							</div>
						</div>
					</div>
					
					<div class="site-footer">
						<button class="btn-action" title="Preview" on:click={() => viewSite(site.id)}>
							<Eye size={16} />
						</button>
						<button class="btn-action" title="Edit" on:click={() => editSite(site)}>
							<Edit size={16} />
						</button>
						<button 
							class="btn-action btn-build {buildingStatus[site.id] ? 'building' : ''}"
							on:click={() => buildSite(site.id)}
							disabled={buildingStatus[site.id]}
							title="Build & Deploy"
						>
							{#if buildingStatus[site.id]}
								<RefreshCw size={16} class="spin" />
							{:else}
								<Play size={16} />
							{/if}
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page-container {
		padding: 1.5rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.requirements-banner {
		background: var(--warning-bg, #FEF3C7);
		border: 1px solid var(--warning-border, #F59E0B);
		border-radius: 0.5rem;
		padding: 1rem;
		margin-bottom: 1.5rem;
		display: flex;
		gap: 1rem;
		align-items: start;
		position: relative;
	}

	.requirements-icon {
		color: var(--warning-color, #D97706);
		flex-shrink: 0;
	}

	.requirements-content {
		flex: 1;
	}

	.requirements-content h3 {
		margin: 0 0 0.5rem 0;
		color: var(--warning-dark, #92400E);
		font-size: 1rem;
		font-weight: 600;
	}

	.requirements-content p {
		margin: 0 0 1rem 0;
		color: var(--warning-text, #78350F);
		font-size: 0.9rem;
	}

	.requirements-steps {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.requirement-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--warning-text, #78350F);
		font-size: 0.875rem;
	}

	.install-commands {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.command-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.command-group label {
		font-size: 0.75rem;
		color: var(--warning-text, #78350F);
		font-weight: 500;
	}

	.command-group code {
		background: var(--bg-primary, white);
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-family: monospace;
		font-size: 0.75rem;
		color: var(--text-primary);
		border: 1px solid var(--border-color);
	}

	.dismiss-button {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: none;
		border: none;
		color: var(--warning-text, #78350F);
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.25rem;
		transition: background 0.2s;
	}

	.dismiss-button:hover {
		background: var(--warning-hover, rgba(217, 119, 6, 0.1));
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.header-title h1 {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.btn-primary {
		background: var(--primary);
		color: white;
		border: none;
		padding: 0.625rem 1.25rem;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: opacity 0.2s;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--text-secondary);
		margin-bottom: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.sites-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.site-card {
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 1rem;
		transition: box-shadow 0.2s;
	}

	.site-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.site-header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		margin-bottom: 0.75rem;
	}

	.site-title {
		flex: 1;
	}

	.site-title h3 {
		margin: 0 0 0.25rem 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.site-domain {
		font-size: 0.875rem;
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.status-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.site-stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.site-stat {
		display: flex;
		flex-direction: column;
	}

	.site-stat-label {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.site-stat-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.site-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border-color);
		margin-bottom: 0.75rem;
	}

	.info-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.site-footer {
		display: flex;
		gap: 0.5rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border-color);
	}

	.btn-action {
		background: transparent;
		border: 1px solid var(--border-color);
		padding: 0.5rem;
		border-radius: 0.375rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		color: var(--text-secondary);
	}

	.btn-action:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
	}

	.btn-build {
		flex: 1;
		gap: 0.375rem;
	}

	.btn-build.building {
		background: var(--primary);
		color: white;
		border-color: var(--primary);
	}

	.btn-danger {
		color: var(--danger);
	}

	.btn-danger:hover {
		background: var(--danger);
		color: white;
		border-color: var(--danger);
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: var(--text-secondary);
	}

	.empty-state h2 {
		margin: 1rem 0 0.5rem 0;
		font-size: 1.25rem;
		color: var(--text-primary);
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: var(--bg-primary);
		border-radius: 0.5rem;
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	.modal-header {
		padding: 1.5rem;
		border-bottom: 1px solid var(--border-color);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: var(--text-secondary);
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary);
	}

	.form-group input,
	.form-group select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid var(--border-color);
		border-radius: 0.375rem;
		font-size: 0.875rem;
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.modal-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--border-color);
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary {
		background: transparent;
		color: var(--text-primary);
		border: 1px solid var(--border-color);
	}

	.btn-secondary:hover {
		background: var(--bg-hover);
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		color: var(--text-secondary);
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.building :global(svg) {
		animation: spin 1s linear infinite;
	}

	.edit-modal {
		width: 90%;
		max-width: 1200px;
		height: 80vh;
		max-height: 800px;
	}
	
	.editor-container {
		display: flex;
		gap: 1rem;
		height: calc(100% - 60px);
	}
	
	.file-explorer {
		width: 250px;
		border-right: 1px solid var(--border-color);
		padding-right: 1rem;
		overflow-y: auto;
	}
	
	.file-explorer h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 0.9rem;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	
	.file-tree {
		font-size: 0.9rem;
	}
	
	.file-node {
		margin-bottom: 0.25rem;
	}
	
	.file-node details {
		cursor: pointer;
	}
	
	.file-node summary {
		list-style: none;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		user-select: none;
	}
	
	.file-node summary:hover {
		background: var(--bg-hover);
	}
	
	.file-node summary::-webkit-details-marker {
		display: none;
	}
	
	.folder-children {
		margin-left: 1rem;
		margin-top: 0.25rem;
	}
	
	.file-node-item {
		display: block;
		width: 100%;
		text-align: left;
		padding: 0.25rem 0.5rem;
		border: none;
		background: none;
		cursor: pointer;
		border-radius: 4px;
		font-size: 0.85rem;
		color: var(--text-primary);
	}
	
	.file-node-item:hover {
		background: var(--bg-hover);
	}
	
	.file-node-item.selected {
		background: var(--primary);
		color: white;
	}
	
	.file-editor {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	
	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: var(--bg-secondary);
		border-radius: 4px;
		margin-bottom: 1rem;
	}
	
	.file-path {
		font-family: monospace;
		font-size: 0.9rem;
		color: var(--text-secondary);
	}
	
	.code-editor {
		flex: 1;
		width: 100%;
		padding: 1rem;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		font-family: 'Courier New', monospace;
		font-size: 0.9rem;
		line-height: 1.5;
		background: var(--bg-primary);
		color: var(--text-primary);
		resize: none;
		overflow: auto;
	}
	
	.code-editor:focus {
		outline: none;
		border-color: var(--primary);
	}
	
	.no-file-selected {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--text-secondary);
		font-style: italic;
	}
	
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		color: var(--text-secondary);
	}
	
	.save-button {
		padding: 0.25rem 1rem;
	}
	
	.btn-sm {
		font-size: 0.875rem;
	}
</style>
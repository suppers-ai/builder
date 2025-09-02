<script lang="ts">
	import '../../../app.css';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { 
		Building, Package, Plus, Search, Filter,
		ChevronRight, ArrowLeft, Edit2, Trash2,
		Settings, TrendingUp, DollarSign, X
	} from 'lucide-svelte';
	import { api } from '$lib/api';
	import { authStore } from '$lib/stores/auth';
	
	let loading = true;
	let entities: any[] = [];
	let entityTypes: any[] = [];
	let searchQuery = '';
	let selectedType = 'all';
	let showCreateModal = false;
	let showEditModal = false;
	let selectedEntity: any = null;
	
	// New entity form
	let newEntity = {
		name: '',
		entity_type_id: '',
		description: '',
		metadata: {}
	};
	
	// Stats
	let stats = {
		totalEntities: 0,
		totalProducts: 0,
		totalRevenue: 0
	};
	
	$: filteredEntities = entities.filter(entity => {
		const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			entity.description?.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesType = selectedType === 'all' || entity.entity_type_id === selectedType;
		return matchesSearch && matchesType;
	});
	
	// Check if user is admin
	$: isAdmin = $authStore.user?.role === 'admin';
	
	onMount(async () => {
		if (!$authStore.user) {
			goto('/login');
			return;
		}
		await loadData();
	});
	
	async function loadData() {
		try {
			loading = true;
			
			// Load entity types
			try {
				const typesRes = await api.get('/products/entity-types');
				entityTypes = Array.isArray(typesRes) ? typesRes : [];
			} catch (err) {
				console.error('Failed to load entity types:', err);
				entityTypes = [];
			}
			
			// Load user's entities
			try {
				const entitiesRes = await api.get('/products/entities');
				entities = Array.isArray(entitiesRes) ? entitiesRes : [];
			} catch (err) {
				console.error('Failed to load entities:', err);
				entities = [];
			}
			
			// Calculate stats
			stats.totalEntities = entities.length;
			stats.totalProducts = entities.reduce((sum, e) => sum + (e.product_count || 0), 0);
			stats.totalRevenue = entities.reduce((sum, e) => sum + (e.total_revenue || 0), 0);
			
		} catch (error) {
			console.error('Failed to load data:', error);
		} finally {
			loading = false;
		}
	}
	
	async function createEntity() {
		try {
			const entity = await api.post('/products/entities', {
				...newEntity,
				user_id: $authStore.user.id
			});
			entities = [...entities, entity];
			showCreateModal = false;
			newEntity = {
				name: '',
				entity_type_id: '',
				description: '',
				metadata: {}
			};
		} catch (error) {
			console.error('Failed to create entity:', error);
			alert('Failed to create entity');
		}
	}
	
	async function updateEntity() {
		if (!selectedEntity) return;
		
		try {
			const updated = await api.put(`/products/entities/${selectedEntity.id}`, selectedEntity);
			entities = entities.map(e => e.id === updated.id ? updated : e);
			showEditModal = false;
			selectedEntity = null;
		} catch (error) {
			console.error('Failed to update entity:', error);
			alert('Failed to update entity');
		}
	}
	
	async function deleteEntity(id: string) {
		if (!confirm('Are you sure you want to delete this entity? All associated products will also be deleted.')) {
			return;
		}
		
		try {
			await api.delete(`/products/entities/${id}`);
			entities = entities.filter(e => e.id !== id);
		} catch (error) {
			console.error('Failed to delete entity:', error);
			alert('Failed to delete entity');
		}
	}
	
	function editEntity(entity: any) {
		selectedEntity = { ...entity };
		showEditModal = true;
	}
	
	function getEntityTypeName(typeId: string): string {
		const type = entityTypes.find(t => t.id === typeId);
		return type?.name || 'Unknown';
	}
	
	function navigateToProducts(entityId: string) {
		goto(`/profile/entities/${entityId}/products`);
	}
</script>

<svelte:head>
	<title>Products - Solobase</title>
</svelte:head>

<div class="products-page">
	<!-- Back Button -->
	<a href="/profile" class="back-button">
		<ArrowLeft size={20} />
		<span>Back to Profile</span>
	</a>
	
	<div class="products-container">
		{#if !isAdmin}
			<div class="notice-banner">
				<div class="notice-content">
					<strong>Notice:</strong> Product creation is currently limited to administrators.
					You can view existing entities and products, but cannot create new ones at this time.
				</div>
			</div>
		{/if}
		
		<div class="products-card">
			<!-- Header -->
			<div class="card-header">
				<div class="header-content">
					<div class="header-info">
						<div class="header-title">
							<Building size={24} />
							<h1>My Entities & Products</h1>
						</div>
						<p class="header-subtitle">
							{#if isAdmin}
								Manage your business entities and their products
							{:else}
								View your business entities and products
							{/if}
						</p>
					</div>
					{#if isAdmin}
						<button class="btn btn-primary" on:click={() => showCreateModal = true}>
							<Plus size={16} />
							New Entity
						</button>
					{/if}
				</div>
			</div>
	
	<!-- Stats Cards -->
	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-icon bg-blue-100">
				<Building size={20} class="text-blue-600" />
			</div>
			<div class="stat-content">
				<p class="stat-label">Total Entities</p>
				<p class="stat-value">{stats.totalEntities}</p>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon bg-green-100">
				<Package size={20} class="text-green-600" />
			</div>
			<div class="stat-content">
				<p class="stat-label">Total Products</p>
				<p class="stat-value">{stats.totalProducts}</p>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-icon bg-purple-100">
				<DollarSign size={20} class="text-purple-600" />
			</div>
			<div class="stat-content">
				<p class="stat-label">Total Revenue</p>
				<p class="stat-value">${stats.totalRevenue.toFixed(2)}</p>
			</div>
		</div>
	</div>
	
	<!-- Filters -->
	<div class="filters-bar">
		<div class="search-box">
			<Search size={16} />
			<input 
				type="text" 
				placeholder="Search entities..."
				bind:value={searchQuery}
			/>
		</div>
		<select class="filter-select" bind:value={selectedType}>
			<option value="all">All Types</option>
			{#each entityTypes as type}
				<option value={type.id}>{type.name}</option>
			{/each}
		</select>
	</div>
	
	<!-- Entities Grid -->
	{#if loading}
		<div class="loading-container">
			<div class="loading loading-spinner loading-lg"></div>
		</div>
	{:else if filteredEntities.length === 0}
		<div class="empty-state">
			<Building size={48} class="text-gray-400" />
			<h3>No entities found</h3>
			{#if isAdmin}
				<p>Create your first entity to start managing products</p>
				<button class="btn btn-primary mt-4" on:click={() => showCreateModal = true}>
					<Plus size={16} />
					Create Entity
				</button>
			{:else}
				<p>Product creation is currently restricted to administrators only.</p>
				<p class="text-sm text-gray-500 mt-2">Please contact an administrator if you need to create products.</p>
			{/if}
		</div>
	{:else}
		<div class="entities-grid">
			{#each filteredEntities as entity}
				<div class="entity-card" on:click={() => navigateToProducts(entity.id)}>
					<div class="entity-header">
						<div class="entity-icon">
							<Building size={24} />
						</div>
						<div class="entity-actions">
							<button 
								class="btn-icon" 
								on:click|stopPropagation={() => editEntity(entity)}
								title="Edit"
							>
								<Edit2 size={16} />
							</button>
							<button 
								class="btn-icon btn-icon-danger" 
								on:click|stopPropagation={() => deleteEntity(entity.id)}
								title="Delete"
							>
								<Trash2 size={16} />
							</button>
						</div>
					</div>
					
					<h3 class="entity-name">{entity.name}</h3>
					<p class="entity-type">{getEntityTypeName(entity.entity_type_id)}</p>
					
					{#if entity.description}
						<p class="entity-description">{entity.description}</p>
					{/if}
					
					<div class="entity-stats">
						<div class="entity-stat">
							<Package size={14} />
							<span>{entity.product_count || 0} products</span>
						</div>
						<div class="entity-stat">
							<TrendingUp size={14} />
							<span>${entity.total_revenue || 0}</span>
						</div>
					</div>
					
					<button class="entity-link">
						View Products
						<ChevronRight size={16} />
					</button>
				</div>
			{/each}
		</div>
	{/if}
		</div>
	</div>
</div>

<!-- Create Entity Modal -->
{#if showCreateModal}
	<div class="modal-overlay" on:click={() => showCreateModal = false}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Create New Entity</h2>
				<button class="btn-icon" on:click={() => showCreateModal = false}>
					<X size={20} />
				</button>
			</div>
			<div class="modal-body">
				<div class="form-group">
					<label for="name">Entity Name</label>
					<input 
						type="text" 
						id="name" 
						bind:value={newEntity.name} 
						placeholder="e.g., My Restaurant, Main Store"
					/>
				</div>
				
				<div class="form-group">
					<label for="type">Entity Type</label>
					<select id="type" bind:value={newEntity.entity_type_id}>
						<option value="">Select a type</option>
						{#each entityTypes as type}
							<option value={type.id}>{type.name}</option>
						{/each}
					</select>
				</div>
				
				<div class="form-group">
					<label for="description">Description</label>
					<textarea 
						id="description" 
						bind:value={newEntity.description} 
						rows="3"
						placeholder="Brief description of this entity"
					></textarea>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={() => showCreateModal = false}>
					Cancel
				</button>
				<button 
					class="btn btn-primary" 
					on:click={createEntity}
					disabled={!newEntity.name || !newEntity.entity_type_id}
				>
					Create Entity
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Edit Entity Modal -->
{#if showEditModal && selectedEntity}
	<div class="modal-overlay" on:click={() => showEditModal = false}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Edit Entity</h2>
				<button class="btn-icon" on:click={() => showEditModal = false}>
					<X size={20} />
				</button>
			</div>
			<div class="modal-body">
				<div class="form-group">
					<label for="edit-name">Entity Name</label>
					<input 
						type="text" 
						id="edit-name" 
						bind:value={selectedEntity.name}
					/>
				</div>
				
				<div class="form-group">
					<label for="edit-type">Entity Type</label>
					<select id="edit-type" bind:value={selectedEntity.entity_type_id}>
						{#each entityTypes as type}
							<option value={type.id}>{type.name}</option>
						{/each}
					</select>
				</div>
				
				<div class="form-group">
					<label for="edit-description">Description</label>
					<textarea 
						id="edit-description" 
						bind:value={selectedEntity.description} 
						rows="3"
					></textarea>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={() => showEditModal = false}>
					Cancel
				</button>
				<button class="btn btn-primary" on:click={updateEntity}>
					Update Entity
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.products-page {
		min-height: 100vh;
		background: #f0f0f0;
		padding: 1rem;
		position: relative;
	}

	.back-button {
		position: absolute;
		top: 1rem;
		left: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		color: #374151;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		z-index: 10;
		text-decoration: none;
	}

	.back-button:hover {
		background: #f9fafb;
		border-color: #189AB4;
		transform: translateX(-2px);
	}

	.products-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 4rem 1rem 2rem;
		gap: 1rem;
	}
	
	.notice-banner {
		width: 100%;
		max-width: 1200px;
		background: #fef3c7;
		border: 1px solid #fbbf24;
		border-radius: 0.5rem;
		padding: 1rem;
		margin-bottom: 0.5rem;
	}
	
	.notice-content {
		color: #92400e;
		font-size: 0.875rem;
		line-height: 1.5;
	}
	
	.notice-content strong {
		font-weight: 600;
	}

	.products-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		width: 100%;
		max-width: 1200px;
		overflow: hidden;
		animation: slideUp 0.4s ease-out;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.card-header {
		padding: 2rem;
		border-bottom: 1px solid #e5e7eb;
		background: linear-gradient(to bottom, #fafafa, #ffffff);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.header-info {
		flex: 1;
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

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		padding: 1.5rem 2rem;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
	}

	.stat-card {
		background: white;
		border-radius: 0.5rem;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
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

	.filters-bar {
		display: flex;
		gap: 1rem;
		padding: 1.5rem 2rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.search-box {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		background: white;
		flex: 1;
		max-width: 400px;
	}

	.search-box input {
		border: none;
		outline: none;
		flex: 1;
		font-size: 0.875rem;
	}

	.filter-select {
		padding: 0.5rem 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		background: white;
	}

	.entities-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
		padding: 2rem;
	}

	.entity-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1.5rem;
		cursor: pointer;
		transition: all 0.3s;
		display: flex;
		flex-direction: column;
	}

	.entity-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		border-color: #06b6d4;
	}

	.entity-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.entity-icon {
		width: 48px;
		height: 48px;
		background: #f0f9ff;
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #06b6d4;
	}

	.entity-actions {
		display: flex;
		gap: 0.5rem;
	}

	.entity-name {
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.25rem 0;
	}

	.entity-type {
		font-size: 0.875rem;
		color: #06b6d4;
		margin: 0 0 0.75rem 0;
	}

	.entity-description {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0 0 1rem 0;
		line-height: 1.5;
		flex: 1;
	}

	.entity-stats {
		display: flex;
		gap: 1rem;
		padding: 0.75rem 0;
		border-top: 1px solid #f3f4f6;
		border-bottom: 1px solid #f3f4f6;
		margin-bottom: 1rem;
	}

	.entity-stat {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.813rem;
		color: #6b7280;
	}

	.entity-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.5rem 0.75rem;
		background: #f0f9ff;
		border: 1px solid #bae6fd;
		border-radius: 0.375rem;
		color: #06b6d4;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.entity-link:hover {
		background: #e0f2fe;
		border-color: #06b6d4;
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

	.btn-primary:hover:not(:disabled) {
		background: #0891b2;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: white;
		color: #374151;
		border: 1px solid #e5e7eb;
	}

	.btn-secondary:hover {
		background: #f9fafb;
	}

	.btn-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		background: white;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-icon:hover {
		background: #f9fafb;
	}

	.btn-icon-danger {
		color: #ef4444;
	}

	.btn-icon-danger:hover {
		background: #fee2e2;
		border-color: #ef4444;
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 6rem 2rem;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 6rem 2rem;
		text-align: center;
	}

	.empty-state h3 {
		margin: 1rem 0 0.5rem 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
	}

	.empty-state p {
		margin: 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	/* Modal Styles */
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

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid #e5e7eb;
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
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #06b6d4;
		box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
	}

	/* Utility classes */
	.bg-blue-100 { background: #dbeafe; }
	.text-blue-600 { color: #2563eb; }
	.bg-green-100 { background: #d1fae5; }
	.text-green-600 { color: #059669; }
	.bg-purple-100 { background: #ede9fe; }
	.text-purple-600 { color: #9333ea; }

	@media (max-width: 768px) {
		.products-container {
			padding: 3rem 0.5rem 1rem;
		}
		
		.entities-grid {
			grid-template-columns: 1fr;
			padding: 1rem;
		}
		
		.stats-grid {
			grid-template-columns: 1fr;
			padding: 1rem;
		}
		
		.filters-bar {
			flex-direction: column;
			padding: 1rem;
		}
		
		.search-box {
			max-width: 100%;
		}
		
		.card-header {
			padding: 1.5rem 1rem;
		}
		
		.header-content {
			flex-direction: column;
			align-items: stretch;
		}
		
		.btn-primary {
			width: 100%;
			justify-content: center;
		}
	}
</style>
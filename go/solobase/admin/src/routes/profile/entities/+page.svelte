<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		Building2, Plus, Edit2, Trash2, Search, Settings,
		Users, Store, Briefcase, Home, Globe, MapPin,
		Phone, Mail, Calendar, MoreVertical, ExternalLink
	} from 'lucide-svelte';
	import { api } from '$lib/api';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	interface Entity {
		id: string;
		entity_type_id: string;
		user_id: string;
		name: string;
		display_name: string;
		description?: string;
		settings?: any;
		metadata?: any;
		is_active: boolean;
		created_at: string;
		updated_at: string;
		// Joined data
		entity_type?: any;
		products_count?: number;
	}

	let entities: Entity[] = [];
	let entityTypes: any[] = [];
	let loading = true;
	let searchQuery = '';
	let selectedType = 'all';
	let showCreateModal = false;
	let showEditModal = false;
	let selectedEntity: Entity | null = null;
	
	// Form data for new entity
	let newEntity: Partial<Entity> = {
		name: '',
		display_name: '',
		description: '',
		entity_type_id: '',
		is_active: true,
		metadata: {}
	};

	// Dynamic fields based on entity type
	let dynamicFields: any = {};

	$: filteredEntities = entities.filter(entity => {
		const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			entity.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			entity.description?.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesType = selectedType === 'all' || entity.entity_type_id === selectedType;
		return matchesSearch && matchesType;
	});

	onMount(async () => {
		// Check if user is logged in
		const currentUser = $authStore.user;
		if (!currentUser) {
			goto('/login');
			return;
		}
		await loadData();
	});

	async function loadData() {
		try {
			loading = true;
			// Load entity types first
			const typesRes = await api.get('/products/entity-types');
			entityTypes = typesRes || [];
			
			// Load user's entities
			const entitiesRes = await api.get('/user/entities');
			entities = entitiesRes || [];
		} catch (error) {
			console.error('Failed to load data:', error);
			entities = [];
			entityTypes = [];
		} finally {
			loading = false;
		}
	}

	function getEntityTypeInfo(typeId: string) {
		return entityTypes.find(t => t.id === typeId);
	}

	function getIconForType(type: any) {
		if (!type) return Building2;
		switch (type.icon) {
			case 'store': return Store;
			case 'users': return Users;
			case 'briefcase': return Briefcase;
			case 'home': return Home;
			case 'globe': return Globe;
			default: return Building2;
		}
	}

	function onEntityTypeChange() {
		const selectedType = entityTypes.find(t => t.id === newEntity.entity_type_id);
		if (selectedType && selectedType.fields_schema) {
			// Initialize dynamic fields based on schema
			dynamicFields = {};
			Object.entries(selectedType.fields_schema).forEach(([key, field]: [string, any]) => {
				dynamicFields[key] = field.default || '';
			});
		} else {
			dynamicFields = {};
		}
	}
	
	async function createEntity() {
		try {
			// Add dynamic fields to metadata
			if (Object.keys(dynamicFields).length > 0) {
				newEntity.metadata = { ...newEntity.metadata, ...dynamicFields };
			}
			
			const result = await api.post('/user/entities', newEntity);
			if (result) {
				// Reset form
				newEntity = {
					name: '',
					display_name: '',
					description: '',
					entity_type_id: '',
					is_active: true,
					metadata: {}
				};
				dynamicFields = {};
				showCreateModal = false;
				// Reload entities
				await loadData();
			}
		} catch (error) {
			console.error('Failed to create entity:', error);
			alert('Failed to create entity');
		}
	}
	
	async function editEntity(entity: Entity) {
		selectedEntity = { ...entity };
		// Load dynamic fields if entity type has schema
		const entityType = getEntityTypeInfo(entity.entity_type_id);
		if (entityType && entityType.fields_schema) {
			dynamicFields = {};
			Object.entries(entityType.fields_schema).forEach(([key, field]: [string, any]) => {
				dynamicFields[key] = entity.metadata?.[key] || field.default || '';
			});
		}
		showEditModal = true;
	}
	
	async function updateEntity() {
		if (!selectedEntity) return;
		
		try {
			// Add dynamic fields to metadata
			if (Object.keys(dynamicFields).length > 0) {
				selectedEntity.metadata = { ...selectedEntity.metadata, ...dynamicFields };
			}
			
			const result = await api.put(`/user/entities/${selectedEntity.id}`, selectedEntity);
			if (result) {
				showEditModal = false;
				selectedEntity = null;
				dynamicFields = {};
				// Reload entities
				await loadData();
			}
		} catch (error) {
			console.error('Failed to update entity:', error);
			alert('Failed to update entity');
		}
	}
	
	async function deleteEntity(id: string) {
		if (!confirm('Are you sure you want to delete this entity? All associated products will also be deleted.')) return;
		
		try {
			await api.delete(`/user/entities/${id}`);
			// Reload entities
			await loadData();
		} catch (error) {
			console.error('Failed to delete entity:', error);
			alert('Failed to delete entity');
		}
	}

	function navigateToProducts(entity: Entity) {
		goto(`/profile/entities/${entity.id}/products`);
	}
</script>

<div class="page-container">
	<!-- Header -->
	<div class="page-header">
		<div class="header-content">
			<div class="header-left">
				<div class="header-title">
					<Building2 size={24} />
					<h1>My Entities</h1>
				</div>
				<p class="header-subtitle">Manage your business entities and organizations</p>
			</div>
			<div class="header-actions">
				<button class="btn btn-primary" on:click={() => showCreateModal = true}>
					<Plus size={16} />
					New Entity
				</button>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="content-card">
		<!-- Toolbar -->
		<div class="toolbar">
			<div class="toolbar-left">
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
						<option value={type.id}>{type.display_name}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Entities Grid -->
		{#if loading}
			<div class="loading-container">
				<div class="loading loading-spinner loading-lg text-cyan-600"></div>
			</div>
		{:else if filteredEntities.length === 0}
			<div class="empty-state">
				<Building2 size={48} class="text-gray-400" />
				<h3>No entities found</h3>
				<p>Create your first entity to start managing products</p>
				<button class="btn btn-primary mt-4" on:click={() => showCreateModal = true}>
					<Plus size={16} />
					Create Entity
				</button>
			</div>
		{:else}
			<div class="entities-grid">
				{#each filteredEntities as entity}
					{@const entityType = getEntityTypeInfo(entity.entity_type_id)}
					<div class="entity-card">
						<div class="entity-header">
							<div class="entity-icon">
								<svelte:component this={getIconForType(entityType)} size={24} />
							</div>
							<div class="entity-actions">
								<button class="btn-icon" on:click={() => navigateToProducts(entity)} title="Products">
									<ExternalLink size={16} />
								</button>
								<button class="btn-icon" on:click={() => editEntity(entity)} title="Edit">
									<Edit2 size={16} />
								</button>
								<button class="btn-icon btn-icon-danger" on:click={() => deleteEntity(entity.id)} title="Delete">
									<Trash2 size={16} />
								</button>
							</div>
						</div>
						<div class="entity-body">
							<h3 class="entity-name">{entity.display_name}</h3>
							<p class="entity-type">{entityType?.display_name || 'Unknown Type'}</p>
							{#if entity.description}
								<p class="entity-description">{entity.description}</p>
							{/if}
							
							{#if entity.metadata && Object.keys(entity.metadata).length > 0}
								<div class="entity-metadata">
									{#if entity.metadata.address}
										<div class="metadata-item">
											<MapPin size={14} />
											{entity.metadata.address}
										</div>
									{/if}
									{#if entity.metadata.phone}
										<div class="metadata-item">
											<Phone size={14} />
											{entity.metadata.phone}
										</div>
									{/if}
									{#if entity.metadata.email}
										<div class="metadata-item">
											<Mail size={14} />
											{entity.metadata.email}
										</div>
									{/if}
								</div>
							{/if}
							
							<div class="entity-footer">
								<div class="entity-stats">
									<span class="stat-item">
										{entity.products_count || 0} products
									</span>
									<span class="status-badge {entity.is_active ? 'status-active' : 'status-inactive'}">
										{entity.is_active ? 'Active' : 'Inactive'}
									</span>
								</div>
								<button class="btn-link" on:click={() => navigateToProducts(entity)}>
									View Products →
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
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

	.content-card {
		background: white;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
		overflow: hidden;
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		gap: 1rem;
	}

	.toolbar-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
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
		max-width: 320px;
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
		border-color: #fca5a5;
	}

	.btn-link {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		background: none;
		border: none;
		color: #06b6d4;
		font-size: 0.875rem;
		cursor: pointer;
		padding: 0;
	}

	.btn-link:hover {
		color: #0891b2;
	}

	.entities-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
		gap: 1.5rem;
		padding: 1.5rem;
	}

	.entity-card {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		overflow: hidden;
		transition: all 0.2s;
	}

	.entity-card:hover {
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.entity-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
	}

	.entity-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		color: #06b6d4;
	}

	.entity-actions {
		display: flex;
		gap: 0.5rem;
	}

	.entity-body {
		padding: 1rem;
	}

	.entity-name {
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.25rem 0;
	}

	.entity-type {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0 0 0.75rem 0;
	}

	.entity-description {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0 0 1rem 0;
	}

	.entity-metadata {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.metadata-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.entity-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px solid #f3f4f6;
	}

	.entity-stats {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.stat-item {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.status-active {
		background: #d1fae5;
		color: #065f46;
	}

	.status-inactive {
		background: #fee2e2;
		color: #991b1b;
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 4rem;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem;
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
		max-width: 600px;
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

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}

	.dynamic-fields {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		padding: 1rem;
		margin-top: 1rem;
	}

	.dynamic-fields h4 {
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 1rem 0;
	}
</style>

<!-- Create Entity Modal -->
{#if showCreateModal}
	<div class="modal-overlay" on:click={() => showCreateModal = false}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Create New Entity</h2>
				<button class="btn-icon" on:click={() => showCreateModal = false}>
					×
				</button>
			</div>
			<div class="modal-body">
				<div class="form-group">
					<label for="entity_type">Entity Type</label>
					<select id="entity_type" bind:value={newEntity.entity_type_id} on:change={onEntityTypeChange}>
						<option value="">Select Entity Type</option>
						{#each entityTypes as type}
							<option value={type.id}>{type.display_name}</option>
						{/each}
					</select>
				</div>
				
				<div class="form-row">
					<div class="form-group">
						<label for="name">Entity Name</label>
						<input type="text" id="name" bind:value={newEntity.name} 
							placeholder="e.g., my_store, main_office" />
					</div>
					<div class="form-group">
						<label for="display_name">Display Name</label>
						<input type="text" id="display_name" bind:value={newEntity.display_name} 
							placeholder="e.g., My Store, Main Office" />
					</div>
				</div>
				
				<div class="form-group">
					<label for="description">Description</label>
					<textarea id="description" bind:value={newEntity.description} rows="2" 
						placeholder="Describe this entity"></textarea>
				</div>
				
				{#if Object.keys(dynamicFields).length > 0}
					<div class="dynamic-fields">
						<h4>Additional Information</h4>
						{#each Object.entries(dynamicFields) as [key, value]}
							{@const fieldSchema = entityTypes.find(t => t.id === newEntity.entity_type_id)?.fields_schema?.[key]}
							<div class="form-group">
								<label for="dynamic-{key}">{fieldSchema?.label || key}</label>
								{#if fieldSchema?.type === 'boolean'}
									<select id="dynamic-{key}" bind:value={dynamicFields[key]}>
										<option value={true}>Yes</option>
										<option value={false}>No</option>
									</select>
								{:else if fieldSchema?.type === 'number'}
									<input type="number" id="dynamic-{key}" bind:value={dynamicFields[key]} />
								{:else if fieldSchema?.type === 'date'}
									<input type="date" id="dynamic-{key}" bind:value={dynamicFields[key]} />
								{:else}
									<input type="text" id="dynamic-{key}" bind:value={dynamicFields[key]} 
										placeholder={fieldSchema?.description || ''} />
								{/if}
							</div>
						{/each}
					</div>
				{/if}
				
				<div class="form-group">
					<label for="is_active">Status</label>
					<select id="is_active" bind:value={newEntity.is_active}>
						<option value={true}>Active</option>
						<option value={false}>Inactive</option>
					</select>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={() => showCreateModal = false}>Cancel</button>
				<button class="btn btn-primary" on:click={createEntity}>Create Entity</button>
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
					×
				</button>
			</div>
			<div class="modal-body">
				<div class="form-row">
					<div class="form-group">
						<label for="edit-name">Entity Name</label>
						<input type="text" id="edit-name" bind:value={selectedEntity.name} />
					</div>
					<div class="form-group">
						<label for="edit-display_name">Display Name</label>
						<input type="text" id="edit-display_name" bind:value={selectedEntity.display_name} />
					</div>
				</div>
				
				<div class="form-group">
					<label for="edit-description">Description</label>
					<textarea id="edit-description" bind:value={selectedEntity.description} rows="2"></textarea>
				</div>
				
				{#if Object.keys(dynamicFields).length > 0}
					{@const entityType = getEntityTypeInfo(selectedEntity.entity_type_id)}
					<div class="dynamic-fields">
						<h4>Additional Information</h4>
						{#each Object.entries(dynamicFields) as [key, value]}
							{@const fieldSchema = entityType?.fields_schema?.[key]}
							<div class="form-group">
								<label for="edit-dynamic-{key}">{fieldSchema?.label || key}</label>
								{#if fieldSchema?.type === 'boolean'}
									<select id="edit-dynamic-{key}" bind:value={dynamicFields[key]}>
										<option value={true}>Yes</option>
										<option value={false}>No</option>
									</select>
								{:else if fieldSchema?.type === 'number'}
									<input type="number" id="edit-dynamic-{key}" bind:value={dynamicFields[key]} />
								{:else if fieldSchema?.type === 'date'}
									<input type="date" id="edit-dynamic-{key}" bind:value={dynamicFields[key]} />
								{:else}
									<input type="text" id="edit-dynamic-{key}" bind:value={dynamicFields[key]} />
								{/if}
							</div>
						{/each}
					</div>
				{/if}
				
				<div class="form-group">
					<label for="edit-is_active">Status</label>
					<select id="edit-is_active" bind:value={selectedEntity.is_active}>
						<option value={true}>Active</option>
						<option value={false}>Inactive</option>
					</select>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={() => showEditModal = false}>Cancel</button>
				<button class="btn btn-primary" on:click={updateEntity}>Update Entity</button>
			</div>
		</div>
	</div>
{/if}
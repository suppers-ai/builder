<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		Building2, Plus, Edit2, Trash2, Search, Filter,
		CheckCircle, XCircle
	} from 'lucide-svelte';
	import { api } from '$lib/api';
	import { requireAdmin } from '$lib/utils/auth';
	import IconPicker from '$lib/components/IconPicker.svelte';
	import { getIconComponent } from '$lib/utils/icons';

	interface EntityType {
		id: string;
		name: string;
		display_name: string;
		description: string;
		icon?: string;
		fields_schema?: any;
		settings?: any;
		is_active: boolean;
		created_at: string;
		updated_at: string;
	}

	let entityTypes: EntityType[] = [];
	let loading = true;
	let searchQuery = '';
	let showCreateModal = false;
	let showEditModal = false;
	let selectedEntityType: EntityType | null = null;
	
	// Form data for new entity type
	let newEntityType: Partial<EntityType> = {
		name: '',
		display_name: '',
		description: '',
		icon: 'building',
		is_active: true,
		fields_schema: {}
	};

	$: filteredEntityTypes = entityTypes.filter(entityType => {
		const matchesSearch = entityType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			entityType.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			entityType.description?.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesSearch;
	});

	onMount(async () => {
		if (!requireAdmin()) return;
		await loadEntityTypes();
	});

	async function loadEntityTypes() {
		try {
			loading = true;
			const response = await api.get('/products/entity-types');
			entityTypes = response || [];
		} catch (error) {
			console.error('Failed to load entity types:', error);
			entityTypes = [];
		} finally {
			loading = false;
		}
	}
	
	async function createEntityType() {
		try {
			// Ensure fields_schema is a valid object
			if (typeof newEntityType.fields_schema === 'string') {
				try {
					newEntityType.fields_schema = JSON.parse(newEntityType.fields_schema);
				} catch {
					newEntityType.fields_schema = {};
				}
			}

			const result = await api.post('/products/entity-types', newEntityType);
			if (result) {
				// Reset form
				newEntityType = {
					name: '',
					display_name: '',
					description: '',
					icon: 'building',
					is_active: true,
					fields_schema: {}
				};
				showCreateModal = false;
				// Reload entity types
				await loadEntityTypes();
			}
		} catch (error) {
			console.error('Failed to create entity type:', error);
			alert('Failed to create entity type');
		}
	}
	
	async function editEntityType(entityType: EntityType) {
		selectedEntityType = { ...entityType };
		showEditModal = true;
	}
	
	async function updateEntityType() {
		if (!selectedEntityType) return;
		
		try {
			// Ensure fields_schema is a valid object
			if (typeof selectedEntityType.fields_schema === 'string') {
				try {
					selectedEntityType.fields_schema = JSON.parse(selectedEntityType.fields_schema);
				} catch {
					selectedEntityType.fields_schema = {};
				}
			}

			const result = await api.put(`/products/entity-types/${selectedEntityType.id}`, selectedEntityType);
			if (result) {
				showEditModal = false;
				selectedEntityType = null;
				// Reload entity types
				await loadEntityTypes();
			}
		} catch (error) {
			console.error('Failed to update entity type:', error);
			alert('Failed to update entity type');
		}
	}
	
	async function deleteEntityType(id: string) {
		if (!confirm('Are you sure you want to delete this entity type? This will affect all entities of this type.')) return;
		
		try {
			await api.delete(`/products/entity-types/${id}`);
			// Reload entity types
			await loadEntityTypes();
		} catch (error) {
			console.error('Failed to delete entity type:', error);
			alert('Failed to delete entity type');
		}
	}

	// Schema editor state
	let schemaFields: any[] = [];
	let editingSchema = false;

	function startSchemaEdit(entityType: any) {
		editingSchema = true;
		if (entityType.fields_schema && typeof entityType.fields_schema === 'object') {
			schemaFields = Object.entries(entityType.fields_schema).map(([key, value]: [string, any]) => ({
				name: key,
				type: value.type || 'text',
				label: value.label || key,
				required: value.required || false,
				description: value.description || ''
			}));
		} else {
			schemaFields = [];
		}
	}

	function addSchemaField() {
		schemaFields = [...schemaFields, {
			name: '',
			type: 'text',
			label: '',
			required: false,
			description: ''
		}];
	}

	function removeSchemaField(index: number) {
		schemaFields = schemaFields.filter((_, i) => i !== index);
	}

	function saveSchema(entityType: any) {
		const schema: any = {};
		schemaFields.forEach(field => {
			if (field.name) {
				schema[field.name] = {
					type: field.type,
					label: field.label || field.name,
					required: field.required,
					description: field.description
				};
			}
		});
		entityType.fields_schema = schema;
		editingSchema = false;
		schemaFields = [];
	}
</script>

<div class="page-container">
	<!-- Header -->
	<div class="page-header">
		<a href="/extensions/products" class="back-button">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="15 18 9 12 15 6"></polyline>
			</svg>
		</a>
		<div class="header-content">
			<div class="header-left">
				<div class="header-title">
					<Building2 size={24} />
					<h1>Entity Types</h1>
				</div>
				<p class="header-subtitle">Define types of entities that can own products (e.g., Store, Company, Team)</p>
			</div>
			<div class="header-actions">
				<button class="btn btn-primary" on:click={() => showCreateModal = true}>
					<Plus size={16} />
					New Entity Type
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
						placeholder="Search entity types..."
						bind:value={searchQuery}
					/>
				</div>
			</div>
			<div class="toolbar-right">
				<button class="btn-icon">
					<Filter size={16} />
				</button>
			</div>
		</div>

		<!-- Entity Types Grid -->
		{#if loading}
			<div class="loading-container">
				<div class="loading loading-spinner loading-lg text-cyan-600"></div>
			</div>
		{:else if filteredEntityTypes.length === 0}
			<div class="empty-state">
				<Building2 size={48} class="text-gray-400" />
				<h3>No entity types found</h3>
				<p>Create your first entity type to organize your business structure</p>
				<button class="btn btn-primary mt-4" on:click={() => showCreateModal = true}>
					<Plus size={16} />
					Create Entity Type
				</button>
			</div>
		{:else}
			<div class="entity-grid">
				{#each filteredEntityTypes as entityType}
					<div class="entity-card">
						<div class="entity-header">
							<div class="entity-icon">
								<svelte:component this={getIconComponent(entityType.icon)} size={24} />
							</div>
							<div class="entity-actions">
								<button class="btn-icon" on:click={() => editEntityType(entityType)} title="Edit">
									<Edit2 size={16} />
								</button>
								<button class="btn-icon btn-icon-danger" on:click={() => deleteEntityType(entityType.id)} title="Delete">
									<Trash2 size={16} />
								</button>
							</div>
						</div>
						<div class="entity-content">
							<h3 class="entity-name">{entityType.display_name}</h3>
							<code class="entity-code">{entityType.name}</code>
							<p class="entity-description">{entityType.description}</p>
							
							{#if entityType.fields_schema && Object.keys(entityType.fields_schema).length > 0}
								<div class="entity-fields">
									<p class="fields-label">Custom Fields:</p>
									<div class="fields-list">
										{#each Object.keys(entityType.fields_schema) as field}
											<span class="field-badge">{field}</span>
										{/each}
									</div>
								</div>
							{/if}
							
							<div class="entity-footer">
								<span class="status-badge {entityType.is_active ? 'status-active' : 'status-inactive'}">
									{#if entityType.is_active}
										<CheckCircle size={12} />
										Active
									{:else}
										<XCircle size={12} />
										Inactive
									{/if}
								</span>
								<button class="btn-link" on:click={() => { selectedEntityType = entityType; startSchemaEdit(entityType); showEditModal = true; }}>
									<Settings size={14} />
									Configure Fields
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
		position: relative;
	}

	.back-button {
		position: absolute;
		top: 1.5rem;
		left: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		background: white;
		color: #6b7280;
		text-decoration: none;
		transition: all 0.2s;
	}

	.back-button:hover {
		background: #f9fafb;
		color: #111827;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-left: 48px;
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

	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
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
		font-size: 0.75rem;
		cursor: pointer;
		padding: 0;
	}

	.btn-link:hover {
		color: #0891b2;
	}

	.entity-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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

	.entity-content {
		padding: 1rem;
	}

	.entity-name {
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.25rem 0;
	}

	.entity-code {
		display: inline-block;
		font-family: 'Courier New', monospace;
		font-size: 0.75rem;
		color: #6b7280;
		background: #f3f4f6;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		margin-bottom: 0.75rem;
	}

	.entity-description {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0 0 1rem 0;
	}

	.entity-fields {
		margin-bottom: 1rem;
	}

	.fields-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		margin: 0 0 0.5rem 0;
	}

	.fields-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.field-badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		background: #ecfdf5;
		color: #059669;
		font-size: 0.75rem;
		font-weight: 500;
		border-radius: 0.25rem;
	}

	.entity-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px solid #f3f4f6;
	}

	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
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
		max-width: 700px;
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

	.schema-editor {
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		padding: 1rem;
		background: #f9fafb;
	}

	.schema-field {
		display: grid;
		grid-template-columns: 2fr 2fr 1fr auto auto;
		gap: 0.5rem;
		align-items: center;
		margin-bottom: 0.5rem;
		padding: 0.5rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
	}

	.schema-field input,
	.schema-field select {
		padding: 0.375rem 0.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
		font-size: 0.75rem;
	}

	.schema-field label {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.75rem;
	}

	.btn-add-field {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.375rem 0.75rem;
		background: #06b6d4;
		color: white;
		border: none;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		margin-top: 0.5rem;
	}

	.btn-add-field:hover {
		background: #0891b2;
	}

	.btn-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: #fee2e2;
		color: #ef4444;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	.btn-remove:hover {
		background: #fca5a5;
	}
</style>

<!-- Create Entity Type Modal -->
{#if showCreateModal}
	<div class="modal-overlay" on:click={() => showCreateModal = false}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Create New Entity Type</h2>
				<button class="btn-icon" on:click={() => showCreateModal = false}>
					×
				</button>
			</div>
			<div class="modal-body">
				<div class="form-row">
					<div class="form-group">
						<label for="name">Entity Type Name</label>
						<input type="text" id="name" bind:value={newEntityType.name} 
							placeholder="e.g., store, company, team" />
					</div>
					<div class="form-group">
						<label for="display_name">Display Name</label>
						<input type="text" id="display_name" bind:value={newEntityType.display_name} 
							placeholder="e.g., Store, Company, Team" />
					</div>
				</div>
				<div class="form-group">
					<label for="description">Description</label>
					<textarea id="description" bind:value={newEntityType.description} rows="2" 
						placeholder="Describe what this entity type represents"></textarea>
				</div>
				<div class="form-group">
					<label for="icon">Icon</label>
					<IconPicker bind:value={newEntityType.icon} placeholder="Choose an icon" />
				</div>
				<div class="form-group">
					<label for="is_active">Status</label>
					<select id="is_active" bind:value={newEntityType.is_active}>
						<option value={true}>Active</option>
						<option value={false}>Inactive</option>
					</select>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={() => showCreateModal = false}>Cancel</button>
				<button class="btn btn-primary" on:click={createEntityType}>Create Entity Type</button>
			</div>
		</div>
	</div>
{/if}

<!-- Edit Entity Type Modal -->
{#if showEditModal && selectedEntityType}
	<div class="modal-overlay" on:click={() => showEditModal = false}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Edit Entity Type</h2>
				<button class="btn-icon" on:click={() => showEditModal = false}>
					×
				</button>
			</div>
			<div class="modal-body">
				<div class="form-row">
					<div class="form-group">
						<label for="edit-name">Entity Type Name</label>
						<input type="text" id="edit-name" bind:value={selectedEntityType.name} />
					</div>
					<div class="form-group">
						<label for="edit-display_name">Display Name</label>
						<input type="text" id="edit-display_name" bind:value={selectedEntityType.display_name} />
					</div>
				</div>
				<div class="form-group">
					<label for="edit-description">Description</label>
					<textarea id="edit-description" bind:value={selectedEntityType.description} rows="2"></textarea>
				</div>
				<div class="form-group">
					<label for="edit-icon">Icon</label>
					<IconPicker bind:value={selectedEntityType.icon} placeholder="Choose an icon" />
				</div>
				
				{#if editingSchema}
					<div class="form-group">
						<label>Custom Fields Schema</label>
						<div class="schema-editor">
							{#each schemaFields as field, index}
								<div class="schema-field">
									<input type="text" placeholder="Field name" bind:value={field.name} />
									<input type="text" placeholder="Label" bind:value={field.label} />
									<select bind:value={field.type}>
										<option value="text">Text</option>
										<option value="number">Number</option>
										<option value="date">Date</option>
										<option value="boolean">Boolean</option>
										<option value="select">Select</option>
									</select>
									<label>
										<input type="checkbox" bind:checked={field.required} />
										Required
									</label>
									<button class="btn-remove" on:click={() => removeSchemaField(index)}>
										×
									</button>
								</div>
							{/each}
							<button class="btn-add-field" on:click={addSchemaField}>
								<Plus size={14} />
								Add Field
							</button>
						</div>
					</div>
				{/if}
				
				<div class="form-group">
					<label for="edit-is_active">Status</label>
					<select id="edit-is_active" bind:value={selectedEntityType.is_active}>
						<option value={true}>Active</option>
						<option value={false}>Inactive</option>
					</select>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={() => { showEditModal = false; editingSchema = false; }}>Cancel</button>
				{#if editingSchema}
					<button class="btn btn-primary" on:click={() => saveSchema(selectedEntityType)}>Save Schema</button>
				{/if}
				<button class="btn btn-primary" on:click={updateEntityType}>Update Entity Type</button>
			</div>
		</div>
	</div>
{/if}
<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		Variable, Plus, Edit2, Trash2, Search, Filter,
		Code, Hash, Type, Calendar, ToggleLeft, 
		Database, Globe, User, ShoppingBag
	} from 'lucide-svelte';
	import { api } from '$lib/api';
	import { requireAdmin } from '$lib/utils/auth';

	interface VariableItem {
		id: string;
		name: string;
		display_name: string;
		description: string;
		type: 'number' | 'text' | 'boolean' | 'date' | 'select';
		source: 'system' | 'user_input' | 'entity' | 'product' | 'calculated';
		category: 'product' | 'entity' | 'order' | 'customer' | 'promotion' | 'system';
		is_active: boolean;
		default_value?: any;
		validation_rules?: any;
		created_at: string;
		updated_at: string;
	}

	let variables: VariableItem[] = [];
	let loading = true;
	let searchQuery = '';
	let selectedCategory = 'all';
	let selectedType = 'all';
	let showCreateModal = false;
	let showEditModal = false;
	let selectedVariable: VariableItem | null = null;
	
	// Form data for new variable
	let newVariable: Partial<VariableItem> = {
		name: '',
		display_name: '',
		description: '',
		type: 'text',
		source: 'system',
		category: 'product',
		is_active: true
	};

	$: filteredVariables = variables.filter(variable => {
		const matchesSearch = variable.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			variable.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			variable.description?.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory = selectedCategory === 'all' || variable.category === selectedCategory;
		const matchesType = selectedType === 'all' || variable.type === selectedType;
		return matchesSearch && matchesCategory && matchesType;
	});

	onMount(async () => {
		if (!requireAdmin()) return;
		await loadVariables();
	});

	async function loadVariables() {
		try {
			loading = true;
			const response = await api.get('/products/variables');
			variables = response || [];
		} catch (error) {
			console.error('Failed to load variables:', error);
			variables = [];
		} finally {
			loading = false;
		}
	}

	function getTypeIcon(type: string) {
		switch (type) {
			case 'number': return Hash;
			case 'text': return Type;
			case 'boolean': return ToggleLeft;
			case 'date': return Calendar;
			default: return Code;
		}
	}

	function getSourceIcon(source: string) {
		switch (source) {
			case 'system': return Database;
			case 'user_input': return User;
			case 'entity': return Globe;
			case 'product': return ShoppingBag;
			default: return Code;
		}
	}

	function getCategoryColor(category: string) {
		switch (category) {
			case 'product': return 'bg-blue-100 text-blue-700';
			case 'entity': return 'bg-purple-100 text-purple-700';
			case 'order': return 'bg-green-100 text-green-700';
			case 'customer': return 'bg-orange-100 text-orange-700';
			case 'promotion': return 'bg-pink-100 text-pink-700';
			case 'system': return 'bg-gray-100 text-gray-700';
			default: return 'bg-gray-100 text-gray-700';
		}
	}
	
	async function createVariable() {
		try {
			const result = await api.post('/products/variables', newVariable);
			if (result) {
				// Reset form
				newVariable = {
					name: '',
					display_name: '',
					description: '',
					type: 'text',
					source: 'system',
					category: 'product',
					is_active: true
				};
				showCreateModal = false;
				// Reload variables
				await loadVariables();
			}
		} catch (error) {
			console.error('Failed to create variable:', error);
			alert('Failed to create variable');
		}
	}
	
	async function editVariable(variable: VariableItem) {
		selectedVariable = { ...variable };
		showEditModal = true;
	}
	
	async function updateVariable() {
		if (!selectedVariable) return;
		
		try {
			const result = await api.put(`/products/variables/${selectedVariable.id}`, selectedVariable);
			if (result) {
				showEditModal = false;
				selectedVariable = null;
				// Reload variables
				await loadVariables();
			}
		} catch (error) {
			console.error('Failed to update variable:', error);
			alert('Failed to update variable');
		}
	}
	
	async function deleteVariable(id: string) {
		if (!confirm('Are you sure you want to delete this variable? This may affect existing products and pricing rules.')) return;
		
		try {
			await api.delete(`/products/variables/${id}`);
			// Reload variables
			await loadVariables();
		} catch (error) {
			console.error('Failed to delete variable:', error);
			alert('Failed to delete variable');
		}
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
					<Variable size={24} />
					<h1>Variables</h1>
				</div>
				<p class="header-subtitle">Define variables for dynamic pricing and product attributes</p>
			</div>
			<div class="header-actions">
				<button class="btn btn-primary" on:click={() => showCreateModal = true}>
					<Plus size={16} />
					New Variable
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
						placeholder="Search variables..."
						bind:value={searchQuery}
					/>
				</div>
				<select class="filter-select" bind:value={selectedCategory}>
					<option value="all">All Categories</option>
					<option value="product">Product</option>
					<option value="entity">Entity</option>
					<option value="order">Order</option>
					<option value="customer">Customer</option>
					<option value="promotion">Promotion</option>
					<option value="system">System</option>
				</select>
				<select class="filter-select" bind:value={selectedType}>
					<option value="all">All Types</option>
					<option value="number">Number</option>
					<option value="text">Text</option>
					<option value="boolean">Boolean</option>
					<option value="date">Date</option>
					<option value="select">Select</option>
				</select>
			</div>
			<div class="toolbar-right">
				<button class="btn-icon">
					<Filter size={16} />
				</button>
			</div>
		</div>

		<!-- Variables Table -->
		{#if loading}
			<div class="loading-container">
				<div class="loading loading-spinner loading-lg text-cyan-600"></div>
			</div>
		{:else if filteredVariables.length === 0}
			<div class="empty-state">
				<Variable size={48} class="text-gray-400" />
				<h3>No variables found</h3>
				<p>Create your first variable to start building dynamic pricing rules</p>
				<button class="btn btn-primary mt-4" on:click={() => showCreateModal = true}>
					<Plus size={16} />
					Create Variable
				</button>
			</div>
		{:else}
			<div class="table-container">
				<table class="data-table">
					<thead>
						<tr>
							<th>Variable</th>
							<th>Type</th>
							<th>Source</th>
							<th>Category</th>
							<th>Status</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each filteredVariables as variable}
							<tr>
								<td>
									<div class="variable-info">
										<div class="variable-header">
											<code class="variable-name">{variable.name}</code>
											<p class="variable-display">{variable.display_name}</p>
										</div>
										<p class="variable-description">{variable.description}</p>
									</div>
								</td>
								<td>
									<div class="type-badge">
										<svelte:component this={getTypeIcon(variable.type)} size={14} />
										{variable.type}
									</div>
								</td>
								<td>
									<div class="source-badge">
										<svelte:component this={getSourceIcon(variable.source)} size={14} />
										{variable.source.replace('_', ' ')}
									</div>
								</td>
								<td>
									<span class="category-badge {getCategoryColor(variable.category)}">
										{variable.category}
									</span>
								</td>
								<td>
									<span class="status-badge {variable.is_active ? 'status-active' : 'status-inactive'}">
										{variable.is_active ? 'Active' : 'Inactive'}
									</span>
								</td>
								<td>
									<div class="action-buttons">
										<button class="btn-icon" on:click={() => editVariable(variable)} title="Edit">
											<Edit2 size={16} />
										</button>
										<button class="btn-icon btn-icon-danger" on:click={() => deleteVariable(variable.id)} title="Delete">
											<Trash2 size={16} />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
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
		width: 36px;
		height: 36px;
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
	}

	.table-container {
		overflow-x: auto;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
	}

	.data-table th {
		text-align: left;
		padding: 0.75rem 1.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		border-bottom: 1px solid #e5e7eb;
		background: #f9fafb;
	}

	.data-table td {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #f3f4f6;
	}

	.variable-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.variable-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.variable-name {
		font-family: 'Courier New', monospace;
		font-size: 0.875rem;
		font-weight: 600;
		color: #059669;
		background: #ecfdf5;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	.variable-display {
		font-weight: 500;
		color: #111827;
		margin: 0;
	}

	.variable-description {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
	}

	.type-badge, .source-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.625rem;
		background: #f3f4f6;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: #374151;
	}

	.category-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
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

	.action-buttons {
		display: flex;
		gap: 0.5rem;
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
</style>

<!-- Create Variable Modal -->
{#if showCreateModal}
	<div class="modal-overlay" on:click={() => showCreateModal = false}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Create New Variable</h2>
				<button class="btn-icon" on:click={() => showCreateModal = false}>
					×
				</button>
			</div>
			<div class="modal-body">
				<div class="form-row">
					<div class="form-group">
						<label for="name">Variable Name</label>
						<input type="text" id="name" bind:value={newVariable.name} 
							placeholder="e.g., base_price, discount_rate" />
					</div>
					<div class="form-group">
						<label for="display_name">Display Name</label>
						<input type="text" id="display_name" bind:value={newVariable.display_name} 
							placeholder="e.g., Base Price, Discount Rate" />
					</div>
				</div>
				<div class="form-group">
					<label for="description">Description</label>
					<textarea id="description" bind:value={newVariable.description} rows="2" 
						placeholder="Describe what this variable represents"></textarea>
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="type">Type</label>
						<select id="type" bind:value={newVariable.type}>
							<option value="text">Text</option>
							<option value="number">Number</option>
							<option value="boolean">Boolean</option>
							<option value="date">Date</option>
							<option value="select">Select</option>
						</select>
					</div>
					<div class="form-group">
						<label for="source">Source</label>
						<select id="source" bind:value={newVariable.source}>
							<option value="system">System</option>
							<option value="user_input">User Input</option>
							<option value="entity">Entity</option>
							<option value="product">Product</option>
							<option value="calculated">Calculated</option>
						</select>
					</div>
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="category">Category</label>
						<select id="category" bind:value={newVariable.category}>
							<option value="product">Product</option>
							<option value="entity">Entity</option>
							<option value="order">Order</option>
							<option value="customer">Customer</option>
							<option value="promotion">Promotion</option>
							<option value="system">System</option>
						</select>
					</div>
					<div class="form-group">
						<label for="is_active">Status</label>
						<select id="is_active" bind:value={newVariable.is_active}>
							<option value={true}>Active</option>
							<option value={false}>Inactive</option>
						</select>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={() => showCreateModal = false}>Cancel</button>
				<button class="btn btn-primary" on:click={createVariable}>Create Variable</button>
			</div>
		</div>
	</div>
{/if}

<!-- Edit Variable Modal -->
{#if showEditModal && selectedVariable}
	<div class="modal-overlay" on:click={() => showEditModal = false}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Edit Variable</h2>
				<button class="btn-icon" on:click={() => showEditModal = false}>
					×
				</button>
			</div>
			<div class="modal-body">
				<div class="form-row">
					<div class="form-group">
						<label for="edit-name">Variable Name</label>
						<input type="text" id="edit-name" bind:value={selectedVariable.name} />
					</div>
					<div class="form-group">
						<label for="edit-display_name">Display Name</label>
						<input type="text" id="edit-display_name" bind:value={selectedVariable.display_name} />
					</div>
				</div>
				<div class="form-group">
					<label for="edit-description">Description</label>
					<textarea id="edit-description" bind:value={selectedVariable.description} rows="2"></textarea>
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="edit-type">Type</label>
						<select id="edit-type" bind:value={selectedVariable.type}>
							<option value="text">Text</option>
							<option value="number">Number</option>
							<option value="boolean">Boolean</option>
							<option value="date">Date</option>
							<option value="select">Select</option>
						</select>
					</div>
					<div class="form-group">
						<label for="edit-source">Source</label>
						<select id="edit-source" bind:value={selectedVariable.source}>
							<option value="system">System</option>
							<option value="user_input">User Input</option>
							<option value="entity">Entity</option>
							<option value="product">Product</option>
							<option value="calculated">Calculated</option>
						</select>
					</div>
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="edit-category">Category</label>
						<select id="edit-category" bind:value={selectedVariable.category}>
							<option value="product">Product</option>
							<option value="entity">Entity</option>
							<option value="order">Order</option>
							<option value="customer">Customer</option>
							<option value="promotion">Promotion</option>
							<option value="system">System</option>
						</select>
					</div>
					<div class="form-group">
						<label for="edit-is_active">Status</label>
						<select id="edit-is_active" bind:value={selectedVariable.is_active}>
							<option value={true}>Active</option>
							<option value={false}>Inactive</option>
						</select>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={() => showEditModal = false}>Cancel</button>
				<button class="btn btn-primary" on:click={updateVariable}>Update Variable</button>
			</div>
		</div>
	</div>
{/if}
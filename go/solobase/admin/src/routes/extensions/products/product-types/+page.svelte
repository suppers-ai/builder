<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		Package2, Plus, Edit2, Trash2, Search, Filter,
		CheckCircle, XCircle, DollarSign, FileText
	} from 'lucide-svelte';
	import { api } from '$lib/api';
	import { requireAdmin } from '$lib/utils/auth';
	import IconPicker from '$lib/components/IconPicker.svelte';
	import { getIconComponent } from '$lib/utils/icons';

	interface ProductType {
		id: string;
		name: string;
		display_name: string;
		description: string;
		category?: string;
		icon?: string;
		schema?: any;
		pricing_model?: string;
		default_variables?: any;
		settings?: any;
		is_active: boolean;
		created_at: string;
		updated_at: string;
	}

	let productTypes: ProductType[] = [];
	let loading = true;
	let searchQuery = '';
	let selectedCategory = 'all';
	let showCreateModal = false;
	let showEditModal = false;
	let showPricingModal = false;
	let selectedProductType: ProductType | null = null;
	
	// Form data for new product type
	let newProductType: Partial<ProductType> = {
		name: '',
		display_name: '',
		description: '',
		// category: 'physical', // Commented out until backend support
		icon: 'package',
		// pricing_model: 'fixed', // Commented out until backend support
		is_active: true,
		schema: {},
		default_variables: {}
	};

	// Available categories
	const categories = [
		{ value: 'physical', label: 'Physical Product' },
		{ value: 'digital', label: 'Digital Product' },
		{ value: 'subscription', label: 'Subscription' },
		{ value: 'service', label: 'Service' },
		{ value: 'license', label: 'License' }
	];

	// Using IconPicker component for icon selection

	// Pricing models
	const pricingModels = [
		{ value: 'fixed', label: 'Fixed Price' },
		{ value: 'dynamic', label: 'Dynamic Pricing' },
		{ value: 'tiered', label: 'Tiered Pricing' },
		{ value: 'usage', label: 'Usage-Based' },
		{ value: 'formula', label: 'Formula-Based' }
	];

	$: filteredProductTypes = productTypes.filter(productType => {
		const matchesSearch = productType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			productType.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			productType.description?.toLowerCase().includes(searchQuery.toLowerCase());
		// Category filtering disabled for now as it's not in the data model
		return matchesSearch;
	});

	onMount(async () => {
		if (!requireAdmin()) return;
		await loadProductTypes();
	});

	async function loadProductTypes() {
		try {
			loading = true;
			const response = await api.get('/products/product-types');
			productTypes = response || [];
		} catch (error) {
			console.error('Failed to load product types:', error);
			productTypes = [];
		} finally {
			loading = false;
		}
	}


	function getCategoryLabel(category: string) {
		const cat = categories.find(c => c.value === category);
		return cat?.label || category;
	}

	function getCategoryColor(category: string) {
		switch (category) {
			case 'physical': return 'bg-blue-100 text-blue-700';
			case 'digital': return 'bg-purple-100 text-purple-700';
			case 'subscription': return 'bg-green-100 text-green-700';
			case 'service': return 'bg-orange-100 text-orange-700';
			case 'license': return 'bg-pink-100 text-pink-700';
			default: return 'bg-gray-100 text-gray-700';
		}
	}

	function getPricingModelColor(model: string) {
		switch (model) {
			case 'fixed': return 'bg-gray-100 text-gray-700';
			case 'dynamic': return 'bg-cyan-100 text-cyan-700';
			case 'tiered': return 'bg-indigo-100 text-indigo-700';
			case 'usage': return 'bg-amber-100 text-amber-700';
			case 'formula': return 'bg-emerald-100 text-emerald-700';
			default: return 'bg-gray-100 text-gray-700';
		}
	}
	
	async function createProductType() {
		try {
			// Ensure schemas are valid objects
			if (typeof newProductType.schema === 'string') {
				try {
					newProductType.schema = JSON.parse(newProductType.schema);
				} catch {
					newProductType.schema = {};
				}
			}
			if (typeof newProductType.default_variables === 'string') {
				try {
					newProductType.default_variables = JSON.parse(newProductType.default_variables);
				} catch {
					newProductType.default_variables = {};
				}
			}

			const result = await api.post('/products/product-types', newProductType);
			if (result) {
				// Reset form
				newProductType = {
					name: '',
					display_name: '',
					description: '',
					// category: 'physical', // Commented out until backend support
					icon: 'package',
					// pricing_model: 'fixed', // Commented out until backend support
					is_active: true,
					schema: {},
					default_variables: {}
				};
				showCreateModal = false;
				// Reload product types
				await loadProductTypes();
			}
		} catch (error) {
			console.error('Failed to create product type:', error);
			alert('Failed to create product type');
		}
	}
	
	async function editProductType(productType: ProductType) {
		selectedProductType = { ...productType };
		showEditModal = true;
	}
	
	async function updateProductType() {
		if (!selectedProductType) return;
		
		try {
			// Ensure schemas are valid objects
			if (typeof selectedProductType.schema === 'string') {
				try {
					selectedProductType.schema = JSON.parse(selectedProductType.schema);
				} catch {
					selectedProductType.schema = {};
				}
			}
			if (typeof selectedProductType.default_variables === 'string') {
				try {
					selectedProductType.default_variables = JSON.parse(selectedProductType.default_variables);
				} catch {
					selectedProductType.default_variables = {};
				}
			}

			const result = await api.put(`/products/product-types/${selectedProductType.id}`, selectedProductType);
			if (result) {
				showEditModal = false;
				selectedProductType = null;
				// Reload product types
				await loadProductTypes();
			}
		} catch (error) {
			console.error('Failed to update product type:', error);
			alert('Failed to update product type');
		}
	}
	
	async function deleteProductType(id: string) {
		if (!confirm('Are you sure you want to delete this product type? This will affect all products of this type.')) return;
		
		try {
			await api.delete(`/products/product-types/${id}`);
			// Reload product types
			await loadProductTypes();
		} catch (error) {
			console.error('Failed to delete product type:', error);
			alert('Failed to delete product type');
		}
	}

	// Schema editor state
	let schemaFields: any[] = [];
	let editingSchema = false;
	let defaultVariables: any[] = [];
	let editingVariables = false;

	function startSchemaEdit(productType: any) {
		editingSchema = true;
		if (productType.schema && typeof productType.schema === 'object') {
			schemaFields = Object.entries(productType.schema).map(([key, value]: [string, any]) => ({
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

	function startVariableEdit(productType: any) {
		editingVariables = true;
		if (productType.default_variables && typeof productType.default_variables === 'object') {
			defaultVariables = Object.entries(productType.default_variables).map(([key, value]) => ({
				name: key,
				value: value
			}));
		} else {
			defaultVariables = [];
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

	function saveSchema(productType: any) {
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
		productType.schema = schema;
		editingSchema = false;
		schemaFields = [];
	}

	function addVariable() {
		defaultVariables = [...defaultVariables, { name: '', value: '' }];
	}

	function removeVariable(index: number) {
		defaultVariables = defaultVariables.filter((_, i) => i !== index);
	}

	function saveVariables(productType: any) {
		const vars: any = {};
		defaultVariables.forEach(variable => {
			if (variable.name) {
				vars[variable.name] = variable.value;
			}
		});
		productType.default_variables = vars;
		editingVariables = false;
		defaultVariables = [];
	}
</script>

<div class="page-container">
	<!-- Header -->
	<div class="page-header">
		<div class="header-content">
			<div class="header-left">
				<div class="header-title">
					<a href="/extensions/products" class="back-button">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="15 18 9 12 15 6"></polyline>
						</svg>
					</a>
					<Package2 size={24} />
					<h1>Product Types</h1>
				</div>
				<p class="header-subtitle">Define different types of products with their own fields and pricing models</p>
			</div>
			<div class="header-actions">
				<button class="btn btn-primary" on:click={() => showCreateModal = true}>
					<Plus size={16} />
					New Product Type
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
						placeholder="Search product types..."
						bind:value={searchQuery}
					/>
				</div>
				<select class="filter-select" bind:value={selectedCategory}>
					<option value="all">All Categories</option>
					{#each categories as cat}
						<option value={cat.value}>{cat.label}</option>
					{/each}
				</select>
			</div>
			<div class="toolbar-right">
				<button class="btn-icon">
					<Filter size={16} />
				</button>
			</div>
		</div>

		<!-- Product Types Grid -->
		{#if loading}
			<div class="loading-container">
				<div class="loading loading-spinner loading-lg text-cyan-600"></div>
			</div>
		{:else if filteredProductTypes.length === 0}
			<div class="empty-state">
				<Package2 size={48} class="text-gray-400" />
				<h3>No product types found</h3>
				<p>Create your first product type to start building your catalog</p>
				<button class="btn btn-primary mt-4" on:click={() => showCreateModal = true}>
					<Plus size={16} />
					Create Product Type
				</button>
			</div>
		{:else}
			<div class="product-grid">
				{#each filteredProductTypes as productType}
					<div class="product-card">
						<div class="product-header">
							<div class="product-icon">
								<svelte:component this={getIconComponent(productType.icon)} size={24} />
							</div>
							<div class="product-actions">
								<button class="btn-icon" on:click={() => editProductType(productType)} title="Edit">
									<Edit2 size={16} />
								</button>
								<button class="btn-icon btn-icon-danger" on:click={() => deleteProductType(productType.id)} title="Delete">
									<Trash2 size={16} />
								</button>
							</div>
						</div>
						<div class="product-content">
							<h3 class="product-name">{productType.display_name}</h3>
							<code class="product-code">{productType.name}</code>
							<p class="product-description">{productType.description}</p>
							
							<!-- Category and pricing model disabled for now as they're not in the data model -->
							<!--
							<div class="product-meta">
								<span class="category-badge {getCategoryColor(productType.category)}">
									{getCategoryLabel(productType.category)}
								</span>
								<span class="pricing-badge {getPricingModelColor(productType.pricing_model)}">
									<DollarSign size={12} />
									{productType.pricing_model}
								</span>
							</div>
							-->
							
							{#if productType.schema && Object.keys(productType.schema).length > 0}
								<div class="product-fields">
									<p class="fields-label">Custom Fields:</p>
									<div class="fields-list">
										{#each Object.keys(productType.schema) as field}
											<span class="field-badge">{field}</span>
										{/each}
									</div>
								</div>
							{/if}

							{#if productType.settings && productType.settings.default_variables && Object.keys(productType.settings.default_variables).length > 0}
								<div class="product-fields">
									<p class="fields-label">Default Variables:</p>
									<div class="fields-list">
										{#each Object.entries(productType.settings.default_variables) as [key, value]}
											<span class="variable-badge">{key}: {value}</span>
										{/each}
									</div>
								</div>
							{/if}
							
							<div class="product-footer">
								<span class="status-badge {productType.is_active ? 'status-active' : 'status-inactive'}">
									{#if productType.is_active}
										<CheckCircle size={12} />
										Active
									{:else}
										<XCircle size={12} />
										Inactive
									{/if}
								</span>
								<div class="footer-actions">
									<button class="btn-link" on:click={() => { selectedProductType = productType; startSchemaEdit(productType); showEditModal = true; }}>
										<FileText size={14} />
										Fields
									</button>
									<button class="btn-link" on:click={() => { selectedProductType = productType; showPricingModal = true; }}>
										<DollarSign size={14} />
										Pricing
									</button>
								</div>
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

	.product-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
		gap: 1.5rem;
		padding: 1.5rem;
	}

	.product-card {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		overflow: hidden;
		transition: all 0.2s;
	}

	.product-card:hover {
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.product-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
	}

	.product-icon {
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

	.product-actions {
		display: flex;
		gap: 0.5rem;
	}

	.product-content {
		padding: 1rem;
	}

	.product-name {
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.25rem 0;
	}

	.product-code {
		display: inline-block;
		font-family: 'Courier New', monospace;
		font-size: 0.75rem;
		color: #6b7280;
		background: #f3f4f6;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		margin-bottom: 0.75rem;
	}

	.product-description {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0 0 1rem 0;
	}

	.product-meta {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.category-badge, .pricing-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.product-fields {
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

	.variable-badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		background: #fef3c7;
		color: #92400e;
		font-size: 0.75rem;
		font-family: 'Courier New', monospace;
		border-radius: 0.25rem;
	}

	.product-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px solid #f3f4f6;
	}

	.footer-actions {
		display: flex;
		gap: 0.75rem;
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

	.variable-editor {
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		padding: 1rem;
		background: #f9fafb;
	}

	.variable-field {
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		gap: 0.5rem;
		align-items: center;
		margin-bottom: 0.5rem;
		padding: 0.5rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
	}

	.variable-field input {
		padding: 0.375rem 0.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
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

<!-- Create Product Type Modal -->
{#if showCreateModal}
	<div class="modal-overlay" on:click={() => showCreateModal = false}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Create New Product Type</h2>
				<button class="btn-icon" on:click={() => showCreateModal = false}>
					×
				</button>
			</div>
			<div class="modal-body">
				<div class="form-row">
					<div class="form-group">
						<label for="name">Product Type Name</label>
						<input type="text" id="name" bind:value={newProductType.name} 
							placeholder="e.g., standard_product, subscription_service" />
					</div>
					<div class="form-group">
						<label for="display_name">Display Name</label>
						<input type="text" id="display_name" bind:value={newProductType.display_name} 
							placeholder="e.g., Standard Product, Subscription Service" />
					</div>
				</div>
				<div class="form-group">
					<label for="description">Description</label>
					<textarea id="description" bind:value={newProductType.description} rows="2" 
						placeholder="Describe what this product type represents"></textarea>
				</div>
				<!-- Category and Pricing Model fields commented out until backend support is added -->
				<!--
				<div class="form-row">
					<div class="form-group">
						<label for="category">Category</label>
						<select id="category" bind:value={newProductType.category}>
							{#each categories as cat}
								<option value={cat.value}>{cat.label}</option>
							{/each}
						</select>
					</div>
					<div class="form-group">
						<label for="pricing_model">Pricing Model</label>
						<select id="pricing_model" bind:value={newProductType.pricing_model}>
							{#each pricingModels as model}
								<option value={model.value}>{model.label}</option>
							{/each}
						</select>
					</div>
				</div>
				-->
				<div class="form-group">
					<label for="icon">Icon</label>
					<IconPicker bind:value={newProductType.icon} placeholder="Choose an icon" />
				</div>
				<div class="form-group">
					<label for="is_active">Status</label>
					<select id="is_active" bind:value={newProductType.is_active}>
						<option value={true}>Active</option>
						<option value={false}>Inactive</option>
					</select>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={() => showCreateModal = false}>Cancel</button>
				<button class="btn btn-primary" on:click={createProductType}>Create Product Type</button>
			</div>
		</div>
	</div>
{/if}

<!-- Edit Product Type Modal -->
{#if showEditModal && selectedProductType}
	<div class="modal-overlay" on:click={() => showEditModal = false}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Edit Product Type</h2>
				<button class="btn-icon" on:click={() => showEditModal = false}>
					×
				</button>
			</div>
			<div class="modal-body">
				<div class="form-row">
					<div class="form-group">
						<label for="edit-name">Product Type Name</label>
						<input type="text" id="edit-name" bind:value={selectedProductType.name} />
					</div>
					<div class="form-group">
						<label for="edit-display_name">Display Name</label>
						<input type="text" id="edit-display_name" bind:value={selectedProductType.display_name} />
					</div>
				</div>
				<div class="form-group">
					<label for="edit-description">Description</label>
					<textarea id="edit-description" bind:value={selectedProductType.description} rows="2"></textarea>
				</div>
				<!-- Category and Pricing Model fields commented out until backend support is added -->
				<!--
				<div class="form-row">
					<div class="form-group">
						<label for="edit-category">Category</label>
						<select id="edit-category" bind:value={selectedProductType.category}>
							{#each categories as cat}
								<option value={cat.value}>{cat.label}</option>
							{/each}
						</select>
					</div>
					<div class="form-group">
						<label for="edit-pricing_model">Pricing Model</label>
						<select id="edit-pricing_model" bind:value={selectedProductType.pricing_model}>
							{#each pricingModels as model}
								<option value={model.value}>{model.label}</option>
							{/each}
						</select>
					</div>
				</div>
				-->
				<div class="form-group">
					<label for="edit-icon">Icon</label>
					<IconPicker bind:value={selectedProductType.icon} placeholder="Choose an icon" />
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

				{#if editingVariables}
					<div class="form-group">
						<label>Default Variables</label>
						<div class="variable-editor">
							{#each defaultVariables as variable, index}
								<div class="variable-field">
									<input type="text" placeholder="Variable name" bind:value={variable.name} />
									<input type="text" placeholder="Default value" bind:value={variable.value} />
									<button class="btn-remove" on:click={() => removeVariable(index)}>
										×
									</button>
								</div>
							{/each}
							<button class="btn-add-field" on:click={addVariable}>
								<Plus size={14} />
								Add Variable
							</button>
						</div>
					</div>
				{/if}
				
				<div class="form-group">
					<label for="edit-is_active">Status</label>
					<select id="edit-is_active" bind:value={selectedProductType.is_active}>
						<option value={true}>Active</option>
						<option value={false}>Inactive</option>
					</select>
				</div>
			</div>
			<div class="modal-footer">
				{#if !editingSchema && !editingVariables}
					<button class="btn btn-secondary" on:click={() => startSchemaEdit(selectedProductType)}>Edit Fields</button>
					<button class="btn btn-secondary" on:click={() => startVariableEdit(selectedProductType)}>Edit Variables</button>
				{/if}
				<button class="btn btn-secondary" on:click={() => { showEditModal = false; editingSchema = false; editingVariables = false; }}>Cancel</button>
				{#if editingSchema}
					<button class="btn btn-primary" on:click={() => saveSchema(selectedProductType)}>Save Schema</button>
				{:else if editingVariables}
					<button class="btn btn-primary" on:click={() => saveVariables(selectedProductType)}>Save Variables</button>
				{:else}
					<button class="btn btn-primary" on:click={updateProductType}>Update Product Type</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Pricing Configuration Modal -->
{#if showPricingModal && selectedProductType}
	<div class="modal-overlay" on:click={() => showPricingModal = false}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Configure Pricing - {selectedProductType.display_name}</h2>
				<button class="btn-icon" on:click={() => showPricingModal = false}>
					×
				</button>
			</div>
			<div class="modal-body">
				<!-- Pricing model configuration commented out until backend support is added -->
				<!--
				<div class="form-group">
					<label>Pricing Model</label>
					<select bind:value={selectedProductType.pricing_model}>
						{#each pricingModels as model}
							<option value={model.value}>{model.label}</option>
						{/each}
					</select>
				</div>
				
				{#if selectedProductType.pricing_model === 'formula'}
					<div class="form-group">
						<label>Pricing Formula</label>
						<textarea rows="4" placeholder="e.g., base_price * quantity * (1 - discount_rate/100)"></textarea>
					</div>
				{/if}
				-->
				
				<div class="form-group">
					<label>Available Variables for Pricing</label>
					<div class="fields-list">
						<span class="field-badge">base_price</span>
						<span class="field-badge">quantity</span>
						<span class="field-badge">discount_rate</span>
						<span class="field-badge">tax_rate</span>
						<span class="field-badge">shipping_cost</span>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={() => showPricingModal = false}>Cancel</button>
				<button class="btn btn-primary" on:click={() => { updateProductType(); showPricingModal = false; }}>Save Pricing</button>
			</div>
		</div>
	</div>
{/if}
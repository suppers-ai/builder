<script>
	import { onMount } from 'svelte';
	import { Plus, Edit2, Trash2, Filter, Search, ChevronDown, ChevronUp, X, AlertCircle } from 'lucide-svelte';

	let variables = [];
	let filteredVariables = [];
	let loading = true;
	let error = null;
	let searchQuery = '';
	let selectedSourceType = 'all';
	let selectedType = 'all';
	let expandedGroups = new Set(['global', 'system', 'entity', 'product']);
	let showCreateModal = false;
	let showEditModal = false;
	let editingVariable = null;

	// Form data for new/edit variable
	let formData = {
		name: '',
		display_name: '',
		value_type: 'string',
		type: 'user_input',
		source_type: 'global',
		source_id: null,
		category: '',
		default_value: '',
		description: '',
		formula: '',
		options: [],
		constraints: {},
		is_active: true
	};

	// Option management for select type
	let newOption = '';

	// Constraint fields
	let constraints = {
		required: false,
		min: '',
		max: '',
		min_length: '',
		max_length: '',
		pattern: ''
	};

	onMount(() => {
		loadVariables();
	});

	async function loadVariables() {
		loading = true;
		error = null;
		try {
			const response = await fetch('/api/products/variables');
			if (!response.ok) throw new Error('Failed to load variables');
			variables = await response.json();
			filterVariables();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function filterVariables() {
		let filtered = [...variables];

		// Filter by source type
		if (selectedSourceType !== 'all') {
			filtered = filtered.filter(v => v.source_type === selectedSourceType);
		}

		// Filter by type
		if (selectedType !== 'all') {
			filtered = filtered.filter(v => v.type === selectedType);
		}

		// Filter by search query
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(v => 
				v.name.toLowerCase().includes(query) ||
				v.display_name?.toLowerCase().includes(query) ||
				v.description?.toLowerCase().includes(query)
			);
		}

		// Group by source type
		const grouped = {};
		filtered.forEach(variable => {
			const group = variable.source_type || 'global';
			if (!grouped[group]) grouped[group] = [];
			grouped[group].push(variable);
		});

		filteredVariables = grouped;
	}

	function toggleGroup(group) {
		if (expandedGroups.has(group)) {
			expandedGroups.delete(group);
		} else {
			expandedGroups.add(group);
		}
		expandedGroups = expandedGroups;
	}

	function resetForm() {
		formData = {
			name: '',
			display_name: '',
			value_type: 'string',
			type: 'user_input',
			source_type: 'global',
			source_id: null,
			category: '',
			default_value: '',
			description: '',
			formula: '',
			options: [],
			constraints: {},
			is_active: true
		};
		constraints = {
			required: false,
			min: '',
			max: '',
			min_length: '',
			max_length: '',
			pattern: ''
		};
		newOption = '';
	}

	function openCreateModal() {
		resetForm();
		showCreateModal = true;
	}

	function openEditModal(variable) {
		editingVariable = variable;
		formData = { ...variable };
		if (!formData.options) formData.options = [];
		if (!formData.constraints) formData.constraints = {};
		
		// Extract constraints
		constraints = {
			required: formData.constraints.required || false,
			min: formData.constraints.min || '',
			max: formData.constraints.max || '',
			min_length: formData.constraints.min_length || '',
			max_length: formData.constraints.max_length || '',
			pattern: formData.constraints.pattern || ''
		};
		
		showEditModal = true;
	}

	function addOption() {
		if (newOption && !formData.options.includes(newOption)) {
			formData.options = [...formData.options, newOption];
			newOption = '';
		}
	}

	function removeOption(option) {
		formData.options = formData.options.filter(o => o !== option);
	}

	async function saveVariable() {
		// Build constraints object
		const finalConstraints = {};
		if (constraints.required) finalConstraints.required = true;
		if (constraints.min !== '') finalConstraints.min = parseFloat(constraints.min);
		if (constraints.max !== '') finalConstraints.max = parseFloat(constraints.max);
		if (constraints.min_length !== '') finalConstraints.min_length = parseInt(constraints.min_length);
		if (constraints.max_length !== '') finalConstraints.max_length = parseInt(constraints.max_length);
		if (constraints.pattern) finalConstraints.pattern = constraints.pattern;

		const data = {
			...formData,
			constraints: finalConstraints
		};

		// Clean up empty fields
		if (!data.formula) delete data.formula;
		if (!data.category) delete data.category;
		if (data.value_type !== 'select') delete data.options;

		try {
			const url = showEditModal 
				? `/api/products/variables/${editingVariable.id}`
				: '/api/products/variables';
			
			const method = showEditModal ? 'PUT' : 'POST';
			
			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});

			if (!response.ok) throw new Error('Failed to save variable');

			await loadVariables();
			showCreateModal = false;
			showEditModal = false;
			resetForm();
		} catch (err) {
			alert('Error saving variable: ' + err.message);
		}
	}

	async function deleteVariable(variable) {
		if (!confirm(`Are you sure you want to delete the variable "${variable.display_name || variable.name}"?`)) {
			return;
		}

		try {
			const response = await fetch(`/api/products/variables/${variable.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) throw new Error('Failed to delete variable');

			await loadVariables();
		} catch (err) {
			alert('Error deleting variable: ' + err.message);
		}
	}

	function getTypeColor(type) {
		switch (type) {
			case 'user_input': return 'badge-info';
			case 'seller_input': return 'badge-primary';
			case 'calculated': return 'badge-warning';
			case 'system': return 'badge-secondary';
			default: return 'badge-ghost';
		}
	}

	function getValueTypeIcon(valueType) {
		switch (valueType) {
			case 'number': return '#';
			case 'string': return 'Aa';
			case 'boolean': return '✓';
			case 'date': return '📅';
			case 'select': return '▼';
			default: return '?';
		}
	}

	function getSourceTypeLabel(sourceType) {
		switch (sourceType) {
			case 'global': return 'Global Variables';
			case 'system': return 'System Variables';
			case 'entity': return 'Entity Variables';
			case 'product': return 'Product Variables';
			default: return 'Other Variables';
		}
	}

	$: {
		searchQuery;
		selectedSourceType;
		selectedType;
		filterVariables();
	}
</script>

<div class="container mx-auto p-6">
	<div class="flex justify-between items-center mb-6">
		<div>
			<h1 class="text-3xl font-bold">Variables Management</h1>
			<p class="text-base-content/60 mt-2">
				Manage all pricing variables across the system
			</p>
		</div>
		<button 
			class="btn btn-primary" 
			on:click={openCreateModal}
		>
			<Plus class="w-4 h-4 mr-2" />
			Create Variable
		</button>
	</div>

	<!-- Filters -->
	<div class="card bg-base-200 p-4 mb-6">
		<div class="flex flex-wrap gap-4">
			<!-- Search -->
			<div class="form-control flex-1 min-w-[200px]">
				<div class="relative">
					<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/60" />
					<input
						type="text"
						placeholder="Search variables..."
						class="input input-bordered w-full pl-10"
						bind:value={searchQuery}
					/>
				</div>
			</div>

			<!-- Source Type Filter -->
			<div class="form-control">
				<select class="select select-bordered" bind:value={selectedSourceType}>
					<option value="all">All Sources</option>
					<option value="global">Global</option>
					<option value="system">System</option>
					<option value="entity">Entity</option>
					<option value="product">Product</option>
				</select>
			</div>

			<!-- Type Filter -->
			<div class="form-control">
				<select class="select select-bordered" bind:value={selectedType}>
					<option value="all">All Types</option>
					<option value="user_input">User Input</option>
					<option value="seller_input">Seller Input</option>
					<option value="calculated">Calculated</option>
					<option value="system">System</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Variables List -->
	{#if loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if error}
		<div class="alert alert-error">
			<AlertCircle class="w-4 h-4" />
			<span>{error}</span>
		</div>
	{:else if Object.keys(filteredVariables).length === 0}
		<div class="card bg-base-200 p-12 text-center">
			<p class="text-base-content/60">No variables found</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each Object.entries(filteredVariables) as [sourceType, groupVariables]}
				<div class="card bg-base-200">
					<!-- Group Header -->
					<div 
						class="card-body cursor-pointer"
						on:click={() => toggleGroup(sourceType)}
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								{#if expandedGroups.has(sourceType)}
									<ChevronUp class="w-5 h-5" />
								{:else}
									<ChevronDown class="w-5 h-5" />
								{/if}
								<h3 class="text-lg font-semibold">
									{getSourceTypeLabel(sourceType)}
								</h3>
								<span class="badge badge-ghost">
									{groupVariables.length}
								</span>
							</div>
						</div>
					</div>

					<!-- Group Variables -->
					{#if expandedGroups.has(sourceType)}
						<div class="px-6 pb-4">
							<div class="overflow-x-auto">
								<table class="table">
									<thead>
										<tr>
											<th>Name</th>
											<th>Display Name</th>
											<th>Type</th>
											<th>Value Type</th>
											<th>Status</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{#each groupVariables as variable}
											<tr>
												<td>
													<code class="text-sm">{variable.name}</code>
													{#if variable.source_id}
														<span class="text-xs text-base-content/60 ml-2">
															(#{variable.source_id})
														</span>
													{/if}
												</td>
												<td>{variable.display_name || '-'}</td>
												<td>
													<span class="badge {getTypeColor(variable.type)} badge-sm">
														{variable.type}
													</span>
												</td>
												<td>
													<div class="flex items-center gap-2">
														<span class="text-xs font-bold">
															{getValueTypeIcon(variable.value_type)}
														</span>
														<span class="text-sm">{variable.value_type}</span>
													</div>
												</td>
												<td>
													{#if variable.is_active}
														<span class="badge badge-success badge-sm">Active</span>
													{:else}
														<span class="badge badge-ghost badge-sm">Inactive</span>
													{/if}
												</td>
												<td>
													<div class="flex gap-2">
														<button
															class="btn btn-ghost btn-sm"
															on:click={() => openEditModal(variable)}
															disabled={variable.source_type !== 'global' && variable.source_type !== 'system'}
														>
															<Edit2 class="w-4 h-4" />
														</button>
														<button
															class="btn btn-ghost btn-sm text-error"
															on:click={() => deleteVariable(variable)}
															disabled={variable.source_type !== 'global' && variable.source_type !== 'system'}
														>
															<Trash2 class="w-4 h-4" />
														</button>
													</div>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Create/Edit Modal -->
{#if showCreateModal || showEditModal}
	<div class="modal modal-open">
		<div class="modal-box max-w-3xl">
			<h3 class="font-bold text-lg mb-4">
				{showEditModal ? 'Edit Variable' : 'Create New Variable'}
			</h3>

			<div class="space-y-4">
				<!-- Basic Info -->
				<div class="grid grid-cols-2 gap-4">
					<div class="form-control">
						<label class="label">
							<span class="label-text">Variable Name</span>
						</label>
						<input
							type="text"
							class="input input-bordered"
							bind:value={formData.name}
							placeholder="e.g., quantity, discount_rate"
						/>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">Display Name</span>
						</label>
						<input
							type="text"
							class="input input-bordered"
							bind:value={formData.display_name}
							placeholder="e.g., Quantity, Discount Rate"
						/>
					</div>
				</div>

				<!-- Type Selection -->
				<div class="grid grid-cols-2 gap-4">
					<div class="form-control">
						<label class="label">
							<span class="label-text">Variable Type</span>
						</label>
						<select class="select select-bordered" bind:value={formData.type}>
							<option value="user_input">User Input</option>
							<option value="seller_input">Seller Input</option>
							<option value="calculated">Calculated</option>
							<option value="system">System</option>
						</select>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">Value Type</span>
						</label>
						<select class="select select-bordered" bind:value={formData.value_type}>
							<option value="string">String</option>
							<option value="number">Number</option>
							<option value="boolean">Boolean</option>
							<option value="date">Date</option>
							<option value="select">Select (Dropdown)</option>
						</select>
					</div>
				</div>

				<!-- Source -->
				<div class="grid grid-cols-2 gap-4">
					<div class="form-control">
						<label class="label">
							<span class="label-text">Source Type</span>
						</label>
						<select class="select select-bordered" bind:value={formData.source_type}>
							<option value="global">Global</option>
							<option value="system">System</option>
							<option value="entity" disabled>Entity (Auto-created)</option>
							<option value="product" disabled>Product (Auto-created)</option>
						</select>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">Category</span>
						</label>
						<input
							type="text"
							class="input input-bordered"
							bind:value={formData.category}
							placeholder="e.g., pricing, shipping"
						/>
					</div>
				</div>

				<!-- Description -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Description</span>
					</label>
					<textarea
						class="textarea textarea-bordered"
						bind:value={formData.description}
						placeholder="Describe what this variable represents..."
						rows="2"
					></textarea>
				</div>

				<!-- Formula (for calculated variables) -->
				{#if formData.type === 'calculated'}
					<div class="form-control">
						<label class="label">
							<span class="label-text">Formula</span>
						</label>
						<textarea
							class="textarea textarea-bordered font-mono"
							bind:value={formData.formula}
							placeholder="e.g., quantity * unit_price * (1 - discount_rate)"
							rows="3"
						></textarea>
					</div>
				{/if}

				<!-- Options (for select type) -->
				{#if formData.value_type === 'select'}
					<div class="form-control">
						<label class="label">
							<span class="label-text">Options</span>
						</label>
						<div class="flex gap-2 mb-2">
							<input
								type="text"
								class="input input-bordered flex-1"
								bind:value={newOption}
								placeholder="Add option..."
								on:keydown={(e) => e.key === 'Enter' && addOption()}
							/>
							<button 
								class="btn btn-primary"
								on:click={addOption}
							>
								Add
							</button>
						</div>
						<div class="flex flex-wrap gap-2">
							{#each formData.options as option}
								<span class="badge badge-lg gap-2">
									{option}
									<button on:click={() => removeOption(option)}>
										<X class="w-3 h-3" />
									</button>
								</span>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Constraints -->
				<div class="divider">Constraints</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-3">
						<input
							type="checkbox"
							class="checkbox"
							bind:checked={constraints.required}
						/>
						<span class="label-text">Required</span>
					</label>
				</div>

				{#if formData.value_type === 'number'}
					<div class="grid grid-cols-2 gap-4">
						<div class="form-control">
							<label class="label">
								<span class="label-text">Minimum Value</span>
							</label>
							<input
								type="number"
								class="input input-bordered"
								bind:value={constraints.min}
								placeholder="e.g., 0"
							/>
						</div>
						<div class="form-control">
							<label class="label">
								<span class="label-text">Maximum Value</span>
							</label>
							<input
								type="number"
								class="input input-bordered"
								bind:value={constraints.max}
								placeholder="e.g., 1000"
							/>
						</div>
					</div>
				{/if}

				{#if formData.value_type === 'string'}
					<div class="grid grid-cols-2 gap-4">
						<div class="form-control">
							<label class="label">
								<span class="label-text">Min Length</span>
							</label>
							<input
								type="number"
								class="input input-bordered"
								bind:value={constraints.min_length}
								placeholder="e.g., 3"
							/>
						</div>
						<div class="form-control">
							<label class="label">
								<span class="label-text">Max Length</span>
							</label>
							<input
								type="number"
								class="input input-bordered"
								bind:value={constraints.max_length}
								placeholder="e.g., 255"
							/>
						</div>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text">Pattern (Regex)</span>
						</label>
						<input
							type="text"
							class="input input-bordered font-mono"
							bind:value={constraints.pattern}
							placeholder="e.g., ^[A-Z][0-9]+$"
						/>
					</div>
				{/if}

				<!-- Default Value -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Default Value</span>
					</label>
					{#if formData.value_type === 'boolean'}
						<select class="select select-bordered" bind:value={formData.default_value}>
							<option value="">No default</option>
							<option value={true}>True</option>
							<option value={false}>False</option>
						</select>
					{:else if formData.value_type === 'select'}
						<select class="select select-bordered" bind:value={formData.default_value}>
							<option value="">No default</option>
							{#each formData.options as option}
								<option value={option}>{option}</option>
							{/each}
						</select>
					{:else if formData.value_type === 'number'}
						<input
							type="number"
							class="input input-bordered"
							bind:value={formData.default_value}
							placeholder="Enter default value..."
						/>
					{:else}
						<input
							type="text"
							class="input input-bordered"
							bind:value={formData.default_value}
							placeholder="Enter default value..."
						/>
					{/if}
				</div>

				<!-- Active Status -->
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-3">
						<input
							type="checkbox"
							class="checkbox"
							bind:checked={formData.is_active}
						/>
						<span class="label-text">Active</span>
					</label>
				</div>
			</div>

			<div class="modal-action">
				<button 
					class="btn btn-ghost" 
					on:click={() => {
						showCreateModal = false;
						showEditModal = false;
						resetForm();
					}}
				>
					Cancel
				</button>
				<button 
					class="btn btn-primary" 
					on:click={saveVariable}
				>
					{showEditModal ? 'Update' : 'Create'} Variable
				</button>
			</div>
		</div>
		<div class="modal-backdrop" on:click={() => {
			showCreateModal = false;
			showEditModal = false;
			resetForm();
		}}></div>
	</div>
{/if}
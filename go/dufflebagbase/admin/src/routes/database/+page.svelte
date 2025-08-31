<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		Database, Search, ChevronDown, 
		RefreshCw, Download, Upload,
		Table, Code, ChevronLeft, ChevronRight,
		Server, AlertCircle, CheckCircle
	} from 'lucide-svelte';
	import { api } from '$lib/api';
	
	let selectedTable = '';
	let activeTab = 'table';
	let searchQuery = '';
	let currentPage = 1;
	let totalPages = 1;
	let rowsPerPage = 25;
	let loading = false;
	let dbType = 'SQLite'; // Default to SQLite
	let dbVersion = '';
	let dbSize = '';
	
	// Real data from API
	let tableData: any[] = [];
	
	let tables: any[] = [];
	let tableColumns: any[] = [];
	
	let sqlQuery = `-- Example: Get all active users
SELECT * FROM auth_users
WHERE confirmed = true
ORDER BY created_at DESC
LIMIT 10;`;
	
	let sqlResults: any[] = [];
	let sqlError = '';
	let sqlExecuting = false;
	let queryExecutionTime = 0;
	
	async function handleTableChange(e: Event) {
		selectedTable = (e.target as HTMLSelectElement).value;
		currentPage = 1;
		await loadTableData();
	}
	
	async function loadTables() {
		loading = true;
		try {
			const response = await api.get('/database/tables');
			// Ensure tables is always an array
			if (Array.isArray(response)) {
				tables = response;
			} else if (response && typeof response === 'object') {
				// If response is wrapped in an object, try to extract the array
				tables = response.data || response.tables || [];
			} else {
				tables = [];
			}
			
			// Select first table if available
			if (tables.length > 0 && !selectedTable) {
				selectedTable = tables[0].name;
				await loadTableData();
			}
		} catch (error) {
			console.error('Failed to load tables:', error);
			tables = []; // Ensure tables is always an array even on error
		} finally {
			loading = false;
		}
	}
	
	async function loadTableData() {
		if (!selectedTable) return;
		
		loading = true;
		try {
			// Get table columns
			const columns = await api.get(`/database/tables/${selectedTable}/columns`);
			tableColumns = columns || [];
			
			// Execute a SELECT query to get data
			const query = `SELECT * FROM ${selectedTable} LIMIT ${rowsPerPage} OFFSET ${(currentPage - 1) * rowsPerPage}`;
			const result = await api.post('/database/query', { query });
			
			if (result.rows && result.columns) {
				// Transform rows array to objects
				tableData = result.rows.map((row: any[]) => {
					const obj: any = {};
					result.columns.forEach((col: string, index: number) => {
						obj[col] = row[index];
					});
					return obj;
				});
			}
		} catch (error) {
			console.error('Failed to load table data:', error);
			tableData = [];
		} finally {
			loading = false;
		}
	}
	
	async function runQuery() {
		sqlError = '';
		sqlResults = [];
		sqlExecuting = true;
		
		try {
			const startTime = Date.now();
			const result = await api.post('/database/query', { query: sqlQuery });
			queryExecutionTime = Date.now() - startTime;
			
			if (result.error) {
				sqlError = result.error;
			} else if (result.rows && result.columns) {
				// Transform rows array to objects for display
				sqlResults = result.rows.map((row: any[]) => {
					const obj: any = {};
					result.columns.forEach((col: string, index: number) => {
						obj[col] = row[index];
					});
					return obj;
				});
			} else if (result.affected_rows !== undefined) {
				// For INSERT/UPDATE/DELETE queries
				sqlResults = [{
					message: `Query executed successfully. ${result.affected_rows} row(s) affected.`
				}];
			}
		} catch (error: any) {
			sqlError = error.message || 'Query execution failed';
		} finally {
			sqlExecuting = false;
		}
	}
	
	function exportData() {
		// Export functionality
		console.log('Exporting data...');
	}
	
	function importData() {
		// Import functionality
		console.log('Importing data...');
	}
	
	async function refreshData() {
		if (selectedTable) {
			await loadTableData();
		} else {
			await loadTables();
		}
	}
	
	async function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
			await loadTableData();
		}
	}
	
	async function getDatabaseInfo() {
		try {
			// Get database info from the server
			const info = await api.get('/database/info');
			if (info) {
				dbType = info.type || 'SQLite';
				dbVersion = info.version || '3.x';
			}
		} catch (error) {
			console.error('Failed to get database info:', error);
			// Default to SQLite on error
			dbType = 'SQLite';
			dbVersion = '3.x';
		}
	}
	
	onMount(async () => {
		// Load tables first, then determine database type from response
		await loadTables();
		await getDatabaseInfo();
	});
</script>

<div class="page-header">
	<div class="breadcrumb">
		<a href="/">Home</a>
		<span class="breadcrumb-separator">›</span>
		<span>Database</span>
	</div>
</div>

<div class="page-content">
	<!-- Database Info Bar -->
	<div class="database-info-bar">
		<div class="database-info-item">
			<Server size={16} />
			<span class="database-info-label">Database:</span>
			<span class="database-info-value">{dbType}</span>
		</div>
		{#if dbVersion}
			<div class="database-info-item">
				<span class="database-info-label">Version:</span>
				<span class="database-info-value">{dbVersion}</span>
			</div>
		{/if}
		<div class="database-info-item">
			<span class="database-info-label">Tables:</span>
			<span class="database-info-value">{tables.length}</span>
		</div>
		{#if dbSize}
			<div class="database-info-item">
				<span class="database-info-label">Size:</span>
				<span class="database-info-value">{dbSize}</span>
			</div>
		{/if}
	</div>
	
	<!-- Header Controls -->
	<div class="database-header">
		<div class="database-selector">
			<Database size={20} style="color: var(--text-muted)" />
			<select 
				class="table-select"
				value={selectedTable}
				on:change={handleTableChange}
				disabled={loading || tables.length === 0}
			>
				{#if tables.length === 0}
					<option value="">No tables available</option>
				{/if}
				{#each tables as table}
					<option value={table.name}>
						{table.schema ? `${table.schema}.${table.name}` : table.name}
						{#if table.rows_count !== undefined}
							({table.rows_count})
						{/if}
					</option>
				{/each}
			</select>
		</div>
		
		<div class="database-actions">
			<button class="btn btn-secondary btn-sm" on:click={refreshData}>
				<RefreshCw size={16} />
				Refresh
			</button>
			<button class="btn btn-secondary btn-sm" on:click={exportData}>
				<Download size={16} />
				Export
			</button>
			<button class="btn btn-secondary btn-sm" on:click={importData}>
				<Upload size={16} />
				Import
			</button>
		</div>
	</div>
	
	<!-- Tabs -->
	<div class="tabs">
		<button 
			class="tab {activeTab === 'table' ? 'active' : ''}"
			on:click={() => activeTab = 'table'}
		>
			<Table size={16} />
			Table Editor
		</button>
		<button 
			class="tab {activeTab === 'sql' ? 'active' : ''}"
			on:click={() => activeTab = 'sql'}
		>
			<Code size={16} />
			SQL Editor
		</button>
	</div>
	
	<!-- Tab Content -->
	{#if activeTab === 'table'}
		<!-- Table View -->
		<div class="card">
			<!-- Search Bar -->
			<div class="table-toolbar">
				<div class="search-input">
					<Search size={16} class="search-input-icon" />
					<input 
						type="text" 
						class="form-input" 
						placeholder="Search in table..."
						bind:value={searchQuery}
					/>
				</div>
				<div class="table-info">
					Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, tables.find(t => t.value === selectedTable)?.count || 0)} of {tables.find(t => t.value === selectedTable)?.count || 0} rows
				</div>
			</div>
			
			<!-- Data Table -->
			<div class="table-container">
				{#if loading}
					<div class="loading-container">
						<RefreshCw size={24} class="spin" />
						<p>Loading table data...</p>
					</div>
				{:else if tableData.length > 0}
					<table class="table">
						<thead>
							<tr>
								{#each Object.keys(tableData[0]) as column}
									<th>{column}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each tableData as row}
								<tr>
									{#each Object.entries(row) as [key, value]}
										<td>
											{#if value === null}
												<span class="null-value">NULL</span>
											{:else if typeof value === 'boolean'}
												<span class="badge {value ? 'badge-success' : 'badge-warning'}">
													{value ? 'true' : 'false'}
												</span>
											{:else if typeof value === 'object'}
												<span class="mono">{JSON.stringify(value)}</span>
											{:else}
												{value}
											{/if}
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				{:else}
					<div class="empty-state">
						<Database size={48} style="color: var(--text-muted)" />
						<p>No data available in this table</p>
					</div>
				{/if}
			</div>
			
			<!-- Pagination -->
			<div class="pagination">
				<div class="pagination-info">
					Page {currentPage} of {totalPages}
				</div>
				<div class="pagination-controls">
					<button 
						class="pagination-btn"
						disabled={currentPage === 1}
						on:click={() => goToPage(currentPage - 1)}
					>
						<ChevronLeft size={16} />
					</button>
					{#each Array(Math.min(5, totalPages)) as _, i}
						<button 
							class="pagination-btn {currentPage === i + 1 ? 'active' : ''}"
							on:click={() => goToPage(i + 1)}
						>
							{i + 1}
						</button>
					{/each}
					{#if totalPages > 5}
						<span class="pagination-ellipsis">...</span>
						<button 
							class="pagination-btn"
							on:click={() => goToPage(totalPages)}
						>
							{totalPages}
						</button>
					{/if}
					<button 
						class="pagination-btn"
						disabled={currentPage === totalPages}
						on:click={() => goToPage(currentPage + 1)}
					>
						<ChevronRight size={16} />
					</button>
				</div>
			</div>
		</div>
	{:else}
		<!-- SQL Editor -->
		<div class="card">
			<div class="sql-editor-container">
				<div class="sql-editor-header">
					<div>
						<h3 class="sql-editor-title">SQL Query Editor</h3>
						<p class="sql-editor-subtitle">Execute raw SQL queries on your {dbType} database</p>
					</div>
					<button 
						class="btn btn-primary btn-sm" 
						on:click={runQuery}
						disabled={sqlExecuting || !sqlQuery.trim()}
					>
						{#if sqlExecuting}
							<RefreshCw size={16} class="spin" />
							Executing...
						{:else}
							Run Query
						{/if}
					</button>
				</div>
				
				<textarea 
					class="sql-editor"
					bind:value={sqlQuery}
					placeholder="Enter your SQL query here..."
					disabled={sqlExecuting}
				/>
				
				{#if queryExecutionTime > 0 && !sqlError}
					<div class="sql-success">
						<CheckCircle size={16} />
						Query executed successfully in {queryExecutionTime}ms
					</div>
				{/if}
				
				{#if sqlError}
					<div class="sql-error">
						<AlertCircle size={16} />
						<strong>Error:</strong> {sqlError}
					</div>
				{/if}
				
				{#if sqlResults.length > 0}
					<div class="sql-results">
						<h4 class="sql-results-title">
							Results ({sqlResults.length} row{sqlResults.length !== 1 ? 's' : ''})
						</h4>
						<div class="table-container">
							<table class="table">
								<thead>
									<tr>
										{#each Object.keys(sqlResults[0]) as column}
											<th>{column}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each sqlResults as row}
										<tr>
											{#each Object.values(row) as value}
												<td>
													{#if typeof value === 'boolean'}
														<span class="badge {value ? 'badge-success' : 'badge-warning'}">
															{value ? 'true' : 'false'}
														</span>
													{:else}
														{value}
													{/if}
												</td>
											{/each}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.database-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
	}
	
	.database-selector {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	
	.table-select {
		padding: 0.5rem 2rem 0.5rem 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		background: white;
		font-size: 0.875rem;
		min-width: 200px;
		cursor: pointer;
	}
	
	.database-actions {
		display: flex;
		gap: 0.5rem;
	}
	
	.table-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}
	
	.table-info {
		font-size: 0.875rem;
		color: var(--text-secondary);
	}
	
	.mono {
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
	}
	
	.text-muted {
		color: var(--text-muted);
		font-size: 0.875rem;
	}
	
	.sql-editor-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.sql-editor-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	
	.sql-editor-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
	}
	
	.sql-editor {
		width: 100%;
		min-height: 200px;
		padding: 1rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
		resize: vertical;
		background: #f8fafc;
	}
	
	.sql-editor:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
	}
	
	.sql-error {
		padding: 1rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 6px;
		color: #dc2626;
		font-size: 0.875rem;
	}
	
	.sql-results {
		margin-top: 1.5rem;
	}
	
	.sql-results-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 1rem;
	}
	
	.pagination-ellipsis {
		padding: 0 0.5rem;
		color: var(--text-muted);
	}
	
	.tab {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.database-info-bar {
		display: flex;
		align-items: center;
		gap: 2rem;
		padding: 1rem;
		background: var(--bg-secondary);
		border-radius: 8px;
		margin-bottom: 1.5rem;
		border: 1px solid var(--border-color);
	}
	
	.database-info-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}
	
	.database-info-label {
		color: var(--text-muted);
	}
	
	.database-info-value {
		color: var(--text-primary);
		font-weight: 500;
	}
	
	.sql-editor-subtitle {
		font-size: 0.813rem;
		color: var(--text-muted);
		margin-top: 0.25rem;
	}
	
	.sql-success {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: #10b98119;
		border: 1px solid #10b981;
		border-radius: 6px;
		color: var(--success-color);
		font-size: 0.875rem;
	}
	
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		color: var(--text-muted);
		gap: 1rem;
	}
	
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		color: var(--text-muted);
		gap: 1rem;
	}
	
	.null-value {
		color: var(--text-muted);
		font-style: italic;
		font-size: 0.813rem;
	}
	
	.spin {
		animation: spin 1s linear infinite;
	}
	
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
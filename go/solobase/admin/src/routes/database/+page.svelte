<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		Database, Search, ChevronDown, 
		RefreshCw, Download, Upload,
		Table, Code, ChevronLeft, ChevronRight,
		Server, AlertCircle, CheckCircle
	} from 'lucide-svelte';
	import { api } from '$lib/api';
	import ExportButton from '$lib/components/ExportButton.svelte';
	
	let selectedTable = '';
	let activeTab = 'table';
	let searchQuery = '';
	let currentPage = 1;
	let totalPages = 1;
	let totalRows = 0;
	let rowsPerPage = 25;
	let loading = false;
	let dbType = 'SQLite'; // Default to SQLite
	let dbVersion = '';
	let dbSize = '';
	
	// Real data from API
	let tableData: any[] = [];
	
	let tables: any[] = [];
	let tableColumns: any[] = [];
	
	let sqlQuery = `SELECT * FROM users ORDER BY created_at DESC LIMIT 10;`;
	let sqlResults: any[] = [];
	let sqlError = '';
	let sqlExecuting = false;
	let queryExecutionTime = 0;
	let affectedRows = 0;
	
	async function handleTableChange(e: Event) {
		selectedTable = (e.target as HTMLSelectElement).value;
		currentPage = 1;
		totalRows = 0; // Reset total rows when changing tables
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
			
			// Select users table by default if available, otherwise first table
			if (tables.length > 0 && !selectedTable) {
				// Try to find the users table
				const usersTable = tables.find(t => 
					t.name === 'users' || 
					t.name === 'auth_users' || 
					t.value === 'users' || 
					t.value === 'auth_users'
				);
				
				if (usersTable) {
					selectedTable = usersTable.name || usersTable.value;
				} else {
					// Fallback to first table if users table not found
					selectedTable = tables[0].name || tables[0].value;
				}
				
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
		// Clear old data immediately when loading new table
		tableData = [];
		tableColumns = [];
		
		try {
			// Get table columns
			const columns = await api.get(`/database/tables/${selectedTable}/columns`);
			tableColumns = columns || [];
			
			// Get total count of rows
			const countQuery = `SELECT COUNT(*) as count FROM ${selectedTable}`;
			const countResult = await api.post('/database/query', { query: countQuery });
			if (countResult.rows && countResult.rows[0]) {
				totalRows = countResult.rows[0][0] || 0;
				totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
			} else {
				totalRows = 0;
				totalPages = 1;
			}
			
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
			} else {
				// Ensure tableData is empty if no rows returned
				tableData = [];
			}
		} catch (error) {
			console.error('Failed to load table data:', error);
			tableData = [];
			tableColumns = [];
		} finally {
			loading = false;
		}
	}
	
	async function runQuery() {
		sqlError = '';
		sqlResults = [];
		affectedRows = 0;
		sqlExecuting = true;
		
		try {
			const startTime = Date.now();
			const result = await api.post('/database/query', { query: sqlQuery });
			queryExecutionTime = Date.now() - startTime;
			
			// The api.post method already extracts data, so result is the actual data
			if (!result) {
				sqlError = 'No response from server';
			} else if (result.error) {
				sqlError = result.error;
			} else if (result.rows !== undefined && result.columns !== undefined) {
				// Transform rows array to objects for display
				if (Array.isArray(result.rows) && Array.isArray(result.columns)) {
					sqlResults = result.rows.map((row: any[]) => {
						const obj: any = {};
						result.columns.forEach((col: string, index: number) => {
							obj[col] = row[index];
						});
						return obj;
					});
				}
			} else if (result.affected_rows !== undefined) {
				// For INSERT/UPDATE/DELETE queries
				affectedRows = result.affected_rows;
				sqlResults = [];
			} else {
				// Check if it's already formatted data (array of objects)
				if (Array.isArray(result)) {
					sqlResults = result;
				} else if (typeof result === 'object') {
					// Try to extract any array from the result
					const possibleArrays = Object.values(result).filter(v => Array.isArray(v));
					if (possibleArrays.length > 0) {
						sqlResults = possibleArrays[0] as any[];
					}
				}
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
				<div class="toolbar-left">
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
						<button 
							class="btn-icon"
							on:click={refreshData}
							disabled={loading}
							title="Refresh table data"
						>
							<RefreshCw size={16} class={loading ? 'spin' : ''} />
						</button>
					</div>
					<div class="search-input">
						<Search size={16} class="search-input-icon" />
						<input 
							type="text" 
							class="form-input" 
							placeholder="Search in table..."
							bind:value={searchQuery}
						/>
					</div>
					<ExportButton 
						data={tableData}
						filename={selectedTable || 'table_data'}
						disabled={tableData.length === 0}
					/>
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
										<td title={value !== null ? String(value) : 'NULL'}>
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
					{#if totalRows > 0}
						Showing {Math.min((currentPage - 1) * rowsPerPage + 1, totalRows)} to {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} rows • Page {currentPage} of {totalPages}
					{:else}
						No rows to display
					{/if}
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
		</div>
	{:else}
		<!-- SQL Editor -->
		<div class="card">
			<div class="sql-editor-container">
				<div class="sql-editor-header">
					<div>
						<h3 class="sql-editor-title">SQL Query Editor</h3>
						<p class="sql-editor-subtitle">Execute raw SQL queries on your {dbType} database • Press Ctrl+Enter to run</p>
					</div>
					<button 
						class="btn btn-primary btn-sm" 
						on:click={runQuery}
						disabled={sqlExecuting || !sqlQuery.trim()}
						title="Run Query (Ctrl+Enter)"
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
					spellcheck="false"
					autocomplete="off"
					autocorrect="off"
					autocapitalize="off"
					on:keydown={(e) => {
						// Ctrl/Cmd + Enter to run query
						if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
							e.preventDefault();
							if (!sqlExecuting && sqlQuery.trim()) {
								runQuery();
							}
						}
						// Tab for indentation
						if (e.key === 'Tab') {
							e.preventDefault();
							const start = e.currentTarget.selectionStart;
							const end = e.currentTarget.selectionEnd;
							const newValue = sqlQuery.substring(0, start) + '  ' + sqlQuery.substring(end);
							sqlQuery = newValue;
							// Restore cursor position after update
							setTimeout(() => {
								e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
							}, 0);
						}
					}}
				/>
				
				{#if queryExecutionTime > 0 && !sqlError}
					<div class="sql-success">
						<CheckCircle size={16} />
						{#if affectedRows > 0}
							Query executed successfully. {affectedRows} row(s) affected. ({queryExecutionTime}ms)
						{:else if sqlResults.length > 0}
							Query executed successfully in {queryExecutionTime}ms - {sqlResults.length} row(s) returned
						{:else}
							Query executed successfully in {queryExecutionTime}ms - No rows returned
						{/if}
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
						<div class="sql-results-header">
							<h4 class="sql-results-title">
								Results ({sqlResults.length} row{sqlResults.length !== 1 ? 's' : ''})
							</h4>
							<ExportButton 
								data={sqlResults}
								filename="query_results"
								disabled={sqlResults.length === 0}
							/>
						</div>
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
												<td title={value !== null ? String(value) : 'NULL'}>
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
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.database-selector {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.btn-icon {
		padding: 0.5rem;
		border: 1px solid var(--border-color);
		background: white;
		color: var(--text-secondary);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.btn-icon:hover:not(:disabled) {
		background: var(--bg-hover);
		color: var(--text-primary);
	}
	
	.btn-icon:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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
	
	
	.table-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}
	
	.toolbar-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	
	.sql-results-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
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
		user-select: text !important;
		-webkit-user-select: text !important;
		-moz-user-select: text !important;
		-ms-user-select: text !important;
		cursor: text;
		white-space: pre-wrap;
		word-wrap: break-word;
		line-height: 1.5;
	}
	
	.sql-editor::selection {
		background: rgba(24, 154, 180, 0.3);
		color: inherit;
	}
	
	.sql-editor::-moz-selection {
		background: rgba(24, 154, 180, 0.3);
		color: inherit;
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
		padding: 1rem 0 0 0;
		font-size: 0.813rem;
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
	
	/* Table formatting to prevent wrapping */
	.table td, .table th {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 200px;
		position: relative;
	}
	
	.table td:hover {
		overflow: visible;
		z-index: 10;
	}
	
	.table td:hover::after {
		content: attr(title);
		position: absolute;
		left: 0;
		top: 100%;
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		white-space: normal;
		word-break: break-word;
		max-width: 300px;
		z-index: 1000;
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
	
	/* Mobile Responsive Styles */
	@media (max-width: 767px) {
		.database-selector {
			flex-wrap: wrap;
			width: 100%;
		}
		
		.table-select {
			flex: 1;
			min-width: unset;
		}
		
		.database-info-bar {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}
		
		.tabs {
			width: 100%;
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
		}
		
		.table-toolbar {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}
		
		.table-container {
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
		}
		
		.table {
			min-width: 600px;
		}
		
		.pagination {
			flex-direction: column;
			gap: 1rem;
		}
		
		.pagination-controls {
			width: 100%;
			justify-content: center;
		}
		
		.sql-editor-header {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}
		
		.sql-editor-header button {
			width: 100%;
		}
		
		.sql-editor {
			font-size: 0.75rem;
		}
	}
	
	/* Tablet Styles */
	@media (min-width: 768px) and (max-width: 1023px) {
		
		.table-container {
			overflow-x: auto;
		}
		
		.database-info-bar {
			flex-wrap: wrap;
		}
	}
	
	/* Ensure horizontal scroll indicators on mobile */
	@media (max-width: 767px) {
		.table-container::-webkit-scrollbar {
			height: 8px;
		}
		
		.table-container::-webkit-scrollbar-track {
			background: #f1f1f1;
		}
		
		.table-container::-webkit-scrollbar-thumb {
			background: #888;
			border-radius: 4px;
		}
	}
</style>
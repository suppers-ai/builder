<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		Users, Search, Plus, Edit2, Trash2, 
		Lock, Unlock, Mail, MoreVertical,
		ChevronLeft, ChevronRight, Filter,
		UserPlus, Shield, Check, X
	} from 'lucide-svelte';
	import { api } from '$lib/api';
	
	let searchQuery = '';
	let selectedRole = 'all';
	let selectedStatus = 'all';
	let showAddModal = false;
	let showEditModal = false;
	let showDeleteModal = false;
	let showLockModal = false;
	let selectedUser: any = null;
	let currentPage = 1;
	let totalPages = 1;
	let rowsPerPage = 10;
	let totalUsers = 0;
	let loading = false;
	let resendingConfirmation = false;
	
	// Form data
	let newUser = {
		email: '',
		password: '',
		role: 'user',
		confirmed: true
	};
	
	// Users data
	let users: any[] = [];
	
	onMount(() => {
		fetchUsers();
	});
	
	async function fetchUsers() {
		loading = true;
		try {
			const response = await api.get(`/users?page=${currentPage}&page_size=${rowsPerPage}`);
			users = response.data || [];
			totalUsers = response.total || 0;
			totalPages = response.total_pages || Math.ceil(totalUsers / rowsPerPage);
			
			// Format dates for display
			users = users.map(user => ({
				...user,
				created_at: formatDate(user.created_at),
				last_login: user.last_login ? formatDate(user.last_login) : 'Never',
				locked: false // Backend doesn't have locked field yet
			}));
		} catch (error) {
			console.error('Failed to fetch users:', error);
		} finally {
			loading = false;
		}
	}
	
	function formatDate(dateString: string): string {
		if (!dateString) return 'N/A';
		const date = new Date(dateString);
		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
	
	// Stats (computed from users)
	$: activeUsers = users.filter(u => u.confirmed && !u.locked).length;
	$: lockedUsers = users.filter(u => u.locked).length;
	$: unconfirmedUsers = users.filter(u => !u.confirmed).length;
	
	function openAddModal() {
		newUser = {
			email: '',
			password: '',
			role: 'user',
			confirmed: true
		};
		showAddModal = true;
	}
	
	function closeAddModal() {
		showAddModal = false;
	}
	
	function openEditModal(user: any) {
		selectedUser = { ...user };
		showEditModal = true;
	}
	
	function closeEditModal() {
		showEditModal = false;
		selectedUser = null;
	}
	
	function openDeleteModal(user: any) {
		selectedUser = user;
		showDeleteModal = true;
	}
	
	function closeDeleteModal() {
		showDeleteModal = false;
		selectedUser = null;
	}
	
	async function saveUser() {
		if (showAddModal) {
			// Add new user
			try {
				await api.post('/auth/signup', newUser);
				closeAddModal();
				fetchUsers();
			} catch (error) {
				console.error('Failed to create user:', error);
			}
		} else if (showEditModal) {
			// Update existing user
			try {
				await api.patch(`/users/${selectedUser.id}`, {
					email: selectedUser.email,
					role: selectedUser.role,
					confirmed: selectedUser.confirmed,
					locked: selectedUser.locked
				});
				closeEditModal();
				fetchUsers();
			} catch (error) {
				console.error('Failed to update user:', error);
			}
		}
	}
	
	async function deleteUser() {
		try {
			await api.delete(`/users/${selectedUser.id}`);
			closeDeleteModal();
			fetchUsers();
		} catch (error) {
			console.error('Failed to delete user:', error);
		}
	}
	
	function toggleUserLock(user: any) {
		user.locked = !user.locked;
		console.log(`${user.locked ? 'Locked' : 'Unlocked'} user:`, user.email);
	}
	
	async function resendConfirmation(user: any) {
		resendingConfirmation = true;
		try {
			// Call API to resend confirmation email
			await api.post(`/users/${user.id}/resend-confirmation`);
			console.log('Confirmation email sent to:', user.email);
			// You could add a success toast here
		} catch (error) {
			console.error('Failed to resend confirmation:', error);
		} finally {
			resendingConfirmation = false;
		}
	}
	
	function confirmToggleLock(user: any) {
		selectedUser = user;
		showLockModal = true;
	}
	
	function closeLockModal() {
		showLockModal = false;
		selectedUser = null;
	}
	
	async function toggleLock() {
		if (!selectedUser) return;
		
		try {
			const newLockedState = !selectedUser.locked;
			await api.patch(`/users/${selectedUser.id}`, {
				locked: newLockedState
			});
			
			// Update the local user object
			selectedUser.locked = newLockedState;
			
			// If we're in the edit modal, keep it open with updated state
			if (showEditModal) {
				// Just close the lock modal
				closeLockModal();
			} else {
				// Refresh the list
				fetchUsers();
				closeLockModal();
			}
		} catch (error) {
			console.error('Failed to toggle lock:', error);
		}
	}
	
	function goToPage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		fetchUsers();
	}
	
	function resetPassword(user: any) {
		console.log('Sending password reset to:', user.email);
	}
	
	function getRoleBadgeClass(role: string) {
		switch(role) {
			case 'admin': return 'badge-danger';
			case 'manager': return 'badge-warning';
			case 'deleted': return 'badge-secondary';
			default: return 'badge-primary';
		}
	}
</script>

<div class="page-header">
	<div class="breadcrumb">
		<a href="/">Home</a>
		<span class="breadcrumb-separator">›</span>
		<span>Users</span>
	</div>
</div>

<div class="page-content">
	<!-- Stats Cards -->
	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-header">
				<Users size={20} style="color: var(--text-muted)" />
			</div>
			<div class="stat-label">TOTAL USERS</div>
			<div class="stat-value">{totalUsers}</div>
			<div class="stat-description">All registered users</div>
		</div>
		
		<div class="stat-card">
			<div class="stat-header">
				<Check size={20} style="color: var(--success-color)" />
			</div>
			<div class="stat-label">ACTIVE USERS</div>
			<div class="stat-value" style="color: var(--success-color)">{activeUsers}</div>
			<div class="stat-description">Confirmed & unlocked</div>
		</div>
		
		<div class="stat-card">
			<div class="stat-header">
				<Lock size={20} style="color: var(--danger-color)" />
			</div>
			<div class="stat-label">LOCKED USERS</div>
			<div class="stat-value" style="color: var(--danger-color)">{lockedUsers}</div>
			<div class="stat-description">Account disabled</div>
		</div>
		
		<div class="stat-card">
			<div class="stat-header">
				<Mail size={20} style="color: var(--warning-color)" />
			</div>
			<div class="stat-label">UNCONFIRMED</div>
			<div class="stat-value" style="color: var(--warning-color)">{unconfirmedUsers}</div>
			<div class="stat-description">Pending email verification</div>
		</div>
	</div>
	
	<!-- Users Table -->
	<div class="card">
		<div class="users-header">
			<div class="users-filters">
				<div class="search-input" style="min-width: 300px;">
					<Search size={16} class="search-input-icon" />
					<input 
						type="text" 
						class="form-input" 
						placeholder="Search users..."
						bind:value={searchQuery}
					/>
				</div>
				
				<select class="form-select" bind:value={selectedRole}>
					<option value="all">All Roles</option>
					<option value="admin">Admin</option>
					<option value="manager">Manager</option>
					<option value="user">User</option>
				</select>
				
				<select class="form-select" bind:value={selectedStatus}>
					<option value="all">All Status</option>
					<option value="active">Active</option>
					<option value="locked">Locked</option>
					<option value="unconfirmed">Unconfirmed</option>
				</select>
			</div>
			
			<button class="btn btn-primary" on:click={openAddModal}>
				<UserPlus size={16} />
				Add User
			</button>
		</div>
		
		<div class="table-container">
			<table class="table">
				<thead>
					<tr>
						<th>Email</th>
						<th>Role</th>
						<th>Status</th>
						<th>Created</th>
						<th>Last Login</th>
						<th style="width: 100px;">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each users as user}
						<tr>
							<td>
								<div class="user-email">
									{user.email}
								</div>
							</td>
							<td>
								<span class="badge {getRoleBadgeClass(user.role)}">
									{#if user.role === 'admin'}
										<Shield size={12} />
									{/if}
									{user.role}
								</span>
							</td>
							<td>
								<div class="user-status">
									{#if user.locked}
										<span class="status-badge status-locked">
											<Lock size={12} />
											Locked
										</span>
									{:else if !user.confirmed}
										<span class="status-badge status-unconfirmed">
											<Mail size={12} />
											Unconfirmed
										</span>
									{:else}
										<span class="status-badge status-active">
											<Check size={12} />
											Active
										</span>
									{/if}
								</div>
							</td>
							<td class="text-muted">{user.created_at}</td>
							<td class="text-muted">{user.last_login || 'Never'}</td>
							<td>
								<div class="action-buttons">
									<button 
										class="btn-icon-sm"
										title="Edit user"
										on:click={() => openEditModal(user)}
									>
										<Edit2 size={14} />
									</button>
									<button 
										class="btn-icon-sm"
										title="{user.locked ? 'Unlock' : 'Lock'} user"
										on:click={() => toggleUserLock(user)}
									>
										{#if user.locked}
											<Unlock size={14} />
										{:else}
											<Lock size={14} />
										{/if}
									</button>
									<div class="dropdown">
										<button class="btn-icon-sm">
											<MoreVertical size={14} />
										</button>
										<div class="dropdown-menu">
											{#if !user.confirmed}
												<button on:click={() => resendConfirmation(user)}>
													<Mail size={14} />
													Resend Confirmation
												</button>
											{/if}
											<button on:click={() => resetPassword(user)}>
												<Lock size={14} />
												Reset Password
											</button>
											<button class="text-danger" on:click={() => openDeleteModal(user)}>
												<Trash2 size={14} />
												Delete User
											</button>
										</div>
									</div>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		
		<!-- Pagination -->
		<div class="pagination">
			<div class="pagination-info">
				Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, totalUsers)} of {totalUsers} users
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
</div>

<!-- Add/Edit User Modal -->
{#if showAddModal || showEditModal}
	<div class="modal-overlay" on:click={showAddModal ? closeAddModal : closeEditModal}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h3 class="modal-title">
					{showAddModal ? 'Add New User' : 'Edit User'}
				</h3>
				<button class="modal-close" on:click={showAddModal ? closeAddModal : closeEditModal}>
					<X size={20} />
				</button>
			</div>
			
			<div class="modal-body">
				{#if showAddModal}
					<div class="form-group">
						<label class="form-label">Email</label>
						<input 
							type="email" 
							class="form-input" 
							bind:value={newUser.email}
							placeholder="user@example.com"
						/>
					</div>
					
					<div class="form-group">
						<label class="form-label">Password</label>
						<input 
							type="password" 
							class="form-input" 
							bind:value={newUser.password}
							placeholder="Enter password"
						/>
					</div>
					
					<div class="form-group">
						<label class="form-label">Role</label>
						<select 
							class="form-select" 
							bind:value={newUser.role}
						>
							<option value="user">User</option>
							<option value="manager">Manager</option>
							<option value="admin">Admin</option>
						</select>
					</div>
					
					<div class="form-group">
						<label class="checkbox-label">
							<input 
								type="checkbox" 
								bind:checked={newUser.confirmed}
							/>
							Email Confirmed
						</label>
					</div>
				{:else if showEditModal && selectedUser}
					<div class="form-group">
						<label class="form-label">Email</label>
						<input 
							type="email" 
							class="form-input" 
							bind:value={selectedUser.email}
							placeholder="user@example.com"
						/>
					</div>
					
					<div class="form-group">
						<label class="form-label">Role</label>
						<select 
							class="form-select" 
							bind:value={selectedUser.role}
						>
							<option value="user">User</option>
							<option value="manager">Manager</option>
							<option value="admin">Admin</option>
							<option value="deleted">Deleted</option>
						</select>
					</div>
					
					<div class="form-group">
						<label class="form-label">Account Status</label>
						<div class="status-controls">
							<div class="status-row">
								<div class="status-info">
									{#if selectedUser.confirmed}
										<span class="status-badge status-active">
											<Check size={12} />
											Email Confirmed
										</span>
									{:else}
										<span class="status-badge status-unconfirmed">
											<Mail size={12} />
											Email Not Confirmed
										</span>
									{/if}
								</div>
								{#if !selectedUser.confirmed}
									<button 
										type="button"
										class="btn btn-sm btn-secondary"
										on:click={() => resendConfirmation(selectedUser)}
										disabled={resendingConfirmation}
									>
										{resendingConfirmation ? 'Sending...' : 'Resend Confirmation'}
									</button>
								{/if}
							</div>
							
							<div class="status-row">
								<div class="status-info">
									{#if selectedUser.locked}
										<span class="status-badge status-locked">
											<Lock size={12} />
											Account Locked
										</span>
									{:else}
										<span class="status-badge status-active">
											<Unlock size={12} />
											Account Active
										</span>
									{/if}
								</div>
								<button 
									type="button"
									class="btn btn-sm {selectedUser.locked ? 'btn-success' : 'btn-danger'}"
									on:click={() => confirmToggleLock(selectedUser)}
								>
									{selectedUser.locked ? 'Unlock Account' : 'Lock Account'}
								</button>
							</div>
						</div>
					</div>
					
					{#if selectedUser.role === 'deleted'}
						<div class="form-group">
							<div class="alert alert-danger">
								<Trash2 size={16} />
								<span>This user is marked as deleted and cannot access the system.</span>
							</div>
						</div>
					{/if}
				{/if}
			</div>
			
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={showAddModal ? closeAddModal : closeEditModal}>
					Cancel
				</button>
				<button class="btn btn-primary" on:click={saveUser}>
					{showAddModal ? 'Add User' : 'Save Changes'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Lock/Unlock Confirmation Modal -->
{#if showLockModal && selectedUser}
	<div class="modal-overlay" on:click={closeLockModal}>
		<div class="modal modal-sm" on:click|stopPropagation>
			<div class="modal-header">
				<h3 class="modal-title">
					{selectedUser.locked ? 'Unlock' : 'Lock'} User Account
				</h3>
				<button class="modal-close" on:click={closeLockModal}>
					<X size={20} />
				</button>
			</div>
			
			<div class="modal-body">
				{#if selectedUser.locked}
					<p>Are you sure you want to unlock this user account?</p>
					<p class="text-muted">{selectedUser.email}</p>
					<p class="text-success">The user will be able to sign in again.</p>
				{:else}
					<p>Are you sure you want to lock this user account?</p>
					<p class="text-muted">{selectedUser.email}</p>
					<p class="text-danger">The user will not be able to sign in.</p>
				{/if}
			</div>
			
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={closeLockModal}>
					Cancel
				</button>
				<button 
					class="btn {selectedUser.locked ? 'btn-success' : 'btn-danger'}" 
					on:click={toggleLock}
				>
					{selectedUser.locked ? 'Unlock Account' : 'Lock Account'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
	<div class="modal-overlay" on:click={closeDeleteModal}>
		<div class="modal modal-sm" on:click|stopPropagation>
			<div class="modal-header">
				<h3 class="modal-title">Delete User</h3>
				<button class="modal-close" on:click={closeDeleteModal}>
					<X size={20} />
				</button>
			</div>
			
			<div class="modal-body">
				<p>Are you sure you want to delete this user?</p>
				<p class="text-muted">{selectedUser?.email}</p>
				<p class="text-danger">This action cannot be undone.</p>
			</div>
			
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={closeDeleteModal}>
					Cancel
				</button>
				<button class="btn btn-danger" on:click={deleteUser}>
					Delete User
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.users-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
	}
	
	.users-filters {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	
	.user-email {
		font-weight: 500;
		color: var(--text-primary);
	}
	
	.user-status {
		display: flex;
		align-items: center;
	}
	
	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
	}
	
	.status-active {
		background: #10b98119;
		color: var(--success-color);
	}
	
	.status-locked {
		background: #ef444419;
		color: var(--danger-color);
	}
	
	.status-unconfirmed {
		background: #f59e0b19;
		color: var(--warning-color);
	}
	
	.action-buttons {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	
	.btn-icon-sm {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		background: white;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.btn-icon-sm:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
	}
	
	.dropdown {
		position: relative;
	}
	
	.dropdown-menu {
		display: none;
		position: absolute;
		right: 0;
		top: 100%;
		margin-top: 0.25rem;
		background: white;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		min-width: 180px;
	}
	
	.dropdown:hover .dropdown-menu {
		display: block;
	}
	
	.dropdown-menu button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: none;
		background: none;
		font-size: 0.875rem;
		color: var(--text-primary);
		text-align: left;
		cursor: pointer;
		transition: background 0.2s;
	}
	
	.dropdown-menu button:hover {
		background: var(--bg-hover);
	}
	
	.dropdown-menu button.text-danger {
		color: var(--danger-color);
	}
	
	/* Modal Styles */
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
		z-index: 2000;
	}
	
	.modal {
		background: white;
		border-radius: 8px;
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow: auto;
	}
	
	.modal-sm {
		max-width: 400px;
	}
	
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid var(--border-color);
	}
	
	.modal-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-primary);
	}
	
	.modal-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background: none;
		color: var(--text-muted);
		cursor: pointer;
		border-radius: 4px;
		transition: all 0.2s;
	}
	
	.modal-close:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
	}
	
	.modal-body {
		padding: 1.5rem;
	}
	
	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid var(--border-color);
	}
	
	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--text-primary);
		cursor: pointer;
	}
	
	.checkbox-label input {
		cursor: pointer;
	}
	
	.text-danger {
		color: var(--danger-color);
	}
	
	.text-muted {
		color: var(--text-muted);
		font-size: 0.875rem;
	}
	
	.status-controls {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 0.75rem;
		background: var(--bg-secondary);
		border-radius: 6px;
	}
	
	.status-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	
	.status-info {
		flex: 1;
	}
	
	.alert {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		border-radius: 6px;
		font-size: 0.875rem;
	}
	
	.alert-warning {
		background: #fef3c7;
		color: #92400e;
		border: 1px solid #fde68a;
	}
	
	.alert-info {
		background: #dbeafe;
		color: #1e40af;
		border: 1px solid #bfdbfe;
	}
	
	.alert-danger {
		background: #fee2e2;
		color: #991b1b;
		border: 1px solid #fecaca;
	}
	
	.btn-sm {
		padding: 0.375rem 0.75rem;
		font-size: 0.813rem;
	}
	
	.btn-success {
		background: var(--success-color, #10b981);
		color: white;
	}
	
	.btn-success:hover {
		background: #059669;
	}
	
	.btn-danger {
		background: var(--danger-color, #ef4444);
		color: white;
	}
	
	.btn-danger:hover {
		background: #dc2626;
	}
	
	.text-success {
		color: var(--success-color, #10b981);
	}
</style>
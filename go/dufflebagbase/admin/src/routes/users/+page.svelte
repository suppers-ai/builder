<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import type { User, PaginatedResponse } from '$lib/types';
	import { Table, tableMapperValues, type TableSource } from '@skeletonlabs/skeleton';
	import { UserCheck, UserX, Shield, Edit, Trash2, Plus } from 'lucide-svelte';
	
	let users: User[] = [];
	let loading = true;
	let currentPage = 1;
	let pageSize = 20;
	let totalPages = 1;
	let totalUsers = 0;
	
	async function loadUsers() {
		loading = true;
		const response = await api.getUsers(currentPage, pageSize);
		if (response.data) {
			users = response.data.data;
			totalUsers = response.data.total;
			totalPages = response.data.total_pages;
		}
		loading = false;
	}
	
	onMount(() => {
		loadUsers();
	});
	
	function getRoleBadgeClass(role: string): string {
		switch (role) {
			case 'admin': return 'admin-badge-primary';
			case 'manager': return 'admin-badge-success';
			case 'deleted': return 'admin-badge-danger';
			default: return 'admin-badge-warning';
		}
	}
	
	async function handleDeleteUser(user: User) {
		if (confirm(`Are you sure you want to delete ${user.email}?`)) {
			const response = await api.deleteUser(user.id);
			if (!response.error) {
				await loadUsers();
			}
		}
	}
	
	const tableSource: TableSource = {
		head: ['User', 'Status', 'Role', 'Created', 'Actions'],
		body: tableMapperValues(users, ['email', 'confirmed', 'role', 'created_at']),
		meta: tableMapperValues(users, ['id', 'email', 'confirmed', 'role', 'created_at'])
	};
	
	$: tableSource.body = tableMapperValues(users, ['email', 'confirmed', 'role', 'created_at']);
	$: tableSource.meta = tableMapperValues(users, ['id', 'email', 'confirmed', 'role', 'created_at']);
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="admin-title">Users</h1>
		<button class="admin-button flex items-center gap-2">
			<Plus size={16} />
			<span>Add User</span>
		</button>
	</div>
	
	{#if loading}
		<div class="admin-card">
			<div class="animate-pulse">
				<div class="h-10 bg-gray-200 rounded mb-4"></div>
				<div class="h-10 bg-gray-200 rounded mb-4"></div>
				<div class="h-10 bg-gray-200 rounded"></div>
			</div>
		</div>
	{:else}
		<div class="admin-card p-0">
			<div class="overflow-x-auto">
				<table class="admin-table">
					<thead>
						<tr>
							<th>User</th>
							<th>Status</th>
							<th>Role</th>
							<th>Created</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each users as user}
							<tr>
								<td>
									<div class="flex items-center gap-3">
										<div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
											{user.email.substring(0, 2).toUpperCase()}
										</div>
										<div>
											<p class="font-medium text-gray-900">{user.email}</p>
											<p class="text-sm text-gray-500">ID: {user.id}</p>
										</div>
									</div>
								</td>
								<td>
									{#if user.confirmed}
										<span class="admin-badge admin-badge-success flex items-center gap-1">
											<UserCheck size={14} />
											Verified
										</span>
									{:else}
										<span class="admin-badge admin-badge-warning flex items-center gap-1">
											<UserX size={14} />
											Unverified
										</span>
									{/if}
								</td>
								<td>
									<span class="admin-badge {getRoleBadgeClass(user.role)} flex items-center gap-1">
										{#if user.role === 'admin'}
											<Shield size={14} />
										{/if}
										<span class="capitalize">{user.role}</span>
									</span>
								</td>
								<td>
									<span class="text-sm">
										{new Date(user.created_at).toLocaleDateString()}
									</span>
								</td>
								<td>
									<div class="flex gap-2">
										<button 
											class="p-2 rounded hover:bg-gray-100 transition-colors"
											title="Edit user"
										>
											<Edit size={16} class="text-gray-600" />
										</button>
										<button 
											class="p-2 rounded hover:bg-red-50 transition-colors"
											on:click={() => handleDeleteUser(user)}
											title="Delete user"
										>
											<Trash2 size={16} class="text-red-600" />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			
			<!-- Pagination -->
			{#if totalPages > 1}
				<footer class="card-footer flex justify-between items-center">
					<span class="text-sm text-surface-500">
						Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
					</span>
					<div class="btn-group variant-ghost-surface">
						<button 
							on:click={() => { currentPage = Math.max(1, currentPage - 1); loadUsers(); }}
							disabled={currentPage === 1}
						>
							Previous
						</button>
						{#each Array(Math.min(5, totalPages)) as _, i}
							{@const page = currentPage - 2 + i}
							{#if page > 0 && page <= totalPages}
								<button
									class:variant-filled-primary={page === currentPage}
									on:click={() => { currentPage = page; loadUsers(); }}
								>
									{page}
								</button>
							{/if}
						{/each}
						<button 
							on:click={() => { currentPage = Math.min(totalPages, currentPage + 1); loadUsers(); }}
							disabled={currentPage === totalPages}
						>
							Next
						</button>
					</div>
				</footer>
			{/if}
		</div>
	{/if}
</div>
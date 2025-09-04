<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { requireAdmin } from '$lib/utils/auth';
	
	let webhooks = [];
	let loading = true;
	let error = null;
	let showCreateModal = false;
	let newWebhook = {
		name: '',
		url: '',
		events: [],
		secret: ''
	};

	onMount(async () => {
		// Check admin access
		if (!requireAdmin()) return;
		
		await loadWebhooks();
	});

	async function loadWebhooks() {
		try {
			loading = true;
			const response = await api.getWebhooks();
			if (response.error) {
				throw new Error(response.error);
			}
			webhooks = response.data?.webhooks || [];
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function createWebhook() {
		try {
			const response = await api.createWebhook(newWebhook);
			if (response.error) {
				throw new Error(response.error);
			}
			showCreateModal = false;
			newWebhook = { name: '', url: '', events: [], secret: '' };
			await loadWebhooks();
		} catch (err) {
			alert(`Error: ${err.message}`);
		}
	}

	async function toggleWebhook(id, active) {
		try {
			const response = await api.toggleWebhook(id, active);
			if (response.error) {
				alert('Failed to toggle webhook: ' + response.error);
			} else {
				await loadWebhooks();
			}
		} catch (err) {
			alert('Failed to toggle webhook: ' + err.message);
		}
	}

	function testWebhook(webhook) {
		alert(`Testing webhook: ${webhook.name}\nThis feature is coming soon!`);
	}
</script>

<div class="container mx-auto p-6">
	<!-- Header -->
	<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center text-white text-2xl">
					🪝
				</div>
				<div>
					<h1 class="text-2xl font-bold text-gray-900">
						Webhooks Dashboard
						<span class="badge badge-info badge-sm ml-2">Official Extension</span>
					</h1>
					<p class="text-gray-600">Manage and monitor your webhook integrations</p>
				</div>
			</div>
			<div class="flex gap-2">
				<button on:click={() => showCreateModal = true} class="btn btn-primary btn-sm">
					+ New Webhook
				</button>
				<button on:click={loadWebhooks} class="btn btn-ghost btn-sm">
					↻ Refresh
				</button>
			</div>
		</div>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
		<div class="stat bg-white rounded-lg shadow">
			<div class="stat-title">Total Webhooks</div>
			<div class="stat-value text-primary">{webhooks.length}</div>
		</div>
		
		<div class="stat bg-white rounded-lg shadow">
			<div class="stat-title">Active Webhooks</div>
			<div class="stat-value text-success">{webhooks.filter(w => w.active).length}</div>
		</div>
		
		<div class="stat bg-white rounded-lg shadow">
			<div class="stat-title">Deliveries Today</div>
			<div class="stat-value text-accent">0</div>
		</div>
		
		<div class="stat bg-white rounded-lg shadow">
			<div class="stat-title">Success Rate</div>
			<div class="stat-value text-info">95%</div>
		</div>
	</div>

	{#if loading}
		<div class="flex justify-center items-center h-64">
			<div class="loading loading-spinner loading-lg"></div>
		</div>
	{:else if error}
		<div class="alert alert-error">
			<span>Error: {error}</span>
		</div>
	{:else}
		<!-- Webhooks List -->
		<div class="bg-white rounded-lg shadow-lg p-6">
			<h2 class="text-xl font-semibold mb-4">Configured Webhooks</h2>
			
			{#if webhooks.length > 0}
				<div class="space-y-4">
					{#each webhooks as webhook}
						<div class="border rounded-lg p-4 {webhook.active ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}">
							<div class="flex justify-between items-start">
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-2">
										<h3 class="font-semibold text-lg">{webhook.name}</h3>
										<span class="badge {webhook.active ? 'badge-success' : 'badge-error'} badge-sm">
											{webhook.active ? 'Active' : 'Inactive'}
										</span>
									</div>
									<p class="text-sm text-gray-600 mb-2">{webhook.url}</p>
									<div class="flex flex-wrap gap-2">
										{#each webhook.events as event}
											<span class="badge badge-ghost badge-sm">{event}</span>
										{/each}
									</div>
								</div>
								<div class="flex gap-2">
									<label class="swap swap-flip">
										<input 
											type="checkbox" 
											checked={webhook.active}
											on:change={() => toggleWebhook(webhook.id, !webhook.active)}
										/>
										<div class="swap-on">✅</div>
										<div class="swap-off">❌</div>
									</label>
									<button on:click={() => testWebhook(webhook)} class="btn btn-ghost btn-sm">
										Test
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12 text-gray-500">
					<p>No webhooks configured yet</p>
					<p class="text-sm mt-2">Click "New Webhook" to get started</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Create Webhook Modal -->
{#if showCreateModal}
<div class="modal modal-open">
	<div class="modal-box">
		<h3 class="font-bold text-lg mb-4">Create New Webhook</h3>
		
		<div class="form-control mb-4">
			<label class="label">
				<span class="label-text">Name</span>
			</label>
			<input 
				type="text" 
				bind:value={newWebhook.name}
				placeholder="e.g., Order Notifications" 
				class="input input-bordered" 
			/>
		</div>
		
		<div class="form-control mb-4">
			<label class="label">
				<span class="label-text">URL</span>
			</label>
			<input 
				type="url" 
				bind:value={newWebhook.url}
				placeholder="https://api.example.com/webhooks" 
				class="input input-bordered" 
			/>
		</div>
		
		<div class="form-control mb-4">
			<label class="label">
				<span class="label-text">Events (comma-separated)</span>
			</label>
			<input 
				type="text" 
				on:input={(e) => newWebhook.events = e.target.value.split(',').map(s => s.trim()).filter(s => s)}
				placeholder="order.created, order.updated" 
				class="input input-bordered" 
			/>
		</div>
		
		<div class="form-control mb-4">
			<label class="label">
				<span class="label-text">Secret (optional)</span>
			</label>
			<input 
				type="password" 
				bind:value={newWebhook.secret}
				placeholder="Webhook signing secret" 
				class="input input-bordered" 
			/>
		</div>
		
		<div class="modal-action">
			<button on:click={() => showCreateModal = false} class="btn btn-ghost">Cancel</button>
			<button on:click={createWebhook} class="btn btn-primary">Create</button>
		</div>
	</div>
	<div class="modal-backdrop" on:click={() => showCreateModal = false}></div>
</div>
{/if}

<style>
	.container {
		max-width: 1200px;
	}
	
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: -1;
	}
</style>
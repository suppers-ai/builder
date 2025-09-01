<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { requireAdmin } from '$lib/utils/auth';
	
	let extensions = [];
	let loading = true;
	let error = null;

	onMount(async () => {
		// Check admin access
		if (!requireAdmin()) return;
		
		await loadExtensions();
	});

	async function loadExtensions() {
		try {
			loading = true;
			const response = await api.getExtensions();
			if (response.error) {
				throw new Error(response.error);
			}
			extensions = response.data || [];
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function toggleExtension(name, enable) {
		try {
			const response = await api.toggleExtension(name, enable);
			if (response.error) {
				throw new Error(response.error);
			}
			await loadExtensions();
		} catch (err) {
			alert(`Error: ${err.message}`);
		}
	}
</script>

<div class="container mx-auto p-6">
	<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
		<div class="flex items-center gap-4 mb-4">
			<div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center text-white text-2xl">
				🧩
			</div>
			<div>
				<h1 class="text-2xl font-bold text-gray-900">Extensions Management</h1>
				<p class="text-gray-600">Enable, disable, and configure extensions to enhance your application</p>
			</div>
		</div>
	</div>

	{#if loading}
		<div class="flex justify-center items-center h-64">
			<div class="loading loading-spinner loading-lg"></div>
		</div>
	{:else if error}
		<div class="alert alert-error">
			<span>Error loading extensions: {error}</span>
		</div>
	{:else if extensions.length === 0}
		<div class="text-center py-12 text-gray-500">
			No extensions available
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each extensions as extension}
				<div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
					<div class="card-body">
						<div class="flex justify-between items-start mb-4">
							<div>
								<h2 class="card-title text-lg">
									{extension.name}
									<span class="badge badge-sm">{extension.version}</span>
									{#if extension.author === 'DuffleBagBase Official'}
										<span class="badge badge-primary badge-sm">Official</span>
									{/if}
								</h2>
								<p class="text-sm text-gray-500">by {extension.author}</p>
							</div>
							<div class="badge {extension.enabled ? 'badge-success' : 'badge-error'}">
								{extension.enabled ? 'Enabled' : 'Disabled'}
							</div>
						</div>
						
						<p class="text-sm text-gray-600 mb-4">{extension.description}</p>
						
						{#if extension.tags && extension.tags.length > 0}
							<div class="flex flex-wrap gap-2 mb-4">
								{#each extension.tags as tag}
									<span class="badge badge-ghost badge-sm">{tag}</span>
								{/each}
							</div>
						{/if}
						
						<div class="card-actions justify-between items-center">
							<label class="swap">
								<input 
									type="checkbox" 
									checked={extension.enabled}
									on:change={() => toggleExtension(extension.name, !extension.enabled)}
								/>
								<div class="swap-on btn btn-success btn-sm">ON</div>
								<div class="swap-off btn btn-ghost btn-sm">OFF</div>
							</label>
							
							{#if extension.dashboardUrl && extension.enabled}
								<a href={extension.dashboardUrl} class="btn btn-primary btn-sm">
									Open Dashboard
								</a>
							{:else}
								<button class="btn btn-sm btn-disabled" disabled>
									Dashboard {extension.enabled ? 'Not Available' : 'Disabled'}
								</button>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 1200px;
	}
</style>
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import type { AppSettings } from '$lib/types';
	import { Save, RefreshCw, AlertCircle, Check } from 'lucide-svelte';
	
	let settings: AppSettings | null = null;
	let loading = true;
	let saving = false;
	let saved = false;
	let error = '';
	
	onMount(async () => {
		await loadSettings();
	});
	
	async function loadSettings() {
		loading = true;
		error = '';
		const response = await api.getSettings();
		if (response.data) {
			settings = response.data;
		} else {
			error = response.error || 'Failed to load settings';
		}
		loading = false;
	}
	
	async function saveSettings() {
		if (!settings) return;
		
		saving = true;
		saved = false;
		error = '';
		
		const response = await api.updateSettings(settings);
		if (response.data) {
			settings = response.data;
			saved = true;
			setTimeout(() => saved = false, 3000);
		} else {
			error = response.error || 'Failed to save settings';
		}
		saving = false;
	}
	
	async function resetSettings() {
		if (!confirm('Are you sure you want to reset all settings to default values?')) {
			return;
		}
		
		saving = true;
		error = '';
		
		const response = await api.post('/settings/reset');
		if (response.data) {
			settings = response.data;
			saved = true;
			setTimeout(() => saved = false, 3000);
		} else {
			error = response.error || 'Failed to reset settings';
		}
		saving = false;
	}
	
	function formatBytes(bytes: number): string {
		const units = ['B', 'KB', 'MB', 'GB'];
		let size = bytes;
		let unitIndex = 0;
		
		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}
		
		return `${size.toFixed(1)} ${units[unitIndex]}`;
	}
	
	function parseBytes(value: string): number {
		const match = value.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?B)?$/i);
		if (!match) return 0;
		
		const num = parseFloat(match[1]);
		const unit = (match[2] || 'B').toUpperCase();
		
		const multipliers: Record<string, number> = {
			'B': 1,
			'KB': 1024,
			'MB': 1024 * 1024,
			'GB': 1024 * 1024 * 1024,
		};
		
		return Math.floor(num * (multipliers[unit] || 1));
	}
</script>

<div class="container mx-auto p-6 max-w-6xl">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Settings</h1>
		<div class="flex gap-2">
			{#if saved}
				<div class="flex items-center text-green-600 px-3 py-2 bg-green-50 rounded">
					<Check size={16} class="mr-2" />
					Settings saved
				</div>
			{/if}
			<button 
				class="btn btn-ghost btn-sm"
				on:click={resetSettings}
				disabled={saving || loading}
			>
				<RefreshCw size={16} class="mr-2" />
				Reset to Defaults
			</button>
		</div>
	</div>
	
	{#if error}
		<div class="alert alert-error mb-6">
			<AlertCircle size={20} />
			<span>{error}</span>
		</div>
	{/if}
	
	{#if loading}
		<div class="space-y-6">
			{#each [1,2,3] as _}
				<div class="card bg-base-100 shadow-sm">
					<div class="card-body">
						<div class="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
						<div class="space-y-4">
							<div class="h-10 bg-gray-100 rounded animate-pulse"></div>
							<div class="h-10 bg-gray-100 rounded animate-pulse"></div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else if settings}
		<div class="space-y-6">
			<!-- General Settings -->
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body">
					<h2 class="card-title text-xl mb-4">General Settings</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label class="label">
								<span class="label-text font-medium">Application Name</span>
							</label>
							<input 
								type="text" 
								class="input input-bordered" 
								bind:value={settings.app_name}
								placeholder="My Application"
							/>
						</div>
						
						<div class="form-control">
							<label class="label">
								<span class="label-text font-medium">Application URL</span>
							</label>
							<input 
								type="url" 
								class="input input-bordered" 
								bind:value={settings.app_url}
								placeholder="https://example.com"
							/>
						</div>
						
						<div class="form-control">
							<label class="label cursor-pointer">
								<span class="label-text font-medium">Allow User Signup</span>
								<input 
									type="checkbox" 
									class="toggle toggle-primary" 
									bind:checked={settings.allow_signup}
								/>
							</label>
						</div>
						
						<div class="form-control">
							<label class="label cursor-pointer">
								<span class="label-text font-medium">Require Email Confirmation</span>
								<input 
									type="checkbox" 
									class="toggle toggle-primary" 
									bind:checked={settings.require_email_confirmation}
								/>
							</label>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Security Settings -->
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body">
					<h2 class="card-title text-xl mb-4">Security</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label class="label">
								<span class="label-text font-medium">Session Timeout</span>
								<span class="label-text-alt">minutes</span>
							</label>
							<input 
								type="number" 
								class="input input-bordered" 
								bind:value={settings.session_timeout}
								min="5"
								placeholder="1440"
							/>
						</div>
						
						<div class="form-control">
							<label class="label">
								<span class="label-text font-medium">Minimum Password Length</span>
							</label>
							<input 
								type="number" 
								class="input input-bordered" 
								bind:value={settings.password_min_length}
								min="6"
								max="32"
								placeholder="8"
							/>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Email Configuration -->
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body">
					<h2 class="card-title text-xl mb-4">Email Configuration</h2>
					
					<div class="form-control mb-4">
						<label class="label cursor-pointer justify-start gap-3">
							<input 
								type="checkbox" 
								class="toggle toggle-primary" 
								bind:checked={settings.smtp_enabled}
							/>
							<span class="label-text font-medium">Enable SMTP</span>
						</label>
					</div>
					
					{#if settings.smtp_enabled}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
							<div class="form-control">
								<label class="label">
									<span class="label-text font-medium">SMTP Host</span>
								</label>
								<input 
									type="text" 
									class="input input-bordered" 
									bind:value={settings.smtp_host}
									placeholder="smtp.example.com"
								/>
							</div>
							
							<div class="form-control">
								<label class="label">
									<span class="label-text font-medium">SMTP Port</span>
								</label>
								<input 
									type="number" 
									class="input input-bordered" 
									bind:value={settings.smtp_port}
									placeholder="587"
								/>
							</div>
							
							<div class="form-control md:col-span-2">
								<label class="label">
									<span class="label-text font-medium">SMTP Username</span>
								</label>
								<input 
									type="text" 
									class="input input-bordered" 
									bind:value={settings.smtp_user}
									placeholder="user@example.com"
								/>
							</div>
						</div>
					{/if}
				</div>
			</div>
			
			<!-- Storage Configuration -->
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body">
					<h2 class="card-title text-xl mb-4">Storage Configuration</h2>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label class="label">
								<span class="label-text font-medium">Storage Provider</span>
							</label>
							<select class="select select-bordered" bind:value={settings.storage_provider}>
								<option value="local">Local Filesystem</option>
								<option value="s3">Amazon S3</option>
							</select>
						</div>
						
						<div class="form-control">
							<label class="label">
								<span class="label-text font-medium">Max Upload Size</span>
							</label>
							<input 
								type="text" 
								class="input input-bordered" 
								value={formatBytes(settings.max_upload_size)}
								on:change={(e) => settings.max_upload_size = parseBytes(e.currentTarget.value)}
								placeholder="10 MB"
							/>
						</div>
						
						<div class="form-control md:col-span-2">
							<label class="label">
								<span class="label-text font-medium">Allowed File Types</span>
								<span class="label-text-alt">comma-separated MIME types</span>
							</label>
							<input 
								type="text" 
								class="input input-bordered" 
								bind:value={settings.allowed_file_types}
								placeholder="image/*,application/pdf,text/*"
							/>
						</div>
					</div>
					
					{#if settings.storage_provider === 's3'}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-primary/20">
							<div class="form-control">
								<label class="label">
									<span class="label-text font-medium">S3 Bucket</span>
								</label>
								<input 
									type="text" 
									class="input input-bordered" 
									bind:value={settings.s3_bucket}
									placeholder="my-bucket"
								/>
							</div>
							
							<div class="form-control">
								<label class="label">
									<span class="label-text font-medium">S3 Region</span>
								</label>
								<input 
									type="text" 
									class="input input-bordered" 
									bind:value={settings.s3_region}
									placeholder="us-east-1"
								/>
							</div>
						</div>
					{/if}
				</div>
			</div>
			
			<!-- Developer Settings -->
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body">
					<h2 class="card-title text-xl mb-4">Developer Options</h2>
					
					<div class="space-y-3">
						<div class="form-control">
							<label class="label cursor-pointer justify-start gap-3">
								<input 
									type="checkbox" 
									class="toggle toggle-primary" 
									bind:checked={settings.enable_api_logs}
								/>
								<span class="label-text font-medium">Enable API Logging</span>
							</label>
						</div>
						
						<div class="form-control">
							<label class="label cursor-pointer justify-start gap-3">
								<input 
									type="checkbox" 
									class="toggle toggle-warning" 
									bind:checked={settings.enable_debug_mode}
								/>
								<span class="label-text font-medium">Enable Debug Mode</span>
							</label>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Maintenance Mode -->
			<div class="card bg-base-100 shadow-sm border-2 border-warning/20">
				<div class="card-body">
					<h2 class="card-title text-xl mb-4">
						<AlertCircle size={20} class="text-warning" />
						Maintenance Mode
					</h2>
					
					<div class="form-control mb-4">
						<label class="label cursor-pointer justify-start gap-3">
							<input 
								type="checkbox" 
								class="toggle toggle-warning" 
								bind:checked={settings.maintenance_mode}
							/>
							<span class="label-text font-medium">Enable Maintenance Mode</span>
						</label>
					</div>
					
					{#if settings.maintenance_mode}
						<div class="form-control pl-4 border-l-2 border-warning/20">
							<label class="label">
								<span class="label-text font-medium">Maintenance Message</span>
							</label>
							<textarea 
								class="textarea textarea-bordered h-24" 
								bind:value={settings.maintenance_message}
								placeholder="We're currently performing maintenance. Please check back later."
							></textarea>
						</div>
					{/if}
				</div>
			</div>
			
			<!-- Save Button -->
			<div class="flex justify-end gap-3 sticky bottom-6">
				<button 
					class="btn btn-primary shadow-lg" 
					on:click={saveSettings}
					disabled={saving}
				>
					{#if saving}
						<span class="loading loading-spinner loading-sm"></span>
						Saving...
					{:else}
						<Save size={18} />
						Save Settings
					{/if}
				</button>
			</div>
		</div>
	{:else}
		<div class="alert alert-error">
			<AlertCircle size={20} />
			<span>Failed to load settings. Please try refreshing the page.</span>
		</div>
	{/if}
</div>

<style>
	.card {
		border: 1px solid rgba(0, 0, 0, 0.05);
	}
	
	.card-title {
		color: rgb(31, 41, 55);
	}
	
	.label-text {
		color: rgb(55, 65, 81);
	}
	
	.label-text-alt {
		color: rgb(107, 114, 128);
		font-size: 0.75rem;
	}
	
	.input:focus, .select:focus, .textarea:focus {
		outline: 2px solid transparent;
		outline-offset: 2px;
		border-color: rgb(99, 102, 241);
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}
	
	.toggle:checked {
		background-color: rgb(99, 102, 241);
		border-color: rgb(99, 102, 241);
	}
	
	.toggle-warning:checked {
		background-color: rgb(251, 191, 36);
		border-color: rgb(251, 191, 36);
	}
</style>
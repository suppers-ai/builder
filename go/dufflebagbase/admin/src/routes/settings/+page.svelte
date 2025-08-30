<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import type { AppSettings } from '$lib/types';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import { Save } from 'lucide-svelte';
	
	let settings: AppSettings | null = null;
	let loading = true;
	let saving = false;
	
	onMount(async () => {
		const response = await api.getSettings();
		if (response.data) {
			settings = response.data;
		}
		loading = false;
	});
	
	async function saveSettings() {
		if (!settings) return;
		
		saving = true;
		const response = await api.updateSettings(settings);
		if (response.data) {
			settings = response.data;
		}
		saving = false;
	}
</script>

<div class="space-y-6">
	<h1 class="h1">Settings</h1>
	
	{#if loading}
		<div class="placeholder animate-pulse h-64"></div>
	{:else if settings}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- General Settings -->
			<div class="card">
				<header class="card-header">
					<h3 class="h3">General</h3>
				</header>
				<div class="p-6 space-y-4">
					<label class="label">
						<span>Application Name</span>
						<input 
							type="text" 
							class="input" 
							bind:value={settings.app_name}
						/>
					</label>
					
					<label class="label">
						<span>Application URL</span>
						<input 
							type="url" 
							class="input" 
							bind:value={settings.app_url}
						/>
					</label>
					
					<div class="space-y-2">
						<SlideToggle 
							name="allow_signup" 
							bind:checked={settings.allow_signup}
						>
							Allow User Signup
						</SlideToggle>
						
						<SlideToggle 
							name="require_email" 
							bind:checked={settings.require_email_confirmation}
						>
							Require Email Confirmation
						</SlideToggle>
					</div>
				</div>
			</div>
			
			<!-- Email Settings -->
			<div class="card">
				<header class="card-header">
					<h3 class="h3">Email Configuration</h3>
				</header>
				<div class="p-6 space-y-4">
					<SlideToggle 
						name="smtp_enabled" 
						bind:checked={settings.smtp_enabled}
					>
						Enable SMTP
					</SlideToggle>
					
					{#if settings.smtp_enabled}
						<label class="label">
							<span>SMTP Host</span>
							<input 
								type="text" 
								class="input" 
								bind:value={settings.smtp_host}
							/>
						</label>
						
						<label class="label">
							<span>SMTP Port</span>
							<input 
								type="number" 
								class="input" 
								bind:value={settings.smtp_port}
							/>
						</label>
						
						<label class="label">
							<span>SMTP User</span>
							<input 
								type="text" 
								class="input" 
								bind:value={settings.smtp_user}
							/>
						</label>
					{/if}
				</div>
			</div>
			
			<!-- Storage Settings -->
			<div class="card">
				<header class="card-header">
					<h3 class="h3">Storage Configuration</h3>
				</header>
				<div class="p-6 space-y-4">
					<label class="label">
						<span>Storage Provider</span>
						<select class="select" bind:value={settings.storage_provider}>
							<option value="local">Local Filesystem</option>
							<option value="s3">Amazon S3</option>
						</select>
					</label>
					
					{#if settings.storage_provider === 's3'}
						<label class="label">
							<span>S3 Bucket</span>
							<input 
								type="text" 
								class="input" 
								bind:value={settings.s3_bucket}
							/>
						</label>
						
						<label class="label">
							<span>S3 Region</span>
							<input 
								type="text" 
								class="input" 
								bind:value={settings.s3_region}
							/>
						</label>
					{/if}
				</div>
			</div>
		</div>
		
		<!-- Save Button -->
		<div class="flex justify-end">
			<button 
				class="btn variant-filled-primary" 
				on:click={saveSettings}
				disabled={saving}
			>
				<Save size={16} />
				<span>{saving ? 'Saving...' : 'Save Settings'}</span>
			</button>
		</div>
	{:else}
		<div class="alert variant-filled-error">
			Failed to load settings
		</div>
	{/if}
</div>
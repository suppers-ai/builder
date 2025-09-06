<script lang="ts">
	import { Link, Mail, Calendar, Lock, Users, Copy, Check } from 'lucide-svelte';
	import Modal from '../common/Modal.svelte';
	import Button from '../common/Button.svelte';
	import { storageService } from '$lib/services/storage';
	import type { FileItem, FolderItem } from '$lib/types/storage';
	
	export let open = false;
	export let item: FileItem | FolderItem | null = null;
	
	let shareType: 'link' | 'email' = 'link';
	let email = '';
	let permissions = 'view';
	let expiresIn = 'never';
	let password = '';
	let loading = false;
	let shareLink = '';
	let copied = false;
	
	async function handleShare() {
		if (!item) return;
		
		loading = true;
		
		try {
			const share = await storageService.createShare(item.id, {
				type: shareType === 'link' ? 'public' : 'user',
				email: shareType === 'email' ? email : undefined,
				permissions: [permissions],
				expiresAt: expiresIn !== 'never' ? getExpiryDate(expiresIn) : undefined,
				password: password || undefined
			});
			
			if (shareType === 'link') {
				shareLink = `${window.location.origin}/shared/${share.id}`;
			} else {
				// Show success message
				alert('Share invitation sent!');
				open = false;
			}
		} catch (error) {
			alert('Failed to create share');
		} finally {
			loading = false;
		}
	}
	
	function getExpiryDate(period: string): Date {
		const date = new Date();
		switch (period) {
			case '1day':
				date.setDate(date.getDate() + 1);
				break;
			case '7days':
				date.setDate(date.getDate() + 7);
				break;
			case '30days':
				date.setDate(date.getDate() + 30);
				break;
		}
		return date;
	}
	
	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(shareLink);
			copied = true;
			setTimeout(() => copied = false, 2000);
		} catch {
			alert('Failed to copy link');
		}
	}
	
	$: if (!open) {
		// Reset form
		shareType = 'link';
		email = '';
		permissions = 'view';
		expiresIn = 'never';
		password = '';
		shareLink = '';
	}
</script>

<Modal bind:open title="Share {item?.name || 'Item'}" size="lg">
	{#if !shareLink}
		<!-- Share Options -->
		<div class="space-y-6">
			<!-- Share Type Tabs -->
			<div class="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
				<button
					on:click={() => shareType = 'link'}
					class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors
						{shareType === 'link' ? 'bg-white dark:bg-gray-700 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}"
				>
					<Link class="w-4 h-4" />
					<span>Share Link</span>
				</button>
				<button
					on:click={() => shareType = 'email'}
					class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors
						{shareType === 'email' ? 'bg-white dark:bg-gray-700 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}"
				>
					<Mail class="w-4 h-4" />
					<span>Share with Email</span>
				</button>
			</div>
			
			{#if shareType === 'email'}
				<!-- Email Sharing -->
				<div>
					<label for="email" class="block text-sm font-medium mb-2">Email Address</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700"
						placeholder="user@example.com"
					/>
				</div>
			{/if}
			
			<!-- Permissions -->
			<div>
				<label class="block text-sm font-medium mb-2">
					<Users class="inline w-4 h-4 mr-1" />
					Permissions
				</label>
				<select
					bind:value={permissions}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700"
				>
					<option value="view">Can view</option>
					<option value="download">Can download</option>
					<option value="edit">Can edit</option>
				</select>
			</div>
			
			<!-- Expiration -->
			<div>
				<label class="block text-sm font-medium mb-2">
					<Calendar class="inline w-4 h-4 mr-1" />
					Expires
				</label>
				<select
					bind:value={expiresIn}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700"
				>
					<option value="never">Never</option>
					<option value="1day">In 1 day</option>
					<option value="7days">In 7 days</option>
					<option value="30days">In 30 days</option>
				</select>
			</div>
			
			{#if shareType === 'link'}
				<!-- Password Protection -->
				<div>
					<label for="password" class="block text-sm font-medium mb-2">
						<Lock class="inline w-4 h-4 mr-1" />
						Password Protection (Optional)
					</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700"
						placeholder="Enter password (optional)"
					/>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Share Link Result -->
		<div class="space-y-4">
			<div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
				<p class="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
					Share link created successfully!
				</p>
				<div class="flex gap-2">
					<input
						type="text"
						value={shareLink}
						readonly
						class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
					/>
					<Button
						on:click={copyToClipboard}
						variant="secondary"
						icon={copied ? Check : Copy}
					>
						{copied ? 'Copied!' : 'Copy'}
					</Button>
				</div>
			</div>
			
			{#if password}
				<div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
					<p class="text-sm text-yellow-800 dark:text-yellow-200">
						This link is password protected. Share the password separately.
					</p>
				</div>
			{/if}
			
			{#if expiresIn !== 'never'}
				<div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
					<p class="text-sm text-blue-800 dark:text-blue-200">
						This link will expire {expiresIn === '1day' ? 'tomorrow' : `in ${expiresIn}`}.
					</p>
				</div>
			{/if}
		</div>
	{/if}
	
	<div slot="footer" class="flex justify-end gap-3">
		{#if !shareLink}
			<Button variant="ghost" on:click={() => open = false}>Cancel</Button>
			<Button on:click={handleShare} {loading}>
				{shareType === 'link' ? 'Create Link' : 'Send Invitation'}
			</Button>
		{:else}
			<Button on:click={() => shareLink = ''} variant="ghost">Create Another</Button>
			<Button on:click={() => open = false}>Done</Button>
		{/if}
	</div>
</Modal>
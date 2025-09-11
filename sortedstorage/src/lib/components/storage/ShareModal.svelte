<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { X, Copy, Mail, Link, Users, Clock, Shield, Folder, File, Check } from 'lucide-svelte';
	import type { StorageItem } from '$lib/types/storage';
	import { isFolder, isFile } from '$lib/types/storage';
	
	export let item: StorageItem | null = null;
	export let open = false;
	
	const dispatch = createEventDispatcher();
	
	// Share settings
	let shareType: 'public' | 'users' = 'public';
	let permissionLevel: 'view' | 'edit' | 'admin' = 'view';
	let inheritToChildren = true;
	let expiresIn: 'never' | '1day' | '7days' | '30days' | 'custom' = 'never';
	let customExpiry = '';
	let shareEmails: string[] = [''];
	let shareLink = '';
	let copied = false;
	
	function addEmailField() {
		shareEmails = [...shareEmails, ''];
	}
	
	function removeEmailField(index: number) {
		shareEmails = shareEmails.filter((_, i) => i !== index);
	}
	
	function updateEmail(index: number, value: string) {
		shareEmails[index] = value;
	}
	
	function createShare() {
		if (!item) return;
		
		// For demo purposes, just generate a fake share link
		if (shareType === 'public') {
			const randomToken = Math.random().toString(36).substring(2, 15);
			shareLink = `${window.location.origin}/shared/${randomToken}`;
			
			// Auto-copy to clipboard
			copyToClipboard();
		} else {
			// For user shares, just show success message
			const validEmails = shareEmails.filter(email => email.trim());
			if (validEmails.length > 0) {
				dispatch('shared', { 
					item, 
					shareType: 'users',
					emails: validEmails,
					permission: permissionLevel 
				});
				close();
			}
		}
	}
	
	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(shareLink);
			copied = true;
			setTimeout(() => copied = false, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}
	
	function close() {
		open = false;
		// Reset form
		shareType = 'public';
		permissionLevel = 'view';
		inheritToChildren = true;
		expiresIn = 'never';
		customExpiry = '';
		shareEmails = [''];
		shareLink = '';
		dispatch('close');
	}
</script>

{#if open && item}
<div class="modal-overlay" on:click={close}>
	<div class="modal-container" on:click|stopPropagation>
		<div class="modal-header">
			<div class="header-content">
				{#if isFolder(item)}
					<Folder class="w-5 h-5 text-blue-600" />
				{:else}
					<File class="w-5 h-5 text-gray-600" />
				{/if}
				<h2>Share "{item.object_name}"</h2>
			</div>
			<button class="close-btn" on:click={close}>
				<X class="w-5 h-5" />
			</button>
		</div>
		
		<div class="modal-body">
			<!-- Share Type Tabs -->
			<div class="share-tabs">
				<button 
					class="tab-btn"
					class:active={shareType === 'public'}
					on:click={() => shareType = 'public'}
				>
					<Link class="w-4 h-4" />
					Public Link
				</button>
				<button 
					class="tab-btn"
					class:active={shareType === 'users'}
					on:click={() => shareType = 'users'}
				>
					<Users class="w-4 h-4" />
					Share with Users
				</button>
			</div>
			
			<!-- Public Link Share -->
			{#if shareType === 'public'}
				{#if shareLink}
					<div class="share-link-container">
						<div class="link-display">
							<input 
								type="text" 
								value={shareLink} 
								readonly
								class="link-input"
							/>
							<button 
								class="copy-btn"
								class:copied
								on:click={copyToClipboard}
							>
								{#if copied}
									<Check class="w-4 h-4" />
									Copied!
								{:else}
									<Copy class="w-4 h-4" />
									Copy
								{/if}
							</button>
						</div>
						<p class="help-text">
							Anyone with this link can {permissionLevel === 'view' ? 'view' : 'edit'} this {item.type}
							{#if expiresIn !== 'never'}
								<br>Link expires in {expiresIn === 'custom' ? 'on ' + new Date(customExpiry).toLocaleDateString() : expiresIn.replace('days', ' days')}
							{/if}
						</p>
					</div>
				{/if}
			{:else}
				<!-- User Email Share -->
				<div class="email-share">
					<label class="form-label">
						<Mail class="w-4 h-4" />
						Email Addresses
					</label>
					{#each shareEmails as email, i}
						<div class="email-input-group">
							<input 
								type="email"
								placeholder="Enter email address"
								value={email}
								on:input={(e) => updateEmail(i, e.currentTarget.value)}
								class="form-input"
							/>
							{#if shareEmails.length > 1}
								<button 
									class="remove-btn"
									on:click={() => removeEmailField(i)}
								>
									<X class="w-4 h-4" />
								</button>
							{/if}
						</div>
					{/each}
					<button class="add-email-btn" on:click={addEmailField}>
						<Plus class="w-4 h-4" />
						Add another email
					</button>
				</div>
			{/if}
			
			<!-- Permission Settings -->
			<div class="permission-section">
				<label class="form-label">
					<Shield class="w-4 h-4" />
					Permission Level
				</label>
				<div class="permission-options">
					<label class="radio-option">
						<input 
							type="radio" 
							value="view"
							bind:group={permissionLevel}
						/>
						<span>
							<strong>View Only</strong>
							<small>Can view and download</small>
						</span>
					</label>
					<label class="radio-option">
						<input 
							type="radio" 
							value="edit"
							bind:group={permissionLevel}
						/>
						<span>
							<strong>Can Edit</strong>
							<small>Can view, download, and upload</small>
						</span>
					</label>
					<label class="radio-option">
						<input 
							type="radio" 
							value="admin"
							bind:group={permissionLevel}
						/>
						<span>
							<strong>Full Access</strong>
							<small>Can manage everything including shares</small>
						</span>
					</label>
				</div>
			</div>
			
			<!-- Folder-specific option -->
			{#if item.type === 'folder'}
				<div class="checkbox-option">
					<label>
						<input 
							type="checkbox"
							bind:checked={inheritToChildren}
						/>
						<Folder class="w-4 h-4" />
						Apply to all files and subfolders
					</label>
				</div>
			{/if}
			
			<!-- Expiration -->
			<div class="expiration-section">
				<label class="form-label">
					<Clock class="w-4 h-4" />
					Expiration
				</label>
				<select class="form-select" bind:value={expiresIn}>
					<option value="never">Never</option>
					<option value="1day">1 day</option>
					<option value="7days">7 days</option>
					<option value="30days">30 days</option>
					<option value="custom">Custom date</option>
				</select>
				{#if expiresIn === 'custom'}
					<input 
						type="datetime-local"
						bind:value={customExpiry}
						class="form-input mt-2"
						min={new Date().toISOString().slice(0, 16)}
					/>
				{/if}
			</div>
		</div>
		
		<div class="modal-footer">
			<button class="btn-secondary" on:click={close}>
				Cancel
			</button>
			<button 
				class="btn-primary"
				on:click={createShare}
				disabled={shareType === 'public' && shareLink}
			>
				{#if shareType === 'public' && shareLink}
					Link Created
				{:else}
					Create Share
				{/if}
			</button>
		</div>
	</div>
</div>
{/if}

<style>
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
		z-index: 10000;
		animation: fadeIn 0.2s ease;
	}
	
	.modal-container {
		background: white;
		border-radius: 12px;
		width: 90%;
		max-width: 600px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		animation: slideUp 0.3s ease;
	}
	
	.modal-header {
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.header-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	
	.modal-header h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
	}
	
	.close-btn {
		background: none;
		border: none;
		padding: 0.5rem;
		cursor: pointer;
		color: #6b7280;
		border-radius: 6px;
		transition: all 0.2s;
	}
	
	.close-btn:hover {
		background: #f3f4f6;
		color: #374151;
	}
	
	.modal-body {
		padding: 1.5rem;
		overflow-y: auto;
		flex: 1;
	}
	
	.share-tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.tab-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		color: #6b7280;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.tab-btn:hover {
		color: #374151;
	}
	
	.tab-btn.active {
		color: #3b82f6;
		border-bottom-color: #3b82f6;
	}
	
	.share-link-container {
		background: #f9fafb;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
	}
	
	.link-display {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
	
	.link-input {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		background: white;
	}
	
	.copy-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.copy-btn:hover {
		background: #f3f4f6;
	}
	
	.copy-btn.copied {
		background: #10b981;
		color: white;
		border-color: #10b981;
	}
	
	.help-text {
		font-size: 0.75rem;
		color: #6b7280;
		margin: 0;
	}
	
	.email-share {
		margin-bottom: 1.5rem;
	}
	
	.form-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.75rem;
	}
	
	.email-input-group {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
	
	.form-input {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
	}
	
	.form-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.remove-btn {
		padding: 0.5rem;
		background: #fff;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.remove-btn:hover {
		background: #fef2f2;
		border-color: #fca5a5;
		color: #dc2626;
	}
	
	.add-email-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: none;
		border: 1px dashed #d1d5db;
		border-radius: 6px;
		color: #6b7280;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
		width: 100%;
		justify-content: center;
	}
	
	.add-email-btn:hover {
		border-color: #3b82f6;
		color: #3b82f6;
		background: #eff6ff;
	}
	
	.permission-section {
		margin-bottom: 1.5rem;
	}
	
	.permission-options {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.radio-option {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.radio-option:hover {
		background: #f9fafb;
		border-color: #d1d5db;
	}
	
	.radio-option input[type="radio"] {
		margin-top: 0.125rem;
	}
	
	.radio-option span {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
	}
	
	.radio-option strong {
		font-size: 0.875rem;
		color: #111827;
	}
	
	.radio-option small {
		font-size: 0.75rem;
		color: #6b7280;
	}
	
	.checkbox-option {
		margin-bottom: 1.5rem;
	}
	
	.checkbox-option label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.875rem;
		color: #374151;
		transition: all 0.2s;
	}
	
	.checkbox-option label:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
	}
	
	.expiration-section {
		margin-bottom: 1.5rem;
	}
	
	.form-select {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		background: white;
	}
	
	.form-select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.modal-footer {
		padding: 1.5rem;
		border-top: 1px solid #e5e7eb;
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}
	
	.btn-secondary,
	.btn-primary {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.btn-secondary {
		background: white;
		border: 1px solid #d1d5db;
		color: #374151;
	}
	
	.btn-secondary:hover {
		background: #f3f4f6;
	}
	
	.btn-primary {
		background: #3b82f6;
		border: 1px solid #3b82f6;
		color: white;
	}
	
	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
	}
	
	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	/* Dark mode */
	:global(.dark) .modal-container {
		background: #1f2937;
	}
	
	:global(.dark) .modal-header {
		border-bottom-color: #374151;
	}
	
	:global(.dark) .modal-header h2 {
		color: #f3f4f6;
	}
	
	:global(.dark) .close-btn {
		color: #9ca3af;
	}
	
	:global(.dark) .close-btn:hover {
		background: #374151;
		color: #e5e7eb;
	}
	
	:global(.dark) .share-tabs {
		border-bottom-color: #374151;
	}
	
	:global(.dark) .tab-btn {
		color: #9ca3af;
	}
	
	:global(.dark) .tab-btn:hover {
		color: #e5e7eb;
	}
	
	:global(.dark) .tab-btn.active {
		color: #60a5fa;
		border-bottom-color: #60a5fa;
	}
	
	:global(.dark) .share-link-container {
		background: #111827;
	}
	
	:global(.dark) .link-input,
	:global(.dark) .form-input,
	:global(.dark) .form-select {
		background: #1f2937;
		border-color: #374151;
		color: #e5e7eb;
	}
	
	:global(.dark) .copy-btn,
	:global(.dark) .remove-btn {
		background: #1f2937;
		border-color: #374151;
		color: #9ca3af;
	}
	
	:global(.dark) .copy-btn:hover,
	:global(.dark) .remove-btn:hover {
		background: #374151;
	}
	
	:global(.dark) .form-label {
		color: #e5e7eb;
	}
	
	:global(.dark) .radio-option,
	:global(.dark) .checkbox-option label {
		background: #111827;
		border-color: #374151;
	}
	
	:global(.dark) .radio-option:hover,
	:global(.dark) .checkbox-option label:hover {
		background: #1f2937;
		border-color: #4b5563;
	}
	
	:global(.dark) .radio-option strong {
		color: #f3f4f6;
	}
	
	:global(.dark) .radio-option small,
	:global(.dark) .help-text {
		color: #9ca3af;
	}
	
	:global(.dark) .modal-footer {
		border-top-color: #374151;
	}
	
	:global(.dark) .btn-secondary {
		background: #1f2937;
		border-color: #374151;
		color: #e5e7eb;
	}
	
	:global(.dark) .btn-secondary:hover {
		background: #374151;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	
	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>
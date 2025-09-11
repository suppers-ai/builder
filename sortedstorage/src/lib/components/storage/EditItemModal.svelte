<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { X, Calendar, FileText } from 'lucide-svelte';
	import Modal from '../common/Modal.svelte';
	import EmojiPicker from '../common/EmojiPicker.svelte';
	import type { StorageItem, StorageObjectMetadata } from '$lib/types/storage';
	import { isFolder, parseMetadata } from '$lib/types/storage';
	
	export let open = false;
	export let item: StorageItem | null = null;
	export let onSave: ((item: StorageItem) => void) | undefined = undefined;
	
	const dispatch = createEventDispatcher();
	
	let name = '';
	let description = '';
	let icon = '';
	let date = '';
	let showEmojiPicker = false;
	let initialized = false;
	let isSaving = false;
	
	// Initialize form when modal opens
	$: if (open && item && !initialized) {
		console.log('EditItemModal - onSave prop:', typeof onSave, onSave);
		name = item.object_name || '';
		// Extract fields from metadata
		const meta = parseMetadata(item);
		description = meta?.description || '';
		icon = meta?.icon || (isFolder(item) ? '📁' : '📄');
		date = meta?.date || new Date().toISOString().split('T')[0];
		initialized = true;
	}
	
	// Reset initialization flag when modal closes
	$: if (!open) {
		initialized = false;
	}
	
	function handleSave() {
		console.log('handleSave called');
		if (item && name.trim()) {
			const existingMeta = parseMetadata(item) || {};
			const updatedMetadata: StorageObjectMetadata = {
				...existingMeta,
				description: description.trim(),
				icon,
				date,
				lastModified: new Date().toISOString()
			};
			const updatedItem: StorageItem = {
				...item,
				object_name: name.trim(),
				metadata: JSON.stringify(updatedMetadata)
			};
			
			// Use callback if provided, otherwise dispatch event
			if (onSave) {
				console.log('Calling onSave callback with:', updatedItem);
				onSave(updatedItem);
			} else {
				console.log('Dispatching update event with:', updatedItem);
				dispatch('update', updatedItem);
			}
		}
	}
	
	function handleEmojiSelect(event: CustomEvent<string>) {
		icon = event.detail;
		showEmojiPicker = false;
	}
	
	function resetModal() {
		name = '';
		description = '';
		icon = '';
		date = '';
		open = false;
		initialized = false;
		isSaving = false;
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && event.ctrlKey && name.trim()) {
			handleSave();
		}
	}
</script>

<Modal bind:open on:close={resetModal}>
	<div class="edit-modal">
		<div class="modal-header">
			<h2>Edit {item && isFolder(item) ? 'Folder' : 'File'}</h2>
			<button class="close-btn" on:click={resetModal}>
				<X size={20} />
			</button>
		</div>
		
		<div class="form-content">
			<!-- Icon and Name on same row -->
			<div class="form-group icon-name-row">
				<label for="item-name">
					<FileText size={16} />
					Name
				</label>
				<div class="input-with-icon">
					<button 
						class="icon-button"
						on:click={() => showEmojiPicker = true}
						type="button"
						aria-label="Select icon"
					>
						<span class="current-icon">{icon}</span>
					</button>
					<input
						id="item-name"
						type="text"
						bind:value={name}
						placeholder="Enter {item && isFolder(item) ? 'folder' : 'file'} name..."
						autocomplete="off"
					/>
				</div>
			</div>
			
			<!-- Description Input -->
			<div class="form-group">
				<label for="item-description">Description</label>
				<textarea
					id="item-description"
					bind:value={description}
					placeholder="Add a description (optional)..."
					rows="3"
				/>
			</div>
			
			<!-- Date Input -->
			<div class="form-group">
				<label for="item-date">
					<Calendar size={16} />
					Date
				</label>
				<input
					id="item-date"
					type="date"
					bind:value={date}
				/>
				<span class="helper-text">Used for organizing and sorting</span>
			</div>
		</div>
		
		<div class="modal-actions">
			<button class="btn-cancel" on:click={resetModal}>Cancel</button>
			<button 
				class="btn-save" 
				on:click={handleSave}
				disabled={!name.trim()}
			>
				Save Changes
			</button>
		</div>
	</div>
</Modal>

<!-- Emoji Picker -->
<EmojiPicker 
	bind:open={showEmojiPicker} 
	selectedEmoji={icon}
	on:select={handleEmojiSelect}
/>

<style>
	.edit-modal {
		padding: 1.5rem;
		min-width: 450px;
		max-width: 500px;
	}
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}
	
	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: var(--text-primary);
	}
	
	.close-btn {
		background: none;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
		color: var(--text-muted);
		transition: color 0.2s;
	}
	
	.close-btn:hover {
		color: var(--text-primary);
	}
	
	.form-content {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.form-group label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-primary);
	}
	
	.form-group input,
	.form-group textarea {
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		font-size: 0.95rem;
		transition: border-color 0.2s;
		font-family: inherit;
		background: white;
	}
	
	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.form-group textarea {
		resize: vertical;
		min-height: 80px;
	}
	
	.input-with-icon {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.icon-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		padding: 0;
		background: white;
		border: 2px solid var(--border-color);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
	}
	
	.icon-button:hover {
		background: var(--hover-bg);
		border-color: var(--primary-color);
		transform: scale(1.05);
	}
	
	.icon-button:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.current-icon {
		font-size: 1.2rem;
		line-height: 1;
	}
	
	.input-with-icon input {
		flex: 1;
	}
	
	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border-color);
	}
	
	.btn-cancel, .btn-save {
		padding: 0.5rem 1.25rem;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.btn-cancel {
		background: white;
		border: 1px solid var(--border-color);
		color: var(--text-primary);
	}
	
	.btn-cancel:hover {
		background: var(--hover-bg);
	}
	
	.btn-save {
		background: var(--primary-color);
		border: 1px solid var(--primary-color);
		color: white;
	}
	
	.btn-save:hover:not(:disabled) {
		background: var(--primary-hover);
		border-color: var(--primary-hover);
	}
	
	.btn-save:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
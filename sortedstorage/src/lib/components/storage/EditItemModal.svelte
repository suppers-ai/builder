<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { X, Calendar, FileText } from 'lucide-svelte';
	import Modal from '../common/Modal.svelte';
	import EmojiPicker from '../common/EmojiPicker.svelte';
	import type { StorageItem } from '$lib/types/storage';
	
	export let open = false;
	export let item: StorageItem | null = null;
	
	const dispatch = createEventDispatcher();
	
	let name = '';
	let description = '';
	let icon = '';
	let metadata: { date?: string } = {};
	let showEmojiPicker = false;
	
	// Initialize form when item changes
	$: if (item) {
		name = item.name;
		description = item.description || '';
		icon = item.icon || (item.type === 'folder' ? '📁' : '📄');
		metadata = item.metadata || {};
		if (!metadata.date) {
			metadata.date = new Date().toISOString().split('T')[0];
		}
	}
	
	function handleSave() {
		if (item && name.trim()) {
			const updatedItem: StorageItem = {
				...item,
				name: name.trim(),
				description: description.trim(),
				icon,
				metadata: {
					...metadata,
					lastModified: new Date().toISOString()
				}
			};
			dispatch('update', updatedItem);
			resetModal();
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
		metadata = {};
		open = false;
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && event.ctrlKey && name.trim()) {
			handleSave();
		}
	}
</script>

<Modal bind:open on:close={resetModal}>
	<div class="edit-modal" on:keydown={handleKeydown}>
		<div class="modal-header">
			<h2>Edit {item?.type === 'folder' ? 'Folder' : 'File'}</h2>
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
						placeholder="Enter {item?.type} name..."
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
					bind:value={metadata.date}
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
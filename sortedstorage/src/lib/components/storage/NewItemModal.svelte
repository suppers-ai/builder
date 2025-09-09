<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { File, Folder, X } from 'lucide-svelte';
	import Modal from '../common/Modal.svelte';
	
	export let open = false;
	
	const dispatch = createEventDispatcher();
	
	let selectedType: 'file' | 'folder' | null = null;
	let name = '';
	let selectedFiles: FileList | null = null;
	let fileInputRef: HTMLInputElement;
	let folderNameInputRef: HTMLInputElement;
	
	function handleSelectType(type: 'file' | 'folder') {
		if (type === 'folder') {
			selectedType = 'folder';
			// Focus on input after type selection for folders
			setTimeout(() => {
				folderNameInputRef?.focus();
			}, 100);
		} else {
			// For files, trigger file selection immediately without changing selectedType
			// This keeps the modal open
			if (fileInputRef) {
				fileInputRef.click();
			}
		}
	}
	
	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		console.log('File select event:', { files: input.files, length: input.files?.length });
		
		if (input.files && input.files.length > 0) {
			selectedFiles = input.files;
			console.log('Files selected, dispatching create event');
			// Dispatch create event with the files
			dispatch('create', { type: 'file', files: selectedFiles });
			resetModal();
		} else {
			console.log('No files selected');
			// If no files selected, just stay on the modal
			selectedType = null;
		}
	}
	
	function handleCreate() {
		if (selectedType === 'folder' && name.trim()) {
			dispatch('create', { type: selectedType, name: name.trim() });
			resetModal();
		}
	}
	
	function resetModal() {
		selectedType = null;
		name = '';
		selectedFiles = null;
		open = false;
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && selectedType && name.trim()) {
			handleCreate();
		}
	}
</script>

<Modal bind:open on:close={resetModal}>
	<div class="new-item-modal">
		<div class="modal-header">
			<h2>Create New</h2>
			<button class="close-btn" on:click={resetModal}>
				<X size={20} />
			</button>
		</div>
		
		{#if !selectedType}
			<div class="type-selection">
				<button class="type-option" on:click={() => handleSelectType('folder')}>
					<Folder size={48} />
					<span>New Folder</span>
				</button>
				<button class="type-option" on:click={() => handleSelectType('file')}>
					<File size={48} />
					<span>Upload Files</span>
				</button>
			</div>
			<!-- Hidden file input -->
			<input 
				bind:this={fileInputRef}
				type="file"
				multiple
				class="hidden"
				on:change={handleFileSelect}
			/>
		{:else if selectedType === 'folder'}
			<div class="name-input">
				<label for="item-name">
					Folder Name
				</label>
				<input
					bind:this={folderNameInputRef}
					id="item-name"
					type="text"
					bind:value={name}
					on:keydown={handleKeydown}
					placeholder="Enter folder name..."
					autocomplete="off"
				/>
				<div class="modal-actions">
					<button class="btn-cancel" on:click={resetModal}>Cancel</button>
					<button 
						class="btn-create" 
						on:click={handleCreate}
						disabled={!name.trim()}
					>
						Create Folder
					</button>
				</div>
			</div>
		{/if}
	</div>
</Modal>

<style>
	.new-item-modal {
		padding: 1.5rem;
		min-width: 400px;
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
	
	.type-selection {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-top: 1rem;
	}
	
	.type-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 2rem 1rem;
		background: white;
		border: 2px solid var(--border-color);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		color: var(--text-primary);
	}
	
	.type-option:hover {
		background: var(--hover-bg);
		border-color: var(--primary-color);
		transform: translateY(-2px);
	}
	
	.type-option span {
		font-size: 0.95rem;
		font-weight: 500;
	}
	
	.name-input {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.name-input label {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-primary);
	}
	
	.name-input input {
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}
	
	.name-input input:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}
	
	.btn-cancel, .btn-create {
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
	
	.btn-create {
		background: var(--primary-color);
		border: 1px solid var(--primary-color);
		color: white;
	}
	
	.btn-create:hover:not(:disabled) {
		background: var(--primary-hover);
		border-color: var(--primary-hover);
	}
	
	.btn-create:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
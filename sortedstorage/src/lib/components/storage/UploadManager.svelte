<script lang="ts">
	import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-svelte';
	import { storage, uploadQueue } from '$lib/stores/storage';
	import { notifications } from '$lib/stores/notifications';
	import { fade, slide } from 'svelte/transition';
	
	export let maxFileSize = 100 * 1024 * 1024; // 100MB
	export let allowedTypes: string[] = [];
	export let multiple = true;
	
	let dragActive = false;
	let fileInput: HTMLInputElement;
	
	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		dragActive = true;
	}
	
	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		if (e.currentTarget === e.target) {
			dragActive = false;
		}
	}
	
	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}
	
	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragActive = false;
		
		const files = Array.from(e.dataTransfer?.files || []);
		handleFiles(files);
	}
	
	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const files = Array.from(input.files || []);
		handleFiles(files);
	}
	
	function handleFiles(files: File[]) {
		// Validate files
		const validFiles = files.filter(file => {
			if (maxFileSize && file.size > maxFileSize) {
				notifications.error('File too large', `${file.name} exceeds the maximum size of ${formatFileSize(maxFileSize)}`);
				return false;
			}
			
			if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
				notifications.error('Invalid file type', `${file.name} is not an allowed file type`);
				return false;
			}
			
			return true;
		});
		
		if (validFiles.length > 0) {
			const progressId = notifications.progress(
				'Uploading files',
				0,
				validFiles.length,
				{ duration: 0 }
			);
			
			// Start upload
			storage.uploadFiles(validFiles);
		}
	}
	
	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	}
	
	function getStatusIcon(status: string) {
		switch (status) {
			case 'completed':
				return CheckCircle;
			case 'error':
				return AlertCircle;
			default:
				return File;
		}
	}
	
	function getStatusColor(status: string) {
		switch (status) {
			case 'completed':
				return 'text-green-500';
			case 'error':
				return 'text-red-500';
			case 'uploading':
				return 'text-blue-500';
			default:
				return 'text-gray-400';
		}
	}
</script>

<div class="upload-manager">
	<!-- Drop Zone -->
	<div
		class="relative border-2 border-dashed rounded-lg p-8 text-center transition-all
			{dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'}"
		on:dragenter={handleDragEnter}
		on:dragleave={handleDragLeave}
		on:dragover={handleDragOver}
		on:drop={handleDrop}
		role="button"
		tabindex="0"
	>
		<Upload class="w-12 h-12 mx-auto mb-4 text-gray-400" />
		<p class="text-lg font-medium mb-2">
			{dragActive ? 'Drop files here' : 'Drag & drop files here'}
		</p>
		<p class="text-sm text-gray-500 mb-4">or</p>
		<button
			on:click={() => fileInput.click()}
			class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
		>
			Browse Files
		</button>
		<input
			bind:this={fileInput}
			type="file"
			{multiple}
			accept={allowedTypes.join(',')}
			on:change={handleFileSelect}
			class="hidden"
		/>
		<p class="text-xs text-gray-500 mt-4">
			Maximum file size: {formatFileSize(maxFileSize)}
		</p>
	</div>
	
	<!-- Upload Queue -->
	{#if $uploadQueue.length > 0}
		<div class="mt-6 space-y-2" transition:slide>
			<h3 class="text-sm font-medium mb-2">Upload Queue</h3>
			{#each $uploadQueue as upload (upload.id)}
				<div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg" transition:fade>
					<svelte:component 
						this={getStatusIcon(upload.status)} 
						class="w-5 h-5 {getStatusColor(upload.status)}"
					/>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium truncate">{upload.name}</p>
						{#if upload.status === 'uploading'}
							<div class="mt-1">
								<div class="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
									<div 
										class="h-full bg-primary-500 transition-all duration-300"
										style="width: {upload.progress}%"
									/>
								</div>
								<p class="text-xs text-gray-500 mt-1">{Math.round(upload.progress)}%</p>
							</div>
						{:else if upload.status === 'error'}
							<p class="text-xs text-red-500">{upload.error}</p>
						{:else if upload.status === 'completed'}
							<p class="text-xs text-green-500">Upload complete</p>
						{/if}
					</div>
					{#if upload.status === 'error' || upload.status === 'completed'}
						<button
							on:click={() => {
								uploadQueue.update(queue => queue.filter(u => u.id !== upload.id));
							}}
							class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
						>
							<X class="w-4 h-4" />
						</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
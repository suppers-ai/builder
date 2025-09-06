<script lang="ts">
	import { 
		Download, Share2, X, ZoomIn, ZoomOut, RotateCw,
		ChevronLeft, ChevronRight, FileText, Code, Image,
		File, Film, Music, Archive, Presentation
	} from 'lucide-svelte';
	import Modal from '../common/Modal.svelte';
	import Button from '../common/Button.svelte';
	import type { FileItem } from '$lib/types/storage';
	
	export let open = false;
	export let file: FileItem | null = null;
	
	let zoom = 100;
	let rotation = 0;
	let currentPage = 1;
	let totalPages = 1;
	let pdfError = false;
	
	$: isImage = file?.mimeType.startsWith('image/');
	$: isPDF = file?.mimeType === 'application/pdf';
	$: isText = file?.mimeType.startsWith('text/') || 
		['.txt', '.md', '.json', '.js', '.ts', '.css', '.html', '.xml', '.yaml', '.yml'].some(ext => 
			file?.name.endsWith(ext)
		);
	$: isCode = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.go', '.rs', '.php', '.rb', '.swift'].some(ext => 
		file?.name.endsWith(ext)
	);
	$: isMarkdown = file?.name.endsWith('.md');
	$: isVideo = file?.mimeType.startsWith('video/');
	$: isAudio = file?.mimeType.startsWith('audio/');
	$: isArchive = ['application/zip', 'application/x-rar', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip'].includes(file?.mimeType || '');
	$: isOfficeDoc = [
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/vnd.ms-excel',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'application/vnd.ms-powerpoint',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation'
	].includes(file?.mimeType || '');
	
	function handleZoomIn() {
		zoom = Math.min(zoom + 25, 200);
	}
	
	function handleZoomOut() {
		zoom = Math.max(zoom - 25, 50);
	}
	
	function handleRotate() {
		rotation = (rotation + 90) % 360;
	}
	
	function handleDownload() {
		if (!file) return;
		// Trigger download
		window.open(`/api/storage/download/${file.id}`, '_blank');
	}
	
	function handleShare() {
		// Open share dialog
		// This would be handled by parent component
	}
	
	function handlePreviousPage() {
		if (currentPage > 1) {
			currentPage--;
		}
	}
	
	function handleNextPage() {
		if (currentPage < totalPages) {
			currentPage++;
		}
	}
	
	function getFileIcon() {
		if (isImage) return Image;
		if (isPDF) return FileText;
		if (isCode) return Code;
		if (isVideo) return Film;
		if (isAudio) return Music;
		if (isArchive) return Archive;
		if (isOfficeDoc) return Presentation;
		return File;
	}
	
	function getSyntaxLanguage(filename: string): string {
		const ext = filename.split('.').pop()?.toLowerCase();
		const languageMap: Record<string, string> = {
			'js': 'javascript',
			'ts': 'typescript',
			'jsx': 'javascript',
			'tsx': 'typescript',
			'py': 'python',
			'java': 'java',
			'cpp': 'cpp',
			'c': 'c',
			'go': 'go',
			'rs': 'rust',
			'php': 'php',
			'rb': 'ruby',
			'swift': 'swift',
			'json': 'json',
			'xml': 'xml',
			'yaml': 'yaml',
			'yml': 'yaml',
			'css': 'css',
			'scss': 'scss',
			'html': 'html',
			'md': 'markdown'
		};
		return languageMap[ext || ''] || 'plaintext';
	}
	
	$: if (!open) {
		// Reset view
		zoom = 100;
		rotation = 0;
		currentPage = 1;
		totalPages = 1;
		pdfError = false;
	}
</script>

<Modal bind:open title={file?.name || 'Preview'} size="xl" closable={true}>
	<div class="file-preview">
		{#if file}
			<!-- Preview Toolbar -->
			<div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
				<div class="flex items-center gap-2">
					{#if isImage}
						<Button variant="ghost" size="sm" on:click={handleZoomIn} icon={ZoomIn}>
							Zoom In
						</Button>
						<Button variant="ghost" size="sm" on:click={handleZoomOut} icon={ZoomOut}>
							Zoom Out
						</Button>
						<Button variant="ghost" size="sm" on:click={handleRotate} icon={RotateCw}>
							Rotate
						</Button>
						<span class="text-sm text-gray-500 ml-2">{zoom}%</span>
					{:else if isPDF}
						<Button 
							variant="ghost" 
							size="sm" 
							on:click={handlePreviousPage} 
							icon={ChevronLeft}
							disabled={currentPage <= 1}
						>
							Previous
						</Button>
						<span class="text-sm text-gray-500 px-2">
							Page {currentPage} of {totalPages}
						</span>
						<Button 
							variant="ghost" 
							size="sm" 
							on:click={handleNextPage} 
							icon={ChevronRight}
							disabled={currentPage >= totalPages}
						>
							Next
						</Button>
					{/if}
				</div>
				
				<div class="flex items-center gap-2">
					<Button variant="ghost" size="sm" on:click={handleShare} icon={Share2}>
						Share
					</Button>
					<Button variant="primary" size="sm" on:click={handleDownload} icon={Download}>
						Download
					</Button>
				</div>
			</div>
			
			<!-- Preview Content -->
			<div class="preview-content overflow-auto" style="max-height: 70vh;">
				{#if isImage}
					<!-- Image Preview -->
					<div class="flex justify-center items-center min-h-[400px] bg-gray-50 dark:bg-gray-900 rounded-lg">
						<img
							src={`/api/storage/preview/${file.id}`}
							alt={file.name}
							class="max-w-full h-auto transition-transform duration-200"
							style="transform: scale({zoom / 100}) rotate({rotation}deg)"
						/>
					</div>
				{:else if isPDF}
					<!-- PDF Preview -->
					{#if pdfError}
						<div class="flex flex-col items-center justify-center h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg">
							<FileText class="w-16 h-16 text-gray-400 mb-4" />
							<p class="text-gray-500 mb-2">Unable to load PDF preview</p>
							<p class="text-sm text-gray-400 mb-4">The PDF viewer is not available</p>
							<Button on:click={handleDownload} icon={Download}>
								Download PDF
							</Button>
						</div>
					{:else}
						<iframe
							src={`/api/storage/preview/${file.id}#page=${currentPage}`}
							title={file.name}
							class="w-full h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg"
							on:error={() => pdfError = true}
						/>
					{/if}
				{:else if isText || isCode}
					<!-- Text/Code Preview -->
					<div class="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
						{#if isCode}
							<div class="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
								<div class="flex items-center gap-2">
									<Code class="w-4 h-4 text-gray-500" />
									<span class="text-sm text-gray-500 font-mono">{getSyntaxLanguage(file.name)}</span>
								</div>
								<span class="text-xs text-gray-400">{file.name}</span>
							</div>
						{/if}
						<div class="p-4 overflow-x-auto">
							<pre class="text-sm font-mono whitespace-pre break-words {isCode ? 'code-highlight' : ''}">
								{#await fetch(`/api/storage/preview/${file.id}`).then(r => r.text())}
									<div class="flex items-center gap-2">
										<div class="animate-spin h-4 w-4 border-2 border-gray-300 border-t-primary-500 rounded-full"></div>
										<span class="text-gray-500">Loading content...</span>
									</div>
								{:then content}
									{#if isMarkdown}
										<!-- For markdown, we'd ideally render it, but for now show raw -->
										<code>{content}</code>
									{:else}
										<code>{content}</code>
									{/if}
								{:catch error}
									<div class="text-red-500">Failed to load preview</div>
								{/await}
							</pre>
						</div>
					</div>
				{:else if isVideo}
					<!-- Video Preview -->
					<video
						controls
						class="w-full rounded-lg"
						src={`/api/storage/preview/${file.id}`}
					>
						<track kind="captions" />
						Your browser does not support video playback.
					</video>
				{:else if isAudio}
					<!-- Audio Preview -->
					<div class="bg-gray-50 dark:bg-gray-900 p-8 rounded-lg text-center">
						<div class="mb-4">
							<div class="w-24 h-24 mx-auto bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
								<svg class="w-12 h-12 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
									<path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
								</svg>
							</div>
						</div>
						<audio
							controls
							class="w-full"
							src={`/api/storage/preview/${file.id}`}
						>
							Your browser does not support audio playback.
						</audio>
					</div>
				{:else if isOfficeDoc}
					<!-- Office Document Preview -->
					<div class="flex flex-col items-center justify-center h-[400px] bg-gray-50 dark:bg-gray-900 rounded-lg">
						<div class="w-24 h-24 mx-auto bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
							<Presentation class="w-12 h-12 text-primary-600" />
						</div>
						<p class="text-gray-500 mb-2">Office document preview</p>
						<p class="text-sm text-gray-400 mb-4">{file.name}</p>
						<div class="flex gap-2">
							<Button variant="outline" size="sm" on:click={() => window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(window.location.origin + `/api/storage/download/${file.id}`)}`, '_blank')}>
								Open in Office Online
							</Button>
							<Button on:click={handleDownload} icon={Download}>
								Download
							</Button>
						</div>
					</div>
				{:else if isArchive}
					<!-- Archive Preview -->
					<div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
						<div class="flex items-center gap-3 mb-4">
							<Archive class="w-8 h-8 text-orange-500" />
							<div>
								<p class="font-medium">{file.name}</p>
								<p class="text-sm text-gray-500">Archive file</p>
							</div>
						</div>
						<div class="space-y-2 mb-4">
							<div class="flex justify-between text-sm">
								<span class="text-gray-500">Compressed size:</span>
								<span class="font-medium">{formatFileSize(file.size)}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-gray-500">Format:</span>
								<span class="font-medium">{file.mimeType}</span>
							</div>
						</div>
						<Button class="w-full" on:click={handleDownload} icon={Download}>
							Download Archive
						</Button>
					</div>
				{:else}
					<!-- No Preview Available -->
					<div class="text-center py-12">
						<div class="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
							<svelte:component this={getFileIcon()} class="w-12 h-12 text-gray-400" />
						</div>
						<p class="text-gray-500 mb-2">Preview not available for this file type</p>
						<p class="text-sm text-gray-400">{file.mimeType || 'Unknown type'}</p>
						<Button class="mt-4" on:click={handleDownload} icon={Download}>
							Download File
						</Button>
					</div>
				{/if}
			</div>
			
			<!-- File Info -->
			<div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div>
						<span class="text-gray-500">Size:</span>
						<span class="ml-2 font-medium">{formatFileSize(file.size)}</span>
					</div>
					<div>
						<span class="text-gray-500">Type:</span>
						<span class="ml-2 font-medium">{file.mimeType}</span>
					</div>
					<div>
						<span class="text-gray-500">Modified:</span>
						<span class="ml-2 font-medium">{new Date(file.modifiedAt).toLocaleDateString()}</span>
					</div>
					<div>
						<span class="text-gray-500">Created:</span>
						<span class="ml-2 font-medium">{new Date(file.createdAt).toLocaleDateString()}</span>
					</div>
				</div>
			</div>
		{/if}
	</div>
</Modal>

<style>
	.preview-content {
		scrollbar-width: thin;
		scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
	}
	
	.preview-content::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}
	
	.preview-content::-webkit-scrollbar-thumb {
		background-color: rgba(156, 163, 175, 0.5);
		border-radius: 4px;
	}
	
	.code-highlight {
		tab-size: 4;
	}
	
	.code-highlight code {
		counter-reset: line;
	}
	
	/* Line numbers for code preview */
	.code-highlight code::before {
		counter-increment: line;
		content: counter(line);
		display: inline-block;
		width: 3em;
		margin-right: 1em;
		color: #6b7280;
		text-align: right;
		user-select: none;
	}
</style>

<script context="module" lang="ts">
	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	}
</script>
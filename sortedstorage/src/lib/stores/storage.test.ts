import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { storage } from './storage';

describe('Storage Store', () => {
	beforeEach(() => {
		// Reset store state
		storage.clearFiles();
		vi.clearAllMocks();
	});

	describe('File Management', () => {
		it('initializes with empty files', () => {
			const files = get(storage.files$);
			expect(files).toEqual([]);
		});

		it('adds files to the store', async () => {
			const mockFiles = [
				{
					id: '1',
					name: 'test.txt',
					size: 1024,
					type: 'file' as const,
					mimeType: 'text/plain',
					path: '/test.txt',
					createdAt: new Date(),
					modifiedAt: new Date(),
					owner: { id: '1', name: 'User' },
					isShared: false,
					permissions: []
				}
			];

			await storage.setFiles(mockFiles);
			const files = get(storage.files$);
			expect(files).toEqual(mockFiles);
		});

		it('filters files by search query', async () => {
			const mockFiles = [
				{
					id: '1',
					name: 'document.pdf',
					size: 2048,
					type: 'file' as const,
					mimeType: 'application/pdf',
					path: '/document.pdf',
					createdAt: new Date(),
					modifiedAt: new Date(),
					owner: { id: '1', name: 'User' },
					isShared: false,
					permissions: []
				},
				{
					id: '2',
					name: 'image.png',
					size: 4096,
					type: 'file' as const,
					mimeType: 'image/png',
					path: '/image.png',
					createdAt: new Date(),
					modifiedAt: new Date(),
					owner: { id: '1', name: 'User' },
					isShared: false,
					permissions: []
				}
			];

			await storage.setFiles(mockFiles);
			storage.setSearchQuery('document');
			
			const filtered = get(storage.filteredFiles$);
			expect(filtered).toHaveLength(1);
			expect(filtered[0].name).toBe('document.pdf');
		});

		it('sorts files by name', async () => {
			const mockFiles = [
				{
					id: '1',
					name: 'zebra.txt',
					size: 100,
					type: 'file' as const,
					mimeType: 'text/plain',
					path: '/zebra.txt',
					createdAt: new Date(),
					modifiedAt: new Date(),
					owner: { id: '1', name: 'User' },
					isShared: false,
					permissions: []
				},
				{
					id: '2',
					name: 'apple.txt',
					size: 200,
					type: 'file' as const,
					mimeType: 'text/plain',
					path: '/apple.txt',
					createdAt: new Date(),
					modifiedAt: new Date(),
					owner: { id: '1', name: 'User' },
					isShared: false,
					permissions: []
				}
			];

			await storage.setFiles(mockFiles);
			storage.setSortBy('name');
			storage.setSortOrder('asc');
			
			const sorted = get(storage.sortedFiles$);
			expect(sorted[0].name).toBe('apple.txt');
			expect(sorted[1].name).toBe('zebra.txt');
		});

		it('deletes a file', async () => {
			const mockFiles = [
				{
					id: '1',
					name: 'test.txt',
					size: 1024,
					type: 'file' as const,
					mimeType: 'text/plain',
					path: '/test.txt',
					createdAt: new Date(),
					modifiedAt: new Date(),
					owner: { id: '1', name: 'User' },
					isShared: false,
					permissions: []
				}
			];

			await storage.setFiles(mockFiles);
			await storage.deleteItem('1');
			
			const files = get(storage.files$);
			expect(files).toHaveLength(0);
		});
	});

	describe('Folder Management', () => {
		it('creates a folder', async () => {
			await storage.createFolder('New Folder', '/');
			
			const folders = get(storage.folders$);
			expect(folders).toHaveLength(1);
			expect(folders[0].name).toBe('New Folder');
			expect(folders[0].path).toBe('/New Folder');
		});

		it('navigates to a folder', () => {
			storage.setCurrentPath('/documents');
			
			const path = get(storage.currentPath$);
			expect(path).toBe('/documents');
		});

		it('generates breadcrumbs from path', () => {
			storage.setCurrentPath('/documents/projects/2024');
			
			const breadcrumbs = get(storage.breadcrumbs$);
			expect(breadcrumbs).toEqual([
				{ name: 'Home', path: '/' },
				{ name: 'documents', path: '/documents' },
				{ name: 'projects', path: '/documents/projects' },
				{ name: '2024', path: '/documents/projects/2024' }
			]);
		});
	});

	describe('Upload Queue', () => {
		it('adds files to upload queue', () => {
			const file = new File(['content'], 'test.txt', { type: 'text/plain' });
			storage.addToUploadQueue([file]);
			
			const queue = get(storage.uploadQueue$);
			expect(queue).toHaveLength(1);
			expect(queue[0].file.name).toBe('test.txt');
			expect(queue[0].status).toBe('pending');
		});

		it('updates upload progress', () => {
			const file = new File(['content'], 'test.txt', { type: 'text/plain' });
			storage.addToUploadQueue([file]);
			
			const queue = get(storage.uploadQueue$);
			const uploadId = queue[0].id;
			
			storage.updateUploadProgress(uploadId, 50);
			
			const updatedQueue = get(storage.uploadQueue$);
			expect(updatedQueue[0].progress).toBe(50);
			expect(updatedQueue[0].status).toBe('uploading');
		});

		it('marks upload as completed', () => {
			const file = new File(['content'], 'test.txt', { type: 'text/plain' });
			storage.addToUploadQueue([file]);
			
			const queue = get(storage.uploadQueue$);
			const uploadId = queue[0].id;
			
			storage.completeUpload(uploadId);
			
			const updatedQueue = get(storage.uploadQueue$);
			expect(updatedQueue[0].status).toBe('completed');
			expect(updatedQueue[0].progress).toBe(100);
		});

		it('handles upload error', () => {
			const file = new File(['content'], 'test.txt', { type: 'text/plain' });
			storage.addToUploadQueue([file]);
			
			const queue = get(storage.uploadQueue$);
			const uploadId = queue[0].id;
			
			storage.failUpload(uploadId, 'Network error');
			
			const updatedQueue = get(storage.uploadQueue$);
			expect(updatedQueue[0].status).toBe('error');
			expect(updatedQueue[0].error).toBe('Network error');
		});

		it('removes from upload queue', () => {
			const file = new File(['content'], 'test.txt', { type: 'text/plain' });
			storage.addToUploadQueue([file]);
			
			const queue = get(storage.uploadQueue$);
			const uploadId = queue[0].id;
			
			storage.removeFromUploadQueue(uploadId);
			
			const updatedQueue = get(storage.uploadQueue$);
			expect(updatedQueue).toHaveLength(0);
		});

		it('clears entire upload queue', () => {
			const files = [
				new File(['content1'], 'test1.txt', { type: 'text/plain' }),
				new File(['content2'], 'test2.txt', { type: 'text/plain' })
			];
			storage.addToUploadQueue(files);
			
			storage.clearUploadQueue();
			
			const queue = get(storage.uploadQueue$);
			expect(queue).toHaveLength(0);
		});
	});

	describe('Selection Management', () => {
		it('selects files', () => {
			storage.selectItems(['1', '2', '3']);
			
			const selected = get(storage.selectedItems$);
			expect(selected).toEqual(['1', '2', '3']);
		});

		it('toggles file selection', () => {
			storage.selectItems(['1', '2']);
			storage.toggleSelection('3');
			
			let selected = get(storage.selectedItems$);
			expect(selected).toContain('3');
			
			storage.toggleSelection('2');
			selected = get(storage.selectedItems$);
			expect(selected).not.toContain('2');
		});

		it('clears selection', () => {
			storage.selectItems(['1', '2', '3']);
			storage.clearSelection();
			
			const selected = get(storage.selectedItems$);
			expect(selected).toHaveLength(0);
		});
	});

	describe('Storage Stats', () => {
		it('calculates total storage used', async () => {
			const mockFiles = [
				{
					id: '1',
					name: 'file1.txt',
					size: 1024,
					type: 'file' as const,
					mimeType: 'text/plain',
					path: '/file1.txt',
					createdAt: new Date(),
					modifiedAt: new Date(),
					owner: { id: '1', name: 'User' },
					isShared: false,
					permissions: []
				},
				{
					id: '2',
					name: 'file2.txt',
					size: 2048,
					type: 'file' as const,
					mimeType: 'text/plain',
					path: '/file2.txt',
					createdAt: new Date(),
					modifiedAt: new Date(),
					owner: { id: '1', name: 'User' },
					isShared: false,
					permissions: []
				}
			];

			await storage.setFiles(mockFiles);
			
			const stats = get(storage.storageStats$);
			expect(stats.totalSize).toBe(3072);
			expect(stats.fileCount).toBe(2);
		});
	});
});
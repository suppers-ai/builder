import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import { writable, get } from 'svelte/store';
import FileExplorer from './FileExplorer.svelte';
import { storage } from '$lib/stores/storage';
import type { FileItem, FolderItem } from '$lib/types/storage';

// Mock the stores
vi.mock('$lib/stores/storage', () => ({
	storage: {
		files$: writable([]),
		folders$: writable([]),
		currentPath$: writable('/'),
		selectedItems$: writable([]),
		sortBy$: writable('name'),
		sortOrder$: writable('asc'),
		viewMode$: writable('grid'),
		searchQuery$: writable(''),
		filteredFiles$: writable([]),
		sortedFiles$: writable([]),
		setFiles: vi.fn(),
		setFolders: vi.fn(),
		setCurrentPath: vi.fn(),
		selectItems: vi.fn(),
		toggleSelection: vi.fn(),
		clearSelection: vi.fn(),
		setSortBy: vi.fn(),
		setSortOrder: vi.fn(),
		setViewMode: vi.fn(),
		setSearchQuery: vi.fn(),
		deleteItem: vi.fn(),
		createFolder: vi.fn(),
		renameItem: vi.fn(),
		moveItems: vi.fn(),
		copyItems: vi.fn()
	}
}));

describe('FileExplorer Component', () => {
	const mockFiles: FileItem[] = [
		{
			id: '1',
			name: 'document.pdf',
			size: 2048000,
			type: 'file',
			mimeType: 'application/pdf',
			path: '/document.pdf',
			createdAt: new Date('2024-01-01'),
			modifiedAt: new Date('2024-01-02'),
			owner: { id: 'user1', name: 'John Doe' },
			isShared: false,
			permissions: []
		},
		{
			id: '2',
			name: 'image.png',
			size: 1024000,
			type: 'file',
			mimeType: 'image/png',
			path: '/image.png',
			createdAt: new Date('2024-01-03'),
			modifiedAt: new Date('2024-01-04'),
			owner: { id: 'user1', name: 'John Doe' },
			isShared: true,
			permissions: []
		}
	];

	const mockFolders: FolderItem[] = [
		{
			id: 'folder1',
			name: 'Documents',
			type: 'folder',
			path: '/Documents',
			createdAt: new Date('2024-01-01'),
			modifiedAt: new Date('2024-01-02'),
			owner: { id: 'user1', name: 'John Doe' },
			itemCount: 5
		}
	];

	beforeEach(() => {
		vi.clearAllMocks();
		// Reset store values
		storage.files$.set(mockFiles);
		storage.folders$.set(mockFolders);
		storage.currentPath$.set('/');
		storage.selectedItems$.set([]);
		storage.viewMode$.set('grid');
		storage.searchQuery$.set('');
	});

	it('renders file explorer with files and folders', () => {
		const { container, getByText } = render(FileExplorer);
		
		// Check if files are rendered
		expect(getByText('document.pdf')).toBeInTheDocument();
		expect(getByText('image.png')).toBeInTheDocument();
		
		// Check if folder is rendered
		expect(getByText('Documents')).toBeInTheDocument();
	});

	it('switches between grid and list view', async () => {
		const { container, getByRole } = render(FileExplorer);
		
		// Initially in grid view
		expect(container.querySelector('.grid')).toBeInTheDocument();
		
		// Find and click the view toggle button
		const listViewButton = getByRole('button', { name: /list view/i });
		await fireEvent.click(listViewButton);
		
		expect(storage.setViewMode).toHaveBeenCalledWith('list');
	});

	it('handles file selection', async () => {
		const { container, getByText } = render(FileExplorer);
		
		const fileElement = getByText('document.pdf').closest('[role="article"]');
		expect(fileElement).toBeInTheDocument();
		
		// Click to select
		if (fileElement) {
			await fireEvent.click(fileElement);
			expect(storage.toggleSelection).toHaveBeenCalledWith('1');
		}
	});

	it('handles multiple selection with Ctrl/Cmd key', async () => {
		const { container, getByText } = render(FileExplorer);
		
		const file1 = getByText('document.pdf').closest('[role="article"]');
		const file2 = getByText('image.png').closest('[role="article"]');
		
		if (file1 && file2) {
			// Select first file
			await fireEvent.click(file1);
			
			// Select second file with Ctrl
			await fireEvent.click(file2, { ctrlKey: true });
			
			expect(storage.toggleSelection).toHaveBeenCalledTimes(2);
		}
	});

	it('opens folder on double click', async () => {
		const { getByText } = render(FileExplorer);
		
		const folderElement = getByText('Documents').closest('[role="article"]');
		
		if (folderElement) {
			await fireEvent.dblClick(folderElement);
			expect(storage.setCurrentPath).toHaveBeenCalledWith('/Documents');
		}
	});

	it('handles search input', async () => {
		const { container } = render(FileExplorer);
		
		const searchInput = container.querySelector('input[type="search"]');
		expect(searchInput).toBeInTheDocument();
		
		if (searchInput) {
			await fireEvent.input(searchInput, { target: { value: 'document' } });
			expect(storage.setSearchQuery).toHaveBeenCalledWith('document');
		}
	});

	it('sorts files by different criteria', async () => {
		const { container, getByRole } = render(FileExplorer);
		
		// Find sort dropdown
		const sortButton = container.querySelector('[data-testid="sort-button"]');
		if (sortButton) {
			await fireEvent.click(sortButton);
			
			// Select sort by size
			const sizeOption = getByRole('button', { name: /size/i });
			await fireEvent.click(sizeOption);
			
			expect(storage.setSortBy).toHaveBeenCalledWith('size');
		}
	});

	it('toggles sort order', async () => {
		const { container } = render(FileExplorer);
		
		const sortOrderButton = container.querySelector('[data-testid="sort-order-button"]');
		if (sortOrderButton) {
			await fireEvent.click(sortOrderButton);
			expect(storage.setSortOrder).toHaveBeenCalledWith('desc');
		}
	});

	it('shows context menu on right click', async () => {
		const { container, getByText } = render(FileExplorer);
		
		const fileElement = getByText('document.pdf').closest('[role="article"]');
		
		if (fileElement) {
			await fireEvent.contextMenu(fileElement);
			
			// Check if context menu appears
			await waitFor(() => {
				const contextMenu = container.querySelector('[role="menu"]');
				expect(contextMenu).toBeInTheDocument();
			});
		}
	});

	it('handles file deletion', async () => {
		const { container, getByText } = render(FileExplorer);
		
		// Select a file
		storage.selectedItems$.set(['1']);
		
		// Find delete button
		const deleteButton = container.querySelector('[data-testid="delete-button"]');
		if (deleteButton) {
			await fireEvent.click(deleteButton);
			
			// Confirm deletion in dialog
			await waitFor(() => {
				const confirmButton = getByText('Delete');
				fireEvent.click(confirmButton);
			});
			
			expect(storage.deleteItem).toHaveBeenCalledWith('1');
		}
	});

	it('creates new folder', async () => {
		const { container, getByText, getByRole } = render(FileExplorer);
		
		// Find new folder button
		const newFolderButton = container.querySelector('[data-testid="new-folder-button"]');
		if (newFolderButton) {
			await fireEvent.click(newFolderButton);
			
			// Enter folder name in dialog
			await waitFor(() => {
				const input = container.querySelector('input[placeholder*="folder name"]');
				if (input) {
					fireEvent.input(input, { target: { value: 'New Folder' } });
				}
				
				const createButton = getByText('Create');
				fireEvent.click(createButton);
			});
			
			expect(storage.createFolder).toHaveBeenCalledWith('New Folder', '/');
		}
	});

	it('renames file', async () => {
		const { container, getByText } = render(FileExplorer);
		
		// Select a file
		storage.selectedItems$.set(['1']);
		
		// Find rename button
		const renameButton = container.querySelector('[data-testid="rename-button"]');
		if (renameButton) {
			await fireEvent.click(renameButton);
			
			// Enter new name in dialog
			await waitFor(() => {
				const input = container.querySelector('input[value="document.pdf"]');
				if (input) {
					fireEvent.input(input, { target: { value: 'renamed.pdf' } });
				}
				
				const saveButton = getByText('Rename');
				fireEvent.click(saveButton);
			});
			
			expect(storage.renameItem).toHaveBeenCalledWith('1', 'renamed.pdf');
		}
	});

	it('handles drag and drop for file movement', async () => {
		const { container, getByText } = render(FileExplorer);
		
		const fileElement = getByText('document.pdf').closest('[role="article"]');
		const folderElement = getByText('Documents').closest('[role="article"]');
		
		if (fileElement && folderElement) {
			// Start drag
			await fireEvent.dragStart(fileElement, {
				dataTransfer: new DataTransfer()
			});
			
			// Drag over folder
			await fireEvent.dragOver(folderElement, {
				dataTransfer: new DataTransfer()
			});
			
			// Drop on folder
			await fireEvent.drop(folderElement, {
				dataTransfer: new DataTransfer()
			});
			
			expect(storage.moveItems).toHaveBeenCalled();
		}
	});

	it('shows empty state when no files', async () => {
		storage.files$.set([]);
		storage.folders$.set([]);
		
		const { container, getByText } = render(FileExplorer);
		
		expect(getByText(/no files or folders/i)).toBeInTheDocument();
	});

	it('displays file size correctly', () => {
		const { getByText } = render(FileExplorer);
		
		// Check if file sizes are formatted
		expect(getByText(/2\.0 MB/i)).toBeInTheDocument();
		expect(getByText(/1\.0 MB/i)).toBeInTheDocument();
	});

	it('shows sharing indicator for shared files', () => {
		const { container } = render(FileExplorer);
		
		// File with id '2' is shared
		const sharedIndicator = container.querySelector('[data-file-id="2"] .badge');
		expect(sharedIndicator).toBeInTheDocument();
		expect(sharedIndicator?.textContent).toContain('Shared');
	});

	it('filters files by type', async () => {
		const { container, getByRole } = render(FileExplorer);
		
		// Find filter dropdown
		const filterButton = container.querySelector('[data-testid="filter-button"]');
		if (filterButton) {
			await fireEvent.click(filterButton);
			
			// Select images filter
			const imageFilter = getByRole('button', { name: /images/i });
			await fireEvent.click(imageFilter);
			
			// Should only show image.png
			await waitFor(() => {
				expect(container.querySelector('[data-file-id="2"]')).toBeInTheDocument();
				expect(container.querySelector('[data-file-id="1"]')).not.toBeInTheDocument();
			});
		}
	});

	it('handles keyboard shortcuts', async () => {
		const { container } = render(FileExplorer);
		
		// Select all with Ctrl+A
		await fireEvent.keyDown(container, { key: 'a', ctrlKey: true });
		expect(storage.selectItems).toHaveBeenCalledWith(['1', '2', 'folder1']);
		
		// Delete with Delete key
		storage.selectedItems$.set(['1']);
		await fireEvent.keyDown(container, { key: 'Delete' });
		expect(storage.deleteItem).toHaveBeenCalled();
	});

	it('shows loading state', () => {
		const { container } = render(FileExplorer, {
			props: {
				loading: true
			}
		});
		
		// Should show loading skeleton
		expect(container.querySelector('.skeleton')).toBeInTheDocument();
	});
});
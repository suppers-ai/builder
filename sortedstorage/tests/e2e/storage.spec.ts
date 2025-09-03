import { test, expect, type Page } from '@playwright/test';
import path from 'path';

const TEST_USER = {
	email: 'test@example.com',
	password: 'TestPassword123!'
};

test.describe('Storage Operations', () => {
	test.beforeEach(async ({ page }) => {
		// Login before each test
		await page.goto('/login');
		await page.fill('input[type="email"]', TEST_USER.email);
		await page.fill('input[type="password"]', TEST_USER.password);
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL('/dashboard');
	});

	test('should display storage dashboard', async ({ page }) => {
		await expect(page.locator('h1')).toContainText('My Files');
		await expect(page.locator('[data-testid="upload-button"]')).toBeVisible();
		await expect(page.locator('[data-testid="new-folder-button"]')).toBeVisible();
		await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
		await expect(page.locator('[data-testid="view-toggle"]')).toBeVisible();
	});

	test('should upload a file', async ({ page }) => {
		// Click upload button
		await page.click('[data-testid="upload-button"]');

		// Select file
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(path.join(__dirname, '../fixtures/test-file.pdf'));

		// Wait for upload to complete
		await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
		await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 10000 });

		// Verify file appears in list
		await expect(page.locator('text=test-file.pdf')).toBeVisible();
	});

	test('should upload multiple files', async ({ page }) => {
		await page.click('[data-testid="upload-button"]');

		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles([
			path.join(__dirname, '../fixtures/test-file.pdf'),
			path.join(__dirname, '../fixtures/test-image.jpg'),
			path.join(__dirname, '../fixtures/test-document.docx')
		]);

		// Wait for all uploads
		await expect(page.locator('[data-testid="upload-queue-count"]')).toContainText('3');
		await page.waitForSelector('[data-testid="all-uploads-complete"]', { timeout: 15000 });

		// Verify all files appear
		await expect(page.locator('text=test-file.pdf')).toBeVisible();
		await expect(page.locator('text=test-image.jpg')).toBeVisible();
		await expect(page.locator('text=test-document.docx')).toBeVisible();
	});

	test('should create a new folder', async ({ page }) => {
		await page.click('[data-testid="new-folder-button"]');

		// Enter folder name
		await page.fill('input[name="folderName"]', 'Test Folder');
		await page.click('button:has-text("Create")');

		// Verify folder appears
		await expect(page.locator('[data-testid="folder-item"]:has-text("Test Folder")')).toBeVisible();
	});

	test('should navigate into folders', async ({ page }) => {
		// Create and navigate to folder
		await createFolder(page, 'Documents');
		await page.dblclick('[data-testid="folder-item"]:has-text("Documents")');

		// Verify breadcrumb
		await expect(page.locator('[data-testid="breadcrumb"]')).toContainText('Documents');

		// Upload file in folder
		await uploadFile(page, 'test-file.pdf');

		// Navigate back
		await page.click('[data-testid="breadcrumb-home"]');
		await expect(page.locator('[data-testid="breadcrumb"]')).not.toContainText('Documents');
	});

	test('should rename a file', async ({ page }) => {
		await uploadFile(page, 'test-file.pdf');

		// Right-click on file
		await page.click('text=test-file.pdf', { button: 'right' });
		await page.click('text=Rename');

		// Enter new name
		await page.fill('input[name="newName"]', 'renamed-file.pdf');
		await page.click('button:has-text("Rename")');

		// Verify renamed
		await expect(page.locator('text=renamed-file.pdf')).toBeVisible();
		await expect(page.locator('text=test-file.pdf')).not.toBeVisible();
	});

	test('should delete a file', async ({ page }) => {
		await uploadFile(page, 'test-file.pdf');

		// Select file
		await page.click('[data-testid="file-checkbox-test-file.pdf"]');

		// Click delete
		await page.click('[data-testid="delete-button"]');

		// Confirm deletion
		await page.click('button:has-text("Delete")');

		// Verify file removed
		await expect(page.locator('text=test-file.pdf')).not.toBeVisible();
		await expect(page.locator('.success-message')).toContainText('deleted');
	});

	test('should move files to another folder', async ({ page }) => {
		// Create destination folder
		await createFolder(page, 'Destination');

		// Upload file
		await uploadFile(page, 'test-file.pdf');

		// Select file
		await page.click('[data-testid="file-checkbox-test-file.pdf"]');

		// Click move
		await page.click('[data-testid="move-button"]');

		// Select destination
		await page.click('[data-testid="folder-select-Destination"]');
		await page.click('button:has-text("Move Here")');

		// Verify file moved
		await expect(page.locator('text=test-file.pdf')).not.toBeVisible();

		// Navigate to destination
		await page.dblclick('[data-testid="folder-item"]:has-text("Destination")');
		await expect(page.locator('text=test-file.pdf')).toBeVisible();
	});

	test('should copy files', async ({ page }) => {
		// Create destination folder
		await createFolder(page, 'Copies');

		// Upload file
		await uploadFile(page, 'test-file.pdf');

		// Select file
		await page.click('[data-testid="file-checkbox-test-file.pdf"]');

		// Click copy
		await page.click('[data-testid="copy-button"]');

		// Select destination
		await page.click('[data-testid="folder-select-Copies"]');
		await page.click('button:has-text("Copy Here")');

		// Verify original still exists
		await expect(page.locator('text=test-file.pdf')).toBeVisible();

		// Navigate to destination
		await page.dblclick('[data-testid="folder-item"]:has-text("Copies")');
		await expect(page.locator('text=test-file.pdf')).toBeVisible();
	});

	test('should search for files', async ({ page }) => {
		// Upload multiple files
		await uploadFile(page, 'test-file.pdf');
		await uploadFile(page, 'document.docx');
		await uploadFile(page, 'image.jpg');

		// Search
		await page.fill('[data-testid="search-input"]', 'test');

		// Verify filtered results
		await expect(page.locator('text=test-file.pdf')).toBeVisible();
		await expect(page.locator('text=document.docx')).not.toBeVisible();
		await expect(page.locator('text=image.jpg')).not.toBeVisible();

		// Clear search
		await page.click('[data-testid="search-clear"]');
		await expect(page.locator('text=document.docx')).toBeVisible();
	});

	test('should filter files by type', async ({ page }) => {
		// Upload different file types
		await uploadFile(page, 'test-file.pdf');
		await uploadFile(page, 'image.jpg');
		await uploadFile(page, 'video.mp4');

		// Filter by images
		await page.click('[data-testid="filter-button"]');
		await page.click('text=Images');

		// Verify filtered
		await expect(page.locator('text=image.jpg')).toBeVisible();
		await expect(page.locator('text=test-file.pdf')).not.toBeVisible();
		await expect(page.locator('text=video.mp4')).not.toBeVisible();
	});

	test('should sort files', async ({ page }) => {
		// Upload files with different names
		await uploadFile(page, 'alpha.txt');
		await uploadFile(page, 'zebra.txt');
		await uploadFile(page, 'beta.txt');

		// Sort by name ascending
		await page.selectOption('[data-testid="sort-select"]', 'name-asc');

		// Verify order
		const files = page.locator('[data-testid^="file-item"]');
		await expect(files.nth(0)).toContainText('alpha.txt');
		await expect(files.nth(1)).toContainText('beta.txt');
		await expect(files.nth(2)).toContainText('zebra.txt');

		// Sort by name descending
		await page.selectOption('[data-testid="sort-select"]', 'name-desc');
		await expect(files.nth(0)).toContainText('zebra.txt');
	});

	test('should preview files', async ({ page }) => {
		await uploadFile(page, 'test-image.jpg');

		// Click to preview
		await page.click('text=test-image.jpg');

		// Verify preview modal
		await expect(page.locator('[data-testid="file-preview-modal"]')).toBeVisible();
		await expect(page.locator('[data-testid="preview-image"]')).toBeVisible();

		// Close preview
		await page.click('[data-testid="preview-close"]');
		await expect(page.locator('[data-testid="file-preview-modal"]')).not.toBeVisible();
	});

	test('should download files', async ({ page }) => {
		await uploadFile(page, 'test-file.pdf');

		// Start download
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.click('[data-testid="file-download-test-file.pdf"]')
		]);

		// Verify download
		expect(download.suggestedFilename()).toBe('test-file.pdf');
	});

	test('should handle drag and drop upload', async ({ page }) => {
		// Create DataTransfer
		await page.evaluate(() => {
			const dt = new DataTransfer();
			const file = new File(['test content'], 'drag-drop.txt', { type: 'text/plain' });
			dt.items.add(file);

			const dropZone = document.querySelector('[data-testid="drop-zone"]');
			const dropEvent = new DragEvent('drop', {
				dataTransfer: dt,
				bubbles: true,
				cancelable: true
			});

			dropZone?.dispatchEvent(dropEvent);
		});

		// Verify file uploaded
		await expect(page.locator('text=drag-drop.txt')).toBeVisible({ timeout: 5000 });
	});

	test('should show storage quota', async ({ page }) => {
		await expect(page.locator('[data-testid="storage-quota"]')).toBeVisible();
		await expect(page.locator('[data-testid="storage-used"]')).toContainText(/\d+(\.\d+)?\s*(B|KB|MB|GB)/);
		await expect(page.locator('[data-testid="storage-total"]')).toContainText(/\d+(\.\d+)?\s*(GB|TB)/);
		await expect(page.locator('[data-testid="storage-percentage"]')).toContainText(/\d+%/);
	});

	test('should handle batch operations', async ({ page }) => {
		// Upload multiple files
		await uploadFile(page, 'file1.txt');
		await uploadFile(page, 'file2.txt');
		await uploadFile(page, 'file3.txt');

		// Select all
		await page.click('[data-testid="select-all-checkbox"]');

		// Verify batch toolbar appears
		await expect(page.locator('[data-testid="batch-toolbar"]')).toBeVisible();
		await expect(page.locator('[data-testid="selected-count"]')).toContainText('3 selected');

		// Batch delete
		await page.click('[data-testid="batch-delete"]');
		await page.click('button:has-text("Delete All")');

		// Verify all deleted
		await expect(page.locator('text=file1.txt')).not.toBeVisible();
		await expect(page.locator('text=file2.txt')).not.toBeVisible();
		await expect(page.locator('text=file3.txt')).not.toBeVisible();
	});
});

// Helper functions
async function uploadFile(page: Page, filename: string) {
	const filePath = path.join(__dirname, '../fixtures', filename);
	const fileInput = page.locator('input[type="file"]');
	await fileInput.setInputFiles(filePath);
	await page.waitForSelector(`text=${filename}`, { timeout: 5000 });
}

async function createFolder(page: Page, name: string) {
	await page.click('[data-testid="new-folder-button"]');
	await page.fill('input[name="folderName"]', name);
	await page.click('button:has-text("Create")');
	await page.waitForSelector(`[data-testid="folder-item"]:has-text("${name}")`, { timeout: 5000 });
}
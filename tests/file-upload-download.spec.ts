import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth-helpers';
import { createTestFile, cleanupTestFiles, getUploadedFiles } from './utils/file-helpers';

test.describe('File Upload and Download', () => {
  let authHelper: AuthHelper;
  let uploadedFiles: string[] = [];

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.ensureLoggedIn();
  });

  test.afterEach(async ({ page }) => {
    // Clean up test files after each test
    if (uploadedFiles.length > 0) {
      await cleanupTestFiles(page, uploadedFiles);
      uploadedFiles = [];
    }
  });

  test('should upload a file successfully', async ({ page }) => {
    const filename = `test-upload-${Date.now()}.zip`;
    uploadedFiles.push(filename);
    
    // Navigate to upload page
    await page.goto('/spaces/blaupunkt/upload');
    await expect(page).toHaveTitle(/Upload Files/);
    
    // Create test file
    const testFile = await createTestFile(filename, 'application/zip', 'Test file content for upload');
    
    // Upload the file
    await page.setInputFiles('input[type="file"]', testFile);
    
    // Wait for file to appear in the selected files list
    await expect(page.locator(`text=${filename}`)).toBeVisible();
    
    // Fill in optional metadata
    await page.fill('input[id="version-0"]', '1.0.0');
    await page.fill('textarea[id="description-0"]', 'Test upload file');
    await page.fill('textarea[id="changelog-0"]', 'Initial test upload');

    // Submit the upload
    await page.click('button[type="submit"]');
    
    // Wait for upload to complete and redirect
    await expect(page).toHaveURL(/\/spaces\/blaupunkt\/files/, { timeout: 30000 });
    
    // Verify file appears in the files list
    await expect(page.locator(`text=${filename}`)).toBeVisible();
  });

  test('should download a file successfully', async ({ page }) => {
    const filename = `test-download-${Date.now()}.zip`;
    uploadedFiles.push(filename);
    
    // First upload a file
    await page.goto('/spaces/blaupunkt/upload');
    const testFile = await createTestFile(filename, 'application/zip', 'Test download content');
    
    await page.setInputFiles('input[type="file"]', testFile);
    await page.fill('input[id="version-0"]', '1.0.0');
    await page.fill('textarea[id="description-0"]', 'Test download file');
    
    await page.click('button[type="submit"]');
    
    // Wait for upload to complete and redirect
    await expect(page).toHaveURL(/\/spaces\/blaupunkt\/files/, { timeout: 30000 });
    await expect(page.locator(`text=${filename}`)).toBeVisible();
    
    // Set up download promise before clicking download button
    const downloadPromise = page.waitForEvent('download');
    
    // Find the file row and click its download button
    const fileRow = page.locator(`div:has-text("${filename}")`).first();
    const downloadButton = fileRow.locator('button:has-text("Download")');
    await downloadButton.click();
    
    // Wait for download to complete
    const download = await downloadPromise;
    
    // Verify download properties
    expect(download.suggestedFilename()).toBe(filename);
    
    // Verify file content
    const path = await download.path();
    expect(path).toBeTruthy();
    
    // Read the downloaded file content
    const fs = require('fs');
    const downloadedContent = fs.readFileSync(path!, 'utf8');
    expect(downloadedContent).toBe('Test download content');
  });

  test('should upload multiple files at once', async ({ page }) => {
    const filename1 = `multi-upload-1-${Date.now()}.zip`;
    const filename2 = `multi-upload-2-${Date.now()}.zip`;
    uploadedFiles.push(filename1, filename2);
    
    // Navigate to upload page
    await page.goto('/spaces/blaupunkt/upload');
    
    // Create multiple test files
    const testFile1 = await createTestFile(filename1, 'application/zip', 'First file content');
    const testFile2 = await createTestFile(filename2, 'application/zip', 'Second file content');

    // Upload multiple files
    await page.setInputFiles('input[type="file"]', [testFile1, testFile2]);
    
    // Wait for both files to appear in the selected files list
    await expect(page.locator(`text=${filename1}`)).toBeVisible();
    await expect(page.locator(`text=${filename2}`)).toBeVisible();
    
    // Fill in metadata for both files
    await page.fill('input[id="version-0"]', '1.0.0');
    await page.fill('textarea[id="description-0"]', 'First file');
    
    await page.fill('input[id="version-1"]', '1.0.1');
    await page.fill('textarea[id="description-1"]', 'Second file');

    // Submit the upload
    await page.click('button[type="submit"]');
    
    // Wait for upload to complete and redirect
    await expect(page).toHaveURL(/\/spaces\/blaupunkt\/files/, { timeout: 30000 });
    
    // Verify both files appear in the files list
    await expect(page.locator(`text=${filename1}`)).toBeVisible();
    await expect(page.locator(`text=${filename2}`)).toBeVisible();
  });

  test('should allow file removal before upload', async ({ page }) => {
    const filename = `removable-file-${Date.now()}.zip`;
    
    // Navigate to upload page
    await page.goto('/spaces/blaupunkt/upload');
    
    // Create test file
    const testFile = await createTestFile(filename, 'application/zip', 'Removable content');
    await page.setInputFiles('input[type="file"]', testFile);
    
    // Verify file appears
    await expect(page.locator(`text=${filename}`)).toBeVisible();
    
    // Click the remove button (X button)
    await page.click('button:has(svg[data-lucide="x"])');
    
    // Verify file is removed from the list
    await expect(page.locator(`text=${filename}`)).toBeHidden();
    
    // Submit button should be disabled
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('should display file metadata correctly', async ({ page }) => {
    const filename = `metadata-test-${Date.now()}.zip`;
    uploadedFiles.push(filename);
    
    // Navigate to upload page
    await page.goto('/spaces/blaupunkt/upload');
    
    // Create test file
    const testFile = await createTestFile(filename, 'application/zip', 'Metadata test content');
    
    await page.setInputFiles('input[type="file"]', testFile);
    await page.fill('input[id="version-0"]', '2.1.0');
    await page.fill('textarea[id="description-0"]', 'File with metadata');
    await page.fill('textarea[id="changelog-0"]', 'Added metadata testing');
    
    await page.click('button[type="submit"]');
    
    // Wait for upload to complete
    await expect(page).toHaveURL(/\/spaces\/blaupunkt\/files/, { timeout: 30000 });
    
    // Verify file appears with metadata
    await expect(page.locator(`text=${filename}`)).toBeVisible();
    await expect(page.locator('text=v2.1.0')).toBeVisible();
    await expect(page.locator('text=File with metadata')).toBeVisible();
  });

  test('should handle empty form submission', async ({ page }) => {
    // Navigate to upload page
    await page.goto('/spaces/blaupunkt/upload');
    
    // Try to submit without selecting any files
    const submitButton = page.locator('button[type="submit"]');
    
    // Submit button should be disabled when no files are selected
    await expect(submitButton).toBeDisabled();
  });
});
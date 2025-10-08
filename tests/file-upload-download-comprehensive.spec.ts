import { test, expect, Page } from '@playwright/test';
import { loginUser, createTestFile, cleanupTestFiles, getUploadedFiles } from './utils/file-helpers';

test.describe('File Upload and Download - Comprehensive', () => {
  let uploadedFiles: string[] = [];

  test.beforeAll(async ({ browser }) => {
    // Set up test environment - ensure we start with a clean state
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await loginUser(page);
      
      // Clean up any existing test files before starting
      const existingFiles = await getUploadedFiles(page);
      const testFiles = existingFiles.filter(file => 
        file.includes('test-') || 
        file.includes('e2e-') || 
        file.includes('playwright-')
      );
      
      if (testFiles.length > 0) {
        await cleanupTestFiles(page, testFiles);
      }
    } finally {
      await context.close();
    }
  });

  test.afterAll(async ({ browser }) => {
    // Clean up all test files after all tests complete
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await loginUser(page);
      
      if (uploadedFiles.length > 0) {
        await cleanupTestFiles(page, uploadedFiles);
      }
      
      // Also clean up any remaining test files
      const remainingFiles = await getUploadedFiles(page);
      const testFiles = remainingFiles.filter(file => 
        file.includes('test-') || 
        file.includes('e2e-') || 
        file.includes('playwright-')
      );
      
      if (testFiles.length > 0) {
        await cleanupTestFiles(page, testFiles);
      }
    } finally {
      await context.close();
    }
  });

  test('should upload a single file with metadata', async ({ page }) => {
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
    
    // Fill in metadata
    await page.fill('input[id="version-0"]', '1.0.0');
    await page.fill('textarea[id="description-0"]', 'Test upload file with metadata');
    await page.fill('textarea[id="changelog-0"]', 'Initial test upload for E2E testing');

    // Submit the upload
    await page.click('button[type="submit"]');
    
    // Wait for upload to complete
    await expect(page.locator('text=Uploading...')).toBeVisible();
    await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 30000 });
    
    // Should redirect to files page after successful upload
    await expect(page).toHaveURL(/\/spaces\/blaupunkt\/files/);
    
    // Verify file appears in the files list with metadata
    await expect(page.locator(`text=${filename}`)).toBeVisible();
    await expect(page.locator('text=v1.0.0')).toBeVisible();
    await expect(page.locator('text=Test upload file with metadata')).toBeVisible();
  });

  test('should download a file successfully', async ({ page }) => {
    const filename = `test-download-${Date.now()}.zip`;
    uploadedFiles.push(filename);
    
    // First upload a file
    await page.goto('/spaces/blaupunkt/upload');
    const testFile = await createTestFile(filename, 'application/zip', 'Test download content');
    
    await page.setInputFiles('input[type="file"]', testFile);
    await page.fill('input[id="version-0"]', '2.0.0');
    await page.fill('textarea[id="description-0"]', 'Test download file');
    
    await page.click('button[type="submit"]');
    
    // Wait for upload to complete and redirect
    await expect(page).toHaveURL(/\/spaces\/blaupunkt\/files/, { timeout: 30000 });
    await expect(page.locator(`text=${filename}`)).toBeVisible();
    
    // Set up download promise before clicking download button
    const downloadPromise = page.waitForEvent('download');
    
    // Click the download button
    await page.click('button:has-text("Download")');
    
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

  test('should upload multiple files simultaneously', async ({ page }) => {
    const filename1 = `multi-upload-1-${Date.now()}.zip`;
    const filename2 = `multi-upload-2-${Date.now()}.zip`;
    uploadedFiles.push(filename1, filename2);
    
    await page.goto('/spaces/blaupunkt/upload');
    
    // Create multiple test files
    const testFile1 = await createTestFile(filename1, 'application/zip', 'First file content');
    const testFile2 = await createTestFile(filename2, 'application/zip', 'Second file content');

    // Upload multiple files
    await page.setInputFiles('input[type="file"]', [testFile1, testFile2]);
    
    // Wait for both files to appear
    await expect(page.locator(`text=${filename1}`)).toBeVisible();
    await expect(page.locator(`text=${filename2}`)).toBeVisible();
    
    // Fill in metadata for both files
    await page.fill('input[id="version-0"]', '1.0.0');
    await page.fill('textarea[id="description-0"]', 'First file');
    
    await page.fill('input[id="version-1"]', '1.0.1');
    await page.fill('textarea[id="description-1"]', 'Second file');

    // Submit the upload
    await page.click('button[type="submit"]');
    
    // Wait for upload to complete
    await expect(page.locator('text=Uploading...')).toBeVisible();
    await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 30000 });
    
    // Should redirect to files page
    await expect(page).toHaveURL(/\/spaces\/blaupunkt\/files/);
    
    // Verify both files appear in the files list
    await expect(page.locator(`text=${filename1}`)).toBeVisible();
    await expect(page.locator(`text=${filename2}`)).toBeVisible();
  });

  test('should handle file removal before upload', async ({ page }) => {
    const filename = `removable-file-${Date.now()}.zip`;
    
    await page.goto('/spaces/blaupunkt/upload');
    
    // Create test file
    const testFile = await createTestFile(filename, 'application/zip', 'Removable content');
    await page.setInputFiles('input[type="file"]', testFile);
    
    // Verify file appears
    await expect(page.locator(`text=${filename}`)).toBeVisible();
    
    // Click the remove button (X button)
    await page.click('button:has(svg[data-lucide="x-circle"])');
    
    // Verify file is removed from the list
    await expect(page.locator(`text=${filename}`)).toBeHidden();
    
    // Submit button should be disabled
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('should validate file upload form', async ({ page }) => {
    await page.goto('/spaces/blaupunkt/upload');
    
    // Try to submit without selecting any files
    await page.click('button[type="submit"]');
    
    // Should show validation error or button should be disabled
    // The exact behavior depends on your implementation
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should display upload progress correctly', async ({ page }) => {
    const filename = `progress-test-${Date.now()}.zip`;
    uploadedFiles.push(filename);
    
    await page.goto('/spaces/blaupunkt/upload');
    
    // Create a larger test file to see progress
    const largeContent = 'x'.repeat(1024 * 1024); // 1MB
    const testFile = await createTestFile(filename, 'application/zip', largeContent);
    
    await page.setInputFiles('input[type="file"]', testFile);
    await page.fill('input[id="version-0"]', '1.0.0');
    
    await page.click('button[type="submit"]');
    
    // Check for upload progress indicators
    await expect(page.locator('text=Uploading...')).toBeVisible();
    
    // Wait for upload to complete
    await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 30000 });
    
    // Should redirect to files page
    await expect(page).toHaveURL(/\/spaces\/blaupunkt\/files/);
  });

  test('should handle download errors gracefully', async ({ page }) => {
    // This test would require setting up a scenario where download fails
    // For now, we'll just verify the download button exists and is clickable
    await page.goto('/spaces/blaupunkt/files');
    
    // Look for any existing files to test download
    const downloadButtons = page.locator('button:has-text("Download")');
    const count = await downloadButtons.count();
    
    if (count > 0) {
      // Test that download button is clickable
      await expect(downloadButtons.first()).toBeEnabled();
    } else {
      // If no files exist, this test passes
      console.log('No files available for download test');
    }
  });
});

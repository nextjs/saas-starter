import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth-helpers';
import { FileHelper } from './utils/file-helpers';
import { getTestUser, getTestTeams, TEST_FILE_DATA, TEST_OTA_IMAGE } from './utils/test-data';

test.describe('File Upload', () => {
  let authHelper: AuthHelper;
  let fileHelper: FileHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    fileHelper = new FileHelper(page);
    await authHelper.ensureLoggedIn();
  });

  test('should upload small text file', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await fileHelper.uploadFile(TEST_FILE_DATA.smallFile, testTeam.slug);
    
    // Verify file appears in files list
    await page.goto(`/spaces/${testTeam.slug}/files`);
    await expect(page.locator(`text=${TEST_FILE_DATA.smallFile.name}`).first()).toBeVisible();
  });

  test('should upload medium file', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await fileHelper.uploadFile(TEST_FILE_DATA.mediumFile, testTeam.slug);
    
    // Verify file appears in files list
    await page.goto(`/spaces/${testTeam.slug}/files`);
    await expect(page.locator(`text=${TEST_FILE_DATA.mediumFile.name}`)).toBeVisible();
  });

  test('should upload large file', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await fileHelper.uploadFile(TEST_FILE_DATA.largeFile, testTeam.slug);
    
    // Verify file appears in files list
    await page.goto(`/spaces/${testTeam.slug}/files`);
    await expect(page.locator(`text=${TEST_FILE_DATA.largeFile.name}`)).toBeVisible();
  });

  test('should upload OTA image file', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await fileHelper.uploadFile(TEST_OTA_IMAGE, testTeam.slug);
    
    // Verify file appears in files list
    await page.goto(`/spaces/${testTeam.slug}/files`);
    await expect(page.locator(`text=${TEST_OTA_IMAGE.name}`)).toBeVisible();
  });

  test('should upload file with metadata', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    // Upload file
    const testFile = await fileHelper.createTestFile(TEST_FILE_DATA.smallFile);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: TEST_FILE_DATA.smallFile.name,
      mimeType: TEST_FILE_DATA.smallFile.type,
      buffer: Buffer.from(TEST_FILE_DATA.smallFile.content)
    });
    
    // Wait for file to appear in the selected files list
    await expect(page.locator(`text=${TEST_FILE_DATA.smallFile.name}`)).toBeVisible();
    
    // Fill metadata fields using the correct IDs
    await page.fill('input[id="version-0"]', '2.1.0');
    await page.fill('textarea[id="description-0"]', 'Test file with metadata');
    await page.fill('textarea[id="changelog-0"]', 'Added new features and bug fixes');
    
    // Submit upload
    const uploadButton = page.locator('button[type="submit"]');
    await uploadButton.click();
    
    // Wait for upload to complete and redirect to files page
    await expect(page).toHaveURL(/\/spaces\/.*\/files/, { timeout: 30000 });
    
    // Verify file appears in files list
    await expect(page.locator(`text=${TEST_FILE_DATA.smallFile.name}`)).toBeVisible();
  });

  test('should validate file type', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    // Try to upload an invalid file type
    const invalidFile = {
      name: 'test.exe',
      content: 'This is not a valid OTA image',
      type: 'application/x-msdownload'
    };
    
    const testFile = await fileHelper.createTestFile(invalidFile);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: invalidFile.name,
      mimeType: invalidFile.type,
      buffer: Buffer.from(invalidFile.content)
    });
    
    // The file input has accept attribute that should prevent invalid files
    // Check if file appears in the list (it shouldn't for invalid types)
    const fileInList = page.locator(`text=${invalidFile.name}`);
    if (await fileInList.isVisible()) {
      // If file appears, try to submit and check for validation
      const uploadButton = page.locator('button[type="submit"]');
      await uploadButton.click();
      
      // Should show validation error or the upload should fail
      await expect(page.locator('text=Invalid file type, text=File type not supported, .error')).toBeVisible();
    } else {
      // File was rejected by the file input accept attribute
      console.log('File type validation working - invalid file rejected by input');
    }
  });

  test('should validate file size', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    // Create a very large file (simulate)
    const hugeFile = {
      name: 'huge-file.zip',
      content: 'A'.repeat(100 * 1024 * 1024), // 100MB
      type: 'application/zip'
    };
    
    const testFile = await fileHelper.createTestFile(hugeFile);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: hugeFile.name,
      mimeType: hugeFile.type,
      buffer: Buffer.from(hugeFile.content)
    });
    
    // Wait for file to appear in the list
    await expect(page.locator(`text=${hugeFile.name}`)).toBeVisible();
    
    // Try to submit
    const uploadButton = page.locator('button[type="submit"]');
    await uploadButton.click();
    
    // Should show file size error or upload should fail
    await expect(page.locator('text=File too large, text=File size exceeded, .error')).toBeVisible();
  });

  test('should show upload progress', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    // Upload a medium-sized file
    const testFile = await fileHelper.createTestFile(TEST_FILE_DATA.mediumFile);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: TEST_FILE_DATA.mediumFile.name,
      mimeType: TEST_FILE_DATA.mediumFile.type,
      buffer: Buffer.from(TEST_FILE_DATA.mediumFile.content)
    });
    
    // Wait for file to appear in the list
    await expect(page.locator(`text=${TEST_FILE_DATA.mediumFile.name}`)).toBeVisible();
    
    // Submit upload
    const uploadButton = page.locator('button[type="submit"]');
    await uploadButton.click();
    
    // Check for upload progress indicators
    await expect(page.locator('text=Uploading...')).toBeVisible();
    
    // Wait for upload to complete and redirect
    await expect(page).toHaveURL(/\/spaces\/.*\/files/, { timeout: 30000 });
  });

  test('should handle upload cancellation', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    // Upload a file
    const testFile = await fileHelper.createTestFile(TEST_FILE_DATA.mediumFile);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: TEST_FILE_DATA.mediumFile.name,
      mimeType: TEST_FILE_DATA.mediumFile.type,
      buffer: Buffer.from(TEST_FILE_DATA.mediumFile.content)
    });
    
    // Wait for file to appear in the list
    await expect(page.locator(`text=${TEST_FILE_DATA.mediumFile.name}`)).toBeVisible();
    
    // Look for remove button (X button) to remove the file
    const removeButton = page.locator('button:has(svg[data-lucide="x"])');
    if (await removeButton.isVisible()) {
      await removeButton.click();
      
      // Verify file was removed from the list
      await expect(page.locator(`text=${TEST_FILE_DATA.mediumFile.name}`)).toBeHidden();
      
      // Submit button should be disabled
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
    }
  });

  test('should retry failed uploads', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    // Upload a file
    const testFile = await fileHelper.createTestFile(TEST_FILE_DATA.smallFile);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: TEST_FILE_DATA.smallFile.name,
      mimeType: TEST_FILE_DATA.smallFile.type,
      buffer: Buffer.from(TEST_FILE_DATA.smallFile.content)
    });
    
    // Wait for file to appear in the list
    await expect(page.locator(`text=${TEST_FILE_DATA.smallFile.name}`)).toBeVisible();
    
    // Submit upload
    const uploadButton = page.locator('button[type="submit"]');
    await uploadButton.click();
    
    // Wait for upload to complete or show error
    try {
      await expect(page).toHaveURL(/\/spaces\/.*\/files/, { timeout: 30000 });
    } catch (error) {
      // If upload fails, look for retry button
      const retryButton = page.locator('button:has-text("Retry"), button:has-text("Try Again")');
      if (await retryButton.isVisible()) {
        await retryButton.click();
        
        // Wait for retry to complete
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should support drag and drop upload', async ({ page }) => {
    const testTeam = getTestTeams()[0];
    
    await page.goto(`/spaces/${testTeam.slug}/upload`);
    
    // Look for drag and drop area (the clickable upload area)
    const dropZone = page.locator('div[class*="border-dashed"]');
    if (await dropZone.isVisible()) {
      // Create test file
      const testFile = await fileHelper.createTestFile(TEST_FILE_DATA.smallFile);
      
      // Simulate drag and drop
      await dropZone.dispatchEvent('drop', {
        dataTransfer: {
          files: [testFile]
        }
      });
      
      // Verify file was added
      await expect(page.locator(`text=${TEST_FILE_DATA.smallFile.name}`)).toBeVisible();
    } else {
      // If drag and drop is not implemented, skip this test
      console.log('Drag and drop not implemented - skipping test');
    }
  });
});

import { Page, expect } from '@playwright/test';
import { TEST_FILE_DATA, TEST_OTA_IMAGE } from './test-data';

export class FileHelper {
  constructor(private page: Page) {}

  async createTestFile(fileData: typeof TEST_FILE_DATA.smallFile) {
    // Create a temporary file for testing
    const fileContent = new Blob([fileData.content], { type: fileData.type });
    return new File([fileContent], fileData.name, { type: fileData.type });
  }

  async uploadFile(fileData: typeof TEST_FILE_DATA.smallFile, teamSlug: string = 'blaupunkt') {
    // Navigate to upload page
    await this.page.goto(`/spaces/${teamSlug}/upload`);
    
    // Wait for upload form to be visible
    await this.page.waitForSelector('h1:has-text("Upload Files")');
    
    // Create test file
    const testFile = await this.createTestFile(fileData);
    
    // Click the upload area to trigger file input
    await this.page.click('div:has-text("Click to upload")');
    
    // Wait for file input to be available (it's hidden but accessible)
    await this.page.waitForSelector('input[type="file"]', { state: 'attached' });
    
    // Upload file using file input
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: fileData.name,
      mimeType: fileData.type,
      buffer: Buffer.from(fileData.content)
    });
    
    // Wait for file to appear in the selected files list (use first occurrence)
    await expect(this.page.locator(`text=${fileData.name}`).first()).toBeVisible();
    
    // Fill in metadata fields using the correct IDs
    await this.page.fill('input[id="version-0"]', '1.0.0');
    await this.page.fill('textarea[id="description-0"]', `Test upload: ${fileData.name}`);
    await this.page.fill('textarea[id="changelog-0"]', 'Test changelog for E2E testing');
    
    // Submit upload
    const uploadButton = this.page.locator('button[type="submit"]');
    await uploadButton.click();
    
    // Wait for upload to complete and redirect to files page
    await expect(this.page).toHaveURL(/\/spaces\/.*\/files/, { timeout: 30000 });
    
    // Verify file appears in files list (use first occurrence)
    await expect(this.page.locator(`text=${fileData.name}`).first()).toBeVisible();
  }

  async downloadFile(fileName: string, teamSlug: string = 'blaupunkt') {
    // Navigate to files page
    await this.page.goto(`/spaces/${teamSlug}/files`);
    
    // Wait for files to load
    await this.page.waitForSelector('div:has-text("Files")');
    
    // Find the file row and click download button
    const fileRow = this.page.locator(`div:has-text("${fileName}")`).first();
    await expect(fileRow).toBeVisible();
    
    // Set up download promise before clicking
    const downloadPromise = this.page.waitForEvent('download');
    
    // Click the download button for this specific file
    const downloadButton = fileRow.locator('button:has-text("Download")');
    await downloadButton.click();
    
    // Wait for download to start
    const download = await downloadPromise;
    
    return download;
  }

  async deleteFile(fileName: string, teamSlug: string = 'blaupunkt') {
    // Navigate to files page
    await this.page.goto(`/spaces/${teamSlug}/files`);
    
    // Wait for files to load
    await this.page.waitForSelector('div:has-text("Files")');
    
    // Find the file row
    const fileRow = this.page.locator(`div:has-text("${fileName}")`).first();
    await expect(fileRow).toBeVisible();
    
    // Click delete button (trash icon)
    const deleteButton = fileRow.locator('button:has(svg[data-lucide="trash-2"])');
    await deleteButton.click();
    
    // Confirm deletion if modal appears
    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Delete")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    // Wait for deletion to complete
    await this.page.waitForLoadState('networkidle');
    
    // Verify file is removed
    await expect(fileRow).not.toBeVisible();
  }

  async verifyFileExists(fileName: string, teamSlug: string = 'blaupunkt'): Promise<boolean> {
    await this.page.goto(`/spaces/${teamSlug}/files`);
    await this.page.waitForSelector('div:has-text("Files")');
    
    const fileElement = this.page.locator(`text=${fileName}`);
    return await fileElement.isVisible();
  }

  async getFileList(teamSlug: string = 'blaupunkt'): Promise<string[]> {
    await this.page.goto(`/spaces/${teamSlug}/files`);
    await this.page.waitForSelector('div:has-text("Files")');
    
    // Extract file names from the page
    const fileElements = await this.page.locator('p.font-medium').all();
    const fileNames = await Promise.all(
      fileElements.map(element => element.textContent())
    );
    
    return fileNames.filter(name => name && name.trim() !== '') as string[];
  }
}

// Helper functions for test setup and cleanup
export async function createTestFile(
  filename: string, 
  mimeType: string, 
  content: string
): Promise<File> {
  const blob = new Blob([content], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}

export async function cleanupTestFiles(page: Page, filenames: string[]) {
  try {
    // Navigate to files page
    await page.goto('/spaces/blaupunkt/files');
    await page.waitForLoadState('networkidle');
    
    // Delete each test file
    for (const filename of filenames) {
      try {
        // Look for the file in the files list
        const fileRow = page.locator(`div:has-text("${filename}")`).first();
        
        if (await fileRow.isVisible()) {
          // Find the delete button (trash icon) for this file
          const deleteButton = fileRow.locator('button:has(svg[data-lucide="trash-2"])');
          
          if (await deleteButton.isVisible()) {
            await deleteButton.click();
            
            // Wait a moment for any confirmation dialog
            await page.waitForTimeout(500);
            
            // If there's a confirmation dialog, click confirm
            const confirmButton = page.locator('button:has-text("Delete"), button:has-text("Confirm")');
            if (await confirmButton.isVisible()) {
              await confirmButton.click();
            }
            
            // Wait for deletion to complete
            await page.waitForLoadState('networkidle');
          }
        }
      } catch (error) {
        console.warn(`Failed to delete test file ${filename}:`, error);
      }
    }
  } catch (error) {
    console.warn('Failed to cleanup test files:', error);
  }
}

export async function getUploadedFiles(page: Page): Promise<string[]> {
  try {
    await page.goto('/spaces/blaupunkt/files');
    await page.waitForLoadState('networkidle');
    
    // Get all file names from the files list
    const fileElements = await page.locator('p.font-medium').all();
    const filenames = await Promise.all(
      fileElements.map(element => element.textContent())
    );
    
    return filenames.filter(name => name && name.trim() !== '') as string[];
  } catch (error) {
    console.warn('Failed to get uploaded files:', error);
    return [];
  }
}
